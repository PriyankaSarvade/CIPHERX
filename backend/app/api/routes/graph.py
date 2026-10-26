"""
Graph Operations and Case Synchronization Endpoints for CIPERX
Implements parameterized Cypher graph queries and safe offline fallbacks.
"""
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException, status

from app.models.entity import EntityCreate
from app.models.relationship import RelationshipCreate
from app.models.graph import (
    GraphResponse,
    GraphNode,
    GraphEdge,
    CaseSyncRequest,
    CaseSyncResponse
)
from app.api.deps import CurrentUser, get_current_investigator, require_case_access
from app.services.graph_service import graph_service

router = APIRouter(prefix="", tags=["Graph Core"])


@router.get("/cases/{case_id}", response_model=GraphResponse)
def get_case_graph(
    case_id: str,
    investigator: CurrentUser = Depends(get_current_investigator)
):
    """
    Retrieves the complete investigative network graph for a specific case.
    Strictly isolated by case_id.
    """
    require_case_access(case_id, investigator)
    return graph_service.get_case_graph(case_id=case_id, user_id=investigator.user_id)


@router.get("/cases/{case_id}/entities/{entity_id}", response_model=GraphNode)
def get_case_entity(
    case_id: str,
    entity_id: str,
    investigator: CurrentUser = Depends(get_current_investigator)
):
    """
    Retrieves details for a specific entity within a case.
    """
    require_case_access(case_id, investigator)
    entity = graph_service.get_entity(entity_id=entity_id, case_id=case_id, user_id=investigator.user_id)
    if not entity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Entity {entity_id} not found in case {case_id}"
        )
    return entity


@router.post("/entities", response_model=GraphNode, status_code=status.HTTP_201_CREATED)
def create_or_update_entity(
    entity_data: EntityCreate,
    investigator: CurrentUser = Depends(get_current_investigator)
):
    """
    Creates or updates an entity (Person, PhoneNumber, Vehicle, Location, etc.) in the graph.
    Uses parameterized Cypher MERGE to prevent duplicates.
    """
    require_case_access(entity_data.case_id, investigator)
    return graph_service.upsert_entity(entity=entity_data, user_id=investigator.user_id)


@router.post("/relationships", response_model=GraphEdge, status_code=status.HTTP_201_CREATED)
def create_or_update_relationship(
    rel_data: RelationshipCreate,
    investigator: CurrentUser = Depends(get_current_investigator)
):
    """
    Creates or updates an edge connecting two entities in the case graph.
    Requires or attaches source evidence metadata to ensure every edge is backed by evidence.
    """
    require_case_access(rel_data.case_id, investigator)
    return graph_service.upsert_relationship(relationship=rel_data, user_id=investigator.user_id)


@router.post("/sync-case", response_model=CaseSyncResponse)
def sync_case_from_frontend(
    sync_data: CaseSyncRequest,
    investigator: CurrentUser = Depends(get_current_investigator)
):
    """
    Synchronizes entities and relationships from the frontend into the Neo4j database.
    Allows seamlessly importing existing React Flow / frontend evidence into the graph store.
    """
    require_case_access(sync_data.case_id, investigator)
    return graph_service.sync_case_graph(sync_req=sync_data, user_id=investigator.user_id)


@router.get("/cases/{case_id}/search", response_model=List[GraphNode])
def search_case_entities(
    case_id: str,
    q: str = Query(..., min_length=1, description="Search term for entity name, alias, or identifier"),
    category: Optional[str] = Query(None, description="Filter by category (e.g. Person, PhoneNumber)"),
    investigator: CurrentUser = Depends(get_current_investigator)
):
    """
    Searches for entities within a case matching a query string.
    """
    require_case_access(case_id, investigator)
    return graph_service.search_entities(
        query=q,
        case_id=case_id,
        category=category,
        user_id=investigator.user_id
    )


@router.delete("/cases/{case_id}")
def delete_case(
    case_id: str,
    investigator: CurrentUser = Depends(get_current_investigator)
):
    """
    Safely removes an isolated case and all its graph nodes and relationships.
    Useful for cleaning up test cases such as CPX-TEST-EVAL-001.
    """
    require_case_access(case_id, investigator)
    deleted = graph_service.delete_case(case_id=case_id, user_id=investigator.user_id)
    return {
        "success": True,
        "case_id": case_id,
        "deleted": deleted,
        "message": f"Case {case_id} and its associated graph elements have been safely removed."
    }
