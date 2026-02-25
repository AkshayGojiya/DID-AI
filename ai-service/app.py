"""
VerifyX AI Service
==================
Flask-based AI microservice for identity verification.
Provides face verification, liveness detection, and OCR capabilities.
"""

import os
import logging
from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime

from services.face_verification import FaceVerificationService
from services.liveness_detection import LivenessDetectionService
from services.ocr_service import OCRService

# Logging
logging.basicConfig(
    level=os.getenv('LOG_LEVEL', 'INFO'),
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# CORS configuration
CORS(app, resources={
    r"/api/*": {
        "origins": os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000,http://localhost:5000').split(','),
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# ===========================================
# Health Check Endpoints
# ===========================================

@app.route('/')
def home():
    """Root endpoint with service info."""
    return jsonify({
        'name': 'VerifyX AI Service',
        'version': '1.0.0',
        'status': 'running',
        'timestamp': datetime.utcnow().isoformat(),
        'endpoints': {
            'health': '/health',
            'face_verify': '/api/v1/face/verify',
            'liveness': '/api/v1/liveness/detect',
            'ocr': '/api/v1/ocr/extract'
        }
    })


@app.route('/health')
def health_check():
    """Health check endpoint for monitoring."""
    face_ready     = FaceVerificationService.is_ready()
    liveness_ready = LivenessDetectionService.is_ready()
    ocr_ready      = OCRService.is_ready()

    def status(ready): return 'ready' if ready else 'available (loads on first request)'

    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'services': {
            'face_verification':  status(face_ready),
            'liveness_detection': status(liveness_ready),
            'ocr_extraction':     status(ocr_ready),
        },
        'models': {
            'deepface':   'loaded' if face_ready     else 'not loaded yet',
            'mediapipe':  'loaded' if liveness_ready else 'not loaded yet',
            'tesseract':  'loaded' if ocr_ready      else 'not loaded yet',
        }
    })


# ===========================================
# Face Verification Endpoints
# ===========================================

@app.route('/api/v1/face/verify', methods=['POST'])
def verify_face():
    """
    Compare two face images and return similarity score.

    Expected payload:
    - document_image: Base64 encoded image from ID document
    - selfie_image: Base64 encoded selfie image
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({'error': 'No data provided'}), 400

        document_image = data.get('document_image')
        selfie_image = data.get('selfie_image')

        if not document_image or not selfie_image:
            return jsonify({'error': 'Both document_image and selfie_image are required'}), 400

        verification = FaceVerificationService.verify_faces(document_image, selfie_image)

        return jsonify({
            'success': True,
            'verification': {
                'match': verification['match'],
                'confidence': verification['confidence'],
                'threshold': verification['threshold'],
                'model': verification['model'],
                'distance_metric': verification['distance_metric']
            },
            'processing_time_ms': verification['processing_time_ms'],
            'timestamp': datetime.utcnow().isoformat()
        })

    except ValueError as e:
        # Face not detected or image decode error
        return jsonify({
            'success': False,
            'error': f'Face processing error: {str(e)}',
            'timestamp': datetime.utcnow().isoformat()
        }), 422

    except Exception as e:
        logger.exception("Face verification failed")
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500


@app.route('/api/v1/face/detect', methods=['POST'])
def detect_face():
    """
    Detect faces in an image and return bounding boxes.
    """
    try:
        data = request.get_json()

        if not data or 'image' not in data:
            return jsonify({'error': 'Image is required'}), 400

        detection = FaceVerificationService.detect_faces(data['image'])

        return jsonify({
            'success': True,
            'faces_detected': detection['faces_detected'],
            'faces': detection['faces'],
            'processing_time_ms': detection['processing_time_ms'],
            'timestamp': datetime.utcnow().isoformat()
        })

    except ValueError as e:
        return jsonify({
            'success': False,
            'error': f'Face detection error: {str(e)}',
            'timestamp': datetime.utcnow().isoformat()
        }), 422

    except Exception as e:
        logger.exception("Face detection failed")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# ===========================================
# Liveness Detection Endpoints
# ===========================================

@app.route('/api/v1/liveness/detect', methods=['POST'])
def detect_liveness():
    """
    Perform liveness detection on video frames using MediaPipe FaceMesh.

    Expected payload:
    - frames: List of base64 encoded video frames (min 5 recommended)
    - challenge_type: 'blink' | 'head_left' | 'head_right' | 'smile' | 'nod'
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({'error': 'No data provided'}), 400

        frames = data.get('frames', [])
        challenge_type = data.get('challenge_type', 'blink')

        if not frames:
            return jsonify({'error': 'At least one frame is required'}), 400

        valid_challenges = ('blink', 'head_left', 'head_right', 'smile', 'nod')
        if challenge_type not in valid_challenges:
            return jsonify({'error': f'Invalid challenge_type. Must be one of: {", ".join(valid_challenges)}'}), 400

        result = LivenessDetectionService.detect(frames, challenge_type)

        return jsonify({
            'success': True,
            'liveness': {
                'is_live':             result['is_live'],
                'confidence':          result['confidence'],
                'challenge_completed': result['challenge_completed'],
                'challenge_type':      result['challenge_type'],
            },
            'anti_spoofing': result['anti_spoofing'],
            'details':       result.get('details'),
            'frames_analyzed': result['frames_analyzed'],
            'frames_with_face': result['frames_with_face'],
            'processing_time_ms': result['processing_time_ms'],
            'timestamp': datetime.utcnow().isoformat()
        })

    except ValueError as e:
        return jsonify({
            'success': False,
            'error': f'Liveness processing error: {str(e)}',
            'timestamp': datetime.utcnow().isoformat()
        }), 422

    except Exception as e:
        logger.exception("Liveness detection failed")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/v1/liveness/challenge', methods=['GET'])
def get_liveness_challenge():
    """Return a random liveness challenge for the client to present."""
    import random

    challenges = [
        {'type': 'blink',      'instruction': 'Please blink your eyes twice slowly'},
        {'type': 'head_left',  'instruction': 'Slowly turn your head to the left'},
        {'type': 'head_right', 'instruction': 'Slowly turn your head to the right'},
        {'type': 'smile',      'instruction': 'Please give a natural smile'},
        {'type': 'nod',        'instruction': 'Nod your head up and down once'},
    ]

    challenge = random.choice(challenges)

    return jsonify({
        'success': True,
        'challenge': challenge,
        'timeout_seconds': 10,
        'min_frames': 10,
        'timestamp': datetime.utcnow().isoformat()
    })


# ===========================================
# OCR Endpoints
# ===========================================

@app.route('/api/v1/ocr/extract', methods=['POST'])
def extract_document_text():
    """
    Extract text and structured fields from a document image using Tesseract OCR.

    Expected payload:
    - image: Base64 encoded document image
    - document_type: 'passport' | 'driving_license' | 'national_id' | 'auto'
    """
    try:
        data = request.get_json()

        if not data or 'image' not in data:
            return jsonify({'error': 'Image is required'}), 400

        document_type = data.get('document_type', 'auto')

        result = OCRService.extract(data['image'], document_type)

        return jsonify({
            'success': True,
            'document_type':     result['document_type'],
            'extracted_data':    result['extracted_data'],
            'confidence_scores': result['confidence_scores'],
            'document_quality':  result['quality'],
            'mrz_found':         result['mrz_found'],
            'checks_passed':     result['checks_passed'],
            'checks_failed':     result['checks_failed'],
            'ocr_confidence':    result['ocr_confidence'],
            'processing_time_ms': result['processing_time_ms'],
            'timestamp': datetime.utcnow().isoformat()
        })

    except RuntimeError as e:
        # Tesseract not installed or not found
        return jsonify({
            'success': False,
            'error': f'Tesseract not available: {str(e)}',
            'hint': 'Install Tesseract and set TESSERACT_PATH in .env',
            'timestamp': datetime.utcnow().isoformat()
        }), 503

    except Exception as e:
        logger.exception("OCR extraction failed")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/v1/ocr/validate', methods=['POST'])
def validate_document():
    """
    Validate extracted document data for consistency and authenticity.

    Expected payload:
    - extracted_data: dict returned by /ocr/extract
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({'error': 'No data provided'}), 400

        extracted_data = data.get('extracted_data', data)  # accept flat or nested

        result = OCRService.validate(extracted_data)

        return jsonify({
            'success': True,
            'validation': {
                'is_valid':    result['is_valid'],
                'checks_passed': result['checks_passed'],
                'checks_failed': result['checks_failed'],
                'warnings':    result['warnings'],
            },
            'authenticity_score': result['authenticity_score'],
            'timestamp': datetime.utcnow().isoformat()
        })

    except Exception as e:
        logger.exception("Document validation failed")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# ===========================================
# Combined Verification Endpoint
# ===========================================

@app.route('/api/v1/verify/complete', methods=['POST'])
def complete_verification():
    """
    Full verification pipeline: face match + liveness + OCR + validation.

    Expected payload:
    - document_image:   Base64 encoded ID document image
    - selfie_image:     Base64 encoded selfie
    - liveness_frames:  List of base64 encoded frames for liveness check
    - challenge_type:   'blink' | 'head_left' | 'head_right' | 'smile' | 'nod'
    - document_type:    'passport' | 'driving_license' | 'national_id' | 'auto'
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({'error': 'No data provided'}), 400

        document_image  = data.get('document_image')
        selfie_image    = data.get('selfie_image')
        liveness_frames = data.get('liveness_frames', [])
        challenge_type  = data.get('challenge_type', 'blink')
        document_type   = data.get('document_type', 'auto')

        if not document_image or not selfie_image:
            return jsonify({'error': 'document_image and selfie_image are required'}), 400

        start = datetime.utcnow()
        errors = []

        # 1. Face verification
        try:
            face_result = FaceVerificationService.verify_faces(document_image, selfie_image)
            face_passed = face_result['match']
        except Exception as e:
            face_result = {'match': False, 'confidence': 0, 'error': str(e)}
            face_passed = False
            errors.append(f'face_verification: {str(e)}')

        # 2. Liveness detection
        liveness_result = None
        liveness_passed = False
        if liveness_frames:
            try:
                liveness_result = LivenessDetectionService.detect(liveness_frames, challenge_type)
                liveness_passed = liveness_result['is_live']
            except Exception as e:
                liveness_result = {'is_live': False, 'confidence': 0, 'error': str(e)}
                errors.append(f'liveness_detection: {str(e)}')
        else:
            liveness_result = {'is_live': None, 'note': 'No frames provided — skipped'}
            liveness_passed = True  # don't fail pipeline if caller skips liveness

        # 3. OCR extraction
        try:
            ocr_result = OCRService.extract(document_image, document_type)
            ocr_passed = len(ocr_result['extracted_data']) > 0
        except Exception as e:
            ocr_result = {'extracted_data': {}, 'error': str(e)}
            ocr_passed = False
            errors.append(f'ocr_extraction: {str(e)}')

        # 4. Data validation
        validation_result = None
        if ocr_result.get('extracted_data'):
            try:
                validation_result = OCRService.validate(ocr_result['extracted_data'])
                validation_passed = validation_result['is_valid']
            except Exception as e:
                validation_result = {'is_valid': False, 'error': str(e)}
                validation_passed = False
                errors.append(f'validation: {str(e)}')
        else:
            validation_result = {'is_valid': False, 'note': 'No extracted data to validate'}
            validation_passed = False

        overall_passed = face_passed and liveness_passed and ocr_passed
        elapsed_ms = int((datetime.utcnow() - start).total_seconds() * 1000)

        return jsonify({
            'success': True,
            'verification_id': f'ver_{start.strftime("%Y%m%d%H%M%S")}',
            'overall_result': 'PASSED' if overall_passed else 'FAILED',
            'results': {
                'face_verification': {
                    'passed':     face_passed,
                    'confidence': face_result.get('confidence', 0),
                    'match':      face_result.get('match', False),
                },
                'liveness_detection': {
                    'passed':     liveness_passed,
                    'confidence': liveness_result.get('confidence', None),
                    'is_live':    liveness_result.get('is_live'),
                },
                'document_ocr': {
                    'passed':        ocr_passed,
                    'mrz_found':     ocr_result.get('mrz_found', False),
                    'checks_passed': ocr_result.get('checks_passed', []),
                    'checks_failed': ocr_result.get('checks_failed', []),
                },
                'document_validation': {
                    'passed':             validation_passed,
                    'authenticity_score': validation_result.get('authenticity_score', 0) if validation_result else 0,
                }
            },
            'extracted_data': ocr_result.get('extracted_data', {}),
            'errors': errors,
            'processing_time_ms': elapsed_ms,
            'timestamp': start.isoformat()
        })

    except Exception as e:
        logger.exception("Complete verification failed")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# ===========================================
# Error Handlers
# ===========================================

@app.errorhandler(400)
def bad_request(e):
    return jsonify({
        'error': 'Bad Request',
        'message': str(e),
        'timestamp': datetime.utcnow().isoformat()
    }), 400


@app.errorhandler(404)
def not_found(e):
    return jsonify({
        'error': 'Not Found',
        'message': 'The requested endpoint does not exist',
        'timestamp': datetime.utcnow().isoformat()
    }), 404


@app.errorhandler(500)
def internal_error(e):
    return jsonify({
        'error': 'Internal Server Error',
        'message': 'An unexpected error occurred',
        'timestamp': datetime.utcnow().isoformat()
    }), 500


# ===========================================
# Run Application
# ===========================================

if __name__ == '__main__':
    port = int(os.getenv('PORT', 8000))
    debug = os.getenv('FLASK_DEBUG', 'true').lower() == 'true'

    print(f"""
    ╔═══════════════════════════════════════════════╗
    ║                                               ║
    ║   🤖 VerifyX AI Service                       ║
    ║                                               ║
    ║   Status:  Running                            ║
    ║   Port:    {port}                               ║
    ║   Debug:   {debug}                              ║
    ║                                               ║
    ║   Endpoints:                                  ║
    ║   • Health: http://localhost:{port}/health      ║
    ║   • Face:   http://localhost:{port}/api/v1/face ║
    ║   • OCR:    http://localhost:{port}/api/v1/ocr  ║
    ║                                               ║
    ╚═══════════════════════════════════════════════╝
    """)

    # Pre-load all models so the first real request is fast.
    # Set WARMUP_MODELS=false to skip and load lazily instead.
    if os.getenv('WARMUP_MODELS', 'true').lower() == 'true':
        FaceVerificationService.warmup()
        LivenessDetectionService.warmup()
        OCRService.warmup()

    app.run(host='0.0.0.0', port=port, debug=debug)
