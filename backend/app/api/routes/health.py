"""
Health and Database Connectivity Check Endpoints for CIPERX
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Dict, Any

from app.database.neo4j_client import neo4j_client
from app.database.schema import init_schema
from app.api.deps import CurrentUser, get_current_investigator
from app.services.audit_service import audit_service

router = APIRouter(prefix="/health", tags=["Health & Status"])


class HealthStatusResponse(BaseModel):
    status: str
    database_backend: str
    is_demo_mode: bool
    neo4j_connected: bool
    neo4j_uri: str
    database_name: str
    message: str


@router.get("", response_model=HealthStatusResponse)
def get_health_status(investigator: CurrentUser = Depends(get_current_investigator)):
    """
    Returns API health and real-time Neo4j graph database connectivity status.
    If Neo4j is offline, informs frontend to display the offline sandbox banner.
    """
    is_connected = neo4j_client.is_connected
    
    if is_connected:
        db_backend = "neo4j"
        is_demo = False
        message = "Connected to live Neo4j graph database. Parameterized Cypher engine active."
    else:
        db_backend = "demo_offline_neo4j"
        is_demo = True
        message = (
            "Neo4j instance is currently unreachable on configured port. "
            "Running in offline investigative sandbox mode with full Cypher emulation."
        )

    return HealthStatusResponse(
        status="healthy",
        database_backend=db_backend,
        is_demo_mode=is_demo,
        neo4j_connected=is_connected,
        neo4j_uri=neo4j_client.uri,
        database_name=neo4j_client.database,
        message=message
    )


@router.post("/reconnect")
def reconnect_database(investigator: CurrentUser = Depends(get_current_investigator)) -> Dict[str, Any]:
    """
    Attempts to re-establish connection to Neo4j and initialize schema constraints.
    Useful when starting Neo4j service after starting the backend.
    """
    reconnected = neo4j_client.reconnect()
    schema_results = []
    
    if reconnected:
        schema_results = init_schema()
        audit_service.log_action(
            action="NEO4J_RECONNECT_SUCCESS",
            user_id=investigator.user_id,
            details={"uri": neo4j_client.uri}
        )
        return {
            "success": True,
            "database_backend": "neo4j",
            "is_demo_mode": False,
            "message": "Successfully reconnected to Neo4j and synchronized schema constraints.",
            "schema_constraints_applied": len(schema_results)
        }
    else:
        return {
            "success": False,
            "database_backend": "demo_offline_neo4j",
            "is_demo_mode": True,
            "message": (
                f"Failed to connect to Neo4j at {neo4j_client.uri}. "
                "Ensure Neo4j service is running (e.g. via Neo4j Desktop or Docker)."
            )
        }
