from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field

class GraphNode(BaseModel):
    id: str
    name: str
    category: str
    case_id: str
    verification_status: str = "Unverified"
    source: Optional[str] = None
    notes: Optional[str] = None
    properties: Dict[str, Any] = Field(default_factory=dict)
    degree: Optional[int] = 0
    centrality: Optional[float] = 0.0

class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    label: str
    relationship_type: str
    case_id: str
    source_evidence_ids: List[str] = Field(default_factory=list)
    evidence_type: Optional[str] = None
    source_reference: Optional[str] = None
    first_observed: Optional[str] = None
    last_observed: Optional[str] = None
    verification_status: str = "Unverified"
    confidence: Optional[float] = None
    notes: Optional[str] = None
    properties: Dict[str, Any] = Field(default_factory=dict)
    has_source_evidence: bool = False

class GraphResponse(BaseModel):
    case_id: str
    database_backend: str = "neo4j"
    is_demo_mode: bool = False
    total_nodes: int
    total_edges: int
    nodes: List[GraphNode]
    edges: List[GraphEdge]

class ShortestPathRequest(BaseModel):
    source_id: str = Field(..., description="Starting entity ID or name")
    target_id: str = Field(..., description="Destination entity ID or name")
    case_id: str = Field(..., description="Case scope to restrict search")
    max_depth: Optional[int] = Field(6, ge=1, le=12, description="Maximum hops to explore")

class ShortestPathResponse(BaseModel):
    case_id: str
    path_found: bool
    path_length: int
    source_id: str
    target_id: str
    nodes: List[GraphNode] = Field(default_factory=list)
    edges: List[GraphEdge] = Field(default_factory=list)
    disclaimer: str = (
        "A shortest path represents a possible connection through recorded relationships, "
        "not proof of coordination or criminal activity."
    )

class CentralityItem(BaseModel):
    id: str
    name: str
    category: str
    degree: int
    centrality_score: float

class DegreeCentralityResponse(BaseModel):
    case_id: str
    total_nodes: int
    centrality: List[CentralityItem]
    disclaimer: str = (
        "Degree centrality indicates recorded connectivity within this case dataset. "
        "High connectivity does not automatically indicate criminal involvement."
    )

class ComponentItem(BaseModel):
    component_id: int
    entity_count: int
    node_ids: List[str]
    sample_entities: List[str]

class ConnectedComponentsResponse(BaseModel):
    case_id: str
    total_components: int
    components: List[ComponentItem]
    disclaimer: str = (
        "Connected components illustrate isolated sub-networks within the recorded case graph."
    )

class GraphStatisticsResponse(BaseModel):
    case_id: str
    total_nodes: int
    total_edges: int
    nodes_by_category: Dict[str, int]
    edges_by_type: Dict[str, int]
    component_count: int
    density: float
    top_central_entities: List[CentralityItem]

class DirectConnectionsResponse(BaseModel):
    entity_id: str
    entity_name: str
    category: str
    total_connections: int
    connections: List[Dict[str, Any]]

class EvidenceProvenanceResponse(BaseModel):
    relationship_id: str
    relationship_type: str
    source_entity: str
    target_entity: str
    evidence_ids: List[str]
    evidence_type: Optional[str] = None
    source_reference: Optional[str] = None
    date_observed: Optional[str] = None
    verification_status: str
    has_source_evidence: bool
    evidence_items: List[Dict[str, Any]] = Field(default_factory=list)
    notes: Optional[str] = None

class CaseSyncRequest(BaseModel):
    case_id: str
    entities: List[Dict[str, Any]] = Field(default_factory=list)
    relationships: List[Dict[str, Any]] = Field(default_factory=list)

class CaseSyncResponse(BaseModel):
    case_id: str
    database_backend: str
    is_demo_mode: bool
    entities_upserted: int
    relationships_upserted: int
    message: str
