"""
Liveness Detection Service (OpenCV-based)
=========================================
Pure OpenCV implementation using Haar cascade classifiers.
No MediaPipe / protobuf dependency.

Detects:
- Blink:      Eyes present in some frames, absent in others
- Head turn:  Face centre X-position shifts across frames
- Nod:        Face centre Y-position shifts across frames
- Smile:      Face width increases (mouth opens, cheeks widen)

Anti-spoofing:
- Near-zero positional variance across frames → photo/screen spoof

Haar cascades are bundled with opencv-python — no separate download needed.
"""

import base64
import time
import logging
import numpy as np
from io import BytesIO
from PIL import Image

logger = logging.getLogger(__name__)

# ── Module-level cascade handles (loaded once) ──
_face_cascade = None
_eye_cascade  = None


def _load_cascades():
    global _face_cascade, _eye_cascade
    if _face_cascade is None:
        import cv2
        _face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        )
        _eye_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + "haarcascade_eye.xml"
        )
    return _face_cascade, _eye_cascade


def _decode_frame(b64: str) -> np.ndarray:
    """Decode base64 → BGR numpy array (OpenCV format)."""
    if "," in b64:
        b64 = b64.split(",", 1)[1]
    img_bytes = base64.b64decode(b64)
    img = Image.open(BytesIO(img_bytes)).convert("RGB")
    arr = np.array(img)
    return arr[:, :, ::-1]   # RGB → BGR


