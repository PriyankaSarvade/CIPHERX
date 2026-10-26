import React from 'react';
import { EvidenceInputTable, EvidenceTableRow } from '../EvidenceInputTable';
import { SearchableSelect } from '../SearchableSelect';
import { MultiInput } from '../MultiInput';
import { GENDERS, PERSON_ROLES, VERIFICATION_STATUSES } from '../../../constants/categories';
import { UploadCloud, FileCheck, X, PhoneCall, AlertCircle, Info } from 'lucide-react';

export const PersonForm = ({
  formData,
  setFormData,
  errors = {},
  cases = []
}) => {
  const caseOptions = cases.map((c) => ({
    id: c.id,
    label: `${c.id} – ${c.name}`
  }));

  const isPhoneInvestigation = !!formData.enablePhoneInvestigation;

  const handleIdDocChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const formattedSize =
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${(file.size / 1024).toFixed(1)} KB`;

      setFormData((prev) => ({
        ...prev,
        identityDocName: file.name,
        identityDocSize: formattedSize,
        fileName: file.name,
        fileSize: formattedSize
      }));
    }
  };

  const removeIdDoc = () => {
    setFormData((prev) => ({
      ...prev,
      identityDocName: '',
      identityDocSize: '',
      fileName: '',
      fileSize: ''
    }));
  };

  return (
    <div className="space-y-3">
      {/* Investigation Mode Selector Banner */}
      <div className="p-3 bg-[#F2F7FC] border border-[#B9D7F2] rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2">
          <PhoneCall className="w-4 h-4 text-[#3478C9] shrink-0" />
          <div>
            <span className="font-bold text-[#243447]">Phone-Based Investigation Mode:</span>
            <span className="text-[#64748B] ml-1.5">
              Toggle whether this person record requires CDR and telecom correlation
            </span>
          </div>
        </div>

        <label className="inline-flex items-center gap-2 cursor-pointer select-none bg-white px-3 py-1.5 rounded-md border border-[#D7E4F0] hover:border-[#3478C9] transition-colors">
          <input
            type="checkbox"
            checked={isPhoneInvestigation}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                enablePhoneInvestigation: e.target.checked
              }))
            }
            className="w-4 h-4 rounded text-[#3478C9] focus:ring-[#3478C9] cursor-pointer"
          />
          <span className="font-semibold text-xs text-[#243447]">
            Enable Phone-Based Investigation
          </span>
        </label>
      </div>

      {!isPhoneInvestigation && !formData.phoneNumber && (
        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-[#475569] flex items-center gap-2">
          <Info className="w-4 h-4 text-[#64748B] shrink-0" />
          <span>
            <strong>Basic Record Mode:</strong> Phone-based analysis is unavailable because no phone number has been recorded. You can still save the basic person dossier.
          </span>
        </div>
      )}

      {/* Editable Table */}
      <EvidenceInputTable>
        {/* Row 1: Person ID */}
        <EvidenceTableRow
          no={1}
          parameter="Person ID"
          subtitle="Automatically generated unique identifier"
          status="automatic"
        >
          <input
            type="text"
            value={formData.id || ''}
            readOnly
            className="w-full px-3 py-1.5 text-xs font-mono font-bold bg-[#F2F7FC] text-[#2866AE] border border-[#CBD5E1] rounded cursor-not-allowed"
          />
        </EvidenceTableRow>

        {/* Row 2: Full Name */}
        <EvidenceTableRow
          no={2}
          parameter="Full Name"
          subtitle="Primary individual identifier"
          status="compulsory"
          error={errors.name}
        >
          <input
            type="text"
            placeholder="Enter full legal name of individual"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`w-full px-3 py-1.5 text-xs bg-white border rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] ${
              errors.name ? 'border-red-400 ring-1 ring-red-400 bg-red-50/20' : 'border-[#CBD5E1]'
            }`}
          />
        </EvidenceTableRow>

        {/* Row 3: Primary Phone Number */}
        <EvidenceTableRow
          no={3}
          parameter="Primary Phone Number"
          subtitle={
            isPhoneInvestigation
              ? 'Compulsory for phone-based investigation'
              : 'Optional for basic person dossier'
          }
          status={isPhoneInvestigation ? 'compulsory' : 'optional'}
          statusLabel={isPhoneInvestigation ? 'Compulsory (Phone Analysis)' : 'Optional'}
          error={errors.phoneNumber}
        >
          <div className="space-y-1">
            <input
              type="tel"
              placeholder="e.g., +91 98201 44521"
              value={formData.phoneNumber || ''}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className={`w-full px-3 py-1.5 text-xs bg-white border rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] ${
                errors.phoneNumber
                  ? 'border-red-400 ring-1 ring-red-400 bg-red-50/20'
                  : 'border-[#CBD5E1]'
              }`}
            />
            {isPhoneInvestigation && !formData.phoneNumber && (
              <p className="text-[11px] text-amber-700">
                Enter a primary phone number to enable phone-based investigation.
              </p>
            )}
          </div>
        </EvidenceTableRow>

        {/* Row 4: Nickname / Alias */}
        <EvidenceTableRow
          no={4}
          parameter="Nickname / Alias"
          subtitle="Operational codename or street alias"
          status="optional"
        >
          <input
            type="text"
            placeholder="Known monikers or aliases (leave blank if none)"
            value={formData.alias || ''}
            onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
            className="w-full px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
          />
        </EvidenceTableRow>

        {/* Row 5: Aadhaar Card Number */}
        <EvidenceTableRow
          no={5}
          parameter="Aadhaar Card Number"
          subtitle="Indian National UID (optional, do not require for every person)"
          status="optional"
        >
          <input
            type="text"
            placeholder="e.g., 1234 5678 9012"
            value={formData.aadhaar || ''}
            onChange={(e) => setFormData({ ...formData, aadhaar: e.target.value })}
            className="w-full px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
          />
        </EvidenceTableRow>

        {/* Row 6: Identity Document */}
        <EvidenceTableRow
          no={6}
          parameter="Identity Document"
          subtitle="Lawfully available identity doc (PDF, JPG, PNG)"
          status="optional"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
            <label className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F2F7FC] border border-[#CBD5E1] rounded text-xs font-semibold text-[#243447] hover:bg-[#EAF4FC] hover:border-[#3478C9] cursor-pointer shrink-0 transition-colors">
              <UploadCloud className="w-3.5 h-3.5 text-[#3478C9]" />
              Choose File (PDF, JPG, PNG)
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleIdDocChange}
                className="hidden"
              />
            </label>

            {formData.identityDocName || formData.fileName ? (
              <div className="flex items-center gap-2 p-1 px-2.5 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-900 truncate">
                <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold truncate max-w-xs">
                  {formData.identityDocName || formData.fileName}
                </span>
                <span className="text-[10px] text-emerald-700 shrink-0">
                  ({formData.identityDocSize || formData.fileSize || 'Attached'})
                </span>
                <button
                  type="button"
                  onClick={removeIdDoc}
                  className="text-emerald-700 hover:text-red-600 p-0.5 ml-1"
                  title="Remove uploaded document"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <span className="text-[11px] text-[#64748B]">No file selected</span>
            )}
          </div>
        </EvidenceTableRow>

        {/* Row 7: Age */}
        <EvidenceTableRow
          no={7}
          parameter="Age"
          subtitle="Age in years if known"
          status="optional"
        >
          <input
            type="number"
            min="0"
            max="120"
            placeholder="e.g., 34"
            value={formData.age !== undefined && formData.age !== null ? formData.age : ''}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            className="w-full sm:w-48 px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
          />
        </EvidenceTableRow>

        {/* Row 8: Gender */}
        <EvidenceTableRow
          no={8}
          parameter="Gender"
          subtitle="Optional demographic parameter"
          status="optional"
        >
          <select
            value={formData.gender || ''}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            className="w-full sm:w-64 px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] cursor-pointer"
          >
            <option value="">Select gender (optional)...</option>
            {GENDERS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </EvidenceTableRow>

        {/* Row 9: Additional Phone Numbers */}
        <EvidenceTableRow
          no={9}
          parameter="Additional Phone Numbers"
          subtitle="Secondary cellular lines, satellite, or burner handsets"
          status="optional"
        >
          <MultiInput
            items={formData.phoneNumbers || []}
            onChange={(phones) => setFormData({ ...formData, phoneNumbers: phones })}
            placeholder="e.g., +91 98112 00192 (press Enter or Add)"
            type="tel"
          />
        </EvidenceTableRow>

        {/* Row 10: Residential Address */}
        <EvidenceTableRow
          no={10}
          parameter="Residential Address"
          subtitle="Known domicile or residence premises"
          status="optional"
        >
          <input
            type="text"
            placeholder="Flat / Building, Street, Area, City"
            value={formData.residentialAddress || formData.address || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                residentialAddress: e.target.value,
                address: e.target.value
              })
            }
            className="w-full px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
          />
        </EvidenceTableRow>

        {/* Row 11: Office Address */}
        <EvidenceTableRow
          no={11}
          parameter="Office Address"
          subtitle="Commercial or employment office premises"
          status="optional"
        >
          <input
            type="text"
            placeholder="Office name, commercial tower, plot, city"
            value={formData.officeAddress || ''}
            onChange={(e) => setFormData({ ...formData, officeAddress: e.target.value })}
            className="w-full px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
          />
        </EvidenceTableRow>

        {/* Row 12: Email Address */}
        <EvidenceTableRow
          no={12}
          parameter="Email Address"
          subtitle="Electronic mail contact identifier"
          status="optional"
        >
          <input
            type="email"
            placeholder="e.g., person@enterprise.com"
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
          />
        </EvidenceTableRow>

        {/* Row 13: Role in Case */}
        <EvidenceTableRow
          no={13}
          parameter="Role in Case"
          subtitle="Standing in case (do not automatically classify as guilty)"
          status="compulsory"
          error={errors.roleInCase}
        >
          <select
            value={formData.roleInCase || 'Other Person of Interest'}
            onChange={(e) => setFormData({ ...formData, roleInCase: e.target.value })}
            className={`w-full sm:w-72 px-3 py-1.5 text-xs bg-white border rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] cursor-pointer ${
              errors.roleInCase ? 'border-red-400 ring-1 ring-red-400' : 'border-[#CBD5E1]'
            }`}
          >
            {PERSON_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </EvidenceTableRow>

        {/* Row 14: Associated Case */}
        <EvidenceTableRow
          no={14}
          parameter="Associated Case"
          subtitle="Case dossier file to which this individual belongs"
          status="compulsory"
          error={errors.caseId}
        >
          <SearchableSelect
            options={caseOptions}
            value={formData.caseId || ''}
            onChange={(val) => setFormData({ ...formData, caseId: val })}
            placeholder="Search and select case..."
            error={errors.caseId}
          />
        </EvidenceTableRow>

        {/* Row 15: Information Source */}
        <EvidenceTableRow
          no={15}
          parameter="Information Source"
          subtitle="Where this information originated (filings, statements, logs)"
          status="compulsory"
          error={errors.source}
        >
          <input
            type="text"
            placeholder="e.g., Corporate Filings #ROC-409, Witness Statement, Surveillance Log"
            value={formData.source || ''}
            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
            className={`w-full px-3 py-1.5 text-xs bg-white border rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] ${
              errors.source ? 'border-red-400 ring-1 ring-red-400 bg-red-50/20' : 'border-[#CBD5E1]'
            }`}
          />
        </EvidenceTableRow>

        {/* Row 16: Description */}
        <EvidenceTableRow
          no={16}
          parameter="Description"
          subtitle="Identifying marks, features, or habitual attire"
          status="optional"
        >
          <textarea
            rows={2}
            placeholder="Physical features, height, identifying scars, glasses, distinguishing attributes..."
            value={formData.physicalDescription || formData.description || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                physicalDescription: e.target.value,
                description: e.target.value
              })
            }
            className="w-full px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
          />
        </EvidenceTableRow>

        {/* Row 17: Investigator Notes */}
        <EvidenceTableRow
          no={17}
          parameter="Investigator Notes"
          subtitle="Investigative observations, alibis, or follow-up directives"
          status="optional"
        >
          <textarea
            rows={2}
            placeholder="Analytical notes, observed movements, business interests, or follow-up surveillance directives..."
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
          />
        </EvidenceTableRow>

        {/* Row 18: Verification Status */}
        <EvidenceTableRow
          no={18}
          parameter="Verification Status"
          subtitle="Default is Unverified until supported by corroborated records"
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
      </EvidenceInputTable>
    </div>
  );
};
