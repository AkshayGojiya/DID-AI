"""
OCR Service
===========
Document text extraction using Tesseract OCR with MRZ parsing.

Supports:
- Passport MRZ (Machine Readable Zone) parsing with checksum validation
- General document text extraction
- Image quality assessment
- Field confidence scoring
"""

import base64
import os
import re
import time
import logging
import numpy as np
from io import BytesIO
from PIL import Image, ImageFilter, ImageStat
from datetime import datetime

logger = logging.getLogger(__name__)

_tesseract = None


def _get_tesseract():
    """Lazy-load pytesseract and configure path."""
    global _tesseract
    if _tesseract is None:
        logger.info("Loading Tesseract OCR...")
        import pytesseract

        # On Windows, Tesseract needs an explicit path
        tess_path = os.getenv('TESSERACT_PATH')
        if tess_path:
            pytesseract.pytesseract.tesseract_cmd = tess_path
        elif os.name == 'nt':
            # Common default Windows install path
            default = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
            if os.path.exists(default):
                pytesseract.pytesseract.tesseract_cmd = default

        _tesseract = pytesseract
        logger.info("Tesseract OCR loaded")
    return _tesseract


def _decode_base64_image(b64: str) -> Image.Image:
    """Decode base64 to PIL Image."""
    if ',' in b64:
        b64 = b64.split(',', 1)[1]
    img_bytes = base64.b64decode(b64)
    return Image.open(BytesIO(img_bytes)).convert('RGB')


# -------------------------------------------------------
# Image preprocessing for better OCR accuracy
# -------------------------------------------------------

def _preprocess_for_ocr(img: Image.Image) -> Image.Image:
    """Enhance image for better OCR results."""
    # Convert to grayscale
    gray = img.convert('L')

    # Increase contrast
    arr = np.array(gray, dtype=np.float32)
    p2, p98 = np.percentile(arr, (2, 98))
    if p98 > p2:
        arr = np.clip((arr - p2) / (p98 - p2) * 255, 0, 255)
    enhanced = Image.fromarray(arr.astype(np.uint8))

    # Sharpen
    enhanced = enhanced.filter(ImageFilter.SHARPEN)

    # Scale up small images
    w, h = enhanced.size
    if w < 1000:
        scale = 1000 / w
        enhanced = enhanced.resize((int(w * scale), int(h * scale)), Image.LANCZOS)

    return enhanced


def _assess_quality(img: Image.Image) -> dict:
    """Assess document image quality."""
    gray = img.convert('L')
    stat = ImageStat.Stat(gray)
    arr = np.array(gray)

    issues = []

    # Check brightness
    mean_brightness = stat.mean[0]
    if mean_brightness < 60:
        issues.append("image_too_dark")
    elif mean_brightness > 220:
        issues.append("image_too_bright")

    # Check contrast (std deviation)
    contrast = stat.stddev[0]
    if contrast < 30:
        issues.append("low_contrast")

    # Check blur via Laplacian variance
    from PIL import ImageFilter as IF
    laplacian = np.array(gray.filter(IF.Kernel((3, 3), [-1, -1, -1, -1, 8, -1, -1, -1, -1], scale=1, offset=128)))
    blur_var = np.var(laplacian)
    if blur_var < 200:
        issues.append("image_blurry")

    # Check resolution
    w, h = img.size
    if w < 400 or h < 300:
        issues.append("resolution_too_low")

    # Overall score
    score = 1.0
    score -= len(issues) * 0.2
    score = max(0.0, min(1.0, score))

    return {
        "score": round(score, 2),
        "issues": issues,
        "resolution": f"{w}x{h}",
        "brightness": round(mean_brightness, 1),
        "contrast": round(contrast, 1),
        "blur_score": round(blur_var, 1)
    }


# -------------------------------------------------------
# MRZ Parsing (TD3 format — passports)
# -------------------------------------------------------

# MRZ checksum: each char maps to a digit, then weighted sum mod 10
MRZ_CHAR_MAP = {c: i for i, c in enumerate("0123456789")}
MRZ_CHAR_MAP.update({c: i + 10 for i, c in enumerate("ABCDEFGHIJKLMNOPQRSTUVWXYZ")})
MRZ_CHAR_MAP['<'] = 0

MRZ_WEIGHTS = [7, 3, 1]


def _mrz_checksum(s: str) -> int:
    """Compute MRZ check digit for a string."""
    total = 0
    for i, ch in enumerate(s):
        val = MRZ_CHAR_MAP.get(ch.upper(), 0)
        total += val * MRZ_WEIGHTS[i % 3]
    return total % 10


