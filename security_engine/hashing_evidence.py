import hashlib
import json
from typing import Any, Dict

def generate_evidence_hash(evidence_data: Dict[str, Any]) -> str:
    """
    Creates a SHA-256 hash of the evidence data. 
    This acts as a tamper-evident digital fingerprint.
    """
    # Convert dictionary to a stable JSON string (sorted keys ensure consistency)
    serialized_data = json.dumps(evidence_data, sort_keys=True).encode('utf-8')
    
    # Generate SHA-256 hash
    evidence_hash = hashlib.sha256(serialized_data).hexdigest()
    return evidence_hash

def verify_evidence_integrity(original_data: Dict[str, Any], stored_hash: str) -> bool:
    """
    Checks if the current data matches the stored blockchain/ledger hash.
    Returns True if the evidence is untouched, False if it was tampered with.
    """
    current_hash = generate_evidence_hash(original_data)
    return current_hash == stored_hash

import hashlib
from fastapi import UploadFile

async def generate_file_hash(file: UploadFile) -> str:
    """
    Generates a SHA-256 hash fingerprint for an uploaded evidence document.
    If even one pixel or text character changes later, this hash will completely change.
    """
    sha256_hash = hashlib.sha256()
    
    # Read the file in small chunks so it doesn't crash the server on large PDFs/Images
    while chunk := await file.read(8192):
        sha256_hash.update(chunk)
    
    # Rewind the file pointer back to the start so the backend can still save the file later
    await file.seek(0)
    
    return sha256_hash.hexdigest()