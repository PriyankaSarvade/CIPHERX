import React, { useState, useEffect, useRef } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Network,
  Compass,
  Paperclip,
  GitFork,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  X,
  ChevronDown,
  Layers,
  ArrowUpDown,
  AlertCircle,
  Sparkles,
  FolderKanban,
  Info
} from 'lucide-react';
import { useCaseContext } from '../context/CaseContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EvidenceDetailModal } from '../components/forms/EvidenceDetailModal';
import { FormLegend } from '../components/forms/FieldLabel';
import {
  EVIDENCE_CATEGORIES,
  VERIFICATION_STATUSES,
  EVIDENCE_TRACKING_STATUSES,
  normalizeCategory,
  normalizeCrimeType,
  getCategoriesForCrimeType,
  CRIME_TYPE_CONFIG
} from '../constants/categories';
import { generateUniqueId } from '../utils/helpers';

// Category Form Components
import { PersonForm } from '../components/forms/categories/PersonForm';
import { PhoneForm } from '../components/forms/categories/PhoneForm';
import { LocationForm } from '../components/forms/categories/LocationForm';
import { FinancialForm } from '../components/forms/categories/FinancialForm';
import { DocumentDigitalForm } from '../components/forms/categories/DocumentDigitalForm';
import { VehicleForm } from '../components/forms/categories/VehicleForm';
import { OrganizationForm } from '../components/forms/categories/OrganizationForm';
import { RelationshipForm } from '../components/forms/categories/RelationshipForm';

