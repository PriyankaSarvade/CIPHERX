import { EVIDENCE_CATEGORIES, normalizeCategory } from '../constants/categories';

export const processCaseQuery = (query, currentCase, entities = [], relationships = []) => {
  if (!query || !query.trim()) {
    return {
      text: 'Please enter an evidentiary question regarding the active case.',
      data: null
    };
  }

  if (!currentCase) {
    return {
      text: 'No active case is currently selected. Please select or create a case to query records.',
      data: null
    };
  }

  const q = query.trim().toLowerCase();

  // 1. Guilt / Liability questions
  if (
    q.includes('guilty') ||
    q.includes('is he the criminal') ||
    q.includes('arrest') ||
    q.includes('convict') ||
    q.includes('who is the culprit')
  ) {
    return {
      text: `**Evidentiary Notice:**\nCIPERX is an investigation support and relationship-mapping prototype. The application organizes recorded case evidence and demonstrates linkage patterns.\n\nDetermination of criminal liability, culpability, and guilt is strictly a judicial process conducted by courts of law in accordance with evidentiary standards and constitutional procedure. CIPERX does not determine guilt or issue legal conclusions.`,
      disclaimer: true
    };
  }

  // 2. Case Summary / Overview
  if (
    q.includes('summary') ||
    q.includes('overview') ||
    q.includes('about this case') ||
    q.includes('case status') ||
    q.includes('what is this case')
  ) {
    const categoriesCount = {};
    entities.forEach((e) => {
      const norm = normalizeCategory(e.category);
      const meta = EVIDENCE_CATEGORIES.find((c) => c.id === norm);
      const label = meta?.shortLabel || norm;
      categoriesCount[label] = (categoriesCount[label] || 0) + 1;
    });

    const categoryBreakdown = Object.entries(categoriesCount)
      .map(([cat, count]) => `• **${cat}**: ${count}`)
      .join('\n');

    return {
      text: `### Case Overview: ${currentCase.name} (${currentCase.id})\n\n` +
        `• **Category:** ${currentCase.category || 'N/A'}\n` +
        `• **Status:** ${currentCase.status}\n` +
        `• **Lead Officer:** ${currentCase.officer || 'Unassigned'}\n` +
        `• **Date Opened:** ${currentCase.dateOpened}\n` +
        `• **Last Updated:** ${currentCase.lastUpdated || currentCase.dateOpened}\n\n` +
        `**Description:**\n${currentCase.description}\n\n` +
        `**Evidentiary Snapshot:**\n` +
        `• Total Recorded Entities: **${entities.length}**\n` +
        `• Total Documented Relationships: **${relationships.length}**\n\n` +
        `**Breakdown by Category:**\n${categoryBreakdown || 'No entities recorded yet.'}`
    };
  }

  // 3. Count / How many evidence items
  if (
    q.includes('how many') ||
    q.includes('total evidence') ||
    q.includes('count') ||
    q.includes('statistics')
  ) {
    const categoriesCount = {};
    entities.forEach((e) => {
      const norm = normalizeCategory(e.category);
      const meta = EVIDENCE_CATEGORIES.find((c) => c.id === norm);
      const label = meta?.shortLabel || norm;
      categoriesCount[label] = (categoriesCount[label] || 0) + 1;
    });

    const breakdownList = Object.entries(categoriesCount)
      .map(([cat, count]) => `• ${cat}: **${count}**`)
      .join('\n');

    return {
      text: `**Evidentiary Metrics for Case ${currentCase.id}:**\n\n` +
        `• **Total Entities / Pieces of Evidence:** ${entities.length}\n` +
        `• **Total Documented Relationships:** ${relationships.length}\n\n` +
        `**Item Count by Evidence Type:**\n${breakdownList || 'No entities logged.'}`
    };
  }

  // 4. Financial Information queries
  if (
    q.includes('financial') ||
    q.includes('money') ||
    q.includes('transaction') ||
    q.includes('amount') ||
    q.includes('wire') ||
    q.includes('bank')
  ) {
    const financials = entities.filter((e) => e.category === 'Financial');
    if (financials.length === 0) {
      return {
        text: `No financial records or transactions are documented in case **${currentCase.id}**.`
      };
    }

    const list = financials
      .map(
        (f) =>
          `• **${f.name}**\n` +
          `  - Amount: ${f.amount || 'Not specified'}\n` +
          `  - Related Parties: ${f.relatedEntities || 'N/A'}\n` +
          `  - Source: ${f.source}\n` +
          `  - Notes: ${f.notes}`
      )
      .join('\n\n');

    return {
      text: `### Documented Financial Records (${financials.length}):\n\n${list}`
    };
  }

  // 5. Phone queries
  if (
    q.includes('phone') ||
    q.includes('call') ||
    q.includes('number') ||
    q.includes('sim') ||
    q.includes('cdr')
  ) {
    const phones = entities.filter((e) => e.category === 'Phone');
    if (phones.length === 0) {
      return {
        text: `No cellular lines or phone records are logged in case **${currentCase.id}**.`
      };
    }

    const list = phones
      .map(
        (p) =>
          `• **${p.name}**\n` +
          `  - Associated Person: ${p.associatedPerson || 'Unassigned'}\n` +
          `  - Carrier/Type: ${p.carrier || 'Not specified'}\n` +
          `  - Source: ${p.source}\n` +
          `  - Notes: ${p.notes}`
      )
      .join('\n\n');

    return {
      text: `### Documented Phone Lines (${phones.length}):\n\n${list}`
    };
  }

  // 6. Vehicle queries
  if (
    q.includes('vehicle') ||
    q.includes('car') ||
    q.includes('van') ||
    q.includes('truck') ||
    q.includes('registration') ||
    q.includes('plate')
  ) {
    const vehicles = entities.filter((e) => e.category === 'Vehicle');
    if (vehicles.length === 0) {
      return {
        text: `No vehicles are logged in case **${currentCase.id}**.`
      };
    }

    const list = vehicles
      .map(
        (v) =>
          `• **${v.name}**\n` +
          `  - Type / Model: ${v.vehicleType || 'Vehicle'}\n` +
          `  - Operator/Owner: ${v.associatedPerson || 'Unassigned'}\n` +
          `  - Source: ${v.source}\n` +
          `  - Notes: ${v.notes}`
      )
      .join('\n\n');

    return {
      text: `### Documented Vehicles (${vehicles.length}):\n\n${list}`
    };
  }

  // 7. Relationships query
  if (
    q.includes('what relationships') ||
    q.includes('all relationships') ||
    q.includes('recorded relationships') ||
    q.includes('list relationships')
  ) {
    if (relationships.length === 0) {
      return {
        text: `No relationships have been recorded yet for case **${currentCase.id}**.`
      };
    }

    const list = relationships
      .map(
        (r, idx) =>
          `${idx + 1}. **${r.sourceEntityName}** ➔ *[${r.relationshipType}]* ➔ **${r.targetEntityName}**\n` +
          `   - Evidence/Source: ${r.supportingEvidence || r.source}`
      )
      .join('\n');

    return {
      text: `### Documented Case Relationships (${relationships.length}):\n\n${list}`
    };
  }

  // 8. Entity-specific queries (Search for a person or entity mentioned in query)
  const matchedEntity = entities.find((e) =>
    q.includes(e.name.toLowerCase()) || (e.associatedPerson && q.includes(e.associatedPerson.toLowerCase()))
  );

  if (matchedEntity) {
    // Find all relationships involving this entity
    const eName = matchedEntity.name.toLowerCase();
    const eId = matchedEntity.id;

    const directRels = relationships.filter(
      (r) =>
        r.sourceEntityId === eId ||
        r.targetEntityId === eId ||
        r.sourceEntityName?.toLowerCase() === eName ||
        r.targetEntityName?.toLowerCase() === eName
    );

    const relList = directRels.length > 0
      ? directRels
          .map((r) => {
            const isOutgoing =
              r.sourceEntityId === eId ||
              r.sourceEntityName?.toLowerCase() === eName;
            return `• ${isOutgoing ? `Links to **${r.targetEntityName}**` : `Linked from **${r.sourceEntityName}**`} via *[${r.relationshipType}]*\n  *(Supporting Evidence: ${r.supportingEvidence || r.source})*`;
          })
          .join('\n')
      : 'No direct relationships currently documented for this entity.';

    return {
      text: `### Entity Record: ${matchedEntity.name} (${matchedEntity.category})\n\n` +
        `• **ID:** ${matchedEntity.id}\n` +
        `• **Category:** ${matchedEntity.category}\n` +
        (matchedEntity.physicalDescription ? `• **Description:** ${matchedEntity.physicalDescription}\n` : '') +
        (matchedEntity.associatedPerson ? `• **Associated Person:** ${matchedEntity.associatedPerson}\n` : '') +
        (matchedEntity.amount ? `• **Amount:** ${matchedEntity.amount}\n` : '') +
        `• **Source:** ${matchedEntity.source}\n` +
        `• **Investigator Notes:** ${matchedEntity.notes || 'None logged.'}\n\n` +
        `**Documented Relationships (${directRels.length}):**\n${relList}`
    };
  }

  // 9. Person / Persons list
  if (q.includes('person') || q.includes('people') || q.includes('who is involved') || q.includes('suspect')) {
    const persons = entities.filter((e) => e.category === 'Person');
    if (persons.length === 0) {
      return {
        text: `No persons have been logged in case **${currentCase.id}**.`
      };
    }

    const list = persons
      .map(
        (p) =>
          `• **${p.name}**\n` +
          `  - Physical/Identifier: ${p.physicalDescription || 'Not recorded'}\n` +
          `  - Source: ${p.source}\n` +
          `  - Notes: ${p.notes}`
      )
      .join('\n\n');

    return {
      text: `### Documented Persons of Interest (${persons.length}):\n\n${list}`
    };
  }

  // 10. Fallback - honest response indicating unavailable or unrecorded data
  const availableEntityNames = entities.map((e) => e.name).join(', ');

  return {
    text: `### Information Not Found in Local Case Files\n\n` +
      `The query **"${query}"** does not match verified records in case **${currentCase.id}** (${currentCase.name}).\n\n` +
      `As a transparent prototype query assistant, CIPERX only references recorded entries in your browser workspace and does not fabricate information or query external intelligence databases.\n\n` +
      `**Currently Documented Entities in this Case:**\n${availableEntityNames || 'None recorded.'}\n\n` +
      `*Tip: Try asking about a specific entity from above, "case summary", "how many evidence items", or "what relationships have been recorded".*`
  };
};
