import React from 'react';
import { EvidenceInputTable, EvidenceTableRow } from '../EvidenceInputTable';
import { SearchableSelect } from '../SearchableSelect';
import {
  COMMUNICATION_TYPES,
  COMMUNICATION_DIRECTIONS,
  VERIFICATION_STATUSES
} from '../../../constants/categories';
import { UploadCloud, FileCheck, X, PhoneCall } from 'lucide-react';

export const PhoneForm = ({
  formData,
  setFormData,
  errors = {},
  cases = [],
  existingPersons = []
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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const formattedSize =
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${(file.size / 1024).toFixed(1)} KB`;

      setFormData((prev) => ({
        ...prev,
        fileName: file.name,
        fileSize: formattedSize
      }));
    }
  };

  const removeFile = () => {
    setFormData((prev) => ({
      ...prev,
      fileName: '',
      fileSize: ''
    }));
  };

  return (
    <div className="space-y-3">
      {/* CDR Legal & Evidentiary Notice */}
      <div className="p-2.5 bg-[#F2F7FC] border border-[#B9D7F2] rounded-md text-xs text-[#243447] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PhoneCall className="w-4 h-4 text-[#3478C9] shrink-0" />
          <span>
            <strong>CDR Provenance Notice:</strong> Do not fabricate calls, timestamps, counterparties, or CDR results. A phone number without CDRs must not produce invented call history.
          </span>
        </div>
      </div>

      <EvidenceInputTable>
        {/* Row 1: Evidence ID */}
        <EvidenceTableRow
          no={1}
          parameter="Evidence ID"
          subtitle="Automatically generated tracking reference"
          status="automatic"
        >
          <input
            type="text"
            value={formData.id || ''}
            readOnly
            className="w-full px-3 py-1.5 text-xs font-mono font-bold bg-[#F2F7FC] text-[#2866AE] border border-[#CBD5E1] rounded cursor-not-allowed"
          />
        </EvidenceTableRow>

        {/* Row 2: Communication Record ID */}
        <EvidenceTableRow
          no={2}
          parameter="Communication Record ID"
          subtitle="External operator record reference (or auto internal ID)"
          status="compulsory"
          error={errors.phoneRecordId}
        >
          <input
            type="text"
            placeholder="e.g., CDR-2026-8812 / LOG-4401"
            value={formData.phoneRecordId || formData.id || ''}
            onChange={(e) => setFormData({ ...formData, phoneRecordId: e.target.value })}
            className={`w-full px-3 py-1.5 text-xs bg-white border rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] ${
              errors.phoneRecordId ? 'border-red-400 ring-1 ring-red-400' : 'border-[#CBD5E1]'
            }`}
          />
        </EvidenceTableRow>

        {/* Row 3: Associated Case */}
        <EvidenceTableRow
          no={3}
          parameter="Associated Case"
          subtitle="Case file to which this communication record is attached"
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

        {/* Row 4: Phone Number */}
        <EvidenceTableRow
          no={4}
          parameter="Phone Number"
          subtitle="Primary cellular, fixed line, or burner number"
          status="compulsory"
          error={errors.phoneNumber}
        >
          <input
            type="tel"
            placeholder="e.g., +91 98201 44521"
            value={formData.phoneNumber || formData.name || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                phoneNumber: e.target.value,
                name: e.target.value
              })
            }
            className={`w-full px-3 py-1.5 text-xs bg-white border rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] ${
              errors.phoneNumber ? 'border-red-400 ring-1 ring-red-400 bg-red-50/20' : 'border-[#CBD5E1]'
            }`}
          />
        </EvidenceTableRow>

        {/* Row 5: Associated Person */}
        <EvidenceTableRow
          no={5}
          parameter="Associated Person"
          subtitle="Optional until subscriber-to-person association is verified"
          status="optional"
        >
          <SearchableSelect
            options={personOptions}
            value={formData.associatedPerson || ''}
            onChange={(val) => setFormData({ ...formData, associatedPerson: val })}
            placeholder="Search & link registered person (optional)..."
          />
        </EvidenceTableRow>

        {/* Row 6: Other Phone Number / Counterparty */}
        <EvidenceTableRow
          no={6}
          parameter="Other Phone Number / Counterparty"
          subtitle="Compulsory for two-party communication present in source"
          status="compulsory"
          error={errors.counterparty}
        >
          <input
            type="text"
            placeholder="e.g., +91 98112 33490 (or B-Party identity)"
            value={formData.counterparty || formData.receiver || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                counterparty: e.target.value,
                receiver: e.target.value
              })
            }
            className={`w-full px-3 py-1.5 text-xs bg-white border rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] ${
              errors.counterparty ? 'border-red-400 ring-1 ring-red-400' : 'border-[#CBD5E1]'
            }`}
          />
        </EvidenceTableRow>

        {/* Row 7: Communication Type */}
        <EvidenceTableRow
          no={7}
          parameter="Communication Type"
          subtitle="Voice Call, SMS text message, or other modality"
          status="compulsory"
          error={errors.communicationType}
        >
          <select
            value={formData.communicationType || 'Call'}
            onChange={(e) => setFormData({ ...formData, communicationType: e.target.value })}
            className="w-full sm:w-60 px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] cursor-pointer"
          >
            {COMMUNICATION_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </EvidenceTableRow>

        {/* Row 8: Communication Direction */}
        <EvidenceTableRow
          no={8}
          parameter="Communication Direction"
          subtitle="Call transmission direction"
          status="optional"
        >
          <select
            value={formData.direction || 'Incoming'}
            onChange={(e) => setFormData({ ...formData, direction: e.target.value })}
            className="w-full sm:w-60 px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] cursor-pointer"
          >
            {COMMUNICATION_DIRECTIONS.map((dir) => (
              <option key={dir} value={dir}>
                {dir}
              </option>
            ))}
          </select>
        </EvidenceTableRow>

        {/* Row 9: Communication Date */}
        <EvidenceTableRow
          no={9}
          parameter="Communication Date"
          subtitle="Actual calendar date of the event"
          status="compulsory"
          error={errors.communicationDate}
        >
          <input
            type="date"
            value={formData.communicationDate || formData.dateAdded || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                communicationDate: e.target.value,
                dateAdded: e.target.value
              })
            }
            className={`w-full sm:w-56 px-3 py-1.5 text-xs bg-white border rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] ${
              errors.communicationDate ? 'border-red-400 ring-1 ring-red-400' : 'border-[#CBD5E1]'
            }`}
          />
        </EvidenceTableRow>

        {/* Row 10: Communication Time */}
        <EvidenceTableRow
          no={10}
          parameter="Communication Time"
          subtitle="Exact timestamp recorded by telecom switch"
          status="compulsory"
          error={errors.communicationTime}
        >
          <input
            type="time"
            value={formData.communicationTime || ''}
            onChange={(e) => setFormData({ ...formData, communicationTime: e.target.value })}
            className={`w-full sm:w-48 px-3 py-1.5 text-xs bg-white border rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] ${
              errors.communicationTime ? 'border-red-400 ring-1 ring-red-400' : 'border-[#CBD5E1]'
            }`}
          />
        </EvidenceTableRow>

        {/* Row 11: Call Duration */}
        <EvidenceTableRow
          no={11}
          parameter="Call Duration"
          subtitle="Duration in seconds (applicable to voice calls)"
          status="optional"
        >
          <input
            type="number"
            min="0"
            placeholder="e.g., 240 (seconds)"
            value={formData.callDuration !== undefined && formData.callDuration !== null ? formData.callDuration : ''}
            onChange={(e) => setFormData({ ...formData, callDuration: e.target.value })}
            className="w-full sm:w-48 px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
          />
        </EvidenceTableRow>

        {/* Row 12: Device Identifier */}
        <EvidenceTableRow
          no={12}
          parameter="Device Identifier"
          subtitle="Handset IMEI, IMSI, or MAC address"
          status="optional"
        >
          <input
            type="text"
            placeholder="e.g., IMEI: 869012049182391"
            value={formData.deviceIdentifier || ''}
            onChange={(e) => setFormData({ ...formData, deviceIdentifier: e.target.value })}
            className="w-full px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
          />
        </EvidenceTableRow>

        {/* Row 13: Communication Platform */}
        <EvidenceTableRow
          no={13}
          parameter="Communication Platform"
          subtitle="Telecom network or app (Cellular GSM, WhatsApp, Signal)"
          status="optional"
        >
          <input
            type="text"
            placeholder="e.g., Cellular GSM, Airtel, WhatsApp"
            value={formData.communicationPlatform || ''}
            onChange={(e) => setFormData({ ...formData, communicationPlatform: e.target.value })}
            className="w-full px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
          />
        </EvidenceTableRow>

        {/* Row 14: Source of Record */}
        <EvidenceTableRow
          no={14}
          parameter="Source of Record"
          subtitle="Official provenance (Subpoena #, Tower Dump, Handset Extraction)"
          status="compulsory"
          error={errors.source}
        >
          <input
            type="text"
            placeholder="e.g., Telecom CDR Subpoena #CDR-8812, Tower Dump"
            value={formData.source || ''}
            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
            className={`w-full px-3 py-1.5 text-xs bg-white border rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] ${
              errors.source ? 'border-red-400 ring-1 ring-red-400 bg-red-50/20' : 'border-[#CBD5E1]'
            }`}
          />
        </EvidenceTableRow>

        {/* Row 15: Supporting File / CDR Upload */}
        <EvidenceTableRow
          no={15}
          parameter="Supporting File / CDR Upload"
          subtitle="Lawfully obtained CDR spreadsheet, PDF export, or audio dump"
          status="optional"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
            <label className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F2F7FC] border border-[#CBD5E1] rounded text-xs font-semibold text-[#243447] hover:bg-[#EAF4FC] hover:border-[#3478C9] cursor-pointer shrink-0 transition-colors">
              <UploadCloud className="w-3.5 h-3.5 text-[#3478C9]" />
              Upload CDR / File
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
              <span className="text-[11px] text-[#64748B]">
                No CDR file uploaded (optional unless required by import workflow)
              </span>
            )}
          </div>
        </EvidenceTableRow>

        {/* Row 16: Verification Status */}
        <EvidenceTableRow
          no={16}
          parameter="Verification Status"
          subtitle="Defaults to Unverified until verified via telecom carrier"
          status="compulsory"
          error={errors.verificationStatus}
        >
          <select
            value={formData.verificationStatus || 'Unverified'}
            onChange={(e) => setFormData({ ...formData, verificationStatus: e.target.value })}
            className={`w-full sm:w-64 px-3 py-1.5 text-xs bg-white border rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] cursor-pointer ${
              errors.verificationStatus ? 'border-red-400 ring-1 ring-red-400' : 'border-[#CBD5E1]'
            }`}
          >
            {VERIFICATION_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </EvidenceTableRow>

        {/* Row 17: Investigator Notes */}
        <EvidenceTableRow
          no={17}
          parameter="Investigator Notes"
          subtitle="Unusual call frequencies, night timings, roaming cell tower hops"
          status="optional"
        >
          <textarea
            rows={2}
            placeholder="Analytical context, subscriber interactions, or follow-up telecom directives..."
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
          />
        </EvidenceTableRow>
      </EvidenceInputTable>
    </div>
  );
};
