"""
Tests for Case Isolation and Multi-Case Scoping Security
"""

def test_case_isolation_entities(client):
    # Create entity in Case A
    entity_a = {
        "id": "PRS-CASE-A",
        "name": "Case A Person",
        "category": "Person",
        "case_id": "CPX-CASE-AAA",
        "verification_status": "Verified"
    }
    client.post("/api/graph/entities", json=entity_a)

    # Create entity in Case B
    entity_b = {
        "id": "PRS-CASE-B",
        "name": "Case B Person",
        "category": "Person",
        "case_id": "CPX-CASE-BBB",
        "verification_status": "Verified"
    }
    client.post("/api/graph/entities", json=entity_b)

    # Query Case A graph: should only contain Case A
    resp_a = client.get("/api/graph/cases/CPX-CASE-AAA")
    assert resp_a.status_code == 200
    nodes_a = resp_a.json()["nodes"]
    assert any(n["id"] == "PRS-CASE-A" for n in nodes_a)
    assert not any(n["id"] == "PRS-CASE-B" for n in nodes_a)

    # Query Case B graph: should only contain Case B
    resp_b = client.get("/api/graph/cases/CPX-CASE-BBB")
    assert resp_b.status_code == 200
    nodes_b = resp_b.json()["nodes"]
    assert any(n["id"] == "PRS-CASE-B" for n in nodes_b)
    assert not any(n["id"] == "PRS-CASE-A" for n in nodes_b)


def test_shortest_path_cannot_cross_cases(client):
    # Attempt to find shortest path between Case A and Case B entities within Case A's scope
    payload = {
        "case_id": "CPX-CASE-AAA",
        "source_id": "PRS-CASE-A",
        "target_id": "PRS-CASE-B",
        "max_depth": 6
    }
    response = client.post("/api/graph/shortest-path", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["path_found"] is False
