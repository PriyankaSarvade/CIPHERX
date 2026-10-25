from fastapi import HTTPException, Depends

# Mock database of which officers are assigned to which cases
# In reality, this would query your PostgreSQL/SQLite database
CASE_ASSIGNMENTS = {
    "CPX-2026-002": ["Officer_Khan", "Insp_Sharma"],
    "CPX-2026-008": ["Insp_Sharma", "Insp. R. Deshmukh"]
}

def verify_case_access(case_id: str, current_user: str = "Insp_Sharma"):
    """
    Dependency to check if the logged-in officer is assigned to the case.
    """
    # 1. Check if the case exists
    if case_id not in CASE_ASSIGNMENTS:
        raise HTTPException(status_code=404, detail="Case not found.")
    
    # 2. Check if the officer's name is in the case's assigned list
    allowed_officers = CASE_ASSIGNMENTS[case_id]
    
    if current_user not in allowed_officers:
        # ABAC kicks in: Block access and log the unauthorized attempt
        print(f"SECURITY ALERT: {current_user} attempted unauthorized access on {case_id}")
        raise HTTPException(
            status_code=403, 
            detail="Access Denied: You are not assigned to this investigation."
        )
    
    return True

# Example of how you protect a route
# @app.get("/api/cases/{case_id}/graph")
# def get_network_graph(case_id: str, access_granted: bool = Depends(verify_case_access)):
#     return {"data": "Here is the network graph for the case!"}

import re
from fastapi import HTTPException

# List of words hackers use to break AI rules
FORBIDDEN_PROMPTS = [
    "ignore previous", "system instructions", "bypass", 
    "reveal backend", "drop table", "developer mode"
]

def sanitize_ai_prompt(user_query: str) -> str:
    """
    Scans the investigator's chat prompt for dangerous instructions.
    """
    query_lower = user_query.lower()
    
    # 1. Check for forbidden hacking phrases
    for bad_word in FORBIDDEN_PROMPTS:
        if bad_word in query_lower:
            print(f"SECURITY ALERT: Prompt injection attempt blocked! Query: {user_query}")
            raise HTTPException(
                status_code=400, 
                detail="Security Violation: Invalid command detected in AI query."
            )
            
    # 2. Strip out weird characters that might mess up the database
    # Only allows letters, numbers, spaces, and basic punctuation
    clean_query = re.sub(r'[^a-zA-Z0-9\s\.\,\?]', '', user_query)
    
    return clean_query

# Example of how you protect the AI chat route
# @app.post("/api/ai-assistant/ask")
# def ask_ai(user_query: str):
#     safe_query = sanitize_ai_prompt(user_query)
#     # Now it is safe to send 'safe_query' to Gemini/your AI model!
#     return {"response": f"AI answers safely based on: {safe_query}"}

def mask_phone_number(phone: str) -> str:
    """Masks a phone number: '+91 98201 44521' becomes '+91 XXXX XXXX 21'"""
    # Remove any extra spaces and split
    clean_phone = phone.strip().replace("-", " ")
    parts = clean_phone.split(" ")
    
    if len(parts) >= 3:
        # Keep country code, mask middle, keep last 2 digits
        return f"{parts[0]} XXXX XXXX {parts[-1][-2:]}"
    
    # Fallback if format is weird
    return "XXXX-XXXX-XX"

def mask_aadhaar(aadhaar: str) -> str:
    """Masks an Aadhaar number: '1234 5678 9012' becomes 'XXXX XXXX 9012'"""
    clean_aadhaar = aadhaar.strip().replace("-", " ")
    parts = clean_aadhaar.split(" ")
    
    if len(parts) == 3:
        return f"XXXX XXXX {parts[-1]}"
    
    return "XXXX XXXX XXXX"

import hmac
import hashlib
from datetime import datetime

# In a real app, this secret stays hidden in a .env file
SIGNING_SECRET = b"ciperx_super_secret_tamper_key_2026"

def sign_verification_decision(investigator_id: str, connection_id: str, decision: str) -> dict:
    """
    Cryptographically signs an investigator's decision (Verify/Reject).
    Creates a tamper-proof receipt.
    """
    timestamp = datetime.utcnow().isoformat()
    
    # 1. Combine the exact details of what they are approving
    payload = f"{investigator_id}|{connection_id}|{decision}|{timestamp}"
    
    # 2. Sign it using HMAC-SHA256
    signature = hmac.new(
        SIGNING_SECRET, 
        payload.encode('utf-8'), 
        hashlib.sha256
    ).hexdigest()
    
    # 3. Return the digital receipt
    return {
        "payload": payload,
        "digital_signature": signature,
        "timestamp": timestamp
    }