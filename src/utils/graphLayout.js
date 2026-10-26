import { EVIDENCE_CATEGORIES, normalizeCategory } from '../constants/categories';

export const buildGraphData = (entities, relationships, focusedEntityName = null) => {
  if (!entities || entities.length === 0) {
    return { nodes: [], edges: [] };
  }

  // Create quick lookup for category info
  const categoryMap = {};
  EVIDENCE_CATEGORIES.forEach((cat) => {
    categoryMap[cat.id] = cat;
  });

  // Calculate layout coordinates
  // Arrange nodes in concentric elliptical orbits or grid
  const nodeCount = entities.length;
  const centerX = 450;
  const centerY = 350;
  const radiusX = Math.max(280, nodeCount * 28);
  const radiusY = Math.max(220, nodeCount * 22);

  const nodes = entities.map((entity, index) => {
    const angle = (index / nodeCount) * 2 * Math.PI - Math.PI / 2;
    const norm = normalizeCategory(entity.category);
    const cat = categoryMap[norm] || categoryMap[entity.category] || categoryMap['Person'];
    
    // Check if this node is highlighted/focused
    const isFocused =
      focusedEntityName &&
      (entity.name?.toLowerCase().includes(focusedEntityName.toLowerCase()) ||
        entity.id?.toLowerCase() === focusedEntityName.toLowerCase());

    return {
      id: entity.id,
      type: 'customEntity',
      position: {
        x: Math.round(centerX + radiusX * Math.cos(angle)),
        y: Math.round(centerY + radiusY * Math.sin(angle))
      },
      data: {
        ...entity,
        categoryInfo: cat,
        isFocused: !!isFocused
      }
    };
  });

  // Map relationships to edges
  const edges = relationships.map((rel) => {
    // Determine source and target IDs
    // Find matching entity by ID or name
    let sourceId = rel.sourceEntityId;
    let targetId = rel.targetEntityId;

    if (!sourceId || !entities.some((e) => e.id === sourceId)) {
      const match = entities.find(
        (e) => e.name?.toLowerCase() === rel.sourceEntityName?.toLowerCase()
      );
      if (match) sourceId = match.id;
    }

    if (!targetId || !entities.some((e) => e.id === targetId)) {
      const match = entities.find(
        (e) => e.name?.toLowerCase() === rel.targetEntityName?.toLowerCase()
      );
      if (match) targetId = match.id;
    }

    const isRelFocused =
      focusedEntityName &&
      (rel.sourceEntityName?.toLowerCase().includes(focusedEntityName.toLowerCase()) ||
        rel.targetEntityName?.toLowerCase().includes(focusedEntityName.toLowerCase()));

    return {
      id: rel.id,
      source: sourceId || rel.id + '-src',
      target: targetId || rel.id + '-tgt',
      type: 'smoothstep',
      animated: !!isRelFocused,
      label: rel.relationshipType,
      data: {
        ...rel
      },
      style: {
        stroke: isRelFocused ? '#2563EB' : '#94A3B8',
        strokeWidth: isRelFocused ? 2.5 : 1.8,
      },
      labelStyle: {
        fill: '#1E293B',
        fontWeight: 600,
        fontSize: 11
      },
      labelBgStyle: {
        fill: '#FFFFFF',
        fillOpacity: 0.95,
        rx: 4,
        ry: 4,
        stroke: '#CBD5E1',
        strokeWidth: 1
      },
      labelBgPadding: [6, 4]
    };
  }).filter((edge) => {
    // Ensure both source and target nodes exist in the graph
    return entities.some((e) => e.id === edge.source) && entities.some((e) => e.id === edge.target);
  });

  return { nodes, edges };
};
