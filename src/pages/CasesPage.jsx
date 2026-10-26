import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  ArrowRight,
  FileSpreadsheet,
  Network,
  CheckCircle2
} from 'lucide-react';
import { useCaseContext } from '../context/CaseContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { CaseFormModal } from '../components/forms/CaseFormModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { CASE_STATUSES } from '../constants/categories';

export const CasesPage = () => {
  const {
    cases,
    evidence,
    activeCaseId,
    setActiveCaseId,
    setActiveTab,
    addCase,
    updateCase,
    deleteCase
  } = useCaseContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState(null);
  const [deletingCaseId, setDeletingCaseId] = useState(null);

  // Filter cases
  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.officer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.crimeType && c.crimeType.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.category && c.category.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'All' || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleEdit = (caseItem) => {
    setEditingCase(caseItem);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deletingCaseId) {
      deleteCase(deletingCaseId);
      setDeletingCaseId(null);
    }
  };

  const handleFormSubmit = (formData) => {
    if (editingCase) {
      updateCase(editingCase.id, formData);
    } else {
      addCase(formData);
    }
  };

  const handleOpenWorkspace = (caseId, targetTab = 'evidence') => {
    setActiveCaseId(caseId);
    setActiveTab(targetTab);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#243447]">Case Management</h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Create, inspect, and organize authorized investigation dossiers
          </p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={() => {
            setEditingCase(null);
            setIsModalOpen(true);
          }}
        >
          Create New Case
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-lg border border-[#D7E4F0] p-4 shadow-xs flex flex-col md:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by case name, ID, officer, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#D7E4F0] rounded-md focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-[#64748B]" />
          <span className="text-xs font-medium text-[#64748B] shrink-0">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-white border border-[#D7E4F0] rounded-md px-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] cursor-pointer"
          >
            <option value="All">All Statuses ({cases.length})</option>
            {CASE_STATUSES.map((st) => (
              <option key={st.id} value={st.id}>
                {st.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cases Grid / Cards */}
      {filteredCases.length === 0 ? (
        <div className="bg-white rounded-lg border border-[#D7E4F0] p-12 text-center">
          <FolderKanban className="w-10 h-10 text-[#94A3B8] mx-auto mb-3" />
          <h4 className="text-sm font-bold text-[#243447]">No Case Files Found</h4>
          <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
            {searchTerm || statusFilter !== 'All'
              ? 'No cases match your active search or status filter criteria.'
              : 'Your workspace currently has no registered cases. Create a case to start logging evidence.'}
          </p>
          <div className="mt-4">
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => {
                setEditingCase(null);
                setIsModalOpen(true);
              }}
            >
              Create New Case
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCases.map((caseItem) => {
            const isActive = activeCaseId === caseItem.id;
            const caseEv = evidence.filter((e) => e.caseId === caseItem.id);
            const entityCount = caseEv.filter((e) => e.category !== 'Relationships').length;
            const relationshipCount = caseEv.filter((e) => e.category === 'Relationships').length;

            return (
              <div
                key={caseItem.id}
                className={`bg-white rounded-lg border p-5 shadow-xs flex flex-col justify-between transition-all ${
                  isActive
                    ? 'border-[#3478C9] ring-2 ring-[#3478C9]/20'
                    : 'border-[#D7E4F0] hover:border-[#9DBFD8]'
                }`}
              >
                <div>
                  {/* Top Bar with ID & Status */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#2866AE] px-2 py-0.5 rounded bg-[#EAF4FC] border border-[#B9D7F2]">
                        {caseItem.id}
                      </span>
                      {isActive && (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Active Workspace
                        </span>
                      )}
                    </div>

                    <Badge
                      variant={
                        caseItem.status === 'Active'
                          ? 'active'
                          : caseItem.status === 'Under Investigation'
                          ? 'investigation'
                          : 'closed'
                      }
                    >
                      {caseItem.status}
                    </Badge>
                  </div>

                  {/* Case Name */}
                  <h3 className="text-base font-bold text-[#243447]">{caseItem.name}</h3>
                  <div className="text-xs text-[#3478C9] font-medium mt-0.5">
                    {caseItem.crimeType || caseItem.category}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#64748B] mt-2 line-clamp-3 leading-relaxed">
                    {caseItem.description}
                  </p>

                  {/* Metadata Row */}
                  <div className="mt-4 pt-3 border-t border-[#D7E4F0] grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-[#64748B] block">Lead Officer:</span>
                      <span className="font-medium text-[#243447] truncate block">
                        {caseItem.officer}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#64748B] block">Last Updated:</span>
                      <span className="text-[#64748B]">{caseItem.lastUpdated || caseItem.dateOpened}</span>
                    </div>

                    <div className="col-span-2 flex items-center gap-3 pt-1 text-[11px] text-[#64748B]">
                      <span>
                        <strong className="text-[#243447]">{entityCount}</strong> entities
                      </span>
                      <span>•</span>
                      <span>
                        <strong className="text-[#243447]">{relationshipCount}</strong> relationships
                      </span>
                      <span>•</span>
                      <span>Priority: <strong className="text-[#243447]">{caseItem.priority || 'Medium'}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-3 border-t border-[#D7E4F0] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Edit2}
                      onClick={() => handleEdit(caseItem)}
                      title="Edit Case Information"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      onClick={() => setDeletingCaseId(caseItem.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Delete Case Dossier"
                    >
                      Delete
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant={isActive ? 'secondary' : 'primary'}
                      size="sm"
                      icon={FileSpreadsheet}
                      onClick={() => handleOpenWorkspace(caseItem.id, 'evidence')}
                    >
                      Evidence
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Network}
                      onClick={() => handleOpenWorkspace(caseItem.id, 'network')}
                    >
                      Graph
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Case Creation/Editing Modal */}
      <CaseFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCase(null);
        }}
        initialData={editingCase}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingCaseId}
        title="Delete Case Dossier"
        message="Are you sure you want to delete this case? Deleting this case will also remove all associated evidence and recorded relationship links from your local workspace."
        confirmLabel="Delete Case"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingCaseId(null)}
      />
    </div>
  );
};
