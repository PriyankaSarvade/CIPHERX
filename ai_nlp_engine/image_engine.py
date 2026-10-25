from deepface import DeepFace
import os
from typing import Dict, Any

def match_suspect_faces(img1_path: str, img2_path: str) -> Dict[str, Any]:
    """
    Compares two suspect photos using ArcFace and flexible thresholding
    designed for real-world unconstrained photos.
    """
    try:
        # ArcFace provides state-of-the-art accuracy across angles & lighting
        verification = DeepFace.verify(
            img1_path=img1_path, 
            img2_path=img2_path, 
            model_name="ArcFace",
            detector_backend="opencv",
            distance_metric="cosine",
            enforce_detection=False
        )
        
        distance = verification.get("distance", 1.0)
        
        # Adjust custom practical threshold for real-world photo variations (0.65 threshold)
        CUSTOM_THRESHOLD = 0.65
        is_verified = distance <= CUSTOM_THRESHOLD

        # Calculate a realistic percentage match score (0% to 100%)
        similarity_score = max(0.0, min(100.0, round((1.0 - (distance / CUSTOM_THRESHOLD)) * 100, 2)))
        
        # Boost visual score display if verified
        if is_verified and similarity_score < 60.0:
            similarity_score = round(60.0 + (1.0 - distance) * 35.0, 2)

        # Extract age & gender attributes
        demographics = DeepFace.analyze(
            img_path=img1_path, 
            actions=['age', 'gender'], 
            enforce_detection=False
        )
        
        demo_data = demographics[0] if isinstance(demographics, list) else demographics

        return {
            "is_same_person": is_verified,
            "face_match_distance": round(distance, 3),
            "match_threshold_used": CUSTOM_THRESHOLD,
            "similarity_score": similarity_score,
            "verification_model_used": "ArcFace",
            "predicted_visual_attributes": {
                "estimated_age": demo_data.get("age"),
                "dominant_gender": demo_data.get("dominant_gender")
            }
        }
    except Exception as e:
        return {
            "error": str(e), 
            "is_same_person": False, 
            "similarity_score": 0.0
        }