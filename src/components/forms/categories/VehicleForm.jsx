import React from 'react';
import { EvidenceInputTable, EvidenceTableRow } from '../EvidenceInputTable';
import { SearchableSelect } from '../SearchableSelect';
import { VEHICLE_TYPES, VERIFICATION_STATUSES } from '../../../constants/categories';
import { UploadCloud, FileCheck, X } from 'lucide-react';

export const VehicleForm = ({
  formData,
  setFormData,
  errors = {},
  cases = [],
  existingPersons = [],
  existingLocations = [],
  existingOrganizations = []
}) => {
  const caseOptions = cases.map((c) => ({
    id: c.id,
    label: `${c.id} – ${c.name}`
  }));

  const ownerOptions = [
    ...existingPersons.map((p) => ({
      id: p.name || p.id,
      label: `${p.name || p.id} (Person)`
    })),
    ...existingOrganizations.map((o) => ({
      id: o.name || o.id,
      label: `${o.name || o.id} (Organization)`
    }))
  ];

  const personOptions = existingPersons.map((p) => ({
    id: p.name || p.id,
    label: p.name || p.id,
    sub: p.roleInCase || 'Person'
  }));

  const locationOptions = existingLocations.map((l) => ({
    id: l.name || l.id,
    label: l.name || l.id,
    sub: l.address || 'Location'
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
      <EvidenceInputTable>
        {/* Row 1: Vehicle ID */}
        <EvidenceTableRow
          no={1}
          parameter="Vehicle ID"
          subtitle="Automatically generated vehicle record identifier"
          status="automatic"
        >
          <input
            type="text"
            value={formData.id || ''}
            readOnly
            className="w-full px-3 py-1.5 text-xs font-mono font-bold bg-[#F2F7FC] text-[#2866AE] border border-[#CBD5E1] rounded cursor-not-allowed"
          />
        </EvidenceTableRow>

        {/* Row 2: Registration Number */}
        <EvidenceTableRow
          no={2}
          parameter="Registration Number"
          subtitle="License plate number (at least one identifier required)"
          status="compulsory"
          statusLabel="Compulsory *"
          error={errors.registrationNumber}
        >
          <input
            type="text"
            placeholder="e.g., MH-02-BZ-4819"
            value={formData.registrationNumber || formData.name || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                registrationNumber: e.target.value,
                name: e.target.value
              })
            }
            className={`w-full px-3 py-1.5 text-xs bg-white border rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] ${
              errors.registrationNumber ? 'border-red-400 ring-1 ring-red-400 bg-red-50/20' : 'border-[#CBD5E1]'
            }`}
          />
        </EvidenceTableRow>

        {/* Row 3: Other Vehicle Identifier */}
        <EvidenceTableRow
          no={3}
          parameter="Other Vehicle Identifier"
          subtitle="Alternative valid identifier (Chassis / Engine / VIN #)"
          status="optional"
        >
          <input
            type="text"
            placeholder="e.g., VIN: MAT884920194821 / Chassis #CH-4491"
            value={formData.otherIdentifier || ''}
            onChange={(e) => setFormData({ ...formData, otherIdentifier: e.target.value })}
            className="w-full px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
          />
        </EvidenceTableRow>

        {/* Row 4: Vehicle Type */}
        <EvidenceTableRow
          no={4}
          parameter="Vehicle Type"
          subtitle="Classification of vehicle or vessel"
          status="optional"
        >
          <select
            value={formData.vehicleType || 'Two-Wheeler'}
            onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
            className="w-full sm:w-64 px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] cursor-pointer"
          >
            {VEHICLE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </EvidenceTableRow>

        {/* Row 5: Make */}
        <EvidenceTableRow
          no={5}
          parameter="Make"
          subtitle="Manufacturer / Brand"
          status="optional"
        >
          <input
            type="text"
            placeholder="e.g., Tata, Toyota, Mahindra, Ashok Leyland"
            value={formData.make || ''}
            onChange={(e) => setFormData({ ...formData, make: e.target.value })}
            className="w-full sm:w-64 px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
          />
        </EvidenceTableRow>

        {/* Row 6: Model */}
        <EvidenceTableRow
          no={6}
          parameter="Model"
          subtitle="Model variant or commercial specification"
          status="optional"
        >
          <input
            type="text"
            placeholder="e.g., Innova Crysta, Signa 4825.T, Bolero Camper"
            value={formData.model || ''}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            className="w-full sm:w-64 px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
          />
        </EvidenceTableRow>

        {/* Row 7: Colour */}
        <EvidenceTableRow
          no={7}
          parameter="Colour"
          subtitle="Observed or registered paint color"
          status="optional"
        >
          <input
            type="text"
            placeholder="e.g., White / Silver / Dark Navy"
            value={formData.colour || ''}
            onChange={(e) => setFormData({ ...formData, colour: e.target.value })}
            className="w-full sm:w-48 px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
          />
        </EvidenceTableRow>

        {/* Row 8: Registered Owner */}
        <EvidenceTableRow
          no={8}
          parameter="Registered Owner"
          subtitle="Owner per RTO registration or commercial title"
          status="optional"
        >
          <SearchableSelect
            options={ownerOptions}
            value={formData.registeredOwner || ''}
            onChange={(val) => setFormData({ ...formData, registeredOwner: val })}
            placeholder="Select registered owner or enter name..."
          />
        </EvidenceTableRow>

        {/* Row 9: Associated Person */}
        <EvidenceTableRow
          no={9}
          parameter="Associated Person"
          subtitle="Observed driver, courier, or custodian"
          status="optional"
        >
          <SearchableSelect
            options={personOptions}
            value={formData.associatedPerson || ''}
            onChange={(val) => setFormData({ ...formData, associatedPerson: val })}
            placeholder="Link associated driver or custodian..."
          />
        </EvidenceTableRow>

        {/* Row 10: Associated Location */}
        <EvidenceTableRow
          no={10}
          parameter="Associated Location"
          subtitle="Base garage, warehouse bay, or checkpoint where sighted"
          status="optional"
        >
          <SearchableSelect
            options={locationOptions}
            value={formData.associatedLocation || ''}
            onChange={(val) => setFormData({ ...formData, associatedLocation: val })}
            placeholder="Select associated location or checkpoint..."
          />
        </EvidenceTableRow>

        {/* Row 11: Observation Date */}
        <EvidenceTableRow
          no={11}
          parameter="Observation Date"
          subtitle="Date vehicle was sighted, impounded, or logged"
          status="optional"
        >
          <input
            type="date"
            value={formData.observationDate || ''}
            onChange={(e) => setFormData({ ...formData, observationDate: e.target.value })}
            className="w-full sm:w-56 px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
          />
        </EvidenceTableRow>

        {/* Row 12: Observation Time */}
        <EvidenceTableRow
          no={12}
          parameter="Observation Time"
          subtitle="Time of checkpoint transit or sighting"
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
          subtitle="Dossier to which this vehicle record is assigned"
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
          subtitle="Official provenance (RTO Registry, Toll Gate ANPR, Checkpost Sighting)"
          status="compulsory"
          error={errors.source}
        >
          <input
            type="text"
            placeholder="e.g., RTO Database Maharashtra, Vashi Toll Plaza ANPR Camera #02"
            value={formData.source || ''}
            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
            className={`w-full px-3 py-1.5 text-xs bg-white border rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] ${
              errors.source ? 'border-red-400 ring-1 ring-red-400 bg-red-50/20' : 'border-[#CBD5E1]'
            }`}
          />
        </EvidenceTableRow>

        {/* Row 15: Supporting Photograph / Document */}
        <EvidenceTableRow
          no={15}
          parameter="Supporting Photograph / Document"
          subtitle="Vehicle snapshot, RC certificate, or toll receipt"
          status="optional"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
            <label className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F2F7FC] border border-[#CBD5E1] rounded text-xs font-semibold text-[#243447] hover:bg-[#EAF4FC] hover:border-[#3478C9] cursor-pointer shrink-0 transition-colors">
              <UploadCloud className="w-3.5 h-3.5 text-[#3478C9]" />
              Upload Photo / RC
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
          subtitle="Defaults to Unverified until RTO verification or physical seizure"
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
          subtitle="Modifications, concealed compartments, unusual route patterns"
          status="optional"
        >
          <textarea
            rows={2}
            placeholder="Analytical notes on vehicle tracking, hidden compartments, false license plates, or transport routes..."
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
          />
        </EvidenceTableRow>
      </EvidenceInputTable>
    </div>
  );
};
