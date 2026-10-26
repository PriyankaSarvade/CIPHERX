"""
Automated Verification Tests for CPX-TEST-EVAL-001
Tests:
- Isolation of test dataset
- Node & relationship retrieval
- Shortest path from Person A to Person C through Person B
- Degree centrality (Person B as highest bridge)
- Connected components (1 component with 3 nodes)
- Evidence provenance inspection on test relationships
- Safe deletion / cleanup of test cases
"""

def test_get_evaluation_case_graph(client):
    response = client.get("/api/graph/cases/CPX-TEST-EVAL-001")
    assert response.status_code == 200
    data = response.json()
    assert data["case_id"] == "CPX-TEST-EVAL-001"
    assert data["total_nodes"] == 3
    assert data["total_edges"] == 2

    node_ids = {n["id"] for n in data["nodes"]}
    assert "TEST-PRS-001" in node_ids
    assert "TEST-PRS-002" in node_ids
    assert "TEST-PRS-003" in node_ids

    edge_ids = {e["id"] for e in data["edges"]}
    assert "TEST-REL-001" in edge_ids
    assert "TEST-REL-002" in edge_ids


def test_shortest_path_person_a_to_person_c_through_person_b(client):
    """
    Verifies that the shortest path from Person A to Person C
    is discovered through Person B with length 2.
    """
    payload = {
        "case_id": "CPX-TEST-EVAL-001",
        "source_id": "TEST-PRS-001",
        "target_id": "TEST-PRS-003",
        "max_depth": 6
    }
    response = client.post("/api/graph/shortest-path", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["path_found"] is True
    assert data["path_length"] == 2
    assert len(data["nodes"]) == 3

    # Check ordered traversal: Person A -> Person B -> Person C
    traversal_ids = [n["id"] for n in data["nodes"]]
    assert traversal_ids == ["TEST-PRS-001", "TEST-PRS-002", "TEST-PRS-003"]

    # Check connecting edges: TEST-REL-001 then TEST-REL-002
    assert len(data["edges"]) == 2
    assert data["edges"][0]["id"] == "TEST-REL-001"
    assert data["edges"][1]["id"] == "TEST-REL-002"

    # Verify ethical non-guilt disclaimer
    assert "disclaimer" in data
    assert "not proof of coordination" in data["disclaimer"]


def test_degree_centrality_person_b_is_hub(client):
    """
    In the graph A-B-C:
    Person B has degree 2 (centrality 1.0)
    Person A has degree 1 (centrality 0.5)
    Person C has degree 1 (centrality 0.5)
    """
    response = client.get("/api/graph/cases/CPX-TEST-EVAL-001/centrality")
    assert response.status_code == 200
    data = response.json()

    assert data["case_id"] == "CPX-TEST-EVAL-001"
    assert data["total_nodes"] == 3
    assert len(data["centrality"]) == 3

    # Top entity must be Person B
    top_entity = data["centrality"][0]
    assert top_entity["id"] == "TEST-PRS-002"
    assert top_entity["degree"] == 2
    assert top_entity["centrality_score"] == 1.0

    # Person A and C must each have degree 1
    degree_map = {item["id"]: item["degree"] for item in data["centrality"]}
    assert degree_map["TEST-PRS-001"] == 1
    assert degree_map["TEST-PRS-003"] == 1

    assert "does not automatically indicate criminal involvement" in data["disclaimer"]


def test_connected_components_evaluation_case(client):
    response = client.get("/api/graph/cases/CPX-TEST-EVAL-001/components")
    assert response.status_code == 200
    data = response.json()

    assert data["case_id"] == "CPX-TEST-EVAL-001"
    assert data["total_components"] == 1
    assert data["components"][0]["entity_count"] == 3


def test_relationship_supporting_test_evidence(client):
    """
    Verifies that selecting test relationships exposes their linked source evidence records.
    """
    # Test Relationship 1: Person A -> Person B
    resp1 = client.get("/api/graph/cases/CPX-TEST-EVAL-001/relationships/TEST-REL-001/evidence")
    assert resp1.status_code == 200
    prov1 = resp1.json()
    assert prov1["relationship_id"] == "TEST-REL-001"
    assert prov1["has_source_evidence"] is True
    assert "TEST-EVD-001" in prov1["evidence_ids"]
    assert "Simulated Surveillance Exercise Log #SIM-01" in prov1["source_reference"]
    assert "Verified (Test Data)" in prov1["verification_status"]

    # Test Relationship 2: Person B -> Person C
    resp2 = client.get("/api/graph/cases/CPX-TEST-EVAL-001/relationships/TEST-REL-002/evidence")
    assert resp2.status_code == 200
    prov2 = resp2.json()
    assert prov2["relationship_id"] == "TEST-REL-002"
    assert prov2["has_source_evidence"] is True
    assert "TEST-EVD-002" in prov2["evidence_ids"]
    assert "Synthetic Telephony CDR Record #SIM-02" in prov2["source_reference"]


def test_safe_test_case_deletion(client):
    """
    Verifies that a test case can be deleted safely via DELETE /api/graph/cases/{case_id}
    without affecting any other cases.
    """
    # Create temporary isolated test case
    temp_entity = {
        "id": "TEMP-PRS-001",
        "name": "Temporary Test Person",
        "category": "Person",
        "case_id": "CPX-TEMP-ISOLATED-99",
        "verification_status": "Unverified"
    }
    client.post("/api/graph/entities", json=temp_entity)

    # Verify exists
    resp = client.get("/api/graph/cases/CPX-TEMP-ISOLATED-99")
    assert resp.status_code == 200
    assert len(resp.json()["nodes"]) == 1

    # Delete safely
    del_resp = client.delete("/api/graph/cases/CPX-TEMP-ISOLATED-99")
    assert del_resp.status_code == 200
    assert del_resp.json()["deleted"] is True

    # Verify gone
    resp_after = client.get("/api/graph/cases/CPX-TEMP-ISOLATED-99")
    assert resp_after.status_code == 200
    assert len(resp_after.json()["nodes"]) == 0
