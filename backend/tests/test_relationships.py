"""
Tests for Graph Relationships & Source Evidence Provenance
"""

def test_create_relationship_with_source_evidence(client):
    rel_payload = {
        "id": "REL-TEST-901",
        "source_id": "PRS-2026-001",
        "target_id": "PRS-2026-002",
        "relationship_type": "MET_WITH",
        "case_id": "CPX-2026-001",
        "source_evidence_ids": ["DOC-2026-001", "CCTV-2026-001"],
        "evidence_type": "CCTV Footage & Visitor Log",
        "source_reference": "Pier 14 CCTV Camera 4, Entry Gate Register",
        "first_observed": "2026-10-12",
        "verification_status": "Verified",
        "notes": "Observed meeting at the dock café 2 hours prior to vessel berthing."
    }
    response = client.post("/api/graph/relationships", json=rel_payload)
    assert response.status_code == 201
    created = response.json()
    assert created["id"] == "REL-TEST-901"
    assert created["has_source_evidence"] is True
    assert "DOC-2026-001" in created["source_evidence_ids"]


def test_get_relationship_evidence_provenance(client):
    # Fetch evidence provenance for REL-2026-001
    response = client.get("/api/graph/cases/CPX-2026-001/relationships/REL-2026-001/evidence")
    assert response.status_code == 200
    provenance = response.json()
    assert provenance["relationship_id"] == "REL-2026-001"
    assert provenance["has_source_evidence"] is True
    assert len(provenance["evidence_ids"]) > 0
    assert provenance["source_reference"] is not None
    assert provenance["verification_status"] == "Verified"


def test_relationship_missing_evidence_flagged(client):
    # Create relationship with NO source evidence
    rel_no_evidence = {
        "id": "REL-TEST-UNSOURCED",
        "source_id": "PRS-2026-001",
        "target_id": "PRS-2026-003",
        "relationship_type": "SUSPECTED_CONTACT",
        "case_id": "CPX-2026-001",
        "source_evidence_ids": [],
        "source_reference": None,
        "verification_status": "Unverified"
    }
    create_resp = client.post("/api/graph/relationships", json=rel_no_evidence)
    assert create_resp.status_code == 201
    created = create_resp.json()
    assert created["has_source_evidence"] is False

    # Check evidence endpoint explicitly reports missing source
    ev_resp = client.get("/api/graph/cases/CPX-2026-001/relationships/REL-TEST-UNSOURCED/evidence")
    assert ev_resp.status_code == 200
    ev_data = ev_resp.json()
    assert ev_data["has_source_evidence"] is False
    assert "Missing Linked Source" in ev_data["verification_status"]
