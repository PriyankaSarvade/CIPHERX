from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field

class RelationshipBase(BaseModel):
    id: str = Field(..., description="Stable unique relationship identifier, e.g. REL-2026-001")
    source_id: str = Field(..., description="Source node unique ID")
    target_id: str = Field(..., description="Target node unique ID")
    relationship_type: str = Field("CONNECTED_TO", description="Type of relationship in uppercase or title")
    case_id: str = Field(..., description="Associated case file ID")
    source_evidence_ids: List[str] = Field(default_factory=list, description="IDs of evidence verifying this link")
    evidence_type: Optional[str] = Field(None, description="Category of primary supporting evidence")
    source_reference: Optional[str] = Field(None, description="Subpoena, manifest, or CDR reference")
    first_observed: Optional[str] = Field(None, description="Earliest recorded observation date")
    last_observed: Optional[str] = Field(None, description="Most recent observation date")
    verification_status: str = Field("Unverified", description="Unverified, Under Review, Verified, or Disputed")
    confidence: Optional[float] = Field(None, description="Confidence score (0.0 to 100.0) only when calculated")
    notes: Optional[str] = Field(None, description="Analyst observations and context")
    properties: Dict[str, Any] = Field(default_factory=dict, description="Additional custom properties")

class RelationshipCreate(RelationshipBase):
    pass

class RelationshipResponse(RelationshipBase):
    source_name: Optional[str] = None
    target_name: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    has_source_evidence: bool = False
