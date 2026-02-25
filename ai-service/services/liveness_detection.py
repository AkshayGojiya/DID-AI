"""
Liveness Detection Service
==========================
Real liveness detection using MediaPipe Face Mesh.

Detects:
- Blink:      Eye Aspect Ratio (EAR) drops below threshold across frames
- Head turn:  Nose tip shifts left/right relative to face center
- Smile:      Mouth aspect ratio widens
- Nod:        Nose tip shifts up/down across frames

Also performs basic anti-spoofing by checking landmark variance
across frames (flat/screen images produce near-zero movement).

MediaPipe compatibility note:
  Uses static_image_mode=True and a fresh context-managed FaceMesh
  per request batch. This works correctly on MediaPipe 0.10+.
"""

import base64
import time
import math
import logging
import numpy as np
from io import BytesIO
from PIL import Image

logger = logging.getLogger(__name__)

_mp = None


def _import_mediapipe():
    """Import mediapipe once and cache the module."""
    global _mp
    if _mp is None:
        import mediapipe as mp  # raises ImportError if not installed
        _mp = mp
    return _mp


def _decode_base64_image(b64: str) -> np.ndarray:
    """Decode base64 to RGB numpy array."""
    if ',' in b64:
        b64 = b64.split(',', 1)[1]
    img_bytes = base64.b64decode(b64)
    img = Image.open(BytesIO(img_bytes)).convert('RGB')
    return np.array(img)


# -------------------------------------------------------
# Landmark indices (MediaPipe 468-point face mesh)
# -------------------------------------------------------
LEFT_EYE_TOP    = 159   # upper eyelid centre
LEFT_EYE_BOTTOM = 145   # lower eyelid centre
LEFT_EYE_INNER  = 133
LEFT_EYE_OUTER  = 33

RIGHT_EYE_TOP    = 386
RIGHT_EYE_BOTTOM = 374
RIGHT_EYE_INNER  = 362
RIGHT_EYE_OUTER  = 263

UPPER_LIP   = 13
LOWER_LIP   = 14
LEFT_MOUTH  = 61
RIGHT_MOUTH = 291

NOSE_TIP     = 1
LEFT_CHEEK   = 234
RIGHT_CHEEK  = 454
FOREHEAD     = 10
CHIN         = 152


def _lm_px(landmarks, idx, w, h):
    """Return (x, y) pixel coords for a landmark index."""
    lm = landmarks.landmark[idx]
    return (lm.x * w, lm.y * h)


def _dist(a, b):
    return math.hypot(a[0] - b[0], a[1] - b[1])


def _compute_ear(landmarks, w, h):
    """Average Eye Aspect Ratio for both eyes. Low EAR = closed."""
    l_top = _lm_px(landmarks, LEFT_EYE_TOP,    w, h)
    l_bot = _lm_px(landmarks, LEFT_EYE_BOTTOM, w, h)
    l_inn = _lm_px(landmarks, LEFT_EYE_INNER,  w, h)
    l_out = _lm_px(landmarks, LEFT_EYE_OUTER,  w, h)
    l_ear = _dist(l_top, l_bot) / max(_dist(l_inn, l_out), 1e-6)

    r_top = _lm_px(landmarks, RIGHT_EYE_TOP,    w, h)
    r_bot = _lm_px(landmarks, RIGHT_EYE_BOTTOM, w, h)
    r_inn = _lm_px(landmarks, RIGHT_EYE_INNER,  w, h)
    r_out = _lm_px(landmarks, RIGHT_EYE_OUTER,  w, h)
    r_ear = _dist(r_top, r_bot) / max(_dist(r_inn, r_out), 1e-6)

    return (l_ear + r_ear) / 2


def _compute_mar(landmarks, w, h):
    """Mouth Aspect Ratio. Higher = more open / wider smile."""
    top   = _lm_px(landmarks, UPPER_LIP,   w, h)
    bot   = _lm_px(landmarks, LOWER_LIP,   w, h)
    left  = _lm_px(landmarks, LEFT_MOUTH,  w, h)
    right = _lm_px(landmarks, RIGHT_MOUTH, w, h)
    return _dist(top, bot) / max(_dist(left, right), 1e-6)


