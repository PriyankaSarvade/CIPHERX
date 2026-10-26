from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field

class EntityBase(BaseModel):
    id: str = Field(..., description="Stable unique identifier, e.g. PRS-2026-001")
    name: str = Field(..., description="Entity display name / title")
    category: str = Field("Person", description="Entity category / primary label")
    case_id: str = Field(..., description="Case dossier identifier")
    verification_status: str = Field("Unverified", description="Verification state")
    source: Optional[str] = Field(None, description="Identification provenance source")
    notes: Optional[str] = Field(None, description="Investigator observations")
    properties: Dict[str, Any] = Field(default_factory=dict, description="Category-specific attributes")

class EntityCreate(EntityBase):
    pass

class EntityUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    verification_status: Optional[str] = None
    source: Optional[str] = None
    notes: Optional[str] = None
    properties: Optional[Dict[str, Any]] = None

class EntityResponse(EntityBase):
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    labels: List[str] = Field(default_factory=list)