export const EvidencePage = () => {
  const {
    cases,
    activeCaseId,
    setActiveCaseId,
    activeCase,
    activeCaseEvidence,
    activeCaseEntities,
    evidence,
    addEvidence,
    updateEvidence,
    deleteEvidence,
    getDependentRelationships,
    navigateToNetworkWithEntity,
    setActiveTab,
    setFocusEntityTarget
  } = useCaseContext();

  const formTopRef = useRef(null);

  // Active Crime Type & Relevant Categories Tailored to Case
  const activeCaseCrimeType = normalizeCrimeType(activeCase?.crimeType || activeCase?.category);
  const relevantCategories = getCategoriesForCrimeType(activeCaseCrimeType);
  const crimeConfig = CRIME_TYPE_CONFIG[activeCaseCrimeType] || CRIME_TYPE_CONFIG['Other/Unclassified'];
  const [showAllCategories, setShowAllCategories] = useState(false);
  const displayedCategories = showAllCategories ? EVIDENCE_CATEGORIES : relevantCategories;

  // Active category tab for the form editor (Person, Phone, Location, etc.)
  const [activeCategoryTab, setActiveCategoryTab] = useState('Person');
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(true);
  const [successMessage, setSuccessMessage] = useState(null);

  // Filter & Search states for the table (strictly isolated to active case)
  const [tableCategoryFilter, setTableCategoryFilter] = useState('All');
  const [tableInvestigationStatusFilter, setTableInvestigationStatusFilter] = useState('All');
  const [tableStatusFilter, setTableStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');

  // Modal inspection & deletion states
  const [viewingItem, setViewingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  // Ensure active category tab is within relevant categories when switching cases
  useEffect(() => {
    const relevantIds = relevantCategories.map((c) => c.id);
    if (!relevantIds.includes(activeCategoryTab) && !showAllCategories) {
      setActiveCategoryTab(relevantIds[0] || 'Person');
    }
  }, [activeCaseId, activeCaseCrimeType, showAllCategories]);

  // Initialize a blank form for the selected category
  const initBlankForm = (category, currentCaseId = activeCaseId) => {
    const norm = normalizeCategory(category);
    const meta = EVIDENCE_CATEGORIES.find((c) => c.id === norm) || EVIDENCE_CATEGORIES[0];
    const count = evidence.filter((e) => normalizeCategory(e.category) === norm).length;
    const generatedId = generateUniqueId(meta.prefix, count);

    const base = {
      id: generatedId,
      category: norm,
      caseId: currentCaseId,
      name: '',
      source: '',
      notes: '',
      verificationStatus: 'Unverified',
      investigationStatus: 'Collected',
      dateAdded: new Date().toISOString().split('T')[0],
      phoneNumbers: [],
      emailAddresses: [],
      knownAssociates: [],
      knownLocations: [],
      relatedPersons: [],
      relatedPhoneNumbers: [],
      relatedLocations: [],
      relatedFinancialRecords: [],
      relatedFinancialAccounts: [],
      associatedIndividuals: [],
      relatedTransactionIds: [],
      chainOfCustody: [],
      supportingEvidenceList: []
    };

    if (norm === 'Person') {
      base.roleInCase = 'Other Person of Interest';
    } else if (norm === 'Phone') {
      base.communicationType = 'Call';
      base.direction = 'Incoming';
    } else if (norm === 'Location') {
      base.locationType = 'Incident Location';
    } else if (norm === 'Financial') {
      base.currency = 'INR';
      base.transactionMethod = 'Bank Transfer';
    } else if (norm === 'DocumentDigital') {
      base.documentType = 'PDF';
      base.reviewStatus = 'Unreviewed';
      base.collectionDate = new Date().toISOString().split('T')[0];
    } else if (norm === 'Vehicle') {
      base.vehicleType = 'Two-Wheeler';
    } else if (norm === 'Organization') {
      base.organizationType = 'Company';
    } else if (norm === 'Relationships') {
      base.relationshipType = 'Communicated With';
      base.reviewStatus = 'Confirmed by Investigator';
    }

    return base;
  };

  // Re-initialize blank form on category change (when not in edit mode)
  useEffect(() => {
    if (!isEditing) {
      setFormData(initBlankForm(activeCategoryTab, activeCaseId));
      setErrors({});
    }
  }, [activeCategoryTab, activeCaseId, isEditing]);

  const handleCategoryTabClick = (categoryId) => {
    const norm = normalizeCategory(categoryId);
    setActiveCategoryTab(norm);
    setIsEditing(false);
    setIsFormVisible(true);
    setFormData(initBlankForm(norm, activeCaseId));
    setErrors({});
  };

  const handleResetForm = () => {
    if (isEditing) {
      // Re-initialize with original editing data or blank
      setIsEditing(false);
    }
    setFormData(initBlankForm(activeCategoryTab, activeCaseId));
    setErrors({});
  };

  const handleCancelForm = () => {
    setIsEditing(false);
    setFormData(initBlankForm(activeCategoryTab, activeCaseId));
    setErrors({});
  };

  // Validate form before saving - supports progressive investigation and checks compulsory fields
  const validateForm = () => {
    const errs = {};
    const norm = normalizeCategory(activeCategoryTab);
    const isProgressive =
      formData.investigationStatus === 'Pending' ||
      formData.investigationStatus === 'Unavailable' ||
      formData.investigationStatus === 'Not Applicable';

    // Associated case is compulsory for all records
    if (!formData.caseId) {
      errs.caseId = 'Associated case is compulsory. Please select a case file.';
    }

    if (norm === 'Person') {
      if (!formData.name?.trim()) {
        errs.name = 'Full name is compulsory. Please enter the person\'s legal name.';
      }
      if (formData.enablePhoneInvestigation && !isProgressive) {
        if (!formData.phoneNumber?.trim()) {
          errs.phoneNumber = 'Enter a primary phone number to enable phone-based investigation.';
        }
      }
      if (!isProgressive) {
        if (!formData.roleInCase?.trim()) {
          errs.roleInCase = 'Role in case is compulsory. Please select a role.';
        }
        if (!formData.source?.trim()) {
          errs.source = 'Information source is compulsory. Please specify how this person was documented.';
        }
        if (!formData.verificationStatus?.trim()) {
          errs.verificationStatus = 'Verification status is compulsory.';
        }
      }
    } else if (norm === 'Phone') {
      if (!formData.phoneNumber?.trim() && !formData.name?.trim() && !formData.phoneRecordId?.trim()) {
        errs.phoneNumber = 'Phone number or identifier is compulsory for a phone record.';
      }
      if (!isProgressive) {
        if (!formData.communicationType?.trim()) {
          errs.communicationType = 'Communication type is compulsory.';
        }
        if (!formData.communicationDate?.trim()) {
          errs.communicationDate = 'Communication date is compulsory.';
        }
        if (!formData.source?.trim()) {
          errs.source = 'Source of record is compulsory.';
        }
      }
    } else if (norm === 'Location') {
      if (!formData.name?.trim()) {
        errs.name = 'Location name is compulsory. Please enter a premise or site name.';
      }
      if (!isProgressive) {
        if (!formData.locationType?.trim()) {
          errs.locationType = 'Location type is compulsory.';
        }
        if (!formData.addressUnavailable && (!formData.address || !formData.address.trim())) {
          errs.address = 'Address is compulsory. Check "Address unavailable" if unknown.';
        }
        if (!formData.source?.trim()) {
          errs.source = 'Information source is compulsory.';
        }
      }
    } else if (norm === 'Financial') {
      if (!formData.transactionId?.trim() && !formData.id?.trim() && !formData.name?.trim()) {
        errs.transactionId = 'Transaction ID is compulsory.';
      }
      if (!isProgressive) {
        if (formData.transactionAmount === undefined || formData.transactionAmount === '' || Number(formData.transactionAmount) <= 0) {
          errs.transactionAmount = 'Valid numerical transaction amount is compulsory.';
        }
        if (!formData.currency?.trim()) {
          errs.currency = 'Currency code is compulsory.';
        }
        if (!formData.source?.trim()) {
          errs.source = 'Source of financial record is compulsory.';
        }
      }
    } else if (norm === 'DocumentDigital') {
      if (!formData.name?.trim()) {
        errs.name = 'Evidence title is compulsory. Please enter a descriptive title.';
      }
      if (!formData.evidenceType?.trim() && !formData.documentType?.trim()) {
        errs.evidenceType = 'Evidence type is compulsory.';
      }
      if (!isProgressive) {
        if (!formData.collectedBy?.trim()) {
          errs.collectedBy = 'Collector officer / authorized specialist is compulsory.';
        }
        if (!formData.collectionDate?.trim()) {
          errs.collectionDate = 'Collection date is compulsory.';
        }
        if (!formData.source?.trim()) {
          errs.source = 'Collection source or seizing authority is compulsory.';
        }
      }
    } else if (norm === 'Vehicle') {
      if (!formData.registrationNumber?.trim() && !formData.otherIdentifier?.trim() && !formData.name?.trim()) {
        errs.registrationNumber = 'At least one valid vehicle identifier (Registration Number or Other Identifier) is required.';
      }
      if (!isProgressive) {
        if (!formData.source?.trim()) {
          errs.source = 'Information source is compulsory.';
        }
      }
    } else if (norm === 'Organization') {
      if (!formData.name?.trim()) {
        errs.name = 'Organization name is compulsory. Please enter the corporate or trade name.';
      }
      if (!isProgressive) {
        if (!formData.organizationType?.trim()) {
          errs.organizationType = 'Organization type is compulsory.';
        }
        if (!formData.source?.trim()) {
          errs.source = 'Information source is compulsory.';
        }
      }
    } else if (norm === 'Relationships') {
      if (!formData.sourceEntityName?.trim()) {
        errs.sourceEntityName = 'First entity (origin) is compulsory.';
      }
      if (!formData.relationshipType?.trim()) {
        errs.relationshipType = 'Relationship type is compulsory.';
      }
      if (!formData.targetEntityName?.trim()) {
        errs.targetEntityName = 'Second entity (target) is compulsory.';
      } else if (formData.sourceEntityName === formData.targetEntityName) {
        errs.targetEntityName = 'Second entity cannot be the same as First Entity (prevents self-loops).';
      }
      if (!isProgressive) {
        if (!formData.supportingEvidence?.trim() && (!formData.supportingEvidenceList || formData.supportingEvidenceList.length === 0)) {
          errs.supportingEvidence = 'Supporting evidence reference is compulsory.';
        }
        if (!formData.source?.trim()) {
          errs.source = 'Relationship source reference is compulsory.';
        }
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveForm = (e) => {
    e?.preventDefault();
    if (!validateForm()) return;

    const norm = normalizeCategory(activeCategoryTab);
    const payload = {
      ...formData,
      category: norm,
      caseId: formData.caseId || activeCaseId,
      investigationStatus: formData.investigationStatus || 'Collected'
    };

    // Ensure display name is consistent for other modules
    if (norm === 'Phone' && !payload.name) {
      payload.name = payload.phoneNumber;
    }
    if (norm === 'Vehicle' && !payload.name) {
      payload.name = payload.registrationNumber || payload.otherIdentifier;
    }
    if (norm === 'Financial' && !payload.name) {
      payload.name = payload.transactionId;
    }
    if (norm === 'Relationships') {
      payload.name = `${payload.sourceEntityName} ➔ ${payload.relationshipType} ➔ ${payload.targetEntityName}`;
    }

    if (isEditing) {
      updateEvidence(payload.id, payload);
      setIsEditing(false);
      setSuccessMessage(`Record ${payload.id} successfully updated.`);
    } else {
      addEvidence(payload);
      setSuccessMessage(`New ${activeCategoryMeta.shortLabel || 'Evidence'} record ${payload.id} successfully created.`);
    }

    // Reset with new unique ID for category
    setFormData(initBlankForm(norm, activeCaseId));
    setErrors({});

    // Auto clear success message after 5 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 5000);
  };

  const handleEditItem = (item) => {
    const norm = normalizeCategory(item.category);
    setActiveCategoryTab(norm);
    setIsEditing(true);
    setIsFormVisible(true);
    setFormData({
      ...item,
      category: norm,
      investigationStatus: item.investigationStatus || 'Collected'
    });
    setErrors({});

    // Smooth scroll to form
    formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleDeletePrompt = (item) => {
    setDeletingItem(item);
  };

  const handleDeleteConfirm = () => {
    if (deletingItem) {
      deleteEvidence(deletingItem.id);
      setDeletingItem(null);
    }
  };

  const handleJumpToFinder = (entityName) => {
    setFocusEntityTarget(entityName);
    setActiveTab('finder');
  };

  // Evidence strictly isolated to the active case - records from different cases never mix
  const caseEvidence = evidence.filter((item) => (activeCaseId ? item.caseId === activeCaseId : true));

  // Filtered & Sorted Evidence List for the table
  const filteredEvidence = caseEvidence.filter((item) => {
    const norm = normalizeCategory(item.category);

    // Category filter
    const matchesCategory =
      tableCategoryFilter === 'All' || norm === normalizeCategory(tableCategoryFilter);

    // Investigation status filter
    const matchesInvestigationStatus =
      tableInvestigationStatusFilter === 'All' ||
      (item.investigationStatus || 'Collected') === tableInvestigationStatusFilter;

    // Verification status filter
    const matchesStatus =
      tableStatusFilter === 'All' || item.verificationStatus === tableStatusFilter;

    // Search query
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      item.name?.toLowerCase().includes(term) ||
      item.id?.toLowerCase().includes(term) ||
      item.source?.toLowerCase().includes(term) ||
      (item.notes && item.notes.toLowerCase().includes(term)) ||
      (item.relationshipType && item.relationshipType.toLowerCase().includes(term));

    return matchesCategory && matchesInvestigationStatus && matchesStatus && matchesSearch;
  });

  // Sorting
  const sortedEvidence = [...filteredEvidence].sort((a, b) => {
    if (sortBy === 'date-desc') {
      return (b.dateAdded || '').localeCompare(a.dateAdded || '');
    }
    if (sortBy === 'date-asc') {
      return (a.dateAdded || '').localeCompare(b.dateAdded || '');
    }
    if (sortBy === 'name-asc') {
      return (a.name || '').localeCompare(b.name || '');
    }
    if (sortBy === 'name-desc') {
      return (b.name || '').localeCompare(a.name || '');
    }
    if (sortBy === 'id') {
      return (a.id || '').localeCompare(b.id || '');
    }
    return 0;
  });

  // Sub-entities lists for searchable dropdowns (strictly isolated to current case)
  const existingPersons = caseEvidence.filter((e) => normalizeCategory(e.category) === 'Person');
  const existingPhones = caseEvidence.filter((e) => normalizeCategory(e.category) === 'Phone');
  const existingLocations = caseEvidence.filter((e) => normalizeCategory(e.category) === 'Location');
  const existingFinancials = caseEvidence.filter((e) => normalizeCategory(e.category) === 'Financial');
  const existingOrganizations = caseEvidence.filter((e) => normalizeCategory(e.category) === 'Organization');
  const existingNonRelEntities = caseEvidence.filter((e) => normalizeCategory(e.category) !== 'Relationships');

  // Dependent relationships warning for deletion modal
  const dependentLinks = deletingItem ? getDependentRelationships(deletingItem.id) : [];

  const activeCategoryMeta = EVIDENCE_CATEGORIES.find((c) => c.id === activeCategoryTab) || EVIDENCE_CATEGORIES[0];
  const ActiveIcon = activeCategoryMeta.icon;

  return (
    <div className="space-y-6" ref={formTopRef}>
      {/* Top Header & Case Selection Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-[#243447] flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-[#3478C9]" />
              Evidence Management
            </h2>
            <Badge variant="blue">{activeCaseCrimeType}</Badge>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Investigation dossier for <span className="font-semibold text-[#243447]">{activeCase?.name || activeCaseId}</span>. Relevant categories and parameters tailored for {activeCaseCrimeType}.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {cases.length > 0 && (
            <div className="flex items-center gap-1.5 bg-white border border-[#D7E4F0] rounded-md px-3 py-1.5 shadow-2xs">
              <span className="text-xs font-semibold text-[#64748B]">Active Case:</span>
              <select
                value={activeCaseId}
                onChange={(e) => setActiveCaseId(e.target.value)}
                className="bg-transparent text-xs font-bold text-[#243447] focus:outline-hidden cursor-pointer"
              >
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id} – {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Button
            variant={isFormVisible ? 'secondary' : 'primary'}
            icon={isFormVisible ? X : Plus}
            onClick={() => setIsFormVisible(!isFormVisible)}
          >
            {isFormVisible ? 'Collapse Form' : 'New Evidence Form'}
          </Button>
        </div>
      </div>

      {/* Case Crime Type & Specific Evidence Guidance Panel */}
      <div className="p-3.5 bg-gradient-to-r from-[#F0F7FF] via-[#F8FAFC] to-[#F0FDF4] border border-[#B9D7F2] rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-start sm:items-center gap-2.5">
          <div className="p-2 rounded-md bg-[#3478C9] text-white shrink-0 mt-0.5 sm:mt-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-[#243447]">
                Case: {activeCase?.id || activeCaseId} — {activeCase?.name || 'Investigation Dossier'}
              </span>
              <Badge variant="blue">{activeCaseCrimeType}</Badge>
            </div>
            <p className="text-[#475569] mt-0.5 leading-relaxed">
              {crimeConfig.description}
            </p>
            {crimeConfig.specificEvidenceHints && crimeConfig.specificEvidenceHints[activeCategoryTab] && (
              <div className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-medium text-[#2866AE] bg-white px-2.5 py-1 rounded border border-[#B9D7F2]">
                <span className="font-bold">Recommended for {activeCategoryMeta.shortLabel || activeCategoryMeta.label}:</span>
                <span>{crimeConfig.specificEvidenceHints[activeCategoryTab]}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start md:self-center bg-white px-3 py-1.5 rounded-md border border-[#D7E4F0]">
          <span className="text-[11px] text-[#64748B] font-semibold">Evidence Status:</span>
          <select
            value={formData.investigationStatus || 'Collected'}
            onChange={(e) => setFormData({ ...formData, investigationStatus: e.target.value })}
            className="text-xs font-bold text-[#243447] bg-transparent focus:outline-hidden cursor-pointer"
          >
            {EVIDENCE_TRACKING_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selectable Category Cards / Tabs Tailored to Active Crime Type */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#243447] uppercase tracking-wider">
              {showAllCategories ? 'All Evidence Categories' : `Relevant Categories for ${activeCaseCrimeType}`} ({displayedCategories.length})
            </span>
            <button
              type="button"
              onClick={() => setShowAllCategories(!showAllCategories)}
              className="text-[11px] text-[#3478C9] hover:underline font-semibold cursor-pointer"
            >
              {showAllCategories ? `Show Only Relevant (${relevantCategories.length})` : 'Show All (8)'}
            </button>
          </div>
          <span className="text-[11px] text-[#64748B]">
            Select a category card to open its dedicated parameter form
          </span>
        </div>

        <div className={`grid grid-cols-2 sm:grid-cols-4 ${displayedCategories.length <= 4 ? 'lg:grid-cols-4' : displayedCategories.length <= 6 ? 'lg:grid-cols-6' : 'lg:grid-cols-8'} gap-2`}>
          {displayedCategories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategoryTab === cat.id;
            const catCount = caseEvidence.filter(
              (e) => normalizeCategory(e.category) === cat.id
            ).length;

            return (
              <button
                type="button"
                key={cat.id}
                onClick={() => handleCategoryTabClick(cat.id)}
                className={`p-3 rounded-lg border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between min-h-[84px] ${
                  isSelected
                    ? 'bg-white border-[#3478C9] ring-2 ring-[#3478C9]/20 shadow-xs'
                    : 'bg-white hover:bg-[#F2F7FC] border-[#D7E4F0] hover:border-[#B9D7F2]'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                    style={{ backgroundColor: cat.bgColor, color: cat.color }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? 'bg-[#3478C9] text-white'
                        : 'bg-[#F2F7FC] text-[#64748B] border border-[#D7E4F0]'
                    }`}
                  >
                    {catCount}
                  </span>
                </div>

                <div className="mt-2">
                  <div
                    className={`text-xs font-bold leading-tight truncate ${
                      isSelected ? 'text-[#2866AE]' : 'text-[#243447]'
                    }`}
                  >
                    {cat.shortLabel || cat.label}
                  </div>
                  <div className="text-[9px] text-[#64748B] font-mono mt-0.5">
                    {cat.prefix}-XXXX
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category-Specific Form Section */}
      {isFormVisible && (
        <div className="bg-white rounded-lg border border-[#D7E4F0] shadow-xs p-5 animate-in fade-in duration-150">
          {/* Form Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-[#D7E4F0] gap-3">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: activeCategoryMeta.bgColor, color: activeCategoryMeta.color }}
              >
                <ActiveIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#243447]">
                    {isEditing ? `Edit Record: ${formData.id}` : `New ${activeCategoryMeta.label}`}
                  </h3>
                  {isEditing && (
                    <Badge variant="investigation">Edit Mode</Badge>
                  )}
                </div>
                <p className="text-xs text-[#64748B] mt-0.5">
                  {activeCategoryMeta.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#64748B]">Auto ID:</span>
              <span className="font-mono font-bold text-xs px-2.5 py-1 rounded bg-[#F2F7FC] text-[#2866AE] border border-[#D7E4F0]">
                {formData.id || 'Generating...'}
              </span>
            </div>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-md text-xs text-emerald-800 flex items-center justify-between gap-2 mb-4 animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">{successMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setSuccessMessage(null)}
                className="text-emerald-700 hover:text-emerald-950 p-1 cursor-pointer"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Form Legend explaining 🟢 Compulsory and 🔴 Optional indicators */}
          <FormLegend />

          {/* Validation Alert when compulsory fields are missing */}
          {Object.keys(errors).length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 flex items-start gap-2.5 mb-4 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">
                  Missing compulsory information ({Object.keys(errors).length} field{Object.keys(errors).length > 1 ? 's' : ''}):
                </span>
                <p className="mt-0.5 text-red-600">
                  Please complete all fields marked with 🟢 Compulsory before saving. Your entered information has been preserved.
                </p>
              </div>
            </div>
          )}

          {/* Form Body: Category-Specific Component */}
          <form onSubmit={handleSaveForm}>
            {activeCategoryTab === 'Person' && (
              <PersonForm
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                cases={cases}
                existingLocations={existingLocations}
                existingPersons={existingPersons}
              />
            )}

            {activeCategoryTab === 'Phone' && (
              <PhoneForm
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                cases={cases}
                existingPersons={existingPersons}
                existingEntities={existingNonRelEntities}
              />
            )}

            {activeCategoryTab === 'Location' && (
              <LocationForm
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                cases={cases}
                existingEntities={existingNonRelEntities}
              />
            )}

            {activeCategoryTab === 'Financial' && (
              <FinancialForm
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                cases={cases}
                existingEntities={existingNonRelEntities}
                existingTransactions={existingFinancials}
              />
            )}

            {activeCategoryTab === 'DocumentDigital' && (
              <DocumentDigitalForm
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                cases={cases}
                existingPersons={existingPersons}
                existingPhones={existingPhones}
                existingLocations={existingLocations}
                existingFinancials={existingFinancials}
              />
            )}

            {activeCategoryTab === 'Vehicle' && (
              <VehicleForm
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                cases={cases}
                existingPersons={existingPersons}
                existingLocations={existingLocations}
                existingOrganizations={existingOrganizations}
              />
            )}

            {activeCategoryTab === 'Organization' && (
              <OrganizationForm
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                cases={cases}
                existingPersons={existingPersons}
                existingFinancials={existingFinancials}
                existingLocations={existingLocations}
              />
            )}

            {activeCategoryTab === 'Relationships' && (
              <RelationshipForm
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                cases={cases}
                existingEntities={existingNonRelEntities}
                existingEvidence={evidence}
              />
            )}

            {/* Bottom Form Actions: Save, Cancel, and Reset */}
            <div className="mt-5 pt-4 border-t border-[#D7E4F0] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  icon={RotateCcw}
                  onClick={handleResetForm}
                >
                  Reset
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  icon={X}
                  onClick={handleCancelForm}
                >
                  Cancel
                </Button>
              </div>

              <div className="flex items-center gap-2.5">
                <Button
                  type="submit"
                  variant="primary"
                  icon={CheckCircle2}
                >
                  {isEditing ? 'Save Changes' : `Save ${activeCategoryMeta.shortLabel || 'Record'}`}
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Saved Evidence Table Section */}
      <div className="bg-white rounded-lg border border-[#D7E4F0] shadow-xs overflow-hidden">
        {/* Table Title and Summary Count */}
        <div className="px-5 py-4 border-b border-[#D7E4F0] bg-[#F2F7FC] flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#243447] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#3478C9]" />
                Saved Evidence Records
                <Badge variant="blue">{sortedEvidence.length} items</Badge>
              </h3>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-white text-[#2866AE] border border-[#D7E4F0]">
                Case: {activeCase?.id || activeCaseId}
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Evidence dossier isolated exclusively to {activeCase?.name || activeCaseId}. Records from different cases never mix.
            </p>
          </div>
        </div>

        {/* Search, Filter & Sort Toolbar */}
        <div className="p-4 border-b border-[#D7E4F0] bg-white grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, identifier, source, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#D7E4F0] rounded-md focus:outline-hidden focus:border-[#3478C9]"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={tableCategoryFilter}
              onChange={(e) => setTableCategoryFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-[#D7E4F0] rounded-md focus:outline-hidden focus:border-[#3478C9] cursor-pointer"
            >
              <option value="All">All Categories ({caseEvidence.length})</option>
              {displayedCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Investigation Status Filter */}
          <div>
            <select
              value={tableInvestigationStatusFilter}
              onChange={(e) => setTableInvestigationStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-[#D7E4F0] rounded-md focus:outline-hidden focus:border-[#3478C9] cursor-pointer"
            >
              <option value="All">All Investigation Statuses</option>
              {EVIDENCE_TRACKING_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Verification Status Filter */}
          <div>
            <select
              value={tableStatusFilter}
              onChange={(e) => setTableStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-[#D7E4F0] rounded-md focus:outline-hidden focus:border-[#3478C9] cursor-pointer"
            >
              <option value="All">All Verification Statuses</option>
              {VERIFICATION_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-[#D7E4F0] rounded-md focus:outline-hidden focus:border-[#3478C9] cursor-pointer"
            >
              <option value="date-desc">Newest Added</option>
              <option value="date-asc">Oldest Added</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="id">Evidence ID</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        {sortedEvidence.length === 0 ? (
          <div className="p-12 text-center">
            <FileSpreadsheet className="w-10 h-10 text-[#94A3B8] mx-auto mb-3" />
            <h4 className="text-sm font-bold text-[#243447]">No Evidence Records Found</h4>
            <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
              {caseEvidence.length === 0
                ? `No evidence items logged for case ${activeCase?.id || activeCaseId} yet. Use the category forms above to create evidence.`
                : 'No evidence matches your active search term, category, or status filter.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#D7E4F0] bg-[#F2F7FC] text-[#64748B] font-semibold">
                  <th className="py-3 px-4">Evidence ID</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Identifier / Name</th>
                  <th className="py-3 px-4">Investigation Status</th>
                  <th className="py-3 px-4">Key Attributes</th>
                  <th className="py-3 px-4">Source / Reference</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4">Date Logged</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D7E4F0]">
                {sortedEvidence.map((item) => {
                  const normCat = normalizeCategory(item.category);
                  const catMeta = EVIDENCE_CATEGORIES.find((c) => c.id === normCat) || EVIDENCE_CATEGORIES[0];
                  const Icon = catMeta.icon;
                  const isRelationship = normCat === 'Relationships';

                  return (
                    <tr
                      key={item.id}
                      onClick={() => setViewingItem(item)}
                      className="hover:bg-[#F2F7FC] transition-colors cursor-pointer"
                    >
                      {/* ID */}
                      <td className="py-3 px-4 font-mono font-bold text-[#2866AE] whitespace-nowrap">
                        {item.id}
                      </td>

                      {/* Category Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border"
                          style={{
                            backgroundColor: catMeta.bgColor,
                            borderColor: catMeta.borderColor,
                            color: catMeta.color
                          }}
                        >
                          <Icon className="w-3 h-3" />
                          {catMeta.shortLabel || catMeta.label}
                        </span>
                      </td>

                      {/* Name / Identifier */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-bold text-[#243447] truncate" title={item.name}>
                          {item.name}
                        </div>
                        {item.fileName && (
                          <div className="text-[10px] text-[#64748B] flex items-center gap-1 mt-0.5">
                            <Paperclip className="w-3 h-3 text-[#3478C9]" />
                            <span className="truncate">{item.fileName}</span>
                            <span>({item.fileSize})</span>
                          </div>
                        )}
                      </td>

                      {/* Investigation Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            item.investigationStatus === 'Collected'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : item.investigationStatus === 'Under Review'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : item.investigationStatus === 'Pending'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : item.investigationStatus === 'Unavailable'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-slate-100 text-slate-600 border-slate-300'
                          }`}
                        >
                          {item.investigationStatus || 'Collected'}
                        </span>
                      </td>

                      {/* Key Attributes preview */}
                      <td className="py-3 px-4 max-w-sm">
                        {isRelationship ? (
                          <div className="text-[11px] text-[#243447]">
                            <span className="font-semibold text-[#3478C9]">{item.relationshipType}</span>
                            <div className="text-[#64748B] truncate mt-0.5">
                              {item.supportingEvidence}
                            </div>
                          </div>
                        ) : (
                          <div className="text-[11px] text-[#64748B] line-clamp-2">
                            {item.physicalDescription ||
                              item.vehicleType ||
                              item.carrier ||
                              item.amount ||
                              (item.roleInCase ? `Role: ${item.roleInCase}` : null) ||
                              (item.locationType ? `Type: ${item.locationType}` : null) ||
                              item.notes ||
                              'Documented evidentiary record'}
                          </div>
                        )}
                      </td>

                      {/* Source */}
                      <td className="py-3 px-4 max-w-xs truncate text-[#64748B]">
                        {item.source || item.supportingEvidence || 'Case File'}
                      </td>

                      {/* Verification Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <Badge
                          variant={
                            item.verificationStatus === 'Verified'
                              ? 'active'
                              : item.verificationStatus === 'Disputed'
                              ? 'danger'
                              : 'investigation'
                          }
                        >
                          {item.verificationStatus || 'Under Review'}
                        </Badge>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 whitespace-nowrap text-[#64748B]">
                        {item.dateAdded}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setViewingItem(item)}
                            className="p-1.5 rounded text-[#64748B] hover:text-[#243447] hover:bg-[#EAF4FC] transition-colors"
                            title="Inspect Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {!isRelationship && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleJumpToFinder(item.name)}
                                className="p-1.5 rounded text-[#64748B] hover:text-[#3478C9] hover:bg-[#EAF4FC] transition-colors"
                                title="Find Connections"
                              >
                                <Compass className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => navigateToNetworkWithEntity(item.name)}
                                className="p-1.5 rounded text-[#64748B] hover:text-[#3478C9] hover:bg-[#EAF4FC] transition-colors"
                                title="View in Network Graph"
                              >
                                <Network className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            onClick={() => handleEditItem(item)}
                            className="p-1.5 rounded text-[#64748B] hover:text-[#243447] hover:bg-[#EAF4FC] transition-colors"
                            title="Edit Record"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeletePrompt(item)}
                            className="p-1.5 rounded text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Comprehensive Details Inspection Modal */}
      <EvidenceDetailModal
        isOpen={!!viewingItem}
        item={viewingItem}
        onClose={() => setViewingItem(null)}
        onEdit={handleEditItem}
      />

      {/* Delete Confirmation Dialog with Dependency Checks */}
      <ConfirmDialog
        isOpen={!!deletingItem}
        title="Delete Evidence Record"
        message={
          dependentLinks.length > 0
            ? `Are you sure you want to delete "${deletingItem?.name}" (${deletingItem?.id})? WARNING: This entity has ${dependentLinks.length} dependent relationship link(s) that will also be removed to preserve graph integrity.`
            : `Are you sure you want to delete "${deletingItem?.name}" (${deletingItem?.id})? This action will remove the record from your local workspace.`
        }
        confirmLabel="Delete Record"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingItem(null)}
      />
    </div>
  );
};