def _parse_mrz_td3(line1: str, line2: str) -> dict:
    """
    Parse TD3 (passport) MRZ — two lines of 44 chars each.

    Line 1: P<ISSUING_COUNTRYLASTNAME<<FIRSTNAME<MIDDLE<<...
    Line 2: DOC_NUMBER<CHECK NATIONALITY YYMMDD CHECK SEX YYMMDD CHECK PERSONAL_NUMBER<CHECK OVERALL_CHECK
    """
    data = {}
    checks_passed = []
    checks_failed = []

    # --- Line 1 ---
    if len(line1) >= 44:
        doc_type_raw = line1[0:2].replace('<', '')
        data['document_type_code'] = doc_type_raw

        country = line1[2:5].replace('<', '')
        data['issuing_country'] = country

        # Name: everything after position 5, split by '<<'
        name_field = line1[5:44]
        parts = name_field.split('<<')
        surname = parts[0].replace('<', ' ').strip() if parts else ''
        given = parts[1].replace('<', ' ').strip() if len(parts) > 1 else ''
        data['surname'] = surname
        data['given_names'] = given
        data['full_name'] = f"{given} {surname}".strip()

    # --- Line 2 ---
    if len(line2) >= 44:
        # Document number: positions 0-8, check digit at 9
        doc_num = line2[0:9].replace('<', '')
        doc_check = line2[9]
        data['document_number'] = doc_num

        if doc_check.isdigit() and _mrz_checksum(line2[0:9]) == int(doc_check):
            checks_passed.append('document_number_checksum')
        else:
            checks_failed.append('document_number_checksum')

        # Nationality
        data['nationality'] = line2[10:13].replace('<', '')

        # Date of birth: YYMMDD at positions 13-18, check at 19
        dob_raw = line2[13:19]
        dob_check = line2[19]
        try:
            yy = int(dob_raw[0:2])
            mm = int(dob_raw[2:4])
            dd = int(dob_raw[4:6])
            # Assume 1930-2029 range
            year = 1900 + yy if yy > 29 else 2000 + yy
            data['date_of_birth'] = f"{year:04d}-{mm:02d}-{dd:02d}"
        except (ValueError, IndexError):
            data['date_of_birth'] = None

        if dob_check.isdigit() and _mrz_checksum(dob_raw) == int(dob_check):
            checks_passed.append('dob_checksum')
        else:
            checks_failed.append('dob_checksum')

        # Sex
        sex = line2[20]
        data['gender'] = sex if sex in ('M', 'F') else 'X'

        # Expiry date: YYMMDD at positions 21-26, check at 27
        exp_raw = line2[21:27]
        exp_check = line2[27]
        try:
            yy = int(exp_raw[0:2])
            mm = int(exp_raw[2:4])
            dd = int(exp_raw[4:6])
            year = 2000 + yy  # expiry is always future
            data['expiry_date'] = f"{year:04d}-{mm:02d}-{dd:02d}"
        except (ValueError, IndexError):
            data['expiry_date'] = None

        if exp_check.isdigit() and _mrz_checksum(exp_raw) == int(exp_check):
            checks_passed.append('expiry_checksum')
        else:
            checks_failed.append('expiry_checksum')

        # Check if document is expired
        if data.get('expiry_date'):
            try:
                exp_date = datetime.strptime(data['expiry_date'], '%Y-%m-%d')
                if exp_date > datetime.utcnow():
                    checks_passed.append('expiry_date_valid')
                else:
                    checks_failed.append('expiry_date_expired')
            except ValueError:
                pass

    return {
        "data": data,
        "checks_passed": checks_passed,
        "checks_failed": checks_failed
    }


def _find_mrz_lines(text: str) -> tuple:
    """
    Find MRZ lines in OCR text output.
    MRZ lines are 44 chars of [A-Z0-9<] for TD3 passports.
    """
    # Clean up and find lines matching MRZ pattern
    mrz_pattern = re.compile(r'[A-Z0-9<]{30,50}')
    candidates = []

    for line in text.split('\n'):
        clean = line.strip().upper().replace(' ', '')
        # Replace common OCR mistakes in MRZ
        clean = clean.replace('O', '0').replace('I', '1').replace('S', '5').replace('B', '8')
        # But keep alpha chars that are valid in names
        # Only apply digit replacement in line2 (numbers-heavy), so do a best-effort
        if mrz_pattern.match(clean) and len(clean) >= 30:
            candidates.append(clean)

    if len(candidates) >= 2:
        # Take the last two longest as MRZ (they're usually at the bottom)
        candidates.sort(key=len, reverse=True)
        line1 = candidates[0][:44].ljust(44, '<')
        line2 = candidates[1][:44].ljust(44, '<')
        # Line1 starts with P<, line2 starts with doc number
        if line2.startswith('P') and not line1.startswith('P'):
            line1, line2 = line2, line1
        return line1, line2

    return None, None


