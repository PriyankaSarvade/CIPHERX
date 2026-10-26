export const findConnections = (query, entities = [], relationships = []) => {
  if (!query || !query.trim()) {
    return {
      searchedEntity: null,
      directConnections: [],
      twoStepPaths: [],
      totalFound: 0
    };
  }

  const cleanQuery = query.trim().toLowerCase();

  // 1. Identify matching entity (or entities)
  const matchedEntities = entities.filter((e) => {
    return (
      e.name?.toLowerCase().includes(cleanQuery) ||
      e.id?.toLowerCase() === cleanQuery ||
      (e.associatedPerson && e.associatedPerson.toLowerCase().includes(cleanQuery)) ||
      (e.source && e.source.toLowerCase().includes(cleanQuery))
    );
  });

  if (matchedEntities.length === 0) {
    // Check if query matches relationship entity names directly
    const matchingRel = relationships.find(
      (r) =>
        r.sourceEntityName?.toLowerCase().includes(cleanQuery) ||
        r.targetEntityName?.toLowerCase().includes(cleanQuery)
    );
    if (!matchingRel) {
      return {
        searchedEntity: null,
        queryTerm: query,
        directConnections: [],
        twoStepPaths: [],
        totalFound: 0
      };
    }
  }

  // Choose the best match or first matched entity
  const targetEntity = matchedEntities[0] || {
    id: 'QUERY-ENTITY',
    name: query,
    category: 'Unknown'
  };

  const targetName = targetEntity.name?.toLowerCase();
  const targetId = targetEntity.id;

  // 2. Discover Direct (1-Step) Connections
  // An edge matches if source is target OR target is target
  const directRelationships = relationships.filter((rel) => {
    const isSource =
      rel.sourceEntityId === targetId ||
      rel.sourceEntityName?.toLowerCase() === targetName;
    const isTarget =
      rel.targetEntityId === targetId ||
      rel.targetEntityName?.toLowerCase() === targetName;
    return isSource || isTarget;
  });

  const directConnections = directRelationships.map((rel) => {
    const isOutgoing =
      rel.sourceEntityId === targetId ||
      rel.sourceEntityName?.toLowerCase() === targetName;

    const connectedEntityName = isOutgoing
      ? rel.targetEntityName
      : rel.sourceEntityName;

    const connectedEntityId = isOutgoing
      ? rel.targetEntityId
      : rel.sourceEntityId;

    const connectedEntityData = entities.find(
      (e) =>
        e.id === connectedEntityId ||
        e.name?.toLowerCase() === connectedEntityName?.toLowerCase()
    );

    return {
      relationshipId: rel.id,
      direction: isOutgoing ? 'outgoing' : 'incoming',
      directionSymbol: isOutgoing ? '➔' : '⬅',
      relationshipType: rel.relationshipType,
      supportingEvidence: rel.supportingEvidence || 'Case evidentiary record',
      source: rel.source || 'Documented case entry',
      notes: rel.notes,
      fromEntity: isOutgoing ? targetEntity.name : connectedEntityName,
      toEntity: isOutgoing ? connectedEntityName : targetEntity.name,
      connectedEntity: {
        id: connectedEntityId,
        name: connectedEntityName,
        category: connectedEntityData?.category || 'Entity',
        details: connectedEntityData
      }
    };
  });

  // 3. Discover 2-Step Indirect Connections (A -> B -> C)
  // For each direct connection (B), find edges connecting B to another entity C (where C != A)
  const twoStepPaths = [];
  const visitedTwoStepKeys = new Set();

  directConnections.forEach((firstHop) => {
    const middleName = firstHop.connectedEntity.name?.toLowerCase();
    const middleId = firstHop.connectedEntity.id;

    // Find relationships involving the middle node
    const secondHopRels = relationships.filter((rel) => {
      // Must not be the same relationship
      if (rel.id === firstHop.relationshipId) return false;

      const involvesMiddle =
        rel.sourceEntityId === middleId ||
        rel.targetEntityId === middleId ||
        rel.sourceEntityName?.toLowerCase() === middleName ||
        rel.targetEntityName?.toLowerCase() === middleName;

      if (!involvesMiddle) return false;

      // Must not connect back to the original target entity A
      const touchesTarget =
        rel.sourceEntityId === targetId ||
        rel.targetEntityId === targetId ||
        rel.sourceEntityName?.toLowerCase() === targetName ||
        rel.targetEntityName?.toLowerCase() === targetName;

      return !touchesTarget;
    });

    secondHopRels.forEach((secondRel) => {
      const isSecondOutgoing =
        secondRel.sourceEntityId === middleId ||
        secondRel.sourceEntityName?.toLowerCase() === middleName;

      const endEntityName = isSecondOutgoing
        ? secondRel.targetEntityName
        : secondRel.sourceEntityName;

      const endEntityId = isSecondOutgoing
        ? secondRel.targetEntityId
        : secondRel.sourceEntityId;

      const endEntityData = entities.find(
        (e) =>
          e.id === endEntityId ||
          e.name?.toLowerCase() === endEntityName?.toLowerCase()
      );

      const pathKey = `${targetEntity.name}->${firstHop.relationshipType}->${firstHop.connectedEntity.name}->${secondRel.relationshipType}->${endEntityName}`;

      if (!visitedTwoStepKeys.has(pathKey)) {
        visitedTwoStepKeys.add(pathKey);
        twoStepPaths.push({
          id: `PATH-${firstHop.relationshipId}-${secondRel.id}`,
          step1: {
            from: firstHop.fromEntity,
            to: firstHop.toEntity,
            type: firstHop.relationshipType,
            evidence: firstHop.supportingEvidence,
            source: firstHop.source,
            direction: firstHop.direction
          },
          step2: {
            from: isSecondOutgoing ? firstHop.connectedEntity.name : endEntityName,
            to: isSecondOutgoing ? endEntityName : firstHop.connectedEntity.name,
            type: secondRel.relationshipType,
            evidence: secondRel.supportingEvidence || 'Recorded link in case files',
            source: secondRel.source || 'Case file',
            direction: isSecondOutgoing ? 'outgoing' : 'incoming'
          },
          intermediateEntity: firstHop.connectedEntity,
          terminalEntity: {
            id: endEntityId,
            name: endEntityName,
            category: endEntityData?.category || 'Entity',
            details: endEntityData
          }
        });
      }
    });
  });

  return {
    searchedEntity: targetEntity,
    queryTerm: query,
    directConnections,
    twoStepPaths,
    totalFound: directConnections.length + twoStepPaths.length
  };
};
