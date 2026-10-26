import React from 'react';
import { EvidenceInputTable, EvidenceTableRow } from '../EvidenceInputTable';
import { SearchableSelect } from '../SearchableSelect';
import { MultiSelect } from '../MultiSelect';
import {
  DOCUMENT_TYPES,
  DOCUMENT_REVIEW_STATUSES
} from '../../../constants/categories';
import { computeFileSHA256 } from '../../../utils/fileCrypto';
import { UploadCloud, FileCheck, X, Plus, ShieldCheck, Lock } from 'lucide-react';

export const DocumentDigitalForm = ({
  formData,
  setFormData,
  errors = {},
  cases = [],
  existingPersons = [],
  existingPhones = [],
  existingLocations = [],
  existingFinancials = []
}) => {
  const caseOptions = cases.map((c) => ({
    id: c.id,
    label: `${c.id} – ${c.name}`
  }));

  const personOptions = existingPersons.map((p) => ({
    id: p.name || p.id,
    label: p.name || p.id,
    sub: p.roleInCase || 'Person'
  }));

  const phoneOptions = existingPhones.map((p) => ({
    id: p.name || p.phoneNumber || p.id,
    label: p.name || p.phoneNumber || p.id,
    sub: 'Phone / CDR'
  }));

  const locationOptions = existingLocations.map((l) => ({
    id: l.name || l.id,
    label: l.name || l.id,
    sub: l.address || 'Location'
  }));

  const financialOptions = existingFinancials.map((f) => ({
    id: f.transactionId || f.name || f.id,
    label: f.transactionId || f.name || f.id,
    sub: `${f.currency || 'INR'} ${f.transactionAmount || 'Financial'}`
  }));

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const formattedSize =
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${(file.size / 1024).toFixed(1)} KB`;

      setFormData((prev) => ({
        ...prev,
        fileName: file.name,
        fileSize: formattedSize,
        sha256Hash: 'Calculating cryptographic hash...'
      }));

      try {
        const hash = await computeFileSHA256(file);
        setFormData((prev) => ({
          ...prev,
          sha256Hash: hash
        }));
      } catch (err) {
        setFormData((prev) => ({
          ...prev,
          sha256Hash: 'Hash unavailable (file reading restricted)'
        }));
      }
    }
  };

  const removeFile = () => {
    setFormData((prev) => ({
      ...prev,
      fileName: '',
      fileSize: '',
      sha256Hash: ''
    }));
  };

  const chainList = Array.isArray(formData.chainOfCustody)
    ? formData.chainOfCustody
    : [];

  const addChainStep = () => {
    const today = new Date().toISOString().split('T')[0];
    const newStep = {
      date: today,
      handler: 'Insp. A. Sharma',
      action: 'Seized & Transferred to Forensic Evidence Locker'
    };
    setFormData((prev) => ({
      ...prev,
      chainOfCustody: [...chainList, newStep]
    }));
  };

  const updateChainStep = (index, field, value) => {
    const updated = chainList.map((step, idx) =>
      idx === index ? { ...step, [field]: value } : step
    );
    setFormData((prev) => ({ ...prev, chainOfCustody: updated }));
  };

  const removeChainStep = (index) => {
    setFormData((prev) => ({
      ...prev,
      chainOfCustody: chainList.filter((_, idx) => idx !== index)
    }));
  };

  return (
    <div className="space-y-3">
      {/* Integrity notice */}
      <div className="p-2.5 bg-[#F2F7FC] border border-[#B9D7F2] rounded-md text-xs text-[#243447] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#3478C9] shrink-0" />
          <span>
            <strong>Digital Forensics Safeguard:</strong> Genuine Web Crypto SHA-256 hashes are calculated on upload to guarantee chain-of-custody data integrity.
          </span>
        </div>
      </div>

      <EvidenceInputTable>
        {/* Row 1: Evidence ID */}
        <EvidenceTableRow
          no={1}
          parameter="Evidence ID"
          subtitle="Automatically generated evidence locker identifier"
          status="automatic"
        >
          <input
            type="text"
            value={formData.id || ''}
            readOnly
            className="w-full px-3 py-1.5 text-xs font-mono font-bold bg-[#F2F7FC] text-[#2866AE] border border-[#CBD5E1] rounded cursor-not-allowed"
          />
        </EvidenceTableRow>

        {/* Row 2: Evidence Title */}
        <EvidenceTableRow
          no={2}
          parameter="Evidence Title"
          subtitle="Descriptive title of document or digital artifact"
          status="compulsory"
          error={errors.name}
        >
          <input
            type="text"
            placeholder="e.g., B/L #88219-IN Falsified Customs Manifest / Seized USB"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`w-full px-3 py-1.5 text-xs bg-white border rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] ${
              errors.name ? 'border-red-400 ring-1 ring-red-400 bg-red-50/20' : 'border-[#CBD5E1]'
            }`}
          />
        </EvidenceTableRow>

        {/* Row 3: Evidence Type */}
        <EvidenceTableRow
          no={3}
          parameter="Evidence Type"
          subtitle="Format category of seized or received evidence"
          status="compulsory"
          error={errors.evidenceType}
        >
          <select
            value={formData.evidenceType || formData.documentType || 'PDF'}
            onChange={(e) =>
              setFormData({
                ...formData,
                evidenceType: e.target.value,
                documentType: e.target.value
              })
            }
            className="w-full sm:w-60 px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] cursor-pointer"
          >
            {DOCUMENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </EvidenceTableRow>

        {/* Row 4: File Upload */}
        <EvidenceTableRow
          no={4}
          parameter="File Upload"
          subtitle="Digital document, video, or seized storage dump"
          status="compulsory"
          error={errors.file}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
            <label className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F2F7FC] border border-[#CBD5E1] rounded text-xs font-semibold text-[#243447] hover:bg-[#EAF4FC] hover:border-[#3478C9] cursor-pointer shrink-0 transition-colors">
              <UploadCloud className="w-3.5 h-3.5 text-[#3478C9]" />
              Select File to Upload
              <input type="file" onChange={handleFileChange} className="hidden" />
            </label>

            {formData.fileName ? (
              <div className="flex items-center gap-2 p-1 px-2.5 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-900 truncate">
                <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold truncate max-w-xs">{formData.fileName}</span>
                <span className="text-[10px] text-emerald-700 shrink-0">({formData.fileSize})</span>
                <button
                  type="button"
                  onClick={removeFile}
                  className="text-emerald-700 hover:text-red-600 p-0.5 ml-1"
                  title="Remove uploaded file"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <span className="text-[11px] text-[#64748B]">No file selected (required)</span>
            )}
          </div>
        </EvidenceTableRow>

        {/* Row 5: Description */}
        <EvidenceTableRow
          no={5}
          parameter="Description"
          subtitle="Summary of contents, physical label, or visible markings"
          status="optional"
        >
          <textarea
            rows={2}
            placeholder="Document contents overview, forensic tags, manufacturer serial on chassis..."
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
          />
        </EvidenceTableRow>

        {/* Row 6: Associated Case */}
        <EvidenceTableRow
          no={6}
          parameter="Associated Case"
          subtitle="Case dossier file to which this evidence belongs"
          status="compulsory"
          error={errors.caseId}
        >
          <SearchableSelect
            options={caseOptions}
            value={formData.caseId || ''}
            onChange={(val) => setFormData({ ...formData, caseId: val })}
            placeholder="Select associated case..."
            error={errors.caseId}
          />
        </EvidenceTableRow>

        {/* Row 7: Collected By */}
        <EvidenceTableRow
          no={7}
          parameter="Collected By"
          subtitle="Investigating officer, cyber analyst, or seizing personnel"
          status="compulsory"
          error={errors.collectedBy}
        >
          <input
            type="text"
            placeholder="e.g., Insp. A. Sharma / Cyber Forensics Cell"
            value={formData.collectedBy || ''}
            onChange={(e) => setFormData({ ...formData, collectedBy: e.target.value })}
            className={`w-full px-3 py-1.5 text-xs bg-white border rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] ${
              errors.collectedBy ? 'border-red-400 ring-1 ring-red-400' : 'border-[#CBD5E1]'
            }`}
          />
        </EvidenceTableRow>

        {/* Row 8: Collection Date */}
        <EvidenceTableRow
          no={8}
          parameter="Collection Date"
          subtitle="Actual date when item was seized or received"
          status="compulsory"
          error={errors.collectionDate}
        >
          <input
            type="date"
            value={formData.collectionDate || formData.dateAdded || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                collectionDate: e.target.value,
                dateAdded: e.target.value
              })
            }
            className={`w-full sm:w-56 px-3 py-1.5 text-xs bg-white border rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] ${
              errors.collectionDate ? 'border-red-400 ring-1 ring-red-400' : 'border-[#CBD5E1]'
            }`}
          />
        </EvidenceTableRow>

        {/* Row 9: Collection Time */}
        <EvidenceTableRow
          no={9}
          parameter="Collection Time"
          subtitle="Seizure or receipt timestamp"
          status="optional"
        >
          <input
            type="time"
            value={formData.collectionTime || ''}
            onChange={(e) => setFormData({ ...formData, collectionTime: e.target.value })}
            className="w-full sm:w-48 px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
          />
        </EvidenceTableRow>

        {/* Row 10: Collection Source */}
        <EvidenceTableRow
          no={10}
          parameter="Collection Source"
          subtitle="Premises, vehicle, or lawful proceeding where acquired"
          status="compulsory"
          error={errors.source}
        >
          <input
            type="text"
            placeholder="e.g., Seized from Pier 14 Warehouse Premises, Search Warrant #2026/89"
            value={formData.source || ''}
            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
            className={`w-full px-3 py-1.5 text-xs bg-white border rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] ${
              errors.source ? 'border-red-400 ring-1 ring-red-400 bg-red-50/20' : 'border-[#CBD5E1]'
            }`}
          />
        </EvidenceTableRow>

        {/* Row 11: Related Persons */}
        <EvidenceTableRow
          no={11}
          parameter="Related Persons"
          subtitle="Individuals referenced or linked in this document"
          status="optional"
        >
          <MultiSelect
            options={personOptions}
            value={formData.relatedPersons || []}
            onChange={(val) => setFormData({ ...formData, relatedPersons: val })}
            placeholder="Link related persons..."
          />
        </EvidenceTableRow>

        {/* Row 12: Related Phone Numbers */}
        <EvidenceTableRow
          no={12}
          parameter="Related Phone Numbers"
          subtitle="Phone numbers logged or extracted"
          status="optional"
        >
          <MultiSelect
            options={phoneOptions}
            value={formData.relatedPhoneNumbers || []}
            onChange={(val) => setFormData({ ...formData, relatedPhoneNumbers: val })}
            placeholder="Link related phone numbers..."
          />
        </EvidenceTableRow>

        {/* Row 13: Related Locations */}
        <EvidenceTableRow
          no={13}
          parameter="Related Locations"
          subtitle="Physical sites or coordinates cited"
          status="optional"
        >
          <MultiSelect
            options={locationOptions}
            value={formData.relatedLocations || []}
            onChange={(val) => setFormData({ ...formData, relatedLocations: val })}
            placeholder="Link related locations..."
          />
        </EvidenceTableRow>

        {/* Row 14: Related Financial Records */}
        <EvidenceTableRow
          no={14}
          parameter="Related Financial Records"
          subtitle="Bank transactions or receipts mentioned"
          status="optional"
        >
          <MultiSelect
            options={financialOptions}
            value={formData.relatedFinancialRecords || []}
            onChange={(val) => setFormData({ ...formData, relatedFinancialRecords: val })}
            placeholder="Link related transactions..."
          />
        </EvidenceTableRow>

        {/* Row 15: SHA-256 File Hash */}
        <EvidenceTableRow
          no={15}
          parameter="SHA-256 File Hash"
          subtitle="Cryptographic checksum computed via Web Crypto API"
          status="automatic"
        >
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#3478C9] shrink-0" />
            <input
              type="text"
              value={formData.sha256Hash || 'Attach a file to calculate cryptographic hash'}
              readOnly
              className="w-full px-3 py-1.5 text-xs font-mono bg-[#F2F7FC] text-[#2866AE] border border-[#CBD5E1] rounded cursor-not-allowed select-all"
            />
          </div>
        </EvidenceTableRow>

        {/* Row 16: Chain of Custody */}
        <EvidenceTableRow
          no={16}
          parameter="Chain of Custody"
          subtitle="Document handling and evidence transfer log"
          status="optional"
        >
          <div className="space-y-2">
            {chainList.map((step, idx) => (
              <div
                key={idx}
                className="p-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded flex flex-col sm:flex-row items-start sm:items-center gap-2 text-xs"
              >
                <input
                  type="date"
                  value={step.date || ''}
                  onChange={(e) => updateChainStep(idx, 'date', e.target.value)}
                  className="w-36 px-2 py-1 text-xs bg-white border border-[#CBD5E1] rounded"
                />
                <input
                  type="text"
                  placeholder="Officer / Handler Name"
                  value={step.handler || ''}
                  onChange={(e) => updateChainStep(idx, 'handler', e.target.value)}
                  className="w-44 px-2 py-1 text-xs bg-white border border-[#CBD5E1] rounded"
                />
                <input
                  type="text"
                  placeholder="Action (e.g., Transferred to Forensic Lab)"
                  value={step.action || ''}
                  onChange={(e) => updateChainStep(idx, 'action', e.target.value)}
                  className="flex-1 px-2 py-1 text-xs bg-white border border-[#CBD5E1] rounded"
                />
                <button
                  type="button"
                  onClick={() => removeChainStep(idx)}
                  className="text-red-500 hover:text-red-700 p-1"
                  title="Remove chain transfer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addChainStep}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3478C9] hover:text-[#2866AE] py-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Chain-of-Custody Event
            </button>
          </div>
        </EvidenceTableRow>

        {/* Row 17: Review Status */}
        <EvidenceTableRow
          no={17}
          parameter="Review Status"
          subtitle="Defaults to Unreviewed until forensic examination"
          status="compulsory"
          error={errors.reviewStatus}
        >
          <select
            value={formData.reviewStatus || 'Unreviewed'}
            onChange={(e) => setFormData({ ...formData, reviewStatus: e.target.value })}
            className="w-full sm:w-60 px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] cursor-pointer"
          >
            {DOCUMENT_REVIEW_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </EvidenceTableRow>

        {/* Row 18: Investigator Notes */}
        <EvidenceTableRow
          no={18}
          parameter="Investigator Notes"
          subtitle="Analytical findings, highlighted passages, or follow-up forensic directives"
          status="optional"
        >
          <textarea
            rows={2}
            placeholder="Analytical notes on document authenticity, signatures, metadata timestamps, or follow-up directives..."
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
          />
        </EvidenceTableRow>
      </EvidenceInputTable>
    </div>
  );
};