class OCRService:
    """Document text extraction and MRZ parsing."""

    _loaded = False

    @classmethod
    def is_ready(cls) -> bool:
        return cls._loaded

    @classmethod
    def warmup(cls):
        """Test that Tesseract is accessible."""
        try:
            tess = _get_tesseract()
            version = tess.get_tesseract_version()
            cls._loaded = True
            logger.info(f"Tesseract OCR ready (version {version})")
        except Exception as e:
            cls._loaded = False
            logger.warning(f"Tesseract warmup failed: {e}")

    @classmethod
    def extract(cls, image_b64: str, document_type: str = 'auto') -> dict:
        """
        Extract text and structured data from a document image.

        Args:
            image_b64:     Base64-encoded document image
            document_type: 'passport', 'driving_license', 'national_id', or 'auto'

        Returns:
            dict with extracted_data, confidence_scores, quality, and MRZ info
        """
        tess = _get_tesseract()
        cls._loaded = True
        start = time.time()

        img = _decode_base64_image(image_b64)

        # Assess quality first
        quality = _assess_quality(img)

        # Preprocess for better OCR
        processed = _preprocess_for_ocr(img)

        # Run OCR with both default and MRZ-specific configs
        # Default OCR for general text
        raw_text = tess.image_to_string(processed, config='--psm 6')

        # Specialized MRZ extraction (single block mode, MRZ-optimized)
        mrz_text = tess.image_to_string(
            processed,
            config='--psm 6 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<'
        )

        # Get per-word confidence from Tesseract
        try:
            ocr_data = tess.image_to_data(processed, output_type=tess.Output.DICT)
            word_confidences = [
                int(c) for c in ocr_data.get('conf', [])
                if str(c).lstrip('-').isdigit() and int(c) > 0
            ]
            avg_confidence = sum(word_confidences) / len(word_confidences) / 100 if word_confidences else 0.5
        except Exception:
            avg_confidence = 0.5

        # Try to find and parse MRZ
        mrz_line1, mrz_line2 = _find_mrz_lines(mrz_text)
        if not mrz_line1:
            mrz_line1, mrz_line2 = _find_mrz_lines(raw_text)

        extracted_data = {}
        confidence_scores = {}
        checks_passed = []
        checks_failed = []
        detected_type = document_type

        if mrz_line1 and mrz_line2:
            # We have MRZ — parse it
            if detected_type == 'auto':
                detected_type = 'passport' if mrz_line1.startswith('P') else 'id_card'

            mrz_result = _parse_mrz_td3(mrz_line1, mrz_line2)
            extracted_data = mrz_result['data']
            extracted_data['mrz_line1'] = mrz_line1
            extracted_data['mrz_line2'] = mrz_line2
            checks_passed = mrz_result['checks_passed']
            checks_failed = mrz_result['checks_failed']

            # MRZ fields have high confidence if checksums pass
            base_conf = 0.90 if len(checks_passed) > len(checks_failed) else 0.60
            for field in extracted_data:
                if field.startswith('mrz_'):
                    continue
                confidence_scores[field] = round(base_conf + (avg_confidence * 0.1), 2)

        else:
            # No MRZ found — fall back to raw text field extraction
            if detected_type == 'auto':
                detected_type = 'unknown'

            extracted_data = _extract_fields_from_text(raw_text)
            for field in extracted_data:
                confidence_scores[field] = round(avg_confidence, 2)

        elapsed_ms = int((time.time() - start) * 1000)

        return {
            "document_type": detected_type,
            "extracted_data": extracted_data,
            "confidence_scores": confidence_scores,
            "quality": quality,
            "raw_text": raw_text.strip(),
            "mrz_found": mrz_line1 is not None,
            "checks_passed": checks_passed,
            "checks_failed": checks_failed,
            "ocr_confidence": round(avg_confidence, 4),
            "processing_time_ms": elapsed_ms
        }

    @classmethod
    def validate(cls, extracted_data: dict) -> dict:
        """
        Validate extracted document data for consistency.

        Args:
            extracted_data: Data from the extract() method

        Returns:
            dict with validation results
        """
        checks_passed = []
        checks_failed = []
        warnings = []

        # Check name is present and reasonable
        name = extracted_data.get('full_name', '')
        if name and len(name) >= 2:
            checks_passed.append('name_present')
            if re.match(r'^[A-Za-z\s\-\.]+$', name):
                checks_passed.append('name_format')
            else:
                warnings.append('name_contains_unusual_characters')
        else:
            checks_failed.append('name_missing')

        # Check document number
        doc_num = extracted_data.get('document_number', '')
        if doc_num and len(doc_num) >= 5:
            checks_passed.append('document_number_present')
            if re.match(r'^[A-Z0-9]+$', doc_num):
                checks_passed.append('document_number_format')
            else:
                warnings.append('document_number_unusual_format')
        else:
            checks_failed.append('document_number_missing')

        # Check date of birth
        dob = extracted_data.get('date_of_birth', '')
        if dob:
            try:
                dob_date = datetime.strptime(dob, '%Y-%m-%d')
                age = (datetime.utcnow() - dob_date).days / 365.25
                if 0 < age < 150:
                    checks_passed.append('dob_valid')
                else:
                    checks_failed.append('dob_out_of_range')
            except ValueError:
                checks_failed.append('dob_invalid_format')
        else:
            checks_failed.append('dob_missing')

        # Check expiry date
        expiry = extracted_data.get('expiry_date', '')
        if expiry:
            try:
                exp_date = datetime.strptime(expiry, '%Y-%m-%d')
                if exp_date > datetime.utcnow():
                    checks_passed.append('expiry_date_valid')
                else:
                    checks_failed.append('document_expired')
            except ValueError:
                checks_failed.append('expiry_date_invalid_format')

        # Overall score
        total = len(checks_passed) + len(checks_failed)
        authenticity = len(checks_passed) / total if total > 0 else 0

        return {
            "is_valid": len(checks_failed) == 0,
            "checks_passed": checks_passed,
            "checks_failed": checks_failed,
            "warnings": warnings,
            "authenticity_score": round(authenticity, 2)
        }


