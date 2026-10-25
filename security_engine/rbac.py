from enum import Enum
from fastapi import HTTPException, status

# Define the strict hierarchy of law enforcement roles
class InvestigatorRole(str, Enum):
    DESK_OFFICER = "Desk Officer"           # Can view basic local reports
    INVESTIGATOR = "Investigator"           # Can view criminal graphs and connect nodes
    INTELLIGENCE_DIRECTOR = "Director"      # Has full access to all sensitive/financial data
    SYS_ADMIN = "System Admin"              # Can manage system configurations

# Define which roles are allowed to access which clearance levels
ROLE_PERMISSIONS = {
    "view_local_fir": [InvestigatorRole.DESK_OFFICER, InvestigatorRole.INVESTIGATOR, InvestigatorRole.INTELLIGENCE_DIRECTOR],
    "view_network_graph": [InvestigatorRole.INVESTIGATOR, InvestigatorRole.INTELLIGENCE_DIRECTOR],
    "export_financial_data": [InvestigatorRole.INTELLIGENCE_DIRECTOR],
    "manage_users": [InvestigatorRole.SYS_ADMIN]
}

def verify_access(user_role: str, required_permission: str):
    """
    Middleware function to check if the user's role has the required permission.
    Raises an HTTP 403 Forbidden error if they do not have clearance.
    """
    allowed_roles = ROLE_PERMISSIONS.get(required_permission, [])
    
    if user_role not in [role.value for role in allowed_roles]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Security Alert: Your role '{user_role}' does not have clearance for '{required_permission}'."
        )
    return True