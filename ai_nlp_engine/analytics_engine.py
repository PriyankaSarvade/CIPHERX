import networkx as nx
from typing import List, Dict, Any

def analyze_network_and_risks(
    nodes: List[str], 
    edges: List[Dict[str, Any]], 
    target_source: str, 
    target_dest: str
) -> Dict[str, Any]:
    """
    Builds an in-memory graph to analyze network pathways, degree hubs, 
    and produce human-readable explainable risk metrics.
    """
    G = nx.Graph()

    for node in nodes:
        G.add_node(node)

    for edge in edges:
        G.add_edge(edge["source"], edge["target"], weight=edge.get("weight", 1.0))

    # 1. Path Analysis (Shortest Path)
    shortest_path = []
    if G.has_node(target_source) and G.has_node(target_dest):
        try:
            shortest_path = nx.shortest_path(G, source=target_source, target=target_dest)
        except nx.NetworkXNoPath:
            shortest_path = []

    # 2. Centrality & Key Suspect Hubs
    centrality = nx.degree_centrality(G)
    top_suspects = sorted(centrality.items(), key=lambda x: x[1], reverse=True)[:3]

    # 3. Explainable Risk Score Generation
    risk_alerts = []
    for node, score in centrality.items():
        if score >= 0.4:
            degree_count = G.degree(node)
            risk_alerts.append({
                "entity": node,
                "risk_score": min(int(score * 100), 100),
                "explanation": f"High risk hub: '{node}' maintains direct connections with {degree_count} entities across the case network."
            })

    return {
        "investigation_path": shortest_path,
        "key_hubs": top_suspects,
        "explainable_risk_alerts": risk_alerts
    }

def detect_contradictions(location_logs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Detects physical travel impossibilities in suspect statements or CDR logs.
    """
    contradictions = []
    sorted_logs = sorted(location_logs, key=lambda x: x["timestamp"])

    for i in range(len(sorted_logs) - 1):
        curr_log = sorted_logs[i]
        next_log = sorted_logs[i+1]

        # Flag if suspect appears at two different places in less than 30 minutes
        time_diff = abs(next_log["timestamp"] - curr_log["timestamp"])
        if time_diff <= 30 and curr_log["location"] != next_log["location"]:
            contradictions.append({
                "entity": curr_log["entity"],
                "issue": "TIMELINE_CONTRADICTION",
                "severity": "HIGH",
                "explanation": f"Suspect logged at '{curr_log['location']}' and '{next_log['location']}' within {time_diff} minutes.",
                "sources": [curr_log["source"], next_log["source"]]
            })

    return contradictions