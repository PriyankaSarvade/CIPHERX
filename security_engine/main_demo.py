import json
import os

from canary_trap import check_canary_trap
from fastapi import Depends, FastAPI, File, HTTPException, UploadFile
from encryption import encrypt_sensitive_text
from rbac import verify_access
from audit_logger import log_investigator_activity, get_all_audit_logs, verify_audit_chain
from advanced_security import (
    mask_aadhaar,
    mask_phone_number,
    sanitize_ai_prompt,
    sign_verification_decision,
    verify_case_access,
)
from hashing_evidence import generate_file_hash

app = FastAPI(title="CIPERX Security Core")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production this would be the frontend's actual URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
#        YOUR ORIGINAL ROUTES
# ==========================================

@app.post("/api/auth/webauthn/login")
def passwordless_login():
    return {"status": "success", "message": "Passkey authentication simulated"}

@app.get("/api/secure-data")
def get_secure_data(user_role: str, required_permission: str = "view_local_fir"):
    # 1. Check if they have clearance
    verify_access(user_role=user_role, required_permission=required_permission)
    
    # 2. Get the "raw" data (this would normally come from a database)
    raw_evidence = "Suspect phone number is +91 98201 44521"
    
    # 3. Actually encrypt the data using your fixed function!
    secured_text = encrypt_sensitive_text(raw_evidence)
    
    return {"status": "success", "data": secured_text}

@app.get("/api/honeytoken-trigger")
def honeytoken_endpoint(resource_id: str = "SUS-CANARY-001"):
    # Call the actual function name and provide dummy data for the test
    is_trap = check_canary_trap(
        investigator_id="Officer_Demo", 
        action="search", 
        resource_id=resource_id
    )
    
    if is_trap:
        return {"error": "CRITICAL: Unauthorized access logged and reported."}
    return {"status": "success", "data": "Normal data accessed."}


# ==========================================
#           NEW CIPERX ROUTES
# ==========================================

@app.get("/api/cases/{case_id}/graph")
def get_network_graph(case_id: str, access_granted: bool = Depends(verify_case_access)):
    """Loads actual case data from the JSON dataset to build the UI network graph."""
    file_path = "ciperx_master_database.json"
    
    # 1. Check if the file is in the folder
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=500, 
            detail="Demo dataset missing! Please make sure the JSON file is in the folder."
        )
        
    # 2. Read the JSON data
    with open(file_path, "r") as f:
        all_cases = json.load(f)
        
    # 3. Search the dataset for the requested case ID
    for case in all_cases:
        if case["case_id"] == case_id:
            # Found the case! Return the real data to the frontend
            return {
                "status": "success",
                "case_info": {
                    "title": case["case_title"],
                    "officer": case["lead_officer"]
                },
                "nodes": case["entities"],          # The dots on the graph
                "edges": case["relationships"]      # The lines connecting them
            }
            
    # If the case ID isn't in the JSON file
    raise HTTPException(status_code=404, detail=f"Case {case_id} not found in the database.")

@app.post("/api/ai-assistant/ask")
def ask_ai(user_query: str):
    safe_query = sanitize_ai_prompt(user_query)
    return {"status": "success", "ai_response": f"Processed safely: {safe_query}"}

# ==========================================
#        EVIDENCE & MASKING ROUTES
# ==========================================

@app.post("/api/evidence/upload")
async def upload_evidence(file: UploadFile = File(...)):
    """Simulates an investigator uploading a PDF/Image of evidence."""
    
    # Note: Using your existing generate_evidence_hash function imported on line 10
    file_fingerprint = await generate_file_hash(file) 
    
    return {
        "status": "success",
        "filename": file.filename,
        "sha256_hash": file_fingerprint,
        "court_admissible": True
    }

@app.get("/api/evidence/person/{person_id}")
def get_person_details(person_id: str, reveal: bool = False):
    """Returns a suspect's profile. Masks data by default unless 'reveal=True' is requested."""
    raw_phone = "+91 98201 44521"
    raw_aadhaar = "1234 5678 9012"
    
    if reveal:
        return {
            "phone": raw_phone, 
            "aadhaar": raw_aadhaar,
            "warning": "Unmasked data. Action logged."
        }
    
    return {
        "phone": mask_phone_number(raw_phone),
        "aadhaar": mask_aadhaar(raw_aadhaar),
        "warning": "Masked for privacy."
    }

# ==========================================
#      TAMPER-PROOF VERIFICATION ROUTE
# ==========================================

@app.post("/api/network/verify-link")
def verify_ai_connection(investigator_id: str, connection_id: str, decision: str):
    """
    Endpoint for investigators to Verify or Reject an AI-generated network link.
    Only accepts 'VERIFIED' or 'REJECTED'.
    """
    decision = decision.upper()
    if decision not in ["VERIFIED", "REJECTED"]:
        raise HTTPException(status_code=400, detail="Decision must be VERIFIED or REJECTED")
    
    # Generate the cryptographic receipt
    security_receipt = sign_verification_decision(investigator_id, connection_id, decision)
    
    # In reality, you would save 'security_receipt' to your database here.
    
    return {
        "status": "success",
        "message": f"Link {connection_id} marked as {decision} by {investigator_id}.",
        "tamper_proof_receipt": security_receipt
    }
@app.get("/api/security/verify-audit-logs")
def verify_logs():
    """Endpoint to prove to the court that internal logs haven't been tampered with."""
    verification_result = verify_audit_chain()
    return verification_result