class LivenessDetectionService:
    """Liveness detection via MediaPipe FaceMesh analysis across frames."""

    EAR_BLINK_THRESHOLD  = 0.21   # EAR below this → eye closed
    MAR_SMILE_THRESHOLD  = 0.15   # MAR above this → smiling
    HEAD_TURN_THRESHOLD  = 0.06   # nose-x shift / face-width
    NOD_THRESHOLD        = 0.04   # nose-y shift / face-height
    SPOOF_VAR_THRESHOLD  = 0.001  # landmark variance; near-zero → spoof

    _loaded = False

    @classmethod
    def is_ready(cls) -> bool:
        return cls._loaded

    @classmethod
    def warmup(cls):
        """Verify MediaPipe is importable and FaceMesh initialises correctly."""
        try:
            mp = _import_mediapipe()
            # Actually instantiate FaceMesh to trigger model download/cache
            with mp.solutions.face_mesh.FaceMesh(
                static_image_mode=True,
                max_num_faces=1,
                refine_landmarks=True,
                min_detection_confidence=0.5
            ) as fm:
                # Process a tiny dummy RGB image to confirm the model works
                dummy = np.zeros((64, 64, 3), dtype=np.uint8)
                fm.process(dummy)

            cls._loaded = True
            logger.info("LivenessDetectionService: MediaPipe FaceMesh ready")

        except Exception as e:
            cls._loaded = False
            logger.error(f"LivenessDetectionService warmup FAILED: {type(e).__name__}: {e}")
            raise   # re-raise so caller knows why it failed

    @classmethod
    def detect(cls, frames_b64: list, challenge_type: str = 'blink') -> dict:
        """
        Analyse a sequence of base64 frames for liveness.

        Args:
            frames_b64:     List of base64-encoded frame images (>=5 recommended)
            challenge_type: 'blink' | 'head_left' | 'head_right' | 'smile' | 'nod'

        Returns:
            dict with liveness result, anti-spoofing, and per-frame metrics
        """
        mp = _import_mediapipe()
        cls._loaded = True
        start = time.time()

        ear_values  = []
        mar_values  = []
        nose_x_vals = []
        nose_y_vals = []
        face_widths = []
        face_heights = []
        frames_with_face = 0

        # Use FaceMesh as context manager — required for MediaPipe 0.10+
        with mp.solutions.face_mesh.FaceMesh(
            static_image_mode=True,      # treat every frame independently
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5
        ) as face_mesh:

            for b64 in frames_b64:
                img = _decode_base64_image(b64)
                h, w = img.shape[:2]

                results = face_mesh.process(img)
                if not results.multi_face_landmarks:
                    continue

                frames_with_face += 1
                lm = results.multi_face_landmarks[0]

                ear_values.append(_compute_ear(lm, w, h))
                mar_values.append(_compute_mar(lm, w, h))

                nose  = _lm_px(lm, NOSE_TIP,    w, h)
                lcheek = _lm_px(lm, LEFT_CHEEK, w, h)
                rcheek = _lm_px(lm, RIGHT_CHEEK, w, h)
                foreh  = _lm_px(lm, FOREHEAD,   w, h)
                chin_p = _lm_px(lm, CHIN,        w, h)

                nose_x_vals.append(nose[0])
                nose_y_vals.append(nose[1])
                face_widths.append(abs(rcheek[0] - lcheek[0]))
                face_heights.append(abs(chin_p[1] - foreh[1]))

        elapsed_ms = int((time.time() - start) * 1000)
        total_frames = len(frames_b64)

        # Require face in ≥40% of frames
        if frames_with_face < max(1, total_frames * 0.4):
            return {
                "is_live": False,
                "confidence": 0.0,
                "challenge_completed": False,
                "challenge_type": challenge_type,
                "reason": "Face not detected in enough frames",
                "anti_spoofing": {
                    "is_real_face": False,
                    "confidence": 0.0,
                    "spoof_type_detected": "no_face"
                },
                "frames_analyzed": total_frames,
                "frames_with_face": frames_with_face,
                "processing_time_ms": elapsed_ms
            }

        avg_fw = float(np.mean(face_widths))  if face_widths  else 1.0
        avg_fh = float(np.mean(face_heights)) if face_heights else 1.0

        # ---- Challenge evaluation ----
        challenge_passed = False
        challenge_conf   = 0.0

        if challenge_type == 'blink':
            if ear_values:
                min_ear   = min(ear_values)
                ear_range = max(ear_values) - min_ear
                challenge_passed = min_ear < cls.EAR_BLINK_THRESHOLD and ear_range > 0.05
                challenge_conf   = min(1.0, ear_range / 0.12)

        elif challenge_type in ('head_left', 'head_right'):
            if nose_x_vals and avg_fw > 0:
                shift = (max(nose_x_vals) - min(nose_x_vals)) / avg_fw
                challenge_passed = shift > cls.HEAD_TURN_THRESHOLD
                challenge_conf   = min(1.0, shift / (cls.HEAD_TURN_THRESHOLD * 2))

        elif challenge_type == 'smile':
            if mar_values:
                max_mar = max(mar_values)
                mar_range = max_mar - min(mar_values)
                challenge_passed = max_mar > cls.MAR_SMILE_THRESHOLD or mar_range > 0.04
                challenge_conf   = min(1.0, max_mar / max(cls.MAR_SMILE_THRESHOLD, 1e-6))

        elif challenge_type == 'nod':
            if nose_y_vals and avg_fh > 0:
                shift = (max(nose_y_vals) - min(nose_y_vals)) / avg_fh
                challenge_passed = shift > cls.NOD_THRESHOLD
                challenge_conf   = min(1.0, shift / (cls.NOD_THRESHOLD * 2))

        challenge_conf = round(max(0.0, min(1.0, challenge_conf)), 4)

        # ---- Anti-spoofing: landmark variance ----
        is_real    = True
        spoof_conf = 0.95
        spoof_type = None

        if len(nose_x_vals) >= 3:
            x_var = float(np.var(nose_x_vals)) / (avg_fw ** 2 + 1e-9)
            y_var = float(np.var(nose_y_vals)) / (avg_fh ** 2 + 1e-9)
            total_var = x_var + y_var

            if total_var < cls.SPOOF_VAR_THRESHOLD and not challenge_passed:
                is_real    = False
                spoof_conf = round(1.0 - total_var / max(cls.SPOOF_VAR_THRESHOLD, 1e-9), 4)
                spoof_type = "photo_or_screen"

        liveness_conf = round(
            (0.6 * challenge_conf + 0.4 * spoof_conf) if challenge_passed
            else challenge_conf * 0.5,
            4
        )

        return {
            "is_live":             challenge_passed and is_real,
            "confidence":          liveness_conf,
            "challenge_completed": challenge_passed,
            "challenge_type":      challenge_type,
            "anti_spoofing": {
                "is_real_face":       is_real,
                "confidence":         spoof_conf,
                "spoof_type_detected": spoof_type
            },
            "details": {
                "ear_min":      round(min(ear_values), 4)   if ear_values   else None,
                "ear_max":      round(max(ear_values), 4)   if ear_values   else None,
                "mar_max":      round(max(mar_values), 4)   if mar_values   else None,
                "nose_x_range": round((max(nose_x_vals) - min(nose_x_vals)) / avg_fw, 4) if nose_x_vals else None,
                "nose_y_range": round((max(nose_y_vals) - min(nose_y_vals)) / avg_fh, 4) if nose_y_vals else None,
            },
            "frames_analyzed":   total_frames,
            "frames_with_face":  frames_with_face,
            "processing_time_ms": elapsed_ms
        }
