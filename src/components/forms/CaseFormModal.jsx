import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { SearchableSelect } from './SearchableSelect';
import {
  CRIME_TYPE_OPTIONS,
  CASE_STATUSES,
  normalizeCrimeType
} from '../../constants/categories';

export const CaseFormModal = ({
  isOpen,
  onClose,
  initialData = null,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    crimeType: 'Murder/Homicide',
    category: 'Murder/Homicide',
    description: '',
    status: 'Active',
    officer: '',
    priority: 'Medium',
    dateOpened: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      const resolvedCrimeType = normalizeCrimeType(initialData.crimeType || initialData.category);
      setFormData({
        id: initialData.id || '',
        name: initialData.name || '',
        crimeType: resolvedCrimeType,
        category: resolvedCrimeType,
        description: initialData.description || '',
        status: initialData.status || 'Active',
        officer: initialData.officer || '',
        priority: initialData.priority || 'Medium',
        dateOpened: initialData.dateOpened || new Date().toISOString().split('T')[0]
      });
    } else {
      setFormData({
        id: '',
        name: '',
        crimeType: 'Murder/Homicide',
        category: 'Murder/Homicide',
        description: '',
        status: 'Active',
        officer: 'Insp. A. Sharma',
        priority: 'Medium',
        dateOpened: new Date().toISOString().split('T')[0]
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Case name is required.';
    if (!formData.crimeType && !formData.category) {
      errs.crimeType = 'Please select the type of case you are investigating.';
    }
    if (!formData.description.trim()) errs.description = 'Case description is required.';
    if (!formData.officer.trim()) errs.officer = 'Investigating officer is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const finalCrimeType = normalizeCrimeType(formData.crimeType || formData.category);
    onSubmit({
      ...formData,
      crimeType: finalCrimeType,
      category: finalCrimeType
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Case File' : 'Create New Case File'}
      subtitle="Authorized evidentiary investigation case registration"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Searchable Question: What type of case are you investigating? */}
        <div>
          <SearchableSelect
            label="What type of case are you investigating?"
            compulsory
            options={CRIME_TYPE_OPTIONS}
            value={formData.crimeType || formData.category}
            onChange={(val) => setFormData({ ...formData, crimeType: val, category: val })}
            placeholder="Search or select investigation crime type..."
            error={errors.crimeType}
            helpText="Sets crime-specific evidence categories and tailored investigation parameters"
          />
        </div>

        {/* Case Name */}
        <div>
          <label className="block text-xs font-semibold text-[#243447] mb-1">
            Case Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g., Operation Blue Harbor"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`w-full px-3 py-2 text-sm bg-white border rounded-md focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] ${
              errors.name ? 'border-red-400' : 'border-[#D7E4F0]'
            }`}
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name}</p>
          )}
        </div>

        {/* Case ID & Date Opened */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#243447] mb-1">
              Case ID (Auto-generated if empty)
            </label>
            <input
              type="text"
              placeholder="e.g., CPX-2026-003"
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              disabled={!!initialData}
              className="w-full px-3 py-2 text-sm bg-white border border-[#D7E4F0] rounded-md focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#243447] mb-1">
              Date Opened
            </label>
            <input
              type="date"
              value={formData.dateOpened}
              onChange={(e) => setFormData({ ...formData, dateOpened: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white border border-[#D7E4F0] rounded-md focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-semibold text-[#243447] mb-1">
            Case Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white border border-[#D7E4F0] rounded-md focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
          >
            {CASE_STATUSES.map((st) => (
              <option key={st.id} value={st.id}>
                {st.label}
              </option>
            ))}
          </select>
        </div>

        {/* Lead Officer & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#243447] mb-1">
              Investigating Officer <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Insp. A. Sharma"
              value={formData.officer}
              onChange={(e) => setFormData({ ...formData, officer: e.target.value })}
              className={`w-full px-3 py-2 text-sm bg-white border rounded-md focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] ${
                errors.officer ? 'border-red-400' : 'border-[#D7E4F0]'
              }`}
            />
            {errors.officer && (
              <p className="text-xs text-red-500 mt-1">{errors.officer}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#243447] mb-1">
              Investigation Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white border border-[#D7E4F0] rounded-md focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
            >
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>
        </div>

        {/* Case Description */}
        <div>
          <label className="block text-xs font-semibold text-[#243447] mb-1">
            Case Description & Scope <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            placeholder="Detailed narrative of initial intelligence, allegations, and investigation mandate..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className={`w-full px-3 py-2 text-sm bg-white border rounded-md focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] ${
              errors.description ? 'border-red-400' : 'border-[#D7E4F0]'
            }`}
          />
          {errors.description && (
            <p className="text-xs text-red-500 mt-1">{errors.description}</p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-[#D7E4F0] flex items-center justify-end gap-2.5">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {initialData ? 'Save Changes' : 'Create Case'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
