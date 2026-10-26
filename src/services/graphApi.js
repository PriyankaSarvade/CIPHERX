/**
 * CIPERX Graph API Client
 * Interfaces React Flow frontend with FastAPI/Neo4j backend.
 * Provides fallback handling if backend server is offline.
 */

const API_BASE = 'http://127.0.0.1:8000/api/graph';

const defaultHeaders = {
  'Content-Type': 'application/json',
  'X-Investigator-Id': 'INV-LEAD-01',
  'X-Investigator-Role': 'lead_investigator',
  'X-API-Key': 'ciperx_dev_token_2026',
};

export const graphApi = {
  /**
   * Health and Database Status
   */
  async getHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`, {
        method: 'GET',
        headers: defaultHeaders,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      return {
        status: 'offline',
        database_backend: 'offline',
        is_demo_mode: false,
        neo4j_connected: false,
        neo4j_uri: 'bolt://localhost:7687',
        message: 'Backend server offline. Graph analysis service is unreachable.',
      };
    }
  },

  /**
   * Trigger Neo4j Reconnect
   */
  async reconnect() {
    const res = await fetch(`${API_BASE}/health/reconnect`, {
      method: 'POST',
      headers: defaultHeaders,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Reconnect failed`);
    return await res.json();
  },

  /**
   * Fetch complete graph for a case from Neo4j / Backend
   */
  async getCaseGraph(caseId) {
    const res = await fetch(`${API_BASE}/cases/${encodeURIComponent(caseId)}`, {
      method: 'GET',
      headers: defaultHeaders,
    });
    if (!res.ok) {
      throw new Error(`Graph retrieval failed with HTTP ${res.status}`);
    }
    return await res.json();
  },

  /**
   * Calculate Shortest Path between two entities
   */
  async calculateShortestPath(caseId, sourceId, targetId, maxDepth = 6) {
    const res = await fetch(`${API_BASE}/shortest-path`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({
        case_id: caseId,
        source_id: sourceId,
        target_id: targetId,
        max_depth: maxDepth,
      }),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Shortest path analysis failed with HTTP ${res.status}: ${errText || res.statusText}`);
    }
    return await res.json();
  },

  /**
   * Get Degree Centrality
   */
  async getDegreeCentrality(caseId) {
    const res = await fetch(`${API_BASE}/cases/${encodeURIComponent(caseId)}/centrality`, {
      method: 'GET',
      headers: defaultHeaders,
    });
    if (!res.ok) throw new Error(`Centrality analysis failed with HTTP ${res.status}`);
    return await res.json();
  },

  /**
   * Get Connected Components
   */
  async getConnectedComponents(caseId) {
    const res = await fetch(`${API_BASE}/cases/${encodeURIComponent(caseId)}/components`, {
      method: 'GET',
      headers: defaultHeaders,
    });
    if (!res.ok) throw new Error(`Connected components analysis failed with HTTP ${res.status}`);
    return await res.json();
  },

  /**
   * Get Graph Statistics
   */
  async getGraphStatistics(caseId) {
    const res = await fetch(`${API_BASE}/cases/${encodeURIComponent(caseId)}/statistics`, {
      method: 'GET',
      headers: defaultHeaders,
    });
    if (!res.ok) throw new Error(`Graph statistics calculation failed with HTTP ${res.status}`);
    return await res.json();
  },

  /**
   * Get Evidence Provenance for Relationship Edge
   */
  async getRelationshipEvidence(caseId, relationshipId) {
    const res = await fetch(
      `${API_BASE}/cases/${encodeURIComponent(caseId)}/relationships/${encodeURIComponent(relationshipId)}/evidence`,
      {
        method: 'GET',
        headers: defaultHeaders,
      }
    );
    if (!res.ok) throw new Error(`Evidence provenance retrieval failed with HTTP ${res.status}`);
    return await res.json();
  },

  /**
   * Synchronize Case Entities and Relationships to Neo4j
   */
  async syncCase(caseId, entities, relationships) {
    const res = await fetch(`${API_BASE}/sync-case`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({
        case_id: caseId,
        entities: entities || [],
        relationships: relationships || [],
      }),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Graph synchronization failed with HTTP ${res.status}: ${errText || res.statusText}`);
    }
    return await res.json();
  },
};
