"""
Graph Analytics and Algorithms Endpoints for CIPERX
Implements Shortest Path, Degree Centrality, Connected Components, and Graph Statistics
with NetworkX algorithmic processing and standardized investigative disclaimers.
"""
from fastapi import APIRouter, Depends, Query

from app.models.graph import (
    ShortestPathRequest,
    ShortestPathResponse,
    DegreeCentralityResponse,
    ConnectedComponentsResponse,
    GraphStatisticsResponse,
    DirectConnectionsResponse,
)
from app.api.deps import CurrentUser, get_current_investigator, require_case_access
from app.services.analytics_service import analytics_service

router = APIRouter(prefix="", tags=["Graph Analytics & Algorithms"])


@router.post("/shortest-path", response_model=ShortestPathResponse)
def calculate_shortest_path(
    req: ShortestPathRequest,
    investigator: CurrentUser = Depends(get_current_investigator)
):
    """
    Computes the shortest path between two entities in a case graph.
    Returns ordered sequence of nodes and edges, hop count, and investigative disclaimer.
    """
    require_case_access(req.case_id, investigator)
    return analytics_service.compute_shortest_path(
        case_id=req.case_id,
        source_id=req.source_id,
        target_id=req.target_id,
        max_depth=req.max_depth or 6,
        user_id=investigator.user_id
    )


@router.get("/cases/{case_id}/centrality", response_model=DegreeCentralityResponse)
def get_degree_centrality(
    case_id: str,
    investigator: CurrentUser = Depends(get_current_investigator)
):
    """
    Calculates degree centrality for all entities in the case network.
    Identifies high-degree coordination hubs. Includes non-guilt disclaimer.
    """
    require_case_access(case_id, investigator)
    return analytics_service.compute_degree_centrality(
        case_id=case_id,
        user_id=investigator.user_id
    )


@router.get("/cases/{case_id}/components", response_model=ConnectedComponentsResponse)
def get_connected_components(
    case_id: str,
    investigator: CurrentUser = Depends(get_current_investigator)
):
    """
    Analyzes connected components to detect isolated clusters or separate sub-networks.
    """
    require_case_access(case_id, investigator)
    return analytics_service.compute_connected_components(
        case_id=case_id,
        user_id=investigator.user_id
    )


@router.get("/cases/{case_id}/statistics", response_model=GraphStatisticsResponse)
def get_graph_statistics(
    case_id: str,
    investigator: CurrentUser = Depends(get_current_investigator)
):
    """
    Generates topological statistics: node counts by category, relationship distributions,
    graph density, component counts, and top central entities.
    """
    require_case_access(case_id, investigator)
    return analytics_service.compute_graph_statistics(
        case_id=case_id,
        user_id=investigator.user_id
    )


@router.get("/cases/{case_id}/entities/{entity_id}/connections", response_model=DirectConnectionsResponse)
def get_entity_connections(
    case_id: str,
    entity_id: str,
    investigator: CurrentUser = Depends(get_current_investigator)
):
    """
    Retrieves all immediate (1-hop) direct incoming and outgoing connections for an entity.
    """
    require_case_access(case_id, investigator)
    return analytics_service.get_direct_connections(
        entity_id=entity_id,
        case_id=case_id,
        user_id=investigator.user_id
    )
