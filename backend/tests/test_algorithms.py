"""
Tests for Graph Algorithms (Shortest Path, Centrality, Components, Statistics)
"""

def test_shortest_path_found(client):
    payload = {
        "case_id": "CPX-2026-001",
        "source_id": "PRS-2026-001",
        "target_id": "PRS-2026-002",
        "max_depth": 6
    }
    response = client.post("/api/graph/shortest-path", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["case_id"] == "CPX-2026-001"
    assert data["path_found"] is True
    assert data["path_length"] >= 1
    assert len(data["nodes"]) >= 2
    assert "disclaimer" in data
    assert "not proof of coordination" in data["disclaimer"]


def test_shortest_path_not_found(client):
    payload = {
        "case_id": "CPX-2026-001",
        "source_id": "NON_EXISTENT_SOURCE",
        "target_id": "NON_EXISTENT_TARGET",
        "max_depth": 6
    }
    response = client.post("/api/graph/shortest-path", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["path_found"] is False
    assert data["path_length"] == 0
    assert len(data["nodes"]) == 0


def test_degree_centrality(client):
    response = client.get("/api/graph/cases/CPX-2026-001/centrality")
    assert response.status_code == 200
    data = response.json()
    assert data["case_id"] == "CPX-2026-001"
    assert data["total_nodes"] > 0
    assert len(data["centrality"]) > 0
    # Top entity should have highest degree
    top = data["centrality"][0]
    assert "id" in top
    assert "name" in top
    assert "degree" in top
    assert "centrality_score" in top
    assert "disclaimer" in data
    assert "does not automatically indicate criminal involvement" in data["disclaimer"]


def test_connected_components(client):
    response = client.get("/api/graph/cases/CPX-2026-001/components")
    assert response.status_code == 200
    data = response.json()
    assert data["case_id"] == "CPX-2026-001"
    assert data["total_components"] >= 1
    assert len(data["components"]) >= 1
    comp1 = data["components"][0]
    assert "component_id" in comp1
    assert comp1["entity_count"] >= 1
    assert "disclaimer" in data


def test_graph_statistics(client):
    response = client.get("/api/graph/cases/CPX-2026-001/statistics")
    assert response.status_code == 200
    stats = response.json()
    assert stats["case_id"] == "CPX-2026-001"
    assert stats["total_nodes"] > 0
    assert stats["total_edges"] > 0
    assert isinstance(stats["nodes_by_category"], dict)
    assert isinstance(stats["edges_by_type"], dict)
    assert "density" in stats
    assert len(stats["top_central_entities"]) > 0


def test_entity_direct_connections(client):
    response = client.get("/api/graph/cases/CPX-2026-001/entities/PRS-2026-001/connections")
    assert response.status_code == 200
    conn = response.json()
    assert conn["entity_id"] == "PRS-2026-001"
    assert conn["total_connections"] >= 1
    assert isinstance(conn["connections"], list)
