import json
import hashlib
import os
from datetime import datetime

LOG_FILE = "audit_log.json"

def get_last_hash() -> str:
    """Retrieves the hash of the most recent log entry to maintain the chain."""
    if not os.path.exists(LOG_FILE):
        # If this is the very first log, we use a standard starting point
        return "GENESIS_HASH_00000000000000000000"
    
    try:
        with open(LOG_FILE, "r") as f:
            logs = json.load(f)
            if len(logs) > 0:
                return logs[-1]["current_hash"]
    except (json.JSONDecodeError, FileNotFoundError):
        pass
        
    return "GENESIS_HASH_00000000000000000000"

def log_investigator_activity(investigator_id: str, action: str, resource_id: str, status: str = "SUCCESS"):
    """
    Logs an action and securely chains it to the previous log using SHA-256.
    """
    timestamp = datetime.utcnow().isoformat()
    previous_hash = get_last_hash()
    
    # 1. Create the base log entry
    log_entry = {
        "timestamp": timestamp,
        "investigator_id": investigator_id,
        "action": action,
        "resource_id": resource_id,
        "status": status,
        "previous_hash": previous_hash
    }
    
    # 2. Calculate the current hash (fingerprint of this specific event + previous hash)
    log_string = json.dumps(log_entry, sort_keys=True)
    current_hash = hashlib.sha256(log_string.encode('utf-8')).hexdigest()
    
    # 3. Attach the signature to the log
    log_entry["current_hash"] = current_hash
    
    # 4. Save it to the JSON file
    logs = []
    if os.path.exists(LOG_FILE):
        with open(LOG_FILE, "r") as f:
            try:
                logs = json.load(f)
            except json.JSONDecodeError:
                pass
                
    logs.append(log_entry)
    
    with open(LOG_FILE, "w") as f:
        json.dump(logs, f, indent=4)
        
    print(f"SECURE LOG WRITTEN: {action} on {resource_id}")
    return current_hash

def get_all_audit_logs():
    """Returns all logs for the dashboard."""
    if not os.path.exists(LOG_FILE):
        return []
    with open(LOG_FILE, "r") as f:
        return json.load(f)

def verify_audit_chain() -> dict:
    """
    Recalculates every hash from the beginning of time. 
    If a rogue admin edited even a single character in the past, this will catch it.
    """
    if not os.path.exists(LOG_FILE):
        return {"chain_intact": True, "message": "No logs to verify."}
        
    with open(LOG_FILE, "r") as f:
        logs = json.load(f)
        
    expected_previous = "GENESIS_HASH_00000000000000000000"
    
    for i, entry in enumerate(logs):
        # Check 1: Does it properly link to the previous block?
        if entry["previous_hash"] != expected_previous:
            return {"chain_intact": False, "message": f"Chain broken at log index {i}! Missing or altered link."}
            
        # Check 2: Has the data inside this block been changed?
        recorded_hash = entry.pop("current_hash") # Remove temporarily to recalculate
        recalculated_hash = hashlib.sha256(json.dumps(entry, sort_keys=True).encode('utf-8')).hexdigest()
        
        if recalculated_hash != recorded_hash:
            return {"chain_intact": False, "message": f"Tampering detected at log index {i}! Data was altered."}
            
        # Put it back and move to the next link in the chain
        entry["current_hash"] = recorded_hash
        expected_previous = recorded_hash
        
    return {"chain_intact": True, "message": f"Audit chain verified. All {len(logs)} logs are 100% cryptographically secure."}