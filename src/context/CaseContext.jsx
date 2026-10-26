import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_CASES, INITIAL_EVIDENCE } from '../data/sampleData';
import { EVIDENCE_CATEGORIES, normalizeCategory, normalizeCrimeType } from '../constants/categories';

const CaseContext = createContext();

const STORAGE_KEYS = {
  CASES: 'ciperx_cases_v2',
  EVIDENCE: 'ciperx_evidence_v2',
  ACTIVE_CASE: 'ciperx_active_case_v2'
};

export const CaseProvider = ({ children }) => {
  // 1. Cases State
  const [cases, setCases] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CASES);
      if (stored) {
        const parsed = JSON.parse(stored);
        const existingIds = new Set(parsed.map((c) => c.id));
        const missing = INITIAL_CASES.filter((c) => !existingIds.has(c.id));
        return missing.length > 0 ? [...parsed, ...missing] : parsed;
      }
    } catch (e) {
      console.error('Error loading cases from localStorage', e);
    }
    return INITIAL_CASES;
  });

  // 2. Evidence State (includes entities and relationships)
  const [evidence, setEvidence] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.EVIDENCE);
      if (stored) {
        const parsed = JSON.parse(stored);
        const existingIds = new Set(parsed.map((e) => e.id));
        const missing = INITIAL_EVIDENCE.filter((e) => !existingIds.has(e.id));
        return missing.length > 0 ? [...parsed, ...missing] : parsed;
      }
    } catch (e) {
      console.error('Error loading evidence from localStorage', e);
    }
    return INITIAL_EVIDENCE;
  });

  // 3. Active Case ID
  const [activeCaseId, setActiveCaseId] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_CASE);
      if (stored) return stored;
    } catch (e) {
      console.error('Error loading active case from localStorage', e);
    }
    return INITIAL_CASES[0]?.id || '';
  });

  // 4. Current active navigation tab
  const [activeTab, setActiveTab] = useState('dashboard');

  // 5. Entity selected for highlighting/focus in Network Explorer or Finder
  const [focusEntityTarget, setFocusEntityTarget] = useState(null);

  // 6. Toast Notification
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'info') => {
    setNotification({ id: Date.now(), message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3800);
  };

  // Sync cases to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(cases));
    } catch (e) {
      console.error('Failed to save cases to localStorage', e);
    }
  }, [cases]);

  // Sync evidence to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EVIDENCE, JSON.stringify(evidence));
    } catch (e) {
      console.error('Failed to save evidence to localStorage', e);
    }
  }, [evidence]);

  // Sync activeCaseId to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_CASE, activeCaseId);
    } catch (e) {
      console.error('Failed to save activeCase to localStorage', e);
    }
  }, [activeCaseId]);

  // Active case object
  const activeCase = cases.find((c) => c.id === activeCaseId) || cases[0] || null;

  // Evidence for active case
  const activeCaseEvidence = evidence.filter((e) => e.caseId === activeCaseId);

  // Non-relationship entities for active case
  const activeCaseEntities = activeCaseEvidence.filter((e) => e.category !== 'Relationships');

  // Relationships for active case
  const activeCaseRelationships = activeCaseEvidence.filter((e) => e.category === 'Relationships');

  // Actions: Cases
  const addCase = (caseData) => {
    const today = new Date().toISOString().split('T')[0];
    const resolvedCrimeType = normalizeCrimeType(caseData.crimeType || caseData.category);
    const newCase = {
      ...caseData,
      id: caseData.id?.trim() || `CPX-${new Date().getFullYear()}-${String(cases.length + 1).padStart(3, '0')}`,
      crimeType: resolvedCrimeType,
      category: resolvedCrimeType,
      dateOpened: caseData.dateOpened || today,
      lastUpdated: today,
      status: caseData.status || 'Active',
      priority: caseData.priority || 'Medium'
    };

    setCases((prev) => [newCase, ...prev]);
    setActiveCaseId(newCase.id);
    setActiveTab('evidence');
    showNotification(`Case "${newCase.name}" (${newCase.id}) registered for ${resolvedCrimeType}. Opened Evidence Management.`, 'success');
    return newCase;
  };

  const updateCase = (caseId, updatedFields) => {
    const today = new Date().toISOString().split('T')[0];
    const resolvedCrimeType = updatedFields.crimeType || updatedFields.category
      ? normalizeCrimeType(updatedFields.crimeType || updatedFields.category)
      : undefined;

    setCases((prev) =>
      prev.map((c) =>
        c.id === caseId
          ? {
              ...c,
              ...updatedFields,
              ...(resolvedCrimeType ? { crimeType: resolvedCrimeType, category: resolvedCrimeType } : {}),
              lastUpdated: today
            }
          : c
      )
    );
    showNotification(`Case updated successfully.`, 'success');
  };

  const deleteCase = (caseId) => {
    const targetCase = cases.find((c) => c.id === caseId);
    setCases((prev) => prev.filter((c) => c.id !== caseId));
    // Also remove evidence associated with this case
    setEvidence((prev) => prev.filter((e) => e.caseId !== caseId));

    if (activeCaseId === caseId) {
      const remaining = cases.filter((c) => c.id !== caseId);
      setActiveCaseId(remaining.length > 0 ? remaining[0].id : '');
    }

    showNotification(`Case "${targetCase?.name || caseId}" deleted.`, 'info');
  };

  // Actions: Evidence & Relationships
  const addEvidence = (evidenceData) => {
    const today = new Date().toISOString().split('T')[0];
    const isRelationship = evidenceData.category === 'Relationships';
    
    // Auto-generate identifier prefix
    let generatedId = evidenceData.id?.trim();
    if (!generatedId) {
      const normCat = normalizeCategory(evidenceData.category);
      const meta = EVIDENCE_CATEGORIES.find((c) => c.id === normCat);
      const prefix = meta?.prefix || (isRelationship ? 'REL' : 'EVD');
      const count = evidence.filter((e) => normalizeCategory(e.category) === normCat).length + 1;
      generatedId = `${prefix}-${new Date().getFullYear()}-${String(count).padStart(3, '0')}`;
    }

    const newEvidence = {
      ...evidenceData,
      id: generatedId,
      caseId: evidenceData.caseId || activeCaseId,
      investigationStatus: evidenceData.investigationStatus || evidenceData.status || 'Collected',
      dateAdded: evidenceData.dateAdded || today,
      isEntity: !isRelationship
    };

    setEvidence((prev) => [newEvidence, ...prev]);
    updateCaseLastUpdated(newEvidence.caseId);

    showNotification(
      `${isRelationship ? 'Relationship' : 'Evidence item'} "${newEvidence.name || newEvidence.relationshipType}" saved.`,
      'success'
    );
    return newEvidence;
  };

  const updateEvidence = (evidenceId, updatedFields) => {
    setEvidence((prev) =>
      prev.map((e) => (e.id === evidenceId ? { ...e, ...updatedFields } : e))
    );
    const item = evidence.find((e) => e.id === evidenceId);
    if (item) updateCaseLastUpdated(item.caseId);
    showNotification('Evidence record updated successfully.', 'success');
  };

  const getDependentRelationships = (evidenceId) => {
    const target = evidence.find((e) => e.id === evidenceId);
    if (!target || target.category === 'Relationships') return [];
    return evidence.filter(
      (e) =>
        e.category === 'Relationships' &&
        (e.sourceEntityId === evidenceId ||
         e.targetEntityId === evidenceId ||
         e.sourceEntityName?.toLowerCase() === target.name?.toLowerCase() ||
         e.targetEntityName?.toLowerCase() === target.name?.toLowerCase())
    );
  };

  const deleteEvidence = (evidenceId) => {
    const target = evidence.find((e) => e.id === evidenceId);
    if (!target) return;

    // If it's an entity, also delete any relationships that depend on this entity
    if (target.category !== 'Relationships') {
      const removedRels = getDependentRelationships(evidenceId);

      setEvidence((prev) =>
        prev.filter(
          (e) =>
            e.id !== evidenceId &&
            !(
              e.category === 'Relationships' &&
              (e.sourceEntityId === evidenceId ||
               e.targetEntityId === evidenceId ||
               e.sourceEntityName?.toLowerCase() === target.name?.toLowerCase() ||
               e.targetEntityName?.toLowerCase() === target.name?.toLowerCase())
            )
        )
      );

      if (removedRels.length > 0) {
        showNotification(
          `Evidence "${target.name}" and ${removedRels.length} linked relationship(s) deleted.`,
          'info'
        );
      } else {
        showNotification(`Evidence "${target.name}" deleted.`, 'info');
      }
    } else {
      setEvidence((prev) => prev.filter((e) => e.id !== evidenceId));
      showNotification(`Relationship deleted.`, 'info');
    }

    updateCaseLastUpdated(target.caseId);
  };

  const updateCaseLastUpdated = (caseId) => {
    const today = new Date().toISOString().split('T')[0];
    setCases((prev) =>
      prev.map((c) => (c.id === caseId ? { ...c, lastUpdated: today } : c))
    );
  };

  // Reset to Sample Data
  const resetToSampleData = () => {
    setCases(INITIAL_CASES);
    setEvidence(INITIAL_EVIDENCE);
    setActiveCaseId(INITIAL_CASES[0]?.id || '');
    showNotification('Sample case demonstration data restored.', 'info');
  };

  // Clear workspace for testing empty states
  const clearAllData = () => {
    setCases([]);
    setEvidence([]);
    setActiveCaseId('');
    showNotification('Workspace cleared. All records removed.', 'info');
  };

  // Jump from table/finder to Network Explorer with target
  const navigateToNetworkWithEntity = (entityIdentifier) => {
    setFocusEntityTarget(entityIdentifier);
    setActiveTab('network');
  };

  return (
    <CaseContext.Provider
      value={{
        cases,
        evidence,
        activeCaseId,
        setActiveCaseId,
        activeCase,
        activeCaseEvidence,
        activeCaseEntities,
        activeCaseRelationships,
        activeTab,
        setActiveTab,
        addCase,
        updateCase,
        deleteCase,
        addEvidence,
        updateEvidence,
        deleteEvidence,
        getDependentRelationships,
        resetToSampleData,
        clearAllData,
        focusEntityTarget,
        setFocusEntityTarget,
        navigateToNetworkWithEntity,
        notification,
        showNotification
      }}
    >
      {children}
    </CaseContext.Provider>
  );
};

export const useCaseContext = () => {
  const context = useContext(CaseContext);
  if (!context) {
    throw new Error('useCaseContext must be used within a CaseProvider');
  }
  return context;
};
