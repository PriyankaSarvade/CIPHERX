"""
Tests for CIPERX Health & System Status Endpoints
"""

def test_system_root(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["system"] == "CIPERX — AI-Powered Criminal Network Analysis System"
    assert data["status"] == "operational"
    assert "database_backend" in data
    assert "is_demo_mode" in data


def test_health_check(client):
    response = client.get("/api/graph/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database_backend"] in ("neo4j", "demo_offline_neo4j")
    assert isinstance(data["is_demo_mode"], bool)
    assert "neo4j_connected" in data
    assert "neo4j_uri" in data


def test_health_reconnect(client):
    response = client.post("/api/graph/health/reconnect")
    assert response.status_code == 200
    data = response.json()
    assert "success" in data
    assert "database_backend" in data
