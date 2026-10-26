import React from 'react';
import { EvidenceInputTable, EvidenceTableRow } from '../EvidenceInputTable';
import { SearchableSelect } from '../SearchableSelect';
import { MultiSelect } from '../MultiSelect';
import { ORGANIZATION_TYPES, VERIFICATION_STATUSES } from '../../../constants/categories';
import { UploadCloud, FileCheck, X } from 'lucide-react';

export const OrganizationForm = ({
  formData,
  setFormData,
  errors = {},
  cases = [],
  existingPersons = [],
  existingFinancials = [],
  existingLocations = []
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

  const financialOptions = existingFinancials.map((f) => ({
    id: f.transactionId || f.name || f.id,
    label: f.transactionId || f.name || f.id,
    sub: `${f.currency || 'INR'} ${f.transactionAmount || 'Financial'}`
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
        {/* Row 1: Organization ID */}
        <EvidenceTableRow
          no={1}
          parameter="Organization ID"
          subtitle="Automatically generated organization ledger identifier"
          status="automatic"
        >
          <input
            type="text"
            value={formData.id || ''}
            readOnly
            className="w-full px-3 py-1.5 text-xs font-mono font-bold bg-[#F2F7FC] text-[#2866AE] border border-[#CBD5E1] rounded cursor-not-allowed"
          />
        </EvidenceTableRow>

        {/* Row 2: Organization Name */}
        <EvidenceTableRow
          no={2}
          parameter="Organization Name"
          subtitle="Registered commercial title, trade name, or corporate entity"
          status="compulsory"
          error={errors.name}
        >
          <input
            type="text"
            placeholder="e.g., Apex Freight Solutions / Pacific Marine Logistics"
            value={formData.name || formData.organizationName || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                name: e.target.value,
                organizationName: e.target.value
              })
            }
            className={`w-full px-3 py-1.5 text-xs bg-white border rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] ${
              errors.name ? 'border-red-400 ring-1 ring-red-400 bg-red-50/20' : 'border-[#CBD5E1]'
            }`}
          />
        </EvidenceTableRow>

        {/* Row 3: Organization Type */}
        <EvidenceTableRow
          no={3}
          parameter="Organization Type"
          subtitle="Corporate structure classification"
          status="compulsory"
          error={errors.organizationType}
        >
          <select
            value={formData.organizationType || 'Company'}
            onChange={(e) => setFormData({ ...formData, organizationType: e.target.value })}
            className="w-full sm:w-60 px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] cursor-pointer"
          >
            {ORGANIZATION_TYPES.map((ot) => (
              <option key={ot} value={ot}>
                {ot}
              </option>
            ))}
          </select>
        </EvidenceTableRow>

        {/* Row 4: Registration Number */}
        <EvidenceTableRow
          no={4}
          parameter="Registration Number / CIN"
          subtitle="Corporate Identification Number (CIN) or trade registration"
          status="optional"
        >
          <input
            type="text"
            placeholder="e.g., U74999MH2021PTC368921 / GSTIN 27AABCA1234F1Z5"
            value={formData.registrationNumber || ''}
            onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
            className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
          />
        </EvidenceTableRow>

        {/* Row 5: Registered Address */}
        <EvidenceTableRow
          no={5}
          parameter="Registered Address"
          subtitle="Registered headquarters or operational office premises"
          status="optional"
        >
          <input
            type="text"
            placeholder="Official registered office address per MCA filings"
            value={formData.registeredAddress || formData.address || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                registeredAddress: e.target.value,
                address: e.target.value
              })
            }
            className="w-full px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
          />
        </EvidenceTableRow>

        {/* Row 6: City */}
        <EvidenceTableRow
          no={6}
          parameter="City"
          subtitle="Registered city"
          status="optional"
        >
          <input
            type="text"
            placeholder="e.g., Mumbai"
            value={formData.city || ''}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full sm:w-64 px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
          />
        </EvidenceTableRow>

        {/* Row 7: State */}
        <EvidenceTableRow
          no={7}
          parameter="State"
          subtitle="Registered state jurisdiction"
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

        {/* Row 8: Contact Phone */}
        <EvidenceTableRow
          no={8}
          parameter="Contact Phone"
          subtitle="Official corporate telephone or reception desk"
          status="optional"
        >
          <input
            type="tel"
            placeholder="e.g., +91 22 2849 0192"
            value={formData.contactPhone || ''}
            onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
            className="w-full sm:w-64 px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
          />
        </EvidenceTableRow>

        {/* Row 9: Contact Email */}
        <EvidenceTableRow
          no={9}
          parameter="Contact Email"
          subtitle="Official company email address"
          status="optional"
        >
          <input
            type="email"
            placeholder="e.g., operations@apexlogistics.in"
            value={formData.contactEmail || ''}
            onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
            className="w-full sm:w-72 px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
          />
        </EvidenceTableRow>

        {/* Row 10: Associated Individuals */}
        <EvidenceTableRow
          no={10}
          parameter="Associated Individuals"
          subtitle="Managing directors, authorized signatories, partners, or employees"
          status="optional"
        >
          <MultiSelect
            options={personOptions}
            value={formData.associatedIndividuals || []}
            onChange={(val) => setFormData({ ...formData, associatedIndividuals: val })}
            placeholder="Link directors, partners, or signatories..."
          />
        </EvidenceTableRow>

        {/* Row 11: Related Financial Accounts */}
        <EvidenceTableRow
          no={11}
          parameter="Related Financial Accounts"
          subtitle="Known corporate banking transactions or accounts"
          status="optional"
        >
          <MultiSelect
            options={financialOptions}
            value={formData.relatedFinancialAccounts || []}
            onChange={(val) => setFormData({ ...formData, relatedFinancialAccounts: val })}
            placeholder="Link related financial transactions..."
          />
        </EvidenceTableRow>

        {/* Row 12: Related Locations */}
        <EvidenceTableRow
          no={12}
          parameter="Related Locations"
          subtitle="Known warehouses, distribution yards, or branch offices"
          status="optional"
        >
          <MultiSelect
            options={locationOptions}
            value={formData.relatedLocations || []}
            onChange={(val) => setFormData({ ...formData, relatedLocations: val })}
            placeholder="Link related operational locations..."
          />
        </EvidenceTableRow>

        {/* Row 13: Associated Case */}
        <EvidenceTableRow
          no={13}
          parameter="Associated Case"
          subtitle="Dossier to which this organization is linked"
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
          subtitle="Official provenance (Ministry of Corporate Affairs MCA-21, Commercial Tax Audit)"
          status="compulsory"
          error={errors.source}
        >
          <input
            type="text"
            placeholder="e.g., MCA-21 Company Master Data, GSTN Verification"
            value={formData.source || ''}
            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
            className={`w-full px-3 py-1.5 text-xs bg-white border rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] ${
              errors.source ? 'border-red-400 ring-1 ring-red-400 bg-red-50/20' : 'border-[#CBD5E1]'
            }`}
          />
        </EvidenceTableRow>

        {/* Row 15: Supporting Documents */}
        <EvidenceTableRow
          no={15}
          parameter="Supporting Documents"
          subtitle="Certificate of Incorporation, MOA/AOA, or GST certificate"
          status="optional"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
            <label className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F2F7FC] border border-[#CBD5E1] rounded text-xs font-semibold text-[#243447] hover:bg-[#EAF4FC] hover:border-[#3478C9] cursor-pointer shrink-0 transition-colors">
              <UploadCloud className="w-3.5 h-3.5 text-[#3478C9]" />
              Upload Document
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
              <span className="text-[11px] text-[#64748B]">No document attached (optional)</span>
            )}
          </div>
        </EvidenceTableRow>

        {/* Row 16: Verification Status */}
        <EvidenceTableRow
          no={16}
          parameter="Verification Status"
          subtitle="Defaults to Unverified until corporate registration verification"
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
          subtitle="Shell company indicators, layered shareholding, common directorships"
          status="optional"
        >
          <textarea
            rows={2}
            placeholder="Analytical observations, dummy directors, cross-corporate guarantees, or tax evasion leads..."
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
          />
        </EvidenceTableRow>
      </EvidenceInputTable>
    </div>
  );
};
