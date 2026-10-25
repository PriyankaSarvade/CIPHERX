from audit_logger import log_investigator_activity

# These are our "Honey-Tokens" - fake profiles that don't exist in the real world.
# If ANYONE searches for or exports these, they are caught in the trap.
HONEY_TOKENS = {
    "SUS-CANARY-001": "Ghost Syndicate Leader",
    "INF-DECOY-999": "Undercover Informant Alpha",
    "POL-FAKE-888": "Corrupted Politician Decoy"
}

def check_canary_trap(
    investigator_id: str, 
    action: str, 
    resource_id: str, 
    ip_address: str = "192.168.1.100"
) -> bool:
    """
    Checks if the requested resource is a Honey-Token.
    If it is, it silently triggers a critical alert without warning the user.
    """
    if resource_id in HONEY_TOKENS:
        # Trap triggered! Silently log a CRITICAL alert.
        log_investigator_activity(
            investigator_id=investigator_id,
            action="CRITICAL_INSIDER_THREAT_DETECTED",
            resource_id=resource_id,
            status="ALERT"
        )
        return True
    return False