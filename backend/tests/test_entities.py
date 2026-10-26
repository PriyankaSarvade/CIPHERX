"""
Tests for Entity Management & Graph Node Upserts
"""

def test_get_case_graph(client):
    response = client.get("/api/graph/cases/CPX-2026-001")
    assert response.status_code == 200
    data = response.json()
    assert data["case_id"] == "CPX-2026-001"
    assert data["total_nodes"] > 0
    assert data["total_edges"] > 0
    assert isinstance(data["nodes"], list)
    assert isinstance(data["edges"], list)


def test_create_and_get_entity(client):
    new_entity = {
        "id": "PRS-TEST-101",
        "name": "Sameer Joshi",
        "category": "Person",
        "case_id": "CPX-2026-001",
        "verification_status": "Verified",
        "source": "Witness Statement #W-09",
        "notes": "Customs broker involved in clearance documentation.",
        "properties": {
            "roleInCase": "Person of Interest",
            "age": 36,
            "gender": "Male"
        }
    }
    create_resp = client.post("/api/graph/entities", json=new_entity)
    assert create_resp.status_code == 201
    created = create_resp.json()
    assert created["id"] == "PRS-TEST-101"
    assert created["name"] == "Sameer Joshi"
    assert created["category"] == "Person"

    # Fetch entity
    fetch_resp = client.get("/api/graph/cases/CPX-2026-001/entities/PRS-TEST-101")
    assert fetch_resp.status_code == 200
    fetched = fetch_resp.json()
    assert fetched["id"] == "PRS-TEST-101"
    assert fetched["name"] == "Sameer Joshi"


def test_search_entities(client):
    response = client.get("/api/graph/cases/CPX-2026-001/search?q=Vikram")
    assert response.status_code == 200
    results = response.json()
    assert len(results) >= 1
    assert any("Vikram" in r["name"] for r in results)


def test_entity_validation_error(client):
    # Missing compulsory fields id and case_id
    invalid_entity = {
        "name": "Incomplete Person"
    }
    response = client.post("/api/graph/entities", json=invalid_entity)
    assert response.status_code == 422
