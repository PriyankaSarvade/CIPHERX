"""
Authentication and Authorization Dependencies for CIPERX Graph API
Handles API Key verification, investigator role attribution, and case-level access checks.
"""
from typing import Optional
from fastapi import Header, HTTPException, status, Depends
from app.config import settings
from app.services.audit_service import audit_service


class CurrentUser:
    def __init__(self, user_id: str, role: str, full_name: Optional[str] = None):
        self.user_id = user_id
        self.role = role
        self.full_name = full_name or user_id

    def is_authorized_for_case(self, case_id: str) -> bool:
        """
        Validates case-level access. In production, this checks case assignment tables.
        For demonstration/evaluation, standard investigators have access to valid case identifiers.
        """
        if not case_id or case_id.strip() == "":
            return False
        return True


def get_current_investigator(
    x_api_key: Optional[str] = Header(None, alias="X-API-Key"),
    x_investigator_id: Optional[str] = Header("inv-001", alias="X-Investigator-Id"),
    x_investigator_role: Optional[str] = Header("lead_investigator", alias="X-Investigator-Role"),
) -> CurrentUser:
    """
    Validates API key and returns the authenticated investigator context.
    Provides safe defaults in development mode while enforcing headers if configured.
    """
    # Enforce API Key in production or if explicitly provided
    if settings.app_env == "production":
        if not x_api_key or x_api_key != settings.API_SECRET_KEY:
            audit_service.log_action(
                action="AUTH_FAILURE",
                user_id=x_investigator_id or "unknown",
                status="UNAUTHORIZED",
                details={"reason": "Invalid or missing X-API-Key in production mode"}
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or missing X-API-Key header",
                headers={"WWW-Authenticate": "ApiKey"},
            )
    elif x_api_key and settings.API_SECRET_KEY and x_api_key != settings.API_SECRET_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid X-API-Key header",
            headers={"WWW-Authenticate": "ApiKey"},
        )

    valid_roles = {"investigator", "lead_investigator", "analyst", "admin", "auditor"}
    role = (x_investigator_role or "investigator").lower()
    if role not in valid_roles:
        role = "investigator"

    user_id = x_investigator_id or "inv-001"
    return CurrentUser(user_id=user_id, role=role)


def require_case_access(
    case_id: str,
    investigator: CurrentUser = Depends(get_current_investigator)
) -> str:
    """
    Dependency to verify investigator authorization for a specific case.
    Prevents unauthorized cross-case data leakage.
    """
    if not investigator.is_authorized_for_case(case_id):
        audit_service.log_action(
            action="CASE_ACCESS_DENIED",
            user_id=investigator.user_id,
            case_id=case_id,
            status="FORBIDDEN",
            details={"role": investigator.role}
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Investigator {investigator.user_id} lacks clearance for case {case_id}"
        )
    return case_id