def _extract_fields_from_text(text: str) -> dict:
    """
    Best-effort field extraction from raw OCR text (no MRZ).
    Uses regex patterns to find common fields.
    """
    data = {}

    # Date pattern: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD
    date_pattern = re.compile(
        r'(\d{1,2}[/\-\.]\d{1,2}[/\-\.]\d{2,4}|\d{4}[/\-\.]\d{1,2}[/\-\.]\d{1,2})'
    )
    dates = date_pattern.findall(text)

    if len(dates) >= 1:
        data['date_of_birth'] = _normalize_date(dates[0])
    if len(dates) >= 2:
        data['expiry_date'] = _normalize_date(dates[1])

    # Document number: alphanumeric sequence of 6-12 chars
    doc_pattern = re.compile(r'\b([A-Z]{1,2}\d{6,10})\b')
    doc_match = doc_pattern.search(text.upper())
    if doc_match:
        data['document_number'] = doc_match.group(1)

    # Try to find name (usually first prominent text line)
    lines = [l.strip() for l in text.split('\n') if l.strip() and len(l.strip()) > 3]
    name_candidates = [l for l in lines if re.match(r'^[A-Za-z\s\-]{3,50}$', l)]
    if name_candidates:
        data['full_name'] = name_candidates[0].title()

    # Gender
    gender_match = re.search(r'\b(MALE|FEMALE|M|F)\b', text.upper())
    if gender_match:
        g = gender_match.group(1)
        data['gender'] = 'M' if g in ('MALE', 'M') else 'F'

    # Nationality: look for 3-letter country code
    nat_match = re.search(r'\b([A-Z]{3})\b', text.upper())
    if nat_match:
        data['nationality'] = nat_match.group(1)

    return data


def _normalize_date(date_str: str) -> str:
    """Try to normalize a date string to YYYY-MM-DD."""
    for fmt in ('%d/%m/%Y', '%d-%m-%Y', '%d.%m.%Y', '%Y-%m-%d', '%Y/%m/%d',
                '%d/%m/%y', '%d-%m-%y', '%d.%m.%y'):
        try:
            dt = datetime.strptime(date_str, fmt)
            return dt.strftime('%Y-%m-%d')
        except ValueError:
            continue
    return date_str
