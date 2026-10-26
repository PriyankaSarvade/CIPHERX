"""
Pytest configuration and fixtures for CIPERX backend testing.
"""
import sys
import os
import pytest
from fastapi.testclient import TestClient

# Ensure backend directory is in Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app


@pytest.fixture(scope="session")
def client():
    """Returns a FastAPI TestClient configured with default investigator auth headers."""
    with TestClient(app) as test_client:
        test_client.headers.update({
            "X-Investigator-Id": "INV-TEST-001",
            "X-Investigator-Role": "lead_investigator",
            "X-API-Key": "ciperx_dev_token_2026"
        })
        yield test_client


@pytest.fixture
def auth_headers():
    return {
        "X-Investigator-Id": "INV-TEST-001",
        "X-Investigator-Role": "lead_investigator",
        "X-API-Key": "ciperx_dev_token_2026"
    }
