import logging
from typing import Dict, Any, List, Optional
try:
    from app.database.neo4j_client import neo4j_client
    from app.models.entity import EntityCreate, EntityResponse
    from app.models.relationship import RelationshipCreate, RelationshipResponse
    from app.models.graph import GraphNode, GraphEdge, GraphResponse
    from app.services.evidence_service import evidence_service
    from app.services.audit_service import audit_service
except ImportError:
    from backend.app.database.neo4j_client import neo4j_client
    from backend.app.models.entity import EntityCreate, EntityResponse
    from backend.app.models.relationship import RelationshipCreate, RelationshipResponse
    from backend.app.models.graph import GraphNode, GraphEdge, GraphResponse
    from backend.app.services.evidence_service import evidence_service
    from backend.app.services.audit_service import audit_service

logger = logging.getLogger("ciperx.graph")

# In-memory repository for offline sandbox / demonstration fallback
# Pre-populated with verified case evidence matching the CIPERX test dossiers
INITIAL_OFFLINE_NODES = [
    # Case CPX-2026-001 (Pier 14 Logistics Smuggling)
    {
        "id": "PRS-2026-001",
        "name": "Vikram Malhotra",
        "category": "Person",
        "case_id": "CPX-2026-001",
        "verification_status": "Verified",
        "source": "Corporate Filings #ROC-409, Surveillance Log #771",
        "notes": "Director of Apex Freight Solutions; observed meeting warehouse custodians.",
        "properties": {"roleInCase": "Suspect", "age": 44, "gender": "Male"}
    },
    {
        "id": "PRS-2026-002",
        "name": "Rohan Roy",
        "category": "Person",
        "case_id": "CPX-2026-001",
        "verification_status": "Verified",
        "source": "Port Gate Log & Eyewitness Statements",
        "notes": "Dock manager at Pier 14; authorized unscheduled midnight container movements.",
        "properties": {"roleInCase": "Suspect", "age": 38, "gender": "Male"}
    },
    {
        "id": "PRS-2026-003",
        "name": "Captain D. D'Souza",
        "category": "Person",
        "case_id": "CPX-2026-001",
        "verification_status": "Under Review",
        "source": "Harbor Master Crew Manifest",
        "notes": "Master of feeder cargo vessel MV Arabian Tide.",
        "properties": {"roleInCase": "Other Person of Interest", "age": 52, "gender": "Male"}
    },
    {
        "id": "CDR-2026-001",
        "name": "+91 98201 44521",
        "category": "Phone",
        "case_id": "CPX-2026-001",
        "verification_status": "Verified",
        "source": "Airtel Subpoena CDR #8812",
        "notes": "Burner SIM registered to fictitious company; located near Pier 14 tower.",
        "properties": {"phoneNumber": "+91 98201 44521", "carrier": "Airtel"}
    },
    {
        "id": "CDR-2026-002",
        "name": "+91 98112 33490",
        "category": "Phone",
        "case_id": "CPX-2026-001",
        "verification_status": "Verified",
        "source": "Vodafone Idea Tower Extraction",
        "notes": "Subscriber associated with dockside coordination desk.",
        "properties": {"phoneNumber": "+91 98112 33490", "carrier": "Vi"}
    },
    {
        "id": "LOC-2026-001",
        "name": "Pier 14 Warehouse",
        "category": "Location",
        "case_id": "CPX-2026-001",
        "verification_status": "Verified",
        "source": "Port Trust Registry",
        "notes": "Bounded customs storage unit used for midnight staging.",
        "properties": {"city": "Navi Mumbai", "coordinates": "18.9498° N, 72.8534° E"}
    },
    {
        "id": "VEH-2026-001",
        "name": "MH-02-BZ-4819",
        "category": "Vehicle",
        "case_id": "CPX-2026-001",
        "verification_status": "Verified",
        "source": "Toll Plaza ANPR Camera #02",
        "notes": "Heavy commercial cargo trailer sighted departing Pier 14.",
        "properties": {"vehicleType": "Commercial Cargo Truck", "colour": "White"}
    },
    {
        "id": "ORG-2026-001",
        "name": "Apex Freight Solutions",
        "category": "Organization",
        "case_id": "CPX-2026-001",
        "verification_status": "Verified",
        "source": "MCA-21 Company Master Data",
        "notes": "Freight forwarding company holding pier logistics lease.",
        "properties": {"registrationNumber": "U74999MH2021PTC368921"}
    },
    {
        "id": "DOC-2026-001",
        "name": "B/L #88219-IN Customs Manifest",
        "category": "DocumentDigital",
        "case_id": "CPX-2026-001",
        "verification_status": "Verified",
        "source": "Customs Pier Inspection Seizure",
        "notes": "Discrepant cargo description concealing unmanifested contraband.",
        "properties": {"sha256Hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}
    },
    {
        "id": "TXN-2026-001",
        "name": "TXN-88492-HK (INR 3,750,000)",
        "category": "Financial",
        "case_id": "CPX-2026-001",
        "verification_status": "Verified",
        "source": "FIU STR Report #8991",
        "notes": "Split wire remittance received 12 hours prior to cargo arrival.",
        "properties": {"amount": "INR 3,750,000", "senderAccount": "Apex Freight"}
    }
]

INITIAL_OFFLINE_EDGES = [
    {
        "id": "REL-2026-001",
        "source_id": "PRS-2026-001",
        "target_id": "CDR-2026-001",
        "relationship_type": "USES_PHONE",
        "case_id": "CPX-2026-001",
        "source_evidence_ids": ["CDR-2026-001", "DOC-2026-001"],
        "source_reference": "Airtel Subpoena #8812 & Seized Handset",
        "verification_status": "Verified",
        "first_observed": "2026-10-10",
        "notes": "Handset recovered from Vikram Malhotra's residence upon search."
    },
    {
        "id": "REL-2026-002",
        "source_id": "CDR-2026-001",
        "target_id": "CDR-2026-002",
        "relationship_type": "COMMUNICATED_WITH",
        "case_id": "CPX-2026-001",
        "source_evidence_ids": ["CDR-2026-001"],
        "source_reference": "Airtel CDR Call Log 2026-10-14 23:42:10",
        "verification_status": "Verified",
        "first_observed": "2026-10-14",
        "notes": "14 calls exchanged during night of dock operation."
    },
    {
        "id": "REL-2026-003",
        "source_id": "PRS-2026-002",
        "target_id": "CDR-2026-002",
        "relationship_type": "USES_PHONE",
        "case_id": "CPX-2026-001",
        "source_evidence_ids": ["CDR-2026-002"],
        "source_reference": "Vi Subscriber Application Form",
        "verification_status": "Verified",
        "first_observed": "2026-10-01",
        "notes": "Subscriber identity matches Rohan Roy's national ID."
    },
    {
        "id": "REL-2026-004",
        "source_id": "PRS-2026-002",
        "target_id": "LOC-2026-001",
        "relationship_type": "ASSOCIATED_WITH",
        "case_id": "CPX-2026-001",
        "source_evidence_ids": ["LOC-2026-001"],
        "source_reference": "Port Trust Roster",
        "verification_status": "Verified",
        "first_observed": "2026-09-15",
        "notes": "Assigned dockside duty supervisor."
    },
    {
        "id": "REL-2026-005",
        "source_id": "PRS-2026-001",
        "target_id": "ORG-2026-001",
        "relationship_type": "DIRECTOR_OF",
        "case_id": "CPX-2026-001",
        "source_evidence_ids": ["ORG-2026-001"],
        "source_reference": "MCA-21 Filings",
        "verification_status": "Verified",
        "first_observed": "2021-04-12",
        "notes": "Listed Managing Director with 60% voting share."
    },
    {
        "id": "REL-2026-006",
        "source_id": "ORG-2026-001",
        "target_id": "TXN-2026-001",
        "relationship_type": "TRANSFERRED_FUNDS",
        "case_id": "CPX-2026-001",
        "source_evidence_ids": ["TXN-2026-001"],
        "source_reference": "FIU STR #8991 Bank Wire Slip",
        "verification_status": "Verified",
        "first_observed": "2026-10-14",
        "notes": "Originating corporate account holder."
    },
    {
        "id": "REL-2026-007",
        "source_id": "VEH-2026-001",
        "target_id": "LOC-2026-001",
        "relationship_type": "SIGHTED_AT",
        "case_id": "CPX-2026-001",
        "source_evidence_ids": ["VEH-2026-001", "LOC-2026-001"],
        "source_reference": "Port CCTV Footage #CAM-14",
        "verification_status": "Verified",
        "first_observed": "2026-10-15",
        "notes": "Entered Pier 14 at 01:10 AM and loaded containers."
    },
    {
        "id": "REL-2026-008",
        "source_id": "PRS-2026-003",
        "target_id": "DOC-2026-001",
        "relationship_type": "MENTIONED_IN",
        "case_id": "CPX-2026-001",
        "source_evidence_ids": ["DOC-2026-001"],
        "source_reference": "Customs Manifest Bill of Lading",
        "verification_status": "Verified",
        "first_observed": "2026-10-13",
        "notes": "Signed carrier declaration for vessel consignment."
    }
]

class GraphService:
    def __init__(self):
        # In-memory store: { case_id: { "nodes": {id: node}, "edges": {id: edge} } }
        self._offline_store: Dict[str, Dict[str, Dict[str, Any]]] = {}
        self._init_offline_sample_data()

    def _init_offline_sample_data(self):
        """Initializes fallback offline store with case data."""
        self._offline_store["CPX-2026-001"] = {"nodes": {}, "edges": {}}
        for n in INITIAL_OFFLINE_NODES:
            self._offline_store["CPX-2026-001"]["nodes"][n["id"]] = n
            evidence_service.register_evidence_item(n)

        for e in INITIAL_OFFLINE_EDGES:
            self._offline_store["CPX-2026-001"]["edges"][e["id"]] = e

        # Test Case CPX-TEST-EVAL-001 (Isolated Fictional Network: Person A -> Person B -> Person C)
        test_case_id = "CPX-TEST-EVAL-001"
        self._offline_store[test_case_id] = {"nodes": {}, "edges": {}}
        test_nodes = [
            {
                "id": "TEST-PRS-001",
                "name": "Person A (Alice Vance)",
                "category": "Person",
                "case_id": test_case_id,
                "verification_status": "Verified (Test Data)",
                "source": "Test Mock Dossier #SIM-01",
                "notes": "Synthetic evaluation persona representing Person A.",
                "properties": {"roleInCase": "Suspect (Test)", "isTestEntity": True}
            },
            {
                "id": "TEST-PRS-002",
                "name": "Person B (Bob Martinez)",
                "category": "Person",
                "case_id": test_case_id,
                "verification_status": "Verified (Test Data)",
                "source": "Test Mock Dossier #SIM-02",
                "notes": "Synthetic evaluation persona representing Person B (intermediary bridge node).",
                "properties": {"roleInCase": "Associate (Test)", "isTestEntity": True}
            },
            {
                "id": "TEST-PRS-003",
                "name": "Person C (Charlie Chen)",
                "category": "Person",
                "case_id": test_case_id,
                "verification_status": "Verified (Test Data)",
                "source": "Test Mock Dossier #SIM-03",
                "notes": "Synthetic evaluation persona representing Person C.",
                "properties": {"roleInCase": "Person of Interest (Test)", "isTestEntity": True}
            }
        ]
        for n in test_nodes:
            self._offline_store[test_case_id]["nodes"][n["id"]] = n
            evidence_service.register_evidence_item(n)

        test_evidences = [
            {
                "id": "TEST-EVD-001",
                "title": "Simulated Surveillance Exercise Log #SIM-01 - Coffee Shop Meeting",
                "evidence_type": "Documentary Record",
                "source": "Simulated Surveillance Exercise Log #SIM-01",
                "verification_status": "Verified (Test Data)",
                "notes": "Direct observed meeting between Person A and Person B."
            },
            {
                "id": "TEST-EVD-002",
                "title": "Synthetic Telephony CDR Record #SIM-02 - Call Exchanged",
                "evidence_type": "Telephony CDR",
                "source": "Synthetic Telephony CDR Record #SIM-02",
                "verification_status": "Verified (Test Data)",
                "notes": "Direct recorded communication between Person B and Person C."
            }
        ]
        evidence_service.register_batch(test_evidences)

        test_edges = [
            {
                "id": "TEST-REL-001",
                "source_id": "TEST-PRS-001",
                "target_id": "TEST-PRS-002",
                "relationship_type": "CONNECTED_TO",
                "case_id": test_case_id,
                "source_evidence_ids": ["TEST-EVD-001"],
                "source_reference": "Simulated Surveillance Exercise Log #SIM-01",
                "evidence_type": "Documentary Record",
                "verification_status": "Verified (Test Data)",
                "first_observed": "2026-10-20",
                "notes": "Direct observed link between Person A and Person B."
            },
            {
                "id": "TEST-REL-002",
                "source_id": "TEST-PRS-002",
                "target_id": "TEST-PRS-003",
                "relationship_type": "CONNECTED_TO",
                "case_id": test_case_id,
                "source_evidence_ids": ["TEST-EVD-002"],
                "source_reference": "Synthetic Telephony CDR Record #SIM-02",
                "evidence_type": "Telephony CDR",
                "verification_status": "Verified (Test Data)",
                "first_observed": "2026-10-21",
                "notes": "Direct recorded communication between Person B and Person C."
            }
        ]
        for e in test_edges:
            self._offline_store[test_case_id]["edges"][e["id"]] = e

    def delete_case(self, case_id: str, user_id: str = "investigator") -> bool:
        """Safely removes an isolated case and all its nodes and edges."""
        audit_service.log_action("DELETE_CASE", case_id=case_id, user_id=user_id)
        if neo4j_client.is_connected:
            try:
                cypher = "MATCH (n:Entity {case_id: $case_id}) DETACH DELETE n"
                neo4j_client.execute_write(cypher, {"case_id": case_id})
            except Exception as e:
                logger.error("Failed to delete case from Neo4j: %s", e)
        if case_id in self._offline_store:
            del self._offline_store[case_id]
            return True
        return False

    def get_case_graph(self, case_id: str, user_id: str = "investigator") -> GraphResponse:
        """
        Retrieves all graph nodes and edges for an authorized case.
        Uses Neo4j if available; otherwise uses offline sandbox.
        """
        audit_service.log_action("GET_CASE_GRAPH", case_id=case_id, user_id=user_id)

        if neo4j_client.is_connected:
            try:
                cypher = """
                MATCH (n:Entity {case_id: $case_id})
                OPTIONAL MATCH (n)-[r:RELATIONSHIP {case_id: $case_id}]->(m:Entity {case_id: $case_id})
                RETURN n, r, m
                """
                records = neo4j_client.execute_query(cypher, {"case_id": case_id})
                
                nodes_dict: Dict[str, GraphNode] = {}
                edges_dict: Dict[str, GraphEdge] = {}

                for row in records:
                    n_data = row.get("n")
                    if n_data and n_data.get("id"):
                        nid = n_data["id"]
                        if nid not in nodes_dict:
                            nodes_dict[nid] = self._record_to_graph_node(n_data)

                    m_data = row.get("m")
                    if m_data and m_data.get("id"):
                        mid = m_data["id"]
                        if mid not in nodes_dict:
                            nodes_dict[mid] = self._record_to_graph_node(m_data)

                    r_data = row.get("r")
                    if r_data and r_data.get("id"):
                        rid = r_data["id"]
                        if rid not in edges_dict and n_data and m_data:
                            edges_dict[rid] = self._record_to_graph_edge(
                                r_data, n_data["id"], m_data["id"]
                            )

                return GraphResponse(
                    case_id=case_id,
                    database_backend="neo4j",
                    is_demo_mode=False,
                    total_nodes=len(nodes_dict),
                    total_edges=len(edges_dict),
                    nodes=list(nodes_dict.values()),
                    edges=list(edges_dict.values())
                )
            except Exception as e:
                logger.error("Failed to query Neo4j for case %s: %s", case_id, e)
                # Fall through to offline store with explicit alert

        # Fallback to offline store
        case_store = self._offline_store.get(case_id, {"nodes": {}, "edges": {}})
        nodes = [self._record_to_graph_node(n) for n in case_store["nodes"].values()]
        edges = []
        for e in case_store["edges"].values():
            edges.append(self._record_to_graph_edge(e, e["source_id"], e["target_id"]))

        return GraphResponse(
            case_id=case_id,
            database_backend="demo_offline_neo4j",
            is_demo_mode=True,
            total_nodes=len(nodes),
            total_edges=len(edges),
            nodes=nodes,
            edges=edges
        )

    def upsert_entity(self, entity: EntityCreate, user_id: str = "investigator") -> GraphNode:
        """Creates or updates a graph entity node with parameterized Cypher."""
        audit_service.log_action("UPSERT_ENTITY", case_id=entity.case_id, user_id=user_id, details={"id": entity.id, "name": entity.name})

        # Register evidence for provenance
        raw_dict = entity.model_dump() if hasattr(entity, "model_dump") else entity.dict()
        evidence_service.register_evidence_item(raw_dict)

        # Update in-memory sandbox
        c_store = self._offline_store.setdefault(entity.case_id, {"nodes": {}, "edges": {}})
        c_store["nodes"][entity.id] = raw_dict

        if neo4j_client.is_connected:
            try:
                # Parameterized Cypher query with Category and Entity labels
                category_label = entity.category.replace(" ", "")
                if not category_label.isalnum():
                    category_label = "Entity"

                cypher = f"""
                MERGE (n:Entity {{id: $id}})
                SET n:{category_label},
                    n.name = $name,
                    n.category = $category,
                    n.case_id = $case_id,
                    n.verification_status = $verification_status,
                    n.source = $source,
                    n.notes = $notes,
                    n.updated_at = datetime()
                RETURN n
                """
                params = {
                    "id": entity.id,
                    "name": entity.name,
                    "category": entity.category,
                    "case_id": entity.case_id,
                    "verification_status": entity.verification_status,
                    "source": entity.source,
                    "notes": entity.notes
                }
                neo4j_client.execute_write(cypher, params)
            except Exception as e:
                logger.error("Failed to upsert entity in Neo4j: %s", e)

        return GraphNode(
            id=entity.id,
            name=entity.name,
            category=entity.category,
            case_id=entity.case_id,
            verification_status=entity.verification_status,
            source=entity.source,
            notes=entity.notes,
            properties=entity.properties
        )

    def upsert_relationship(
        self,
        rel: Optional[RelationshipCreate] = None,
        relationship: Optional[RelationshipCreate] = None,
        user_id: str = "investigator"
    ) -> GraphEdge:
        """Creates or updates a graph edge backed by verified source evidence."""
        actual_rel = rel or relationship
        if not actual_rel:
            raise ValueError("Relationship data must be provided")

        audit_service.log_action(
            "UPSERT_RELATIONSHIP",
            case_id=actual_rel.case_id,
            user_id=user_id,
            details={"id": actual_rel.id, "source": actual_rel.source_id, "target": actual_rel.target_id, "type": actual_rel.relationship_type}
        )

        raw_dict = actual_rel.model_dump() if hasattr(actual_rel, "model_dump") else actual_rel.dict()

        # Update in-memory sandbox
        c_store = self._offline_store.setdefault(actual_rel.case_id, {"nodes": {}, "edges": {}})
        c_store["edges"][actual_rel.id] = raw_dict

        has_source = bool(actual_rel.source_evidence_ids or actual_rel.source_reference)

        if neo4j_client.is_connected:
            try:
                cypher = """
                MATCH (a:Entity {id: $source_id})
                MATCH (b:Entity {id: $target_id})
                MERGE (a)-[r:RELATIONSHIP {id: $id}]->(b)
                SET r.relationship_type = $rel_type,
                    r.label = $rel_type,
                    r.case_id = $case_id,
                    r.source_evidence_ids = $source_evidence_ids,
                    r.source_reference = $source_reference,
                    r.evidence_type = $evidence_type,
                    r.first_observed = $first_observed,
                    r.last_observed = $last_observed,
                    r.verification_status = $verification_status,
                    r.confidence = $confidence,
                    r.notes = $notes,
                    r.updated_at = datetime()
                RETURN r
                """
                params = {
                    "id": actual_rel.id,
                    "source_id": actual_rel.source_id,
                    "target_id": actual_rel.target_id,
                    "rel_type": actual_rel.relationship_type,
                    "case_id": actual_rel.case_id,
                    "source_evidence_ids": actual_rel.source_evidence_ids,
                    "source_reference": actual_rel.source_reference,
                    "evidence_type": actual_rel.evidence_type,
                    "first_observed": actual_rel.first_observed,
                    "last_observed": actual_rel.last_observed,
                    "verification_status": actual_rel.verification_status,
                    "confidence": actual_rel.confidence,
                    "notes": actual_rel.notes
                }
                neo4j_client.execute_write(cypher, params)
            except Exception as e:
                logger.error("Failed to upsert relationship in Neo4j: %s", e)

        return GraphEdge(
            id=actual_rel.id,
            source=actual_rel.source_id,
            target=actual_rel.target_id,
            label=actual_rel.relationship_type,
            relationship_type=actual_rel.relationship_type,
            case_id=actual_rel.case_id,
            source_evidence_ids=actual_rel.source_evidence_ids,
            evidence_type=actual_rel.evidence_type,
            source_reference=actual_rel.source_reference,
            first_observed=actual_rel.first_observed,
            last_observed=actual_rel.last_observed,
            verification_status=actual_rel.verification_status,
            confidence=actual_rel.confidence,
            notes=actual_rel.notes,
            properties=actual_rel.properties,
            has_source_evidence=has_source
        )

    def get_entity(self, entity_id: str, case_id: Optional[str] = None, user_id: str = "investigator") -> Optional[GraphNode]:
        """Retrieves a single entity by ID."""
        audit_service.log_action("GET_ENTITY", case_id=case_id, user_id=user_id, details={"entity_id": entity_id})

        if neo4j_client.is_connected:
            try:
                cypher = "MATCH (n:Entity {id: $id}) RETURN n LIMIT 1"
                records = neo4j_client.execute_query(cypher, {"id": entity_id})
                if records and records[0].get("n"):
                    return self._record_to_graph_node(records[0]["n"])
            except Exception as e:
                logger.error("Failed to retrieve entity from Neo4j: %s", e)

        # Search in offline stores
        for cid, store in self._offline_store.items():
            if case_id and cid != case_id:
                continue
            if entity_id in store["nodes"]:
                return self._record_to_graph_node(store["nodes"][entity_id])

        return None

    def search_entities(
        self, query: str, case_id: Optional[str] = None, category: Optional[str] = None, limit: int = 20, user_id: str = "investigator"
    ) -> List[GraphNode]:
        """Performs a parameterized search for entities across or within a case."""
        audit_service.log_action(
            "SEARCH_ENTITIES", case_id=case_id, user_id=user_id, details={"query": query, "category": category, "limit": limit}
        )

        clean_q = query.strip().lower()

        if neo4j_client.is_connected:
            try:
                clauses = ["toLower(n.name) CONTAINS toLower($q) OR toLower(n.id) CONTAINS toLower($q)"]
                params: Dict[str, Any] = {"q": clean_q, "limit": limit}

                if case_id:
                    clauses.append("n.case_id = $case_id")
                    params["case_id"] = case_id
                if category and category != "All":
                    clauses.append("n.category = $category")
                    params["category"] = category

                where_clause = " AND ".join(clauses)
                cypher = f"MATCH (n:Entity) WHERE {where_clause} RETURN n LIMIT $limit"
                records = neo4j_client.execute_query(cypher, params)
                return [self._record_to_graph_node(r["n"]) for r in records if r.get("n")]
            except Exception as e:
                logger.error("Neo4j search failed: %s", e)

        # In-memory search fallback
        results = []
        for cid, store in self._offline_store.items():
            if case_id and cid != case_id:
                continue
            for n in store["nodes"].values():
                name_match = clean_q in (n.get("name") or "").lower()
                id_match = clean_q in (n.get("id") or "").lower()
                cat_match = not category or category == "All" or n.get("category") == category
                if (name_match or id_match) and cat_match:
                    results.append(self._record_to_graph_node(n))
                if len(results) >= limit:
                    break
        return results

    def sync_case_graph(self, sync_req: Any, user_id: str = "investigator") -> Dict[str, Any]:
        """Wrapper accepting CaseSyncRequest or dict."""
        case_id = getattr(sync_req, "case_id", None) or sync_req.get("case_id")
        entities = getattr(sync_req, "entities", None) or sync_req.get("entities", [])
        relationships = getattr(sync_req, "relationships", None) or sync_req.get("relationships", [])
        return self.sync_case_from_frontend(case_id=case_id, entities=entities, relationships=relationships)

    def sync_case_from_frontend(self, case_id: str, entities: List[Dict[str, Any]], relationships: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Receives structured entities and relationships from frontend and saves them into Neo4j.
        Prevents duplicates by relying on stable ID unique constraints.
        """
        audit_service.log_action(
            "SYNC_CASE_FROM_FRONTEND",
            case_id=case_id,
            details={"entities_count": len(entities), "relationships_count": len(relationships)}
        )

        entities_count = 0
        relationships_count = 0

        # Upsert entities
        for ent_data in entities:
            try:
                ent = EntityCreate(
                    id=ent_data.get("id", f"ENT-{case_id}-{entities_count}"),
                    name=ent_data.get("name") or ent_data.get("title") or ent_data.get("phoneNumber") or "Unnamed Entity",
                    category=ent_data.get("category", "Person"),
                    case_id=case_id,
                    verification_status=ent_data.get("verificationStatus") or ent_data.get("verification_status", "Unverified"),
                    source=ent_data.get("source"),
                    notes=ent_data.get("notes"),
                    properties=ent_data
                )
                self.upsert_entity(ent)
                entities_count += 1
            except Exception as e:
                logger.warning("Failed to sync entity: %s", e)

        # Upsert relationships
        for rel_data in relationships:
            try:
                src_id = rel_data.get("sourceEntityId") or rel_data.get("source_id") or rel_data.get("source")
                tgt_id = rel_data.get("targetEntityId") or rel_data.get("target_id") or rel_data.get("target")
                
                # Resolve IDs if only names were provided
                if not src_id and rel_data.get("sourceEntityName"):
                    match = next((e for e in entities if e.get("name") == rel_data["sourceEntityName"]), None)
                    if match:
                        src_id = match.get("id")
                if not tgt_id and rel_data.get("targetEntityName"):
                    match = next((e for e in entities if e.get("name") == rel_data["targetEntityName"]), None)
                    if match:
                        tgt_id = match.get("id")

                if src_id and tgt_id:
                    ev_ids = rel_data.get("supportingEvidenceList") or rel_data.get("source_evidence_ids") or []
                    rel = RelationshipCreate(
                        id=rel_data.get("id", f"REL-{case_id}-{relationships_count}"),
                        source_id=src_id,
                        target_id=tgt_id,
                        relationship_type=rel_data.get("relationshipType") or rel_data.get("relationship_type", "CONNECTED_TO"),
                        case_id=case_id,
                        source_evidence_ids=ev_ids if isinstance(ev_ids, list) else [str(ev_ids)],
                        source_reference=rel_data.get("source") or rel_data.get("source_reference"),
                        evidence_type=rel_data.get("evidence_type", "Evidentiary Link"),
                        first_observed=rel_data.get("dateFirstObserved") or rel_data.get("first_observed"),
                        last_observed=rel_data.get("dateLastObserved") or rel_data.get("last_observed"),
                        verification_status=rel_data.get("verificationStatus") or rel_data.get("reviewStatus") or "Unverified",
                        notes=rel_data.get("notes"),
                        properties=rel_data
                    )
                    self.upsert_relationship(rel)
                    relationships_count += 1
            except Exception as e:
                logger.warning("Failed to sync relationship: %s", e)

        return {
            "case_id": case_id,
            "database_backend": "neo4j" if neo4j_client.is_connected else "demo_offline_neo4j",
            "is_demo_mode": not neo4j_client.is_connected,
            "entities_upserted": entities_count,
            "relationships_upserted": relationships_count,
            "message": (
                f"Successfully synced {entities_count} entities and {relationships_count} relationships into "
                f"{'Neo4j database' if neo4j_client.is_connected else 'offline sandbox'}."
            )
        }

    def get_relationship(self, relationship_id: str, case_id: str, user_id: str = "investigator") -> Optional[Dict[str, Any]]:
        """
        Retrieves a relationship record with its source and target details for evidence provenance inspection.
        """
        if neo4j_client.is_connected:
            cypher = """
            MATCH (a)-[r {id: $rel_id}]->(b)
            WHERE r.case_id = $case_id
            RETURN a.id AS source_id, a.name AS source_name, b.id AS target_id, b.name AS target_name, properties(r) AS rel_props
            LIMIT 1
            """
            try:
                records = neo4j_client.execute_query(cypher, {"rel_id": relationship_id, "case_id": case_id})
                if records:
                    rec = records[0]
                    props = dict(rec.get("rel_props") or {})
                    props["source"] = rec.get("source_id")
                    props["source_name"] = rec.get("source_name")
                    props["target"] = rec.get("target_id")
                    props["target_name"] = rec.get("target_name")
                    return props
            except Exception as e:
                logger.warning("Neo4j relationship query failed: %s, falling back to offline store", e)

        # Fallback offline store lookup
        case_store = self._offline_store.get(case_id, {"nodes": {}, "edges": {}})
        edge = case_store.get("edges", {}).get(relationship_id)
        if edge:
            res = dict(edge)
            src_node = case_store.get("nodes", {}).get(edge.get("source_id"))
            tgt_node = case_store.get("nodes", {}).get(edge.get("target_id"))
            res["source"] = edge.get("source_id")
            res["source_name"] = src_node.get("name") if src_node else edge.get("source_id")
            res["target"] = edge.get("target_id")
            res["target_name"] = tgt_node.get("name") if tgt_node else edge.get("target_id")
            return res
        return None

    def _record_to_graph_node(self, record: Dict[str, Any]) -> GraphNode:
        """Maps a Cypher node or dictionary record to GraphNode."""
        props = dict(record)
        nid = props.pop("id", "UNKNOWN")
        name = props.pop("name", nid)
        cat = props.pop("category", "Person")
        cid = props.pop("case_id", "")
        v_status = props.pop("verification_status", "Unverified")
        src = props.pop("source", None)
        notes = props.pop("notes", None)

        return GraphNode(
            id=nid,
            name=name,
            category=cat,
            case_id=cid,
            verification_status=v_status,
            source=src,
            notes=notes,
            properties=props
        )

    def _record_to_graph_edge(self, record: Dict[str, Any], src_id: str, tgt_id: str) -> GraphEdge:
        """Maps a Cypher relationship or dictionary record to GraphEdge."""
        props = dict(record)
        rid = props.pop("id", f"{src_id}->{tgt_id}")
        label = props.pop("relationship_type", props.pop("label", "CONNECTED_TO"))
        cid = props.pop("case_id", "")
        ev_ids = props.pop("source_evidence_ids", [])
        ev_type = props.pop("evidence_type", None)
        src_ref = props.pop("source_reference", None)
        f_obs = props.pop("first_observed", None)
        l_obs = props.pop("last_observed", None)
        v_status = props.pop("verification_status", "Unverified")
        conf = props.pop("confidence", None)
        notes = props.pop("notes", None)

        has_source = bool(ev_ids or src_ref)

        return GraphEdge(
            id=rid,
            source=src_id,
            target=tgt_id,
            label=label,
            relationship_type=label,
            case_id=cid,
            source_evidence_ids=ev_ids,
            evidence_type=ev_type,
            source_reference=src_ref,
            first_observed=f_obs,
            last_observed=l_obs,
            verification_status=v_status,
            confidence=conf,
            notes=notes,
            properties=props,
            has_source_evidence=has_source
        )

graph_service = GraphService()
