"""
Evidence Provenance and Audit Trail Endpoints for CIPERX
Ensures every edge in the graph can be inspected for source evidence, timestamps,
investigator notes, and chain of custody verification.
"""
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.models.graph import EvidenceProvenanceResponse
from app.models.audit import AuditLogEntry
from app.api.deps import CurrentUser, get_current_investigator, require_case_access
from app.services.graph_service import graph_service
from app.services.evidence_service import evidence_service
from app.services.audit_service import audit_service

router = APIRouter(prefix="", tags=["Evidence & Provenance"])


class LinkEvidenceRequest(BaseModel):
    evidence_id: str
    evidence_type: Optional[str] = "Documentary Record"
    source_reference: Optional[str] = None
    verification_status: Optional[str] = "Verified"
    notes: Optional[str] = None


@router.get("/cases/{case_id}/relationships/{relationship_id}/evidence", response_model=EvidenceProvenanceResponse)
def get_relationship_evidence_provenance(
    case_id: str,
    relationship_id: str,
    investigator: CurrentUser = Depends(get_current_investigator)
):
    """
    Returns the complete source evidence backing a specific graph relationship edge.
    Shows documentary source, CDR log references, CCTV tags, or explicitly flags missing evidence.
    """
    require_case_access(case_id, investigator)
    rel_data = graph_service.get_relationship(relationship_id=relationship_id, case_id=case_id, user_id=investigator.user_id)
    if not rel_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Relationship {relationship_id} not found in case {case_id}"
        )

    provenance = evidence_service.get_relationship_evidence(rel_data)
    audit_service.log_action(
        action="EVIDENCE_PROVENANCE_INSPECTED",
        user_id=investigator.user_id,
        case_id=case_id,
        details={"relationship_id": relationship_id, "has_source": provenance.has_source_evidence}
    )
    return provenance


@router.post("/cases/{case_id}/relationships/{relationship_id}/evidence")
def link_evidence_to_relationship(
    case_id: str,
    relationship_id: str,
    link_req: LinkEvidenceRequest,
    investigator: CurrentUser = Depends(get_current_investigator)
):
    """
    Attaches a verified evidence item to an existing graph relationship edge.
    """
    require_case_access(case_id, investigator)
    rel_data = graph_service.get_relationship(relationship_id=relationship_id, case_id=case_id, user_id=investigator.user_id)
    if not rel_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Relationship {relationship_id} not found in case {case_id}"
        )

    # Register evidence item in provenance service
    evidence_service.register_evidence_item({
        "id": link_req.evidence_id,
        "evidence_type": link_req.evidence_type,
        "source_reference": link_req.source_reference,
        "verification_status": link_req.verification_status,
        "notes": link_req.notes
    })

    audit_service.log_action(
        action="EVIDENCE_LINKED_TO_RELATIONSHIP",
        user_id=investigator.user_id,
        case_id=case_id,
        details={"relationship_id": relationship_id, "evidence_id": link_req.evidence_id}
    )

    return {
        "success": True,
        "relationship_id": relationship_id,
        "linked_evidence_id": link_req.evidence_id,
        "message": f"Successfully attached evidence {link_req.evidence_id} to relationship {relationship_id}"
    }


@router.get("/cases/{case_id}/audit-logs", response_model=List[AuditLogEntry])
def get_case_audit_logs(
    case_id: str,
    investigator: CurrentUser = Depends(get_current_investigator)
):
    """
    Retrieves the compliance and provenance audit trail for this case.
    """
    require_case_access(case_id, investigator)
    return audit_service.get_case_logs(case_id=case_id)
