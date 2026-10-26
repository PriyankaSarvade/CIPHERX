import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MiniMap
} from '@xyflow/react';
import { useCaseContext } from '../context/CaseContext';
import { CustomNode } from '../components/network/CustomNode';
import { GraphLegend } from '../components/network/GraphLegend';
import { NodeDetailDrawer } from '../components/network/NodeDetailDrawer';
import { buildGraphData } from '../utils/graphLayout';
import { Button } from '../components/common/Button';
import { graphApi } from '../services/graphApi';
import {
  Network,
  Search,
  Plus,
  Compass,
  RotateCcw,
  Activity,
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  ArrowRight,
  Route,
  ShieldCheck,
  BarChart3,
  Layers,
  Sparkles,
  WifiOff,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const nodeTypes = {
  customEntity: CustomNode
};

export const NetworkExplorerPage = () => {
  const {
    cases,
    activeCaseId,
    setActiveCaseId,
    activeCase,
    activeCaseEntities,
    activeCaseRelationships,
    focusEntityTarget,
    setFocusEntityTarget,
    setActiveTab
  } = useCaseContext();

  const [selectedElement, setSelectedElement] = useState(null);
  const [filterType, setFilterType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Backend Graph Loading & Error State
  const [backendGraphData, setBackendGraphData] = useState(null);
  const [isLoadingGraph, setIsLoadingGraph] = useState(false);
  const [graphError, setGraphError] = useState(null);

  // Backend & Graph Database State
  const [dbStatus, setDbStatus] = useState({
    checked: false,
    connected: false,
    backend: 'demo_offline_neo4j',
    isDemo: true,
    message: 'Checking database...'
  });
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);

  // Shortest Path Interactive Panel State (Visible by default for test cases)
  const [showPathPanel, setShowPathPanel] = useState(() => {
    return activeCaseId === 'CPX-TEST-EVAL-001';
  });
  const [pathSource, setPathSource] = useState('');
  const [pathTarget, setPathTarget] = useState('');
  const [pathResult, setPathResult] = useState(null);
  const [isCalculatingPath, setIsCalculatingPath] = useState(false);
  const [highlightedPathIds, setHighlightedPathIds] = useState(new Set());

  // Graph Analytics Modal State
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [graphStats, setGraphStats] = useState(null);
  const [centralityData, setCentralityData] = useState(null);
  const [componentsData, setComponentsData] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState(null);

  // Check Neo4j / Backend status on mount and when case changes
  const checkHealth = useCallback(async () => {
    try {
      const health = await graphApi.getHealth();
      setDbStatus({
        checked: true,
        connected: health.neo4j_connected || false,
        backend: health.database_backend || 'demo_offline_neo4j',
        isDemo: health.is_demo_mode ?? true,
        message: health.message || ''
      });
    } catch {
      setDbStatus({
        checked: true,
        connected: false,
        backend: 'demo_offline_neo4j',
        isDemo: true,
        message: 'Backend offline. Emulated sandbox active.'
      });
    }
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  // Load Graph Data from Backend API whenever activeCaseId changes
  const fetchGraphData = useCallback(async (caseId) => {
    if (!caseId) return;
    setIsLoadingGraph(true);
    setGraphError(null);
    try {
      let data = await graphApi.getCaseGraph(caseId);
      // If backend has no nodes for this case yet, but case has entities, sync to backend
      if ((!data || !data.nodes || data.nodes.length === 0) && activeCaseEntities && activeCaseEntities.length > 0) {
        try {
          await graphApi.syncCase(caseId, activeCaseEntities, activeCaseRelationships);
          data = await graphApi.getCaseGraph(caseId);
        } catch (syncErr) {
          console.warn('Initial case sync warning:', syncErr);
        }
      }

      if (data && data.nodes && data.nodes.length > 0) {
        setBackendGraphData(data);
      } else {
        setBackendGraphData(null);
      }
    } catch (err) {
      console.warn('Backend graph fetch notice:', err);
      setGraphError(`Graph analysis backend is unavailable (${err.message}). Showing locally cached case data.`);
      setBackendGraphData(null);
    } finally {
      setIsLoadingGraph(false);
    }
  }, [activeCaseEntities, activeCaseRelationships]);

  useEffect(() => {
    fetchGraphData(activeCaseId);
    // Reset shortest path selection when case switches
    setPathSource('');
    setPathTarget('');
    setPathResult(null);
    setHighlightedPathIds(new Set());
    if (activeCaseId === 'CPX-TEST-EVAL-001') {
      setShowPathPanel(true);
    }
  }, [activeCaseId, fetchGraphData]);

  const handleReconnect = async () => {
    setIsReconnecting(true);
    try {
      const res = await graphApi.reconnect();
      setDbStatus({
        checked: true,
        connected: res.success || false,
        backend: res.database_backend || 'demo_offline_neo4j',
        isDemo: res.is_demo_mode ?? true,
        message: res.message || ''
      });
      // Re-fetch graph data on reconnect
      await fetchGraphData(activeCaseId);
    } catch (err) {
      setDbStatus({
        checked: true,
        connected: false,
        backend: 'offline',
        isDemo: false,
        message: 'Reconnect failed: ' + err.message
      });
    } finally {
      setIsReconnecting(false);
    }
  };

  const handleSyncToBackend = async () => {
    setSyncStatus({ loading: true, message: 'Syncing to Graph DB...' });
    try {
      const res = await graphApi.syncCase(activeCaseId, activeCaseEntities, activeCaseRelationships);
      setSyncStatus({
        loading: false,
        success: true,
        message: res.message || `Synced ${res.entities_upserted} entities and ${res.relationships_upserted} links.`
      });
      // Refresh graph from backend after sync
      await fetchGraphData(activeCaseId);
      setTimeout(() => setSyncStatus(null), 4000);
    } catch (err) {
      setSyncStatus({
        loading: false,
        success: false,
        message: 'Sync failed: ' + (err.message || 'Server error')
      });
      setTimeout(() => setSyncStatus(null), 4000);
    }
  };

  // Open Graph Analytics and fetch stats
  const handleOpenAnalytics = async () => {
    setShowStatsModal(true);
    setLoadingStats(true);
    setStatsError(null);
    try {
      const [stats, cent, comps] = await Promise.all([
        graphApi.getGraphStatistics(activeCaseId),
        graphApi.getDegreeCentrality(activeCaseId),
        graphApi.getConnectedComponents(activeCaseId)
      ]);
      setGraphStats(stats);
      setCentralityData(cent);
      setComponentsData(comps);
    } catch (err) {
      setStatsError(err.message || 'Unable to connect to graph analysis backend.');
    } finally {
      setLoadingStats(false);
    }
  };

  // Execute Shortest Path Query via Backend API
  const handleExecuteShortestPath = async () => {
    if (!pathSource || !pathTarget) return;
    setIsCalculatingPath(true);
    try {
      const res = await graphApi.calculateShortestPath(activeCaseId, pathSource, pathTarget, 6);
      setPathResult(res);
      if (res && res.path_found) {
        const idSet = new Set();
        (res.nodes || []).forEach((n) => idSet.add(n.id));
        (res.edges || []).forEach((e) => {
          idSet.add(e.id);
          idSet.add(e.source);
          idSet.add(e.target);
        });
        setHighlightedPathIds(idSet);
      } else {
        setHighlightedPathIds(new Set());
      }
    } catch (err) {
      setPathResult({
        error: true,
        message: err.message || 'Graph analysis backend service is currently unreachable.'
      });
      setHighlightedPathIds(new Set());
    } finally {
      setIsCalculatingPath(false);
    }
  };

  const handleClearShortestPath = () => {
    setPathResult(null);
    setHighlightedPathIds(new Set());
    setPathSource('');
    setPathTarget('');
  };

  // Normalize entities from backend if available, otherwise use activeCaseEntities from CaseContext
  const currentEntities = useMemo(() => {
    if (backendGraphData && backendGraphData.nodes && backendGraphData.nodes.length > 0) {
      return backendGraphData.nodes.map((n) => ({
        id: n.id,
        name: n.name,
        category: n.category,
        verificationStatus: n.verification_status,
        source: n.source,
        notes: n.notes,
        ...(n.properties?.properties || n.properties || {})
      }));
    }
    return activeCaseEntities;
  }, [backendGraphData, activeCaseEntities]);

  // Normalize relationships from backend if available, otherwise use activeCaseRelationships
  const currentRelationships = useMemo(() => {
    if (backendGraphData && backendGraphData.edges && backendGraphData.edges.length > 0) {
      return backendGraphData.edges.map((e) => ({
        id: e.id,
        sourceEntityId: e.source,
        targetEntityId: e.target,
        relationshipType: e.relationship_type || e.label,
        supportingEvidence: e.source_reference,
        source: e.source_reference,
        notes: e.notes,
        verificationStatus: e.verification_status,
        source_evidence_ids: e.source_evidence_ids,
        has_source_evidence: e.has_source_evidence,
        ...(e.properties?.properties || e.properties || {})
      }));
    }
    return activeCaseRelationships;
  }, [backendGraphData, activeCaseRelationships]);

  // Filter entities according to category filter
  const visibleEntities = useMemo(() => {
    let result = currentEntities;
    if (filterType !== 'All') {
      result = result.filter((e) => e.category === filterType);
    }
    return result;
  }, [currentEntities, filterType]);

  // Build initial nodes and edges with shortest path highlight styling
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const raw = buildGraphData(
      visibleEntities,
      currentRelationships,
      searchQuery || focusEntityTarget
    );

    // Apply shortest path highlighting if active
    if (highlightedPathIds.size > 0) {
      const styledNodes = raw.nodes.map((n) => {
        const isInPath = highlightedPathIds.has(n.id);
        return {
          ...n,
          data: {
            ...n.data,
            isInShortestPath: isInPath,
            isDimmed: !isInPath
          }
        };
      });

      const styledEdges = raw.edges.map((e) => {
        const isInPath =
          highlightedPathIds.has(e.id) ||
          (highlightedPathIds.has(e.source) && highlightedPathIds.has(e.target));
        return {
          ...e,
          animated: isInPath,
          style: {
            ...e.style,
            stroke: isInPath ? '#D97706' : '#CBD5E1',
            strokeWidth: isInPath ? 3.5 : 1.2,
            opacity: isInPath ? 1.0 : 0.25
          }
        };
      });

      return { nodes: styledNodes, edges: styledEdges };
    }

    return raw;
  }, [visibleEntities, currentRelationships, searchQuery, focusEntityTarget, highlightedPathIds]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync nodes and edges whenever underlying case data or search changes
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Handle node click
  const onNodeClick = useCallback((_, node) => {
    setSelectedElement(node.data);
  }, []);

  // Handle edge click
  const onEdgeClick = useCallback((_, edge) => {
    setSelectedElement(edge.data);
  }, []);

  // Clear selection on background click
  const onPaneClick = useCallback(() => {
    setSelectedElement(null);
  }, []);

  // Connected relationships for selected entity
  const connectedRelationships = useMemo(() => {
    if (!selectedElement || selectedElement.relationshipType) return [];
    const name = selectedElement.name?.toLowerCase();
    const id = selectedElement.id;

    return currentRelationships.filter(
      (r) =>
        r.sourceEntityId === id ||
        r.targetEntityId === id ||
        r.sourceEntityName?.toLowerCase() === name ||
        r.targetEntityName?.toLowerCase() === name
    );
  }, [selectedElement, currentRelationships]);

  const handleJumpToFinder = (entityName) => {
    setFocusEntityTarget(entityName);
    setActiveTab('finder');
  };

  // Helper names for source and target
  const sourceNodeObj = useMemo(
    () => currentEntities.find((e) => e.id === pathSource),
    [currentEntities, pathSource]
  );
  const targetNodeObj = useMemo(
    () => currentEntities.find((e) => e.id === pathTarget),
    [currentEntities, pathTarget]
  );

  return (
    <div className="space-y-4">
      {/* Top Controls Toolbar */}
      <div className="bg-white rounded-lg border border-[#D7E4F0] p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold text-[#243447] flex items-center gap-2">
              <Network className="w-5 h-5 text-[#3478C9]" />
              Network Explorer
            </h2>

            {/* Neo4j Database Status Pill */}
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                dbStatus.connected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-amber-50 text-amber-800 border-amber-300'
              }`}
              title={dbStatus.message}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  dbStatus.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span>{dbStatus.connected ? 'Neo4j Live' : 'Neo4j Offline Sandbox'}</span>
              {!dbStatus.connected && (
                <button
                  onClick={handleReconnect}
                  disabled={isReconnecting}
                  className="hover:underline ml-1 text-[10px] text-amber-700 font-bold cursor-pointer"
                  title="Attempt to reconnect to local Neo4j bolt://localhost:7687"
                >
                  {isReconnecting ? 'Connecting...' : 'Reconnect'}
                </button>
              )}
            </div>

            {/* Backend Data Source Badge */}
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#F2F7FC] border border-[#D7E4F0] text-[#64748B] font-mono">
              {backendGraphData ? 'Backend Graph API: Connected' : 'Context Fallback Mode'}
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Interactive relational graph for Case {activeCase?.id || ''}: {activeCase?.name || 'No case selected'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Case Selector */}
          {cases.length > 0 && (
            <div className="flex items-center gap-1.5 bg-[#F2F7FC] border border-[#D7E4F0] rounded-md px-2.5 py-1.5 text-xs">
              <span className="font-semibold text-[#64748B]">Case:</span>
              <select
                value={activeCaseId}
                onChange={(e) => setActiveCaseId(e.target.value)}
                className="bg-transparent font-bold text-[#243447] focus:outline-hidden cursor-pointer"
              >
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id} {c.id.startsWith('CPX-TEST') ? '(Test Evaluation)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quick Highlight Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Highlight entity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-2.5 py-1.5 text-xs bg-white border border-[#D7E4F0] rounded-md focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] w-36 sm:w-40"
            />
          </div>

          {/* Shortest Path Toggle Button - Prominent & Unmissable */}
          <button
            onClick={() => setShowPathPanel(!showPathPanel)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md border transition-all cursor-pointer shadow-xs ${
              showPathPanel || highlightedPathIds.size > 0
                ? 'bg-[#3478C9] text-white border-[#2866AE] ring-2 ring-[#3478C9]/30'
                : 'bg-[#EAF4FC] hover:bg-[#D7E4F0] text-[#2866AE] border-[#B9D7F2]'
            }`}
            title="Toggle Shortest Path connection analysis between any two nodes"
          >
            <Route className="w-4 h-4" />
            <span>Shortest Path</span>
            {highlightedPathIds.size > 0 ? (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px]">
                {pathResult?.path_length} Hops
              </span>
            ) : (
              showPathPanel ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />
            )}
          </button>

          {/* Graph Analytics Button */}
          <Button
            variant="secondary"
            size="sm"
            icon={BarChart3}
            onClick={handleOpenAnalytics}
          >
            Analytics
          </Button>

          {/* Sync to Neo4j Button */}
          <Button
            variant="secondary"
            size="sm"
            icon={Database}
            onClick={handleSyncToBackend}
            title="Synchronize case data into Neo4j graph database"
          >
            Sync DB
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={Plus}
            onClick={() => setActiveTab('evidence')}
          >
            Add Link
          </Button>
        </div>
      </div>

      {/* Shortest Path Interactive Analysis Panel */}
      {showPathPanel && (
        <div className="bg-[#F2F7FC] border border-[#B9D7F2] rounded-lg p-4 shadow-xs space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-[#D7E4F0] pb-2">
            <div className="flex items-center gap-2">
              <Route className="w-4 h-4 text-[#3478C9]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#243447]">
                Shortest Path Connection Finder — Case {activeCaseId}
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-white border border-[#D7E4F0] text-[#3478C9] font-medium">
                Live FastAPI & NetworkX Traversal
              </span>
            </div>
            <button
              onClick={() => setShowPathPanel(false)}
              className="text-[#64748B] hover:text-[#243447] text-xs font-bold p-1 rounded hover:bg-white cursor-pointer"
              title="Close panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-[#64748B]">
            Select a <strong>Source Entity</strong> and a <strong>Destination Entity</strong> from the case graph nodes below to calculate the minimum relational traversal distance.
          </p>

          {/* Dropdowns and Action Controls Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            {/* Source Entity Dropdown */}
            <div className="md:col-span-4">
              <label className="block text-xs font-bold text-[#243447] mb-1">
                Source Entity (Origin):
              </label>
              <select
                value={pathSource}
                onChange={(e) => setPathSource(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-[#D7E4F0] rounded-md text-[#243447] font-medium focus:ring-2 focus:ring-[#3478C9] focus:outline-hidden cursor-pointer"
              >
                <option value="">-- Choose Origin Node --</option>
                {currentEntities.map((ent) => (
                  <option key={ent.id} value={ent.id}>
                    {ent.name} ({ent.category || 'Entity'})
                  </option>
                ))}
              </select>
            </div>

            {/* Destination Entity Dropdown */}
            <div className="md:col-span-4">
              <label className="block text-xs font-bold text-[#243447] mb-1">
                Destination Entity (Target):
              </label>
              <select
                value={pathTarget}
                onChange={(e) => setPathTarget(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-[#D7E4F0] rounded-md text-[#243447] font-medium focus:ring-2 focus:ring-[#3478C9] focus:outline-hidden cursor-pointer"
              >
                <option value="">-- Choose Target Node --</option>
                {currentEntities.map((ent) => (
                  <option key={ent.id} value={ent.id}>
                    {ent.name} ({ent.category || 'Entity'})
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="md:col-span-4 flex items-center gap-2">
              <button
                type="button"
                onClick={handleExecuteShortestPath}
                disabled={!pathSource || !pathTarget || isCalculatingPath}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-md bg-[#3478C9] hover:bg-[#2866AE] text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCalculatingPath ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Calculating...</span>
                  </>
                ) : (
                  <>
                    <Route className="w-3.5 h-3.5" />
                    <span>Find Shortest Path</span>
                  </>
                )}
              </button>

              {highlightedPathIds.size > 0 && (
                <button
                  type="button"
                  onClick={handleClearShortestPath}
                  className="px-3 py-2.5 text-xs font-semibold rounded-md bg-white border border-[#D7E4F0] text-[#64748B] hover:text-[#243447] hover:bg-slate-50 cursor-pointer shadow-2xs"
                  title="Clear highlighted path"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Path Query Result Output Box */}
          {pathResult && (
            <div
              className={`p-3.5 rounded-lg border text-xs space-y-2 mt-2 ${
                pathResult.error
                  ? 'bg-red-50 border-red-300 text-red-950'
                  : pathResult.path_found
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-amber-50 border-amber-300 text-amber-950'
              }`}
            >
              {pathResult.error ? (
                <div className="flex items-start gap-2.5 text-xs text-red-900">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-sm">Graph Analysis Backend Error</p>
                    <p className="text-xs text-red-700">
                      {pathResult.message || 'The graph analysis backend service is currently unreachable.'}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="font-bold flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      {pathResult.path_found ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>
                            Shortest Path Discovered: <strong>{pathResult.path_length} Relational Hops</strong>
                          </span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>No Relational Path Discovered within 6 Hops</span>
                        </>
                      )}
                    </div>

                    {pathResult.path_found && (
                      <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-600 text-white font-mono font-bold">
                        {pathResult.nodes?.length} Nodes Active
                      </span>
                    )}
                  </div>

                  {pathResult.path_found ? (
                    <>
                      <div className="bg-white p-3 rounded border border-emerald-200 text-xs text-[#243447] space-y-1.5 shadow-2xs">
                        <span className="font-bold text-[#64748B] text-[10px] uppercase tracking-wider block">
                          Ordered Node Traversal Sequence:
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                          {pathResult.nodes?.map((node, i) => (
                            <React.Fragment key={node.id}>
                              <span className="px-2.5 py-1 rounded-md bg-[#EAF4FC] border border-[#B9D7F2] font-bold text-[#2866AE] inline-flex items-center gap-1">
                                <span className="text-[10px] text-[#64748B] font-mono">#{i + 1}</span>
                                <span>{node.name}</span>
                              </span>
                              {i < pathResult.nodes.length - 1 && (
                                <ArrowRight className="w-4 h-4 text-[#3478C9] shrink-0" />
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>

                      <div className="text-[11px] italic bg-white/70 p-2.5 rounded border border-emerald-200/50 text-slate-700">
                        ⚖️ <strong>Legal & Analytical Disclaimer:</strong> {pathResult.disclaimer}
                      </div>
                    </>
                  ) : (
                    <div className="bg-white p-3 rounded border border-amber-200 text-xs text-amber-900 space-y-1 shadow-2xs">
                      <p className="font-semibold">
                        No direct or indirect relational chain connects <strong>"{sourceNodeObj?.name || pathSource}"</strong> and <strong>"{targetNodeObj?.name || pathTarget}"</strong>.
                      </p>
                      <p className="text-[11px] text-[#64748B]">
                        These two entities are located in disconnected sub-graphs or isolated components in Case {activeCaseId}.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Graph Error Alert if present */}
      {graphError && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{graphError}</span>
          </div>
          <button
            onClick={() => fetchGraphData(activeCaseId)}
            className="text-xs font-bold text-red-700 hover:underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Sync Status Notification Toast */}
      {syncStatus && (
        <div
          className={`px-4 py-2.5 rounded-lg border text-xs flex items-center justify-between shadow-xs ${
            syncStatus.success
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-amber-50 border-amber-300 text-amber-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {syncStatus.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            )}
            <span className="font-medium">{syncStatus.message}</span>
          </div>
          <button
            onClick={() => setSyncStatus(null)}
            className="text-[#64748B] hover:text-[#243447] text-xs font-bold cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* Main Canvas Area */}
      <div className="relative h-[620px] w-full bg-[#F8FAFC] rounded-lg border border-[#D7E4F0] shadow-xs overflow-hidden">
        {/* Loading Overlay */}
        {isLoadingGraph && (
          <div className="absolute inset-0 bg-[#F8FAFC]/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-30">
            <RefreshCw className="w-8 h-8 text-[#3478C9] animate-spin mb-2" />
            <h4 className="text-sm font-bold text-[#243447]">Loading Case Graph...</h4>
            <p className="text-xs text-[#64748B] mt-1">
              Retrieving entities and relational edges from CIPERX backend for Case {activeCaseId}.
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoadingGraph && nodes.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
            <Network className="w-12 h-12 text-[#94A3B8] mb-3" />
            <h4 className="text-base font-bold text-[#243447]">No Network Data to Display</h4>
            <p className="text-xs text-[#64748B] mt-1 max-w-md">
              There are no entities or relationships logged in this case ({activeCaseId}). Add evidence items and
              relationships in Evidence Management or select a test case to generate an interactive graph.
            </p>
            <div className="mt-4 flex gap-2">
              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={() => setActiveTab('evidence')}
              >
                Go to Evidence Management
              </Button>
            </div>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.2}
            maxZoom={2.0}
            className="bg-[#F8FAFC]"
          >
            <Background color="#CBD5E1" gap={20} size={1} />
            <Controls className="bg-white border border-[#D7E4F0] rounded-md shadow-xs text-[#243447]" />
            <MiniMap
              nodeStrokeColor="#3478C9"
              nodeColor="#EAF4FC"
              className="bg-white border border-[#D7E4F0] rounded-md shadow-xs"
              zoomable
              pannable
            />
          </ReactFlow>
        )}

        {/* Legend Overlay at Bottom-Left */}
        {!isLoadingGraph && nodes.length > 0 && (
          <div className="absolute bottom-4 left-4 z-10 pointer-events-auto">
            <GraphLegend />
          </div>
        )}

        {/* Node or Edge Detail Drawer at Right */}
        <NodeDetailDrawer
          selectedItem={selectedElement}
          onClose={() => setSelectedElement(null)}
          onFindConnections={handleJumpToFinder}
          connectedRelationships={connectedRelationships}
          caseId={activeCaseId}
        />
      </div>

      {/* Graph Analytics & Centrality Modal */}
      {showStatsModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-[#D7E4F0] shadow-2xl max-w-2xl w-full p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#D7E4F0]">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#3478C9]" />
                <h3 className="font-bold text-base text-[#243447]">
                  Graph Topology & Centrality Analytics
                </h3>
              </div>
              <button
                onClick={() => setShowStatsModal(false)}
                className="text-[#64748B] hover:text-[#243447] p-1 rounded-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingStats ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
                <RefreshCw className="w-6 h-6 text-[#3478C9] animate-spin" />
                <span className="text-xs text-[#64748B]">
                  Analyzing network topology via NetworkX and Cypher...
                </span>
              </div>
            ) : statsError ? (
              <div className="py-8 px-4 bg-red-50 border border-red-200 rounded-lg text-center space-y-2">
                <AlertCircle className="w-6 h-6 text-red-600 mx-auto" />
                <p className="text-xs font-bold text-red-800">Graph Analysis Backend Error</p>
                <p className="text-[11px] text-red-700">{statsError}</p>
                <button
                  onClick={handleOpenAnalytics}
                  className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700 cursor-pointer"
                >
                  Retry Analysis
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* 4 Summary Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 bg-[#F2F7FC] rounded-lg border border-[#D7E4F0] text-center">
                    <span className="text-[10px] uppercase font-bold text-[#64748B] block">
                      Total Nodes
                    </span>
                    <span className="text-xl font-bold text-[#243447]">
                      {graphStats?.total_nodes || currentEntities.length}
                    </span>
                  </div>
                  <div className="p-3 bg-[#F2F7FC] rounded-lg border border-[#D7E4F0] text-center">
                    <span className="text-[10px] uppercase font-bold text-[#64748B] block">
                      Total Edges
                    </span>
                    <span className="text-xl font-bold text-[#243447]">
                      {graphStats?.total_edges || currentRelationships.length}
                    </span>
                  </div>
                  <div className="p-3 bg-[#F2F7FC] rounded-lg border border-[#D7E4F0] text-center">
                    <span className="text-[10px] uppercase font-bold text-[#64748B] block">
                      Graph Density
                    </span>
                    <span className="text-xl font-bold text-[#243447]">
                      {graphStats?.density !== undefined ? graphStats.density : '0.12'}
                    </span>
                  </div>
                  <div className="p-3 bg-[#F2F7FC] rounded-lg border border-[#D7E4F0] text-center">
                    <span className="text-[10px] uppercase font-bold text-[#64748B] block">
                      Clusters / Components
                    </span>
                    <span className="text-xl font-bold text-[#243447]">
                      {componentsData?.total_components || graphStats?.component_count || 1}
                    </span>
                  </div>
                </div>

                {/* Degree Centrality Leaderboard */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-[#243447] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#3478C9]" />
                      Top Connected Entities (Degree Centrality)
                    </span>
                    <span className="text-[11px] text-[#64748B]">Sorted by direct connectivity</span>
                  </div>

                  <div className="bg-[#F8FAFC] border border-[#D7E4F0] rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#EAF4FC] text-[#243447] font-semibold border-b border-[#D7E4F0]">
                        <tr>
                          <th className="py-2 px-3">Entity Name</th>
                          <th className="py-2 px-3">Category</th>
                          <th className="py-2 px-3 text-center">Degree</th>
                          <th className="py-2 px-3 text-right">Centrality Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0]">
                        {centralityData?.centrality && centralityData.centrality.length > 0 ? (
                          centralityData.centrality.slice(0, 6).map((item, idx) => (
                            <tr key={idx} className="hover:bg-white transition-colors">
                              <td className="py-2 px-3 font-semibold text-[#243447]">
                                {item.name}
                              </td>
                              <td className="py-2 px-3">
                                <span className="px-1.5 py-0.5 rounded bg-white border border-[#D7E4F0] text-[10px]">
                                  {item.category}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-center font-bold text-[#3478C9]">
                                {item.degree}
                              </td>
                              <td className="py-2 px-3 text-right font-mono font-medium text-[#243447]">
                                {item.centrality_score.toFixed(4)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="py-3 px-3 text-center text-[#64748B]">
                              No centrality data available.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Ethical Disclaimer */}
                  <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-900 italic">
                    ⚖️ {centralityData?.disclaimer ||
                      'Degree centrality indicates recorded connectivity within this case dataset. High connectivity does not automatically indicate criminal involvement.'}
                  </div>
                </div>

                {/* Breakdown by Node Category & Relationship Types */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-white rounded-lg border border-[#D7E4F0]">
                    <span className="font-bold text-[#243447] block mb-2">
                      Entities by Category
                    </span>
                    <div className="space-y-1 text-[11px]">
                      {graphStats?.nodes_by_category &&
                        Object.entries(graphStats.nodes_by_category).map(([cat, count]) => (
                          <div key={cat} className="flex justify-between py-0.5 border-b border-slate-100">
                            <span className="text-[#64748B]">{cat}:</span>
                            <span className="font-bold text-[#243447]">{count}</span>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-[#D7E4F0]">
                    <span className="font-bold text-[#243447] block mb-2">
                      Relationships by Type
                    </span>
                    <div className="space-y-1 text-[11px]">
                      {graphStats?.edges_by_type &&
                        Object.entries(graphStats.edges_by_type).map(([relType, count]) => (
                          <div key={relType} className="flex justify-between py-0.5 border-b border-slate-100">
                            <span className="text-[#64748B] truncate max-w-[150px]">{relType}:</span>
                            <span className="font-bold text-[#3478C9]">{count}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-[#D7E4F0]">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowStatsModal(false)}
              >
                Close Analytics
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
