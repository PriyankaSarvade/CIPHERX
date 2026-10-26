import React from 'react';
import { EvidenceInputTable, EvidenceTableRow } from '../EvidenceInputTable';
import { SearchableSelect } from '../SearchableSelect';
import { LOCATION_TYPES, VERIFICATION_STATUSES } from '../../../constants/categories';
import { UploadCloud, FileCheck, X } from 'lucide-react';

export const LocationForm = ({
  formData,
  setFormData,
  errors = {},
  cases = [],
  existingEntities = []
}) => {
  const caseOptions = cases.map((c) => ({
    id: c.id,
    label: `${c.id} – ${c.name}`
  }));

  const entityOptions = existingEntities.map((e) => ({
    id: e.name || e.id,
    label: e.name || e.id,
    sub: `${e.category} (${e.id})`
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

  const isAddressUnavailable = !!formData.addressUnavailable;

  return (
    <div className="space-y-3">
      <EvidenceInputTable>
        {/* Row 1: Location ID */}
        <EvidenceTableRow
          no={1}
          parameter="Location ID"
          subtitle="Automatically generated spatial identifier"
          status="automatic"
        >
          <input
            type="text"
            value={formData.id || ''}
            readOnly
            className="w-full px-3 py-1.5 text-xs font-mono font-bold bg-[#F2F7FC] text-[#2866AE] border border-[#CBD5E1] rounded cursor-not-allowed"
          />
        </EvidenceTableRow>

        {/* Row 2: Location Name */}
        <EvidenceTableRow
          no={2}
          parameter="Location Name"
          subtitle="Primary site, landmark, or premise name"
          status="compulsory"
          error={errors.name}
        >
          <input
            type="text"
            placeholder="e.g., Pier 14 Warehouse / Bandra Commercial Complex"
            value={formData.name || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                name: e.target.value,
                locationName: e.target.value
              })
            }
            className={`w-full px-3 py-1.5 text-xs bg-white border rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] ${
              errors.name ? 'border-red-400 ring-1 ring-red-400 bg-red-50/20' : 'border-[#CBD5E1]'
            }`}
          />
        </EvidenceTableRow>

        {/* Row 3: Location Type */}
        <EvidenceTableRow
          no={3}
          parameter="Location Type"
          subtitle="Residence, Business, Incident Point, or Public Place"
          status="compulsory"
          error={errors.locationType}
        >
          <select
            value={formData.locationType || 'Incident Location'}
            onChange={(e) => setFormData({ ...formData, locationType: e.target.value })}
            className="w-full sm:w-64 px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] cursor-pointer"
          >
            {LOCATION_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </EvidenceTableRow>

        {/* Row 4: Address */}
        <EvidenceTableRow
          no={4}
          parameter="Address"
          subtitle="Physical street address (or mark explicit unavailable status)"
          status="compulsory"
          error={errors.address}
        >
          <div className="space-y-1.5">
            <input
              type="text"
              placeholder="Street address, building number, plot / dock reference"
              value={isAddressUnavailable ? 'Address unavailable' : (formData.address || '')}
              disabled={isAddressUnavailable}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className={`w-full px-3 py-1.5 text-xs bg-white border rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] ${
                isAddressUnavailable
                  ? 'bg-slate-100 text-slate-500 cursor-not-allowed border-[#CBD5E1]'
                  : errors.address
                  ? 'border-red-400 ring-1 ring-red-400'
                  : 'border-[#CBD5E1]'
              }`}
            />
            <label className="inline-flex items-center gap-1.5 text-[11px] text-[#64748B] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isAddressUnavailable}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    addressUnavailable: e.target.checked,
                    address: e.target.checked ? 'Address unavailable' : ''
                  }))
                }
                className="w-3.5 h-3.5 rounded text-[#3478C9] focus:ring-[#3478C9] cursor-pointer"
              />
              <span>Mark address as currently unavailable / unknown</span>
            </label>
          </div>
        </EvidenceTableRow>

        {/* Row 5: City */}
        <EvidenceTableRow
          no={5}
          parameter="City"
          subtitle="Municipality or district"
          status="optional"
        >
          <input
            type="text"
            placeholder="e.g., Navi Mumbai"
            value={formData.city || ''}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full sm:w-64 px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
          />
        </EvidenceTableRow>

        {/* Row 6: State */}
        <EvidenceTableRow
          no={6}
          parameter="State"
          subtitle="State / Province"
          status="optional"
        >
          <input
            type="text"
            placeholder="e.g., Maharashtra"
            value={formData.state || ''}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            className="w-full sm:w-64 px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
          />
        </EvidenceTableRow>

        {/* Row 7: Postal Code */}
        <EvidenceTableRow
          no={7}
          parameter="Postal Code"
          subtitle="PIN code / ZIP"
          status="optional"
        >
          <input
            type="text"
            placeholder="e.g., 400703"
            value={formData.postalCode || ''}
            onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
            className="w-full sm:w-48 px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
          />
        </EvidenceTableRow>

        {/* Row 8: Latitude */}
        <EvidenceTableRow
          no={8}
          parameter="Latitude"
          subtitle="Geographic latitude coordinate in decimal degrees"
          status="optional"
        >
          <input
            type="text"
            placeholder="e.g., 18.9498"
            value={formData.latitude || ''}
            onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
            className="w-full sm:w-48 px-3 py-1.5 text-xs font-mono bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
          />
        </EvidenceTableRow>

        {/* Row 9: Longitude */}
        <EvidenceTableRow
          no={9}
          parameter="Longitude"
          subtitle="Geographic longitude coordinate in decimal degrees"
          status="optional"
        >
          <input
            type="text"
            placeholder="e.g., 72.8534"
            value={formData.longitude || ''}
            onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
            className="w-full sm:w-48 px-3 py-1.5 text-xs font-mono bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
          />
        </EvidenceTableRow>

        {/* Row 10: Associated Person or Entity */}
        <EvidenceTableRow
          no={10}
          parameter="Associated Person or Entity"
          subtitle="Registered tenant, owner, or observed occupant"
          status="optional"
        >
          <SearchableSelect
            options={entityOptions}
            value={formData.associatedEntity || ''}
            onChange={(val) => setFormData({ ...formData, associatedEntity: val })}
            placeholder="Link associated person, company, or vehicle..."
          />
        </EvidenceTableRow>

        {/* Row 11: Observation Date */}
        <EvidenceTableRow
          no={11}
          parameter="Observation Date"
          subtitle="Date when location was observed or identified"
          status="compulsory"
          error={errors.observationDate}
        >
          <input
            type="date"
            value={formData.observationDate || formData.dateAdded || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                observationDate: e.target.value,
                dateAdded: e.target.value
              })
            }
            className={`w-full sm:w-56 px-3 py-1.5 text-xs bg-white border rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] ${
              errors.observationDate ? 'border-red-400 ring-1 ring-red-400' : 'border-[#CBD5E1]'
            }`}
          />
        </EvidenceTableRow>

        {/* Row 12: Observation Time */}
        <EvidenceTableRow
          no={12}
          parameter="Observation Time"
          subtitle="Recorded time of physical visit or surveillance"
          status="optional"
        >
          <input
            type="time"
            value={formData.observationTime || ''}
            onChange={(e) => setFormData({ ...formData, observationTime: e.target.value })}
            className="w-full sm:w-48 px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
          />
        </EvidenceTableRow>

        {/* Row 13: Associated Case */}
        <EvidenceTableRow
          no={13}
          parameter="Associated Case"
          subtitle="Case file to which this location is tied"
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

        {/* Row 14: Information Source */}
        <EvidenceTableRow
          no={14}
          parameter="Information Source"
          subtitle="Official provenance (Port Registry, GPS Tag, Surveillance Memo)"
          status="compulsory"
          error={errors.source}
        >
          <input
            type="text"
            placeholder="e.g., Harbor Security Registry #402, Checkpost Camera"
            value={formData.source || ''}
            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
            className={`w-full px-3 py-1.5 text-xs bg-white border rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] ${
              errors.source ? 'border-red-400 ring-1 ring-red-400 bg-red-50/20' : 'border-[#CBD5E1]'
            }`}
          />
        </EvidenceTableRow>

        {/* Row 15: Supporting Evidence */}
        <EvidenceTableRow
          no={15}
          parameter="Supporting Evidence"
          subtitle="Site photo, lease agreement, or verification memo"
          status="optional"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
            <label className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F2F7FC] border border-[#CBD5E1] rounded text-xs font-semibold text-[#243447] hover:bg-[#EAF4FC] hover:border-[#3478C9] cursor-pointer shrink-0 transition-colors">
              <UploadCloud className="w-3.5 h-3.5 text-[#3478C9]" />
              Upload Photo / Memo
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
                  title="Remove uploaded document"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <span className="text-[11px] text-[#64748B]">No photo attached (optional)</span>
            )}
          </div>
        </EvidenceTableRow>

        {/* Row 16: Verification Status */}
        <EvidenceTableRow
          no={16}
          parameter="Verification Status"
          subtitle="Defaults to Unverified until verified by physical inquiry"
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
          subtitle="Access restrictions, security shifts, CCTV coverage, staging bays"
          status="optional"
        >
          <textarea
            rows={2}
            placeholder="Security guards, entry checkpoints, vehicle docks, observation vantage points..."
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
          />
        </EvidenceTableRow>
      </EvidenceInputTable>
    </div>
  );
};
