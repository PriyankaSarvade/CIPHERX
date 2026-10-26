from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class AuditLogEntry(BaseModel):
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    action: str = Field(..., description="Action taken, e.g. SEARCH_GRAPH, SHORTEST_PATH, UPSERT_RELATIONSHIP")
    case_id: Optional[str] = Field(None, description="Scope case ID")
    user_id: str = Field("INV-LEAD-01", description="Investigator ID")
    user_role: str = Field("Investigator", description="Assigned role")
    details: Dict[str, Any] = Field(default_factory=dict, description="Action-specific parameters")
    status: str = Field("SUCCESS", description="SUCCESS or FAILED")