class LivenessDetectionService:
    """Liveness detection using OpenCV Haar cascades across multiple frames."""

    # ── Tunable thresholds ──
    FACE_SCALE        = 1.1    # detectMultiScale scaleFactor
    FACE_NEIGHBORS    = 5      # detectMultiScale minNeighbors
    EYE_SCALE         = 1.1
    EYE_NEIGHBORS     = 3
    MOTION_THRESHOLD  = 0.04   # minimum normalised face-centre shift for head/nod
    SMILE_THRESHOLD   = 0.015  # minimum normalised face-width change for smile
    SPOOF_VAR_THRESH  = 0.0003 # variance below this → photo/screen detected

    _loaded = False

    @classmethod
    def is_ready(cls) -> bool:
        return cls._loaded

    @classmethod
    def warmup(cls):
        """Load and validate cascade classifiers at startup."""
        try:
            import cv2
            fc, ec = _load_cascades()
            if fc.empty() or ec.empty():
                raise RuntimeError("Haar cascade XML files not found")
            # Smoke-test with a blank image
            dummy = np.zeros((100, 100), dtype=np.uint8)
            fc.detectMultiScale(dummy, cls.FACE_SCALE, cls.FACE_NEIGHBORS)
            cls._loaded = True
            logger.info("LivenessDetectionService: OpenCV Haar cascades ready")
        except Exception as e:
            cls._loaded = False
            logger.error(f"LivenessDetectionService warmup FAILED: {type(e).__name__}: {e}")
            raise

    @classmethod
    def detect(cls, frames_b64: list, challenge_type: str = "blink") -> dict:
        """
        Analyse a sequence of base64 frames for liveness.

        Args:
            frames_b64:     List of base64-encoded frames (>=10 recommended).
            challenge_type: 'blink' | 'head_left' | 'head_right' | 'nod' | 'smile'

        Returns:
            dict with is_live, confidence, challenge result, and anti-spoofing verdict.
        """
        import cv2
        fc, ec = _load_cascades()
        cls._loaded = True

        start = time.time()

        face_cx   = []   # normalised face-centre X per frame
        face_cy   = []   # normalised face-centre Y per frame
        face_w    = []   # normalised face width
        eye_open  = []   # True if >=2 eyes detected
        frames_with_face = 0
        total = len(frames_b64)

        for b64 in frames_b64:
            frame = _decode_frame(b64)
            h, w  = frame.shape[:2]
            gray  = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            gray  = cv2.equalizeHist(gray)    # improve detection in low light

            faces = fc.detectMultiScale(
                gray,
                scaleFactor=cls.FACE_SCALE,
                minNeighbors=cls.FACE_NEIGHBORS,
                minSize=(50, 50),
            )

            if not len(faces):
                eye_open.append(False)
                continue

            # Use the largest detected face
            x, y, fw, fh = max(faces, key=lambda f: f[2] * f[3])
            frames_with_face += 1

            # Cast to Python float — detectMultiScale returns numpy.int32 values
            face_cx.append(float((x + fw / 2) / w))
            face_cy.append(float((y + fh / 2) / h))
            face_w.append(float(fw / w))

            # Eye detection inside the upper half of the face ROI
            roi_gray = gray[y : y + fh // 2, x : x + fw]
            eyes = ec.detectMultiScale(
                roi_gray,
                scaleFactor=cls.EYE_SCALE,
                minNeighbors=cls.EYE_NEIGHBORS,
            )
            eye_open.append(bool(len(eyes) >= 2))

        elapsed_ms = int((time.time() - start) * 1000)

        # Require face in >=40% of frames
        if frames_with_face < max(1, total * 0.4):
            return {
                "is_live":             False,
                "confidence":          0.0,
                "challenge_completed": False,
                "challenge_type":      challenge_type,
                "reason":              "Face not detected in enough frames",
                "anti_spoofing": {
                    "is_real_face":        False,
                    "confidence":          0.0,
                    "spoof_type_detected": "no_face",
                },
                "frames_analyzed":    total,
                "frames_with_face":   frames_with_face,
                "processing_time_ms": elapsed_ms,
            }

        # ── Anti-spoofing: positional variance ──
        is_real    = True
        spoof_conf = 0.95
        spoof_type = None

        if len(face_cx) >= 3:
            var_x = float(np.var(face_cx))
            var_y = float(np.var(face_cy))
            total_var = var_x + var_y

            if total_var < cls.SPOOF_VAR_THRESH:
                is_real    = False
                spoof_conf = round(1.0 - total_var / max(cls.SPOOF_VAR_THRESH, 1e-9), 4)
                spoof_type = "photo_or_screen"

        # ── Challenge evaluation ──
        challenge_passed = False
        challenge_conf   = 0.0

        if challenge_type == "blink":
            # Blink: at least one frame with eyes open AND one with eyes closed
            if eye_open:
                has_open   = any(eye_open)
                has_closed = not all(eye_open)
                challenge_passed = has_open and has_closed
                open_ratio = sum(eye_open) / len(eye_open)
                challenge_conf = min(1.0, abs(open_ratio - 0.5) * 2 + 0.3) if challenge_passed else open_ratio * 0.3

        elif challenge_type in ("head_left", "head_right"):
            if face_cx:
                x_range = max(face_cx) - min(face_cx)
                challenge_passed = bool(x_range > cls.MOTION_THRESHOLD)
                challenge_conf   = float(min(1.0, x_range / (cls.MOTION_THRESHOLD * 2)))

        elif challenge_type == "nod":
            if face_cy:
                y_range = max(face_cy) - min(face_cy)
                challenge_passed = bool(y_range > cls.MOTION_THRESHOLD)
                challenge_conf   = float(min(1.0, y_range / (cls.MOTION_THRESHOLD * 2)))

        elif challenge_type == "smile":
            if face_w:
                w_range = max(face_w) - min(face_w)
                challenge_passed = bool(w_range > cls.SMILE_THRESHOLD)
                challenge_conf   = float(min(1.0, w_range / (cls.SMILE_THRESHOLD * 2)))

        challenge_conf = round(max(0.0, min(1.0, challenge_conf)), 4)

        liveness_conf = round(
            (0.6 * challenge_conf + 0.4 * spoof_conf) if challenge_passed
            else challenge_conf * 0.5,
            4,
        )

        return {
            "is_live":             bool(challenge_passed and is_real),
            "confidence":          float(liveness_conf),
            "challenge_completed": bool(challenge_passed),
            "challenge_type":      challenge_type,
            "anti_spoofing": {
                "is_real_face":        bool(is_real),
                "confidence":          float(spoof_conf),
                "spoof_type_detected": spoof_type,
            },
            "details": {
                "face_x_range":      round(float(max(face_cx) - min(face_cx)), 4) if face_cx else None,
                "face_y_range":      round(float(max(face_cy) - min(face_cy)), 4) if face_cy else None,
                "eye_open_frames":   int(sum(eye_open)),
                "eye_closed_frames": int(sum(not e for e in eye_open)),
                "face_width_range":  round(float(max(face_w) - min(face_w)), 4) if face_w else None,
            },
            "frames_analyzed":    int(total),
            "frames_with_face":   int(frames_with_face),
            "processing_time_ms": int(elapsed_ms),
        }
