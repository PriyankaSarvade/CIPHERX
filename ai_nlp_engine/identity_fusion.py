from rapidfuzz import fuzz
from typing import List, Dict, Any

def fuse_identities(
    new_entities: List[Dict[str, str]], 
    existing_db_entities: List[Dict[str, str]], 
    threshold: float = 70.0  # Set threshold to 70 for partial names like "Vikram S."
) -> List[Dict[str, Any]]:
    """
    Compares newly extracted entities against database records
    and flags duplicates or aliases based on fuzzy matching.
    """
    fusion_results = []

    for new_ent in new_entities:
        best_match = None
        highest_score = 0.0

        for db_ent in existing_db_entities:
            # Match entities of the same type (e.g., PERSON vs PERSON)
            if new_ent.get("label") == db_ent.get("label"):
                # Use partial ratio or token sort ratio for name abbreviations
                score = fuzz.partial_ratio(new_ent["text"].lower(), db_ent["text"].lower())
                if score > highest_score:
                    highest_score = score
                    best_match = db_ent

        # Check against threshold using best_match
        if highest_score >= threshold and best_match is not None:
            fusion_results.append({
                "input_entity": new_ent["text"],
                "matched_db_entity": best_match["text"],
                "confidence_score": round(highest_score / 100.0, 2),
                "status": "MERGED_ALIAS",
                "matched_id": best_match.get("id")
            })
        else:
            fusion_results.append({
                "input_entity": new_ent["text"],
                "matched_db_entity": None,
                "confidence_score": 1.0,
                "status": "NEW_ENTITY",
                "matched_id": None
            })

    return fusion_results