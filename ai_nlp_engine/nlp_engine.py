import re
from typing import List, Dict, Any
from collections import Counter

# Regular Expressions for Law Enforcement Attributes
PHONE_REGEX = r"\b(?:\+91[\-\s]?)?[6-9]\d{9}\b"
VEHICLE_REGEX = r"\b[A-Z]{2}\s?\d{2}\s?[A-Z]{1,2}\s?\d{4}\b"
BANK_ACC_REGEX = r"\b\d{9,18}\b"
IFSC_REGEX = r"\b[A-Z]{4}0[A-Z0-9]{6}\b"
HEIGHT_REGEX = r"\b(?:[4-7]\s?(?:ft|feet|')\s?\d{1,2}\s?(?:in|inches|\")?|\d{3}\s?cm)\b"
AGE_REGEX = r"\b(?:\d{1,2})\s?(?:years old|yrs old|yo|years of age)\b"
GENDER_REGEX = r"\b(male|female|transgender|man|woman)\b"

JOB_KEYWORDS = ["engineer", "driver", "contractor", "accountant", "businessman", "broker", "agent", "worker", "student"]

def extract_entities_and_relations(text: str) -> Dict[str, Any]:
    """
    Basic extraction fallback.
    """
    entities = []
    for match in re.finditer(PHONE_REGEX, text):
        entities.append({"text": match.group(), "label": "PHONE_NUMBER", "start": match.start(), "end": match.end()})
    for match in re.finditer(VEHICLE_REGEX, text, re.IGNORECASE):
        entities.append({"text": match.group().upper(), "label": "VEHICLE", "start": match.start(), "end": match.end()})

    return {"entities": entities, "relations": []}


def extract_extended_entities(text: str) -> Dict[str, Any]:
    """
    Detailed attribute extraction without spaCy C-binding dependencies.
    """
    entities = []
    words = text.split()
    
    # Capitalized words treated as candidate names/locations
    people_found = [word.strip(",.") for word in words if word.istitle() and len(word) > 2]

    for p in people_found:
        entities.append({"text": p, "label": "PERSON"})

    for match in re.finditer(PHONE_REGEX, text):
        entities.append({"text": match.group(), "label": "PHONE_NUMBER"})

    for match in re.finditer(VEHICLE_REGEX, text, re.IGNORECASE):
        entities.append({"text": match.group().upper(), "label": "VEHICLE"})

    for match in re.finditer(BANK_ACC_REGEX, text):
        if not re.match(PHONE_REGEX, match.group()):
            entities.append({"text": match.group(), "label": "BANK_ACCOUNT"})

    for match in re.finditer(IFSC_REGEX, text):
        entities.append({"text": match.group(), "label": "IFSC_CODE"})

    for match in re.finditer(HEIGHT_REGEX, text, re.IGNORECASE):
        entities.append({"text": match.group(), "label": "HEIGHT"})

    for match in re.finditer(AGE_REGEX, text, re.IGNORECASE):
        entities.append({"text": match.group(), "label": "AGE"})

    for match in re.finditer(GENDER_REGEX, text, re.IGNORECASE):
        entities.append({"text": match.group(), "label": "GENDER"})

    for word in words:
        if word.lower() in JOB_KEYWORDS:
            entities.append({"text": word, "label": "JOB_TITLE"})

    person_counts = dict(Counter(people_found))
    unique_people = list(set(people_found))
    relations = []
    
    if len(unique_people) >= 2:
        for i in range(len(unique_people) - 1):
            relations.append({
                "source": unique_people[i],
                "target": unique_people[i+1],
                "relation_type": "MEETS_WITH",
                "interaction_frequency": person_counts.get(unique_people[i], 1)
            })

    return {
        "entities": entities,
        "relations": relations,
        "meeting_network_summary": {
            "total_suspects_encountered": len(unique_people),
            "contact_counts_per_person": person_counts
        }
    }