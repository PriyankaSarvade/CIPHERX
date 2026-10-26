import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { EVIDENCE_CATEGORIES, RELATIONSHIP_TYPES } from '../../constants/categories';
import { UploadCloud, Paperclip, FileCheck, AlertCircle } from 'lucide-react';

export const EvidenceFormModal = ({
  isOpen,
  onClose,
  initialData = null,
  activeCaseId,
  existingEntities = [],
  onSubmit
}) => {
  const [category, setCategory] = useState('Person');
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [attachedFile, setAttachedFile] = useState(null);

  useEffect(() => {
    if (initialData) {
      setCategory(initialData.category || 'Person');
      setFormData({ ...initialData });
      if (initialData.fileName) {
        setAttachedFile({
          name: initialData.fileName,
          size: initialData.fileSize || 'Reference only'
        });
      } else {
        setAttachedFile(null);
      }
    } else {
      setCategory('Person');
      setFormData({
        name: '',
        source: '',
        notes: '',
        caseId: activeCaseId
      });
      setAttachedFile(null);
    }
    setErrors({});
  }, [initialData, isOpen, activeCaseId]);

  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    setErrors({});
    if (!initialData) {
      setFormData({
        caseId: activeCaseId,
        source: formData.source || '',
        notes: formData.notes || ''
      });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const formattedSize = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${(file.size / 1024).toFixed(1)} KB`;
      setAttachedFile({
        name: file.name,
        size: formattedSize
      });
      setFormData((prev) => ({
        ...prev,
        fileName: file.name,
        fileSize: formattedSize
      }));
    }
  };

  const validate = () => {
    const errs = {};

    if (category === 'Person') {
      if (!formData.name?.trim()) errs.name = 'Full name or identifier is required.';
      if (!formData.source?.trim()) errs.source = 'Source or reference is required.';
    } else if (category === 'Phone') {
      if (!formData.name?.trim()) errs.name = 'Phone number is required.';
      if (!formData.source?.trim()) errs.source = 'Source is required.';
    } else if (category === 'Location') {
      if (!formData.name?.trim()) errs.name = 'Location name or address is required.';
      if (!formData.source?.trim()) errs.source = 'Source is required.';
    } else if (category === 'Financial') {
      if (!formData.name?.trim()) errs.name = 'Transaction or account reference is required.';
      if (!formData.source?.trim()) errs.source = 'Source is required.';
    } else if (category === 'Documents') {
      if (!formData.name?.trim()) errs.name = 'Document name is required.';
      if (!formData.source?.trim()) errs.source = 'Source or reference is required.';
    } else if (category === 'Digital') {
      if (!formData.name?.trim()) errs.name = 'Evidence name is required.';
      if (!formData.source?.trim()) errs.source = 'Chain of custody source is required.';
    } else if (category === 'Vehicle') {
      if (!formData.name?.trim()) errs.name = 'Vehicle registration or plate is required.';
      if (!formData.source?.trim()) errs.source = 'Source is required.';
    } else if (category === 'Incident') {
      if (!formData.name?.trim()) errs.name = 'Incident name or identifier is required.';
      if (!formData.source?.trim()) errs.source = 'Source is required.';
    } else if (category === 'Organization') {
      if (!formData.name?.trim()) errs.name = 'Organization name is required.';
      if (!formData.source?.trim()) errs.source = 'Source is required.';
    } else if (category === 'Relationships') {
      if (!formData.sourceEntityName?.trim()) errs.sourceEntityName = 'First entity is required.';
      if (!formData.relationshipType?.trim()) errs.relationshipType = 'Relationship type is required.';
      if (!formData.targetEntityName?.trim()) errs.targetEntityName = 'Second entity is required.';
      if (!formData.supportingEvidence?.trim()) errs.supportingEvidence = 'Supporting evidence is required.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    let payload = {
      ...formData,
      category,
      caseId: activeCaseId
    };

    // If Relationship, resolve IDs if selected from existing entities
    if (category === 'Relationships') {
      const matchSrc = existingEntities.find(
        (ent) => ent.name?.toLowerCase() === formData.sourceEntityName?.toLowerCase()
      );
      const matchTgt = existingEntities.find(
        (ent) => ent.name?.toLowerCase() === formData.targetEntityName?.toLowerCase()
      );

      payload.sourceEntityId = matchSrc ? matchSrc.id : (formData.sourceEntityId || '');
      payload.targetEntityId = matchTgt ? matchTgt.id : (formData.targetEntityId || '');
      payload.name = `${formData.sourceEntityName} ➔ ${formData.relationshipType} ➔ ${formData.targetEntityName}`;
    }

    onSubmit(payload);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Evidence Record' : 'Log New Case Evidence'}
      subtitle={`Associated with Case: ${activeCaseId}`}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category Selector Tabs */}
        <div>
          <label className="block text-xs font-semibold text-[#243447] mb-1.5">
            Evidence Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-1 bg-[#F2F7FC] rounded-lg border border-[#D7E4F0]">
            {EVIDENCE_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = category === cat.id;
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`flex flex-col items-center justify-center p-2 rounded-md text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-white text-[#2866AE] font-semibold shadow-xs border border-[#B9D7F2]'
                      : 'text-[#64748B] hover:text-[#243447] hover:bg-white/60'
                  }`}
                  title={cat.description}
                >
                  <Icon className="w-4 h-4 mb-1" style={{ color: isSelected ? '#3478C9' : undefined }} />
                  <span className="truncate w-full text-center text-[11px]">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Category Fields */}

        {/* 1. PERSON */}
        {category === 'Person' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#243447] mb-1">
                Full Name or Identifier <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Vikram Malhotra"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3 py-2 text-sm bg-white border rounded-md focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] ${
                  errors.name ? 'border-red-400' : 'border-[#D7E4F0]'
                }`}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#243447] mb-1">
                Physical Description (Height, Weight, Identifying Marks)
              </label>
              <input
                type="text"
                placeholder="e.g., 5ft 11in, ~82kg, scar on left eyebrow, business attire"
                value={formData.physicalDescription || ''}
                onChange={(e) => setFormData({ ...formData, physicalDescription: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-[#D7E4F0] rounded-md focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
              />
            </div>
          </div>
        )}

        {/* 2. PHONE */}
        {category === 'Phone' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#243447] mb-1">
                  Phone Number or Identifier <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., +91 98201 44521"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 text-sm bg-white border rounded-md focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] ${
                    errors.name ? 'border-red-400' : 'border-[#D7E4F0]'
                  }`}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#243447] mb-1">
                  Associated Person
                </label>
                <input
                  type="text"
                  placeholder="e.g., Vikram Malhotra"
                  value={formData.associatedPerson || ''}
                  onChange={(e) => setFormData({ ...formData, associatedPerson: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#D7E4F0] rounded-md focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#243447] mb-1">
                Carrier / SIM Details
              </label>
              <input
                type="text"
                placeholder="e.g., Airtel Enterprise Postpaid, IMEI 8690120..."
                value={formData.carrier || ''}
                onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-[#D7E4F0] rounded-md focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
              />
            </div>
          </div>
        )}

        {/* 3. LOCATION */}
        {category === 'Location' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#243447] mb-1">
                Location Name or Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Pier 14 Logistics Yard, Navi Mumbai"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3 py-2 text-sm bg-white border rounded-md focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] ${
                  errors.name ? 'border-red-400' : 'border-[#D7E4F0]'
                }`}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#243447] mb-1">
                Coordinates / Zone / Related Case Info
              </label>
              <input
                type="text"
                placeholder="e.g., 18.9512° N, 72.9518° E (Restricted Bonded Area)"
                value={formData.coordinates || ''}
                onChange={(e) => setFormData({ ...formData, coordinates: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-[#D7E4F0] rounded-md focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
              />
            </div>
          </div>
        )}

        {/* 4. FINANCIAL */}
        {category === 'Financial' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#243447] mb-1">
                  Transaction or Account Reference <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., TXN-88492-HK"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 text-sm bg-white border rounded-md focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] ${
                    errors.name ? 'border-red-400' : 'border-[#D7E4F0]'
                  }`}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#243447] mb-1">
                  Amount
                </label>
                <input
                  type="text"
                  placeholder="e.g., $45,000 USD (₹3,750,000)"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#D7E4F0] rounded-md focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#243447] mb-1">
                Related Entities (Sender / Beneficiary)
              </label>
              <input
                type="text"
                placeholder="e.g., Apex Freight Solutions ➔ Trident Marine HK"
                value={formData.relatedEntities || ''}
                onChange={(e) => setFormData({ ...formData, relatedEntities: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-[#D7E4F0] rounded-md focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
              />
            </div>
          </div>
        )}

        {/* 5. DOCUMENTS */}
        {category === 'Documents' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#243447] mb-1">
                  Document Name / Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., B/L #88219-IN"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 text-sm bg-white border rounded-md focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] ${
                    errors.name ? 'border-red-400' : 'border-[#D7E4F0]'
                  }`}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#243447] mb-1">
                  Document Type
                </label>
                <input
                  type="text"
                  placeholder="e.g., Falsified Customs Manifest"
                  value={formData.documentType || ''}
                  onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#D7E4F0] rounded-md focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
                />
              </div>
            </div>
          </div>
        )}

        {/* 6. DIGITAL EVIDENCE */}
        {category === 'Digital' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#243447] mb-1">
                  Digital Evidence Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., SanDisk 64GB Extreme USB"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 text-sm bg-white border rounded-md focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] ${
                    errors.name ? 'border-red-400' : 'border-[#D7E4F0]'
                  }`}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#243447] mb-1">
                  Digital Evidence Type
                </label>
                <input
                  type="text"
                  placeholder="e.g., Encrypted Flash Drive / CCTV Dump"
                  value={formData.digitalType || ''}
                  onChange={(e) => setFormData({ ...formData, digitalType: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#D7E4F0] rounded-md focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
                />
              </div>
            </div>
          </div>
        )}

        {/* 7. VEHICLE */}
        {category === 'Vehicle' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#243447] mb-1">
                  Registration / Plate Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., MH-02-BZ-4819"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 text-sm bg-white border rounded-md focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] ${
                    errors.name ? 'border-red-400' : 'border-[#D7E4F0]'
                  }`}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#243447] mb-1">
                  Vehicle Model / Type
                </label>
                <input
                  type="text"
                  placeholder="e.g., White Ashok Leyland Delivery Van"
                  value={formData.vehicleType || ''}
                  onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#D7E4F0] rounded-md focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#243447] mb-1">
                Associated Driver / Person
              </label>
              <input
                type="text"
                placeholder="e.g., Rohan Roy"
                value={formData.associatedPerson || ''}
                onChange={(e) => setFormData({ ...formData, associatedPerson: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-[#D7E4F0] rounded-md focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
              />
            </div>
          </div>
        )}

        {/* 8. INCIDENT */}
        {category === 'Incident' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#243447] mb-1">
                Incident Name or Identifier <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Midnight Container Clearance Incident"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3 py-2 text-sm bg-white border rounded-md focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] ${
                  errors.name ? 'border-red-400' : 'border-[#D7E4F0]'
                }`}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#243447] mb-1">
                  Incident Date & Time
                </label>
                <input
                  type="text"
                  placeholder="e.g., 2026-09-28 02:30 AM"
                  value={formData.incidentDate || ''}
                  onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#D7E4F0] rounded-md focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#243447] mb-1">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="e.g., Pier 14 Logistics Yard"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#D7E4F0] rounded-md focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
                />
              </div>
            </div>
          </div>
        )}

        {/* 9. ORGANIZATION */}
        {category === 'Organization' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#243447] mb-1">
                  Organization Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Apex Freight Solutions"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 text-sm bg-white border rounded-md focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] ${
                    errors.name ? 'border-red-400' : 'border-[#D7E4F0]'
                  }`}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#243447] mb-1">
                  Organization Type
                </label>
                <input
                  type="text"
                  placeholder="e.g., Import/Export Shell Intermediary"
                  value={formData.organizationType || ''}
                  onChange={(e) => setFormData({ ...formData, organizationType: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#D7E4F0] rounded-md focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#243447] mb-1">
                Associated Entities / Principals
              </label>
              <input
                type="text"
                placeholder="e.g., Vikram Malhotra, Elena Vance"
                value={formData.associatedEntities || ''}
                onChange={(e) => setFormData({ ...formData, associatedEntities: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-[#D7E4F0] rounded-md focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
              />
            </div>
          </div>
        )}

        {/* 10. RELATIONSHIPS */}
        {category === 'Relationships' && (
          <div className="space-y-3 bg-[#F2F7FC] p-3.5 rounded-lg border border-[#D7E4F0]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#243447] mb-1">
                  First Entity (Source) <span className="text-red-500">*</span>
                </label>
                <input
                  list="entities-list"
                  type="text"
                  placeholder="Select or enter first entity"
                  value={formData.sourceEntityName || ''}
                  onChange={(e) => setFormData({ ...formData, sourceEntityName: e.target.value })}
                  className={`w-full px-3 py-2 text-sm bg-white border rounded-md focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] ${
                    errors.sourceEntityName ? 'border-red-400' : 'border-[#D7E4F0]'
                  }`}
                />
                {errors.sourceEntityName && (
                  <p className="text-xs text-red-500 mt-1">{errors.sourceEntityName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#243447] mb-1">
                  Relationship Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.relationshipType || RELATIONSHIP_TYPES[0]}
                  onChange={(e) => setFormData({ ...formData, relationshipType: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#D7E4F0] rounded-md focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
                >
                  {RELATIONSHIP_TYPES.map((rt) => (
                    <option key={rt} value={rt}>
                      {rt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#243447] mb-1">
                Second Entity (Target) <span className="text-red-500">*</span>
              </label>
              <input
                list="entities-list"
                type="text"
                placeholder="Select or enter second entity"
                value={formData.targetEntityName || ''}
                onChange={(e) => setFormData({ ...formData, targetEntityName: e.target.value })}
                className={`w-full px-3 py-2 text-sm bg-white border rounded-md focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] ${
                  errors.targetEntityName ? 'border-red-400' : 'border-[#D7E4F0]'
                }`}
              />
              {errors.targetEntityName && (
                <p className="text-xs text-red-500 mt-1">{errors.targetEntityName}</p>
              )}
            </div>

            {/* Datalist for existing entities */}
            <datalist id="entities-list">
              {existingEntities.map((ent) => (
                <option key={ent.id} value={ent.name}>
                  {ent.name} ({ent.category})
                </option>
              ))}
            </datalist>

            <div>
              <label className="block text-xs font-semibold text-[#243447] mb-1">
                Supporting Evidence / Document Reference <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., CDR call logs, wire receipt #8821, CCTV timestamp"
                value={formData.supportingEvidence || ''}
                onChange={(e) => setFormData({ ...formData, supportingEvidence: e.target.value })}
                className={`w-full px-3 py-2 text-sm bg-white border rounded-md focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] ${
                  errors.supportingEvidence ? 'border-red-400' : 'border-[#D7E4F0]'
                }`}
              />
              {errors.supportingEvidence && (
                <p className="text-xs text-red-500 mt-1">{errors.supportingEvidence}</p>
              )}
            </div>
          </div>
        )}

        {/* Source / Reference (common to all except relationship where supporting evidence is used) */}
        {category !== 'Relationships' && (
          <div>
            <label className="block text-xs font-semibold text-[#243447] mb-1">
              Evidentiary Source or Reference <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Seizure Memo #409, Surveillance Log, Bank Records"
              value={formData.source || ''}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              className={`w-full px-3 py-2 text-sm bg-white border rounded-md focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] ${
                errors.source ? 'border-red-400' : 'border-[#D7E4F0]'
              }`}
            />
            {errors.source && <p className="text-xs text-red-500 mt-1">{errors.source}</p>}
          </div>
        )}

        {/* Notes (common) */}
        <div>
          <label className="block text-xs font-semibold text-[#243447] mb-1">
            Investigator Notes & Observations
          </label>
          <textarea
            rows={2}
            placeholder="Analytical notes, significance to case theory, chain of custody observations..."
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white border border-[#D7E4F0] rounded-md focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
          />
        </div>

        {/* Local File Attachment (demonstration) */}
        {category !== 'Relationships' && (
          <div className="pt-2 border-t border-[#D7E4F0]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-[#243447] flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-[#3478C9]" />
                Attach Demonstration File Reference
              </span>
              <span className="text-[10px] text-[#64748B]">Optional</span>
            </div>

            <div className="flex items-center gap-3 p-3 bg-[#F2F7FC] rounded-md border border-[#D7E4F0]">
              <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D7E4F0] rounded text-xs font-medium text-[#243447] hover:bg-[#EAF4FC] hover:text-[#2866AE] cursor-pointer shrink-0">
                <UploadCloud className="w-3.5 h-3.5 text-[#3478C9]" />
                Select File
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {attachedFile ? (
                <div className="flex items-center gap-2 text-xs text-[#243447] truncate">
                  <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold truncate">{attachedFile.name}</span>
                  <span className="text-[10px] text-[#64748B]">({attachedFile.size})</span>
                </div>
              ) : (
                <span className="text-xs text-[#64748B]">
                  No file attached. (PDF, JPG, TXT, or scan)
                </span>
              )}
            </div>

            <p className="text-[10px] text-[#64748B] mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-[#94A3B8]" />
              File references are stored in browser session state for demonstration. Files are not uploaded to external servers.
            </p>
          </div>
        )}

        {/* Form Actions */}
        <div className="pt-3 border-t border-[#D7E4F0] flex items-center justify-end gap-2.5">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {initialData ? 'Save Changes' : 'Log Evidence'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
