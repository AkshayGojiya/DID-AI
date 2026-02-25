"""
Face Verification Service
=========================
Real face verification and detection using DeepFace.
Uses ArcFace model with cosine distance for high-accuracy face matching.
"""

import base64
import time
import logging
import numpy as np
from io import BytesIO
from PIL import Image

logger = logging.getLogger(__name__)

# DeepFace is imported lazily on first use so the server starts fast
# and model weights are downloaded/loaded only when needed.
_deepface = None


def _get_deepface():
    """Lazy-load DeepFace to avoid slow startup."""
    global _deepface
    if _deepface is None:
        logger.info("Loading DeepFace library (first call — models will download if needed)...")
        from deepface import DeepFace
        _deepface = DeepFace
        logger.info("DeepFace loaded successfully")
    return _deepface


def _decode_base64_image(base64_str: str) -> np.ndarray:
    """
    Decode a base64 string into a numpy array (RGB).
    Handles both raw base64 and data-URI prefixed strings.
    """
    # Strip data URI prefix if present (e.g. "data:image/jpeg;base64,...")
    if ',' in base64_str:
        base64_str = base64_str.split(',', 1)[1]

    img_bytes = base64.b64decode(base64_str)
    img = Image.open(BytesIO(img_bytes)).convert('RGB')
    return np.array(img)


class FaceVerificationService:
    """Handles face verification and detection using DeepFace."""

    # Configuration
    MODEL_NAME = "ArcFace"
    DETECTOR_BACKEND = "opencv"     # fast & reliable; alternatives: retinaface, mtcnn
    DISTANCE_METRIC = "cosine"
    CONFIDENCE_THRESHOLD = 0.40     # cosine distance threshold — lower = stricter

    _model_loaded = False

    @classmethod
    def warmup(cls):
        """
        Pre-load the model so the first real request is fast.
        Call this at server startup.
        """
        try:
            logger.info("Warming up face verification model...")
            DeepFace = _get_deepface()
            # Build the model by representing a tiny dummy image
            dummy = np.zeros((100, 100, 3), dtype=np.uint8)
            dummy[30:70, 30:70] = 200  # light square in center
            try:
                DeepFace.represent(
                    img_path=dummy,
                    model_name=cls.MODEL_NAME,
                    detector_backend="skip",  # skip detection on dummy
                    enforce_detection=False
                )
                cls._model_loaded = True
                logger.info("Face verification model warmed up")
            except Exception:
                # Model will load on first real request instead
                cls._model_loaded = False
                logger.warning("Warmup skipped — model will load on first request")
        except Exception as e:
            cls._model_loaded = False
            logger.warning(f"Warmup failed: {e}")

    @classmethod
    def is_ready(cls) -> bool:
        """Check if the model has been loaded."""
        return cls._model_loaded

    @classmethod
    def verify_faces(cls, document_image_b64: str, selfie_image_b64: str) -> dict:
        """
        Compare the face in a document photo against a selfie.

        Args:
            document_image_b64: Base64-encoded document image
            selfie_image_b64:   Base64-encoded selfie image

        Returns:
            dict with match result, confidence, and metadata
        """
        DeepFace = _get_deepface()
        start = time.time()

        img1 = _decode_base64_image(document_image_b64)
        img2 = _decode_base64_image(selfie_image_b64)

        result = DeepFace.verify(
            img1_path=img1,
            img2_path=img2,
            model_name=cls.MODEL_NAME,
            detector_backend=cls.DETECTOR_BACKEND,
            distance_metric=cls.DISTANCE_METRIC,
            enforce_detection=True
        )

        cls._model_loaded = True
        elapsed_ms = int((time.time() - start) * 1000)

        # DeepFace returns distance — convert to a 0-1 confidence score
        distance = result.get("distance", 0)
        threshold = result.get("threshold", cls.CONFIDENCE_THRESHOLD)
        confidence = round(max(0.0, 1.0 - distance), 4)

        return {
            "match": result.get("verified", False),
            "confidence": confidence,
            "distance": round(distance, 4),
            "threshold": threshold,
            "model": cls.MODEL_NAME,
            "detector": cls.DETECTOR_BACKEND,
            "distance_metric": cls.DISTANCE_METRIC,
            "processing_time_ms": elapsed_ms
        }

    @classmethod
    def detect_faces(cls, image_b64: str) -> dict:
        """
        Detect all faces in an image and return bounding boxes + landmarks.

        Args:
            image_b64: Base64-encoded image

        Returns:
            dict with detected faces, bounding boxes, and landmarks
        """
        DeepFace = _get_deepface()
        start = time.time()

        img = _decode_base64_image(image_b64)

        faces = DeepFace.extract_faces(
            img_path=img,
            detector_backend=cls.DETECTOR_BACKEND,
            enforce_detection=True,
            align=True
        )

        cls._model_loaded = True
        elapsed_ms = int((time.time() - start) * 1000)

        face_results = []
        for face in faces:
            facial_area = face.get("facial_area", {})
            face_results.append({
                "bounding_box": {
                    "x": facial_area.get("x", 0),
                    "y": facial_area.get("y", 0),
                    "width": facial_area.get("w", 0),
                    "height": facial_area.get("h", 0)
                },
                "confidence": round(face.get("confidence", 0), 4),
                "landmarks": {
                    "left_eye": face.get("facial_area", {}).get("left_eye"),
                    "right_eye": face.get("facial_area", {}).get("right_eye")
                }
            })

        return {
            "faces_detected": len(face_results),
            "faces": face_results,
            "detector": cls.DETECTOR_BACKEND,
            "processing_time_ms": elapsed_ms
        }
