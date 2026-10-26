"""
Graph Analytics Service for CIPERX
Combines NetworkX for algorithmic graph computations with Neo4j/in-memory graph data.
Includes strict case isolation and standardized investigative disclaimers.
"""
from typing import Optional, List, Dict, Any
import networkx as nx

from app.models.graph import (
    GraphResponse,
    GraphNode,
    GraphEdge,
    ShortestPathResponse,
    DegreeCentralityResponse,
    CentralityItem,
    ConnectedComponentsResponse,
    ComponentItem,
    GraphStatisticsResponse,
    DirectConnectionsResponse,
)
from app.services.graph_service import graph_service
from app.services.audit_service import audit_service


class AnalyticsService:
    def _build_nx_graph(self, graph_data: GraphResponse) -> nx.Graph:
        """
        Build an undirected NetworkX graph from GraphResponse for algorithmic analysis.
        Undirected is preferred for investigative reachability and centrality.
        """
        G = nx.Graph()
        
        for node in graph_data.nodes:
            G.add_node(
                node.id,
                name=node.name,
                category=node.category,
                verification_status=node.verification_status,
                obj=node
            )
            
        for edge in graph_data.edges:
            G.add_edge(
                edge.source,
                edge.target,
                id=edge.id,
                label=edge.label,
                relationship_type=edge.relationship_type,
                has_source_evidence=edge.has_source_evidence,
                evidence_type=edge.evidence_type,
                obj=edge
            )
            
        return G

    def compute_shortest_path(
        self,
        case_id: str,
        source_id: str,
        target_id: str,
        max_depth: int = 6,
        user_id: str = "investigator"
    ) -> ShortestPathResponse:
        """
        Calculates shortest path between two entities within the scope of a case.
        Includes compulsory disclaimer that shortest path is an informational link,
        not proof of guilt or criminal coordination.
        """
        graph_data = graph_service.get_case_graph(case_id, user_id=user_id)
        G = self._build_nx_graph(graph_data)

        disclaimer = (
            "A shortest path represents a possible connection through recorded relationships, "
            "not proof of coordination or criminal activity."
        )

        # Lookup mapping for names/IDs
        node_id_map = {n.id: n for n in graph_data.nodes}
        name_to_id = {n.name.lower(): n.id for n in graph_data.nodes}

        # Resolve source and target either by exact ID or case-insensitive Name
        actual_source = source_id if source_id in node_id_map else name_to_id.get(source_id.lower())
        actual_target = target_id if target_id in node_id_map else name_to_id.get(target_id.lower())

        if not actual_source or not actual_target:
            return ShortestPathResponse(
                case_id=case_id,
                path_found=False,
                path_length=0,
                source_id=source_id,
                target_id=target_id,
                nodes=[],
                edges=[],
                disclaimer=disclaimer
            )

        if actual_source == actual_target:
            single_node = node_id_map.get(actual_source)
            return ShortestPathResponse(
                case_id=case_id,
                path_found=True,
                path_length=0,
                source_id=actual_source,
                target_id=actual_target,
                nodes=[single_node] if single_node else [],
                edges=[],
                disclaimer=disclaimer
            )

        try:
            if not nx.has_path(G, actual_source, actual_target):
                return ShortestPathResponse(
                    case_id=case_id,
                    path_found=False,
                    path_length=0,
                    source_id=actual_source,
                    target_id=actual_target,
                    nodes=[],
                    edges=[],
                    disclaimer=disclaimer
                )

            path_node_ids = nx.shortest_path(G, source=actual_source, target=actual_target)
            
            # Check depth limit
            path_hops = len(path_node_ids) - 1
            if path_hops > max_depth:
                return ShortestPathResponse(
                    case_id=case_id,
                    path_found=False,
                    path_length=path_hops,
                    source_id=actual_source,
                    target_id=actual_target,
                    nodes=[],
                    edges=[],
                    disclaimer=f"Path exceeds maximum depth limit of {max_depth} hops."
                )

            # Collect nodes in order
            ordered_nodes: List[GraphNode] = []
            for nid in path_node_ids:
                if nid in node_id_map:
                    ordered_nodes.append(node_id_map[nid])

            # Collect edges connecting each consecutive pair in the path
            ordered_edges: List[GraphEdge] = []
            for i in range(len(path_node_ids) - 1):
                u = path_node_ids[i]
                v = path_node_ids[i + 1]
                # Find matching edge in graph_data
                matching_edge = None
                for e in graph_data.edges:
                    if (e.source == u and e.target == v) or (e.source == v and e.target == u):
                        matching_edge = e
                        break
                if matching_edge:
                    ordered_edges.append(matching_edge)
                else:
                    # Synthetic edge representation if not directly located
                    ordered_edges.append(
                        GraphEdge(
                            id=f"path-edge-{u}-{v}",
                            source=u,
                            target=v,
                            label="CONNECTED_TO",
                            relationship_type="CONNECTED_TO",
                            case_id=case_id,
                            has_source_evidence=False
                        )
                    )

            audit_service.log_action(
                action="SHORTEST_PATH_QUERY",
                user_id=user_id,
                case_id=case_id,
                details={"source": actual_source, "target": actual_target, "hops": path_hops}
            )

            return ShortestPathResponse(
                case_id=case_id,
                path_found=True,
                path_length=path_hops,
                source_id=actual_source,
                target_id=actual_target,
                nodes=ordered_nodes,
                edges=ordered_edges,
                disclaimer=disclaimer
            )
        except Exception as ex:
            return ShortestPathResponse(
                case_id=case_id,
                path_found=False,
                path_length=0,
                source_id=actual_source,
                target_id=actual_target,
                nodes=[],
                edges=[],
                disclaimer=f"Shortest path calculation failed: {str(ex)}"
            )

    def compute_degree_centrality(
        self,
        case_id: str,
        user_id: str = "investigator"
    ) -> DegreeCentralityResponse:
        """
        Computes degree centrality scores for all nodes in the case graph.
        Sorted descending by connectivity score.
        """
        graph_data = graph_service.get_case_graph(case_id, user_id=user_id)
        G = self._build_nx_graph(graph_data)

        disclaimer = (
            "Degree centrality indicates recorded connectivity within this case dataset. "
            "High connectivity does not automatically indicate criminal involvement."
        )

        if len(G.nodes) == 0:
            return DegreeCentralityResponse(
                case_id=case_id,
                total_nodes=0,
                centrality=[],
                disclaimer=disclaimer
            )

        centrality_scores = nx.degree_centrality(G)
        node_id_map = {n.id: n for n in graph_data.nodes}

        centrality_list: List[CentralityItem] = []
        for nid, score in centrality_scores.items():
            node = node_id_map.get(nid)
            degree_val = G.degree(nid)
            name_val = node.name if node else nid
            cat_val = node.category if node else "Unknown"

            centrality_list.append(
                CentralityItem(
                    id=nid,
                    name=name_val,
                    category=cat_val,
                    degree=degree_val,
                    centrality_score=round(score, 4)
                )
            )

        # Sort descending by centrality score then degree
        centrality_list.sort(key=lambda x: (x.centrality_score, x.degree), reverse=True)

        audit_service.log_action(
            action="CENTRALITY_ANALYSIS",
            user_id=user_id,
            case_id=case_id,
            details={"nodes_analyzed": len(centrality_list)}
        )

        return DegreeCentralityResponse(
            case_id=case_id,
            total_nodes=len(centrality_list),
            centrality=centrality_list,
            disclaimer=disclaimer
        )

    def compute_connected_components(
        self,
        case_id: str,
        user_id: str = "investigator"
    ) -> ConnectedComponentsResponse:
        """
        Computes connected components to reveal isolated clusters in the network.
        """
        graph_data = graph_service.get_case_graph(case_id, user_id=user_id)
        G = self._build_nx_graph(graph_data)

        disclaimer = (
            "Connected components illustrate isolated sub-networks within the recorded case graph."
        )

        if len(G.nodes) == 0:
            return ConnectedComponentsResponse(
                case_id=case_id,
                total_components=0,
                components=[],
                disclaimer=disclaimer
            )

        components_raw = list(nx.connected_components(G))
        # Sort components by size descending
        components_raw.sort(key=lambda c: len(c), reverse=True)

        node_id_map = {n.id: n for n in graph_data.nodes}
        component_items: List[ComponentItem] = []

        for idx, comp in enumerate(components_raw, start=1):
            comp_nodes = list(comp)
            sample_names = [node_id_map[nid].name for nid in comp_nodes[:4] if nid in node_id_map]
            component_items.append(
                ComponentItem(
                    component_id=idx,
                    entity_count=len(comp_nodes),
                    node_ids=comp_nodes,
                    sample_entities=sample_names
                )
            )

        audit_service.log_action(
            action="CONNECTED_COMPONENTS_ANALYSIS",
            user_id=user_id,
            case_id=case_id,
            details={"components_found": len(component_items)}
        )

        return ConnectedComponentsResponse(
            case_id=case_id,
            total_components=len(component_items),
            components=component_items,
            disclaimer=disclaimer
        )

    def compute_graph_statistics(
        self,
        case_id: str,
        user_id: str = "investigator"
    ) -> GraphStatisticsResponse:
        """
        Computes aggregate topology statistics for a case graph.
        """
        graph_data = graph_service.get_case_graph(case_id, user_id=user_id)
        G = self._build_nx_graph(graph_data)

        total_nodes = len(graph_data.nodes)
        total_edges = len(graph_data.edges)

        # Categorical counts
        nodes_by_category: Dict[str, int] = {}
        for n in graph_data.nodes:
            cat = n.category or "Unknown"
            nodes_by_category[cat] = nodes_by_category.get(cat, 0) + 1

        edges_by_type: Dict[str, int] = {}
        for e in graph_data.edges:
            rel = e.relationship_type or e.label or "ASSOCIATED_WITH"
            edges_by_type[rel] = edges_by_type.get(rel, 0) + 1

        # Density
        density = round(nx.density(G), 4) if total_nodes > 1 else 0.0

        # Connected components count
        comp_count = nx.number_connected_components(G) if total_nodes > 0 else 0

        # Centrality top 5
        cent_resp = self.compute_degree_centrality(case_id, user_id=user_id)
        top_central = cent_resp.centrality[:5]

        return GraphStatisticsResponse(
            case_id=case_id,
            total_nodes=total_nodes,
            total_edges=total_edges,
            nodes_by_category=nodes_by_category,
            edges_by_type=edges_by_type,
            component_count=comp_count,
            density=density,
            top_central_entities=top_central
        )

    def get_direct_connections(
        self,
        entity_id: str,
        case_id: str,
        user_id: str = "investigator"
    ) -> DirectConnectionsResponse:
        """
        Retrieves all 1-hop direct connections for an entity within a case.
        """
        graph_data = graph_service.get_case_graph(case_id, user_id=user_id)
        node_id_map = {n.id: n for n in graph_data.nodes}

        target_node = node_id_map.get(entity_id)
        entity_name = target_node.name if target_node else entity_id
        category = target_node.category if target_node else "Unknown"

        connections: List[Dict[str, Any]] = []
        for edge in graph_data.edges:
            if edge.source == entity_id:
                peer = node_id_map.get(edge.target)
                connections.append({
                    "relationship_id": edge.id,
                    "relationship_type": edge.relationship_type,
                    "direction": "outgoing",
                    "connected_entity_id": edge.target,
                    "connected_entity_name": peer.name if peer else edge.target,
                    "category": peer.category if peer else "Unknown",
                    "has_source_evidence": edge.has_source_evidence,
                    "evidence_type": edge.evidence_type,
                    "verification_status": edge.verification_status
                })
            elif edge.target == entity_id:
                peer = node_id_map.get(edge.source)
                connections.append({
                    "relationship_id": edge.id,
                    "relationship_type": edge.relationship_type,
                    "direction": "incoming",
                    "connected_entity_id": edge.source,
                    "connected_entity_name": peer.name if peer else edge.source,
                    "category": peer.category if peer else "Unknown",
                    "has_source_evidence": edge.has_source_evidence,
                    "evidence_type": edge.evidence_type,
                    "verification_status": edge.verification_status
                })

        return DirectConnectionsResponse(
            entity_id=entity_id,
            entity_name=entity_name,
            category=category,
            total_connections=len(connections),
            connections=connections
        )


analytics_service = AnalyticsService()
