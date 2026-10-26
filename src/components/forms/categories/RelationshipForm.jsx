import React from 'react';
import { EvidenceInputTable, EvidenceTableRow } from '../EvidenceInputTable';
import { SearchableSelect } from '../SearchableSelect';
import { MultiSelect } from '../MultiSelect';
import {
  RELATIONSHIP_TYPES,
  RELATIONSHIP_REVIEW_STATUSES
} from '../../../constants/categories';
import { ArrowRight, GitFork } from 'lucide-react';

export const RelationshipForm = ({
  formData,
  setFormData,
  errors = {},
  cases = [],
  existingEntities = [],
  existingEvidence = []
}) => {
  const caseOptions = cases.map((c) => ({
    id: c.id,
    label: `${c.id} – ${c.name}`
  }));

  // Endpoint 1 options
  const firstEntityOptions = existingEntities.map((e) => ({
    id: e.name || e.id,
    label: e.name || e.id,
    sub: `${e.category} (${e.id})`
  }));

  // Endpoint 2 options: filter out First Entity to prevent self-referencing relationship loops
  const secondEntityOptions = existingEntities
    .filter((e) => {
      const eName = e.name || e.id;
      return eName !== formData.sourceEntityName;
    })
    .map((e) => ({
      id: e.name || e.id,
      label: e.name || e.id,
      sub: `${e.category} (${e.id})`
    }));

  const evidenceOptions = existingEvidence
    .filter((e) => e.category !== 'Relationships')
    .map((e) => ({
      id: `${e.id}: ${e.name}`,
      label: `${e.id} – ${e.name} (${e.category})`
    }));

  const handleFirstEntityChange = (val) => {
    const matched = existingEntities.find((e) => (e.name || e.id) === val);
    setFormData((prev) => ({
      ...prev,
      sourceEntityName: val,
      sourceEntityId: matched ? matched.id : '',
      name: `${val} ➔ ${prev.relationshipType || RELATIONSHIP_TYPES[0]} ➔ ${prev.targetEntityName || 'Target'}`
    }));
  };

  const handleSecondEntityChange = (val) => {
    const matched = existingEntities.find((e) => (e.name || e.id) === val);
    setFormData((prev) => ({
      ...prev,
      targetEntityName: val,
      targetEntityId: matched ? matched.id : '',
      name: `${prev.sourceEntityName || 'Source'} ➔ ${prev.relationshipType || RELATIONSHIP_TYPES[0]} ➔ ${val}`
    }));
  };

  const handleTypeChange = (typeVal) => {
    setFormData((prev) => ({
      ...prev,
      relationshipType: typeVal,
      name: `${prev.sourceEntityName || 'Source'} ➔ ${typeVal} ➔ ${prev.targetEntityName || 'Target'}`
    }));
  };

  return (
    <div className="space-y-3">
      {/* Visual Link Preview */}
      {(formData.sourceEntityName || formData.targetEntityName) && (
        <div className="p-3 bg-[#EAF4FC] rounded-lg border border-[#B9D7F2] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#243447] px-2.5 py-1 bg-white border border-[#D7E4F0] rounded">
              {formData.sourceEntityName || 'Select First Entity'}
            </span>
            <div className="flex items-center gap-1 font-semibold text-[#3478C9]">
              <ArrowRight className="w-4 h-4" />
              <span className="px-2 py-0.5 rounded bg-white/80 border border-[#B9D7F2]">
                {formData.relationshipType || RELATIONSHIP_TYPES[0]}
              </span>
              <ArrowRight className="w-4 h-4" />
            </div>
            <span className="font-bold text-[#243447] px-2.5 py-1 bg-white border border-[#D7E4F0] rounded">
              {formData.targetEntityName || 'Select Second Entity'}
            </span>
          </div>
          <span className="text-[10px] text-[#2866AE] font-semibold uppercase tracking-wider">
            Graph Link Preview
          </span>
        </div>
      )}

      <EvidenceInputTable>
        {/* Row 1: Relationship ID */}
        <EvidenceTableRow
          no={1}
          parameter="Relationship ID"
          subtitle="Automatically generated relationship identifier"
          status="automatic"
        >
          <input
            type="text"
            value={formData.id || ''}
            readOnly
            className="w-full px-3 py-1.5 text-xs font-mono font-bold bg-[#F2F7FC] text-[#2866AE] border border-[#CBD5E1] rounded cursor-not-allowed"
          />
        </EvidenceTableRow>

        {/* Row 2: First Entity */}
        <EvidenceTableRow
          no={2}
          parameter="First Entity"
          subtitle="Origin / Source entity in connection"
          status="compulsory"
          error={errors.sourceEntityName}
        >
          <SearchableSelect
            options={firstEntityOptions}
            value={formData.sourceEntityName || ''}
            onChange={handleFirstEntityChange}
            placeholder="Search & select first entity (person, phone, vehicle, org)..."
            error={errors.sourceEntityName}
          />
        </EvidenceTableRow>

        {/* Row 3: Relationship Type */}
        <EvidenceTableRow
          no={3}
          parameter="Relationship Type"
          subtitle="Classification of connection or evidentiary interaction"
          status="compulsory"
          error={errors.relationshipType}
        >
          <select
            value={formData.relationshipType || RELATIONSHIP_TYPES[0]}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="w-full sm:w-72 px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] cursor-pointer"
          >
            {RELATIONSHIP_TYPES.map((rt) => (
              <option key={rt} value={rt}>
                {rt}
              </option>
            ))}
          </select>
        </EvidenceTableRow>

        {/* Row 4: Second Entity */}
        <EvidenceTableRow
          no={4}
          parameter="Second Entity"
          subtitle="Target / Destination entity (cannot be identical to First Entity)"
          status="compulsory"
          error={errors.targetEntityName}
        >
          <SearchableSelect
            options={secondEntityOptions}
            value={formData.targetEntityName || ''}
            onChange={handleSecondEntityChange}
            placeholder="Search & select second entity (self-loops prevented)..."
            error={errors.targetEntityName}
          />
        </EvidenceTableRow>

        {/* Row 5: Associated Case */}
        <EvidenceTableRow
          no={5}
          parameter="Associated Case"
          subtitle="Case dossier to which this connection is attached"
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

        {/* Row 6: Supporting Evidence Reference */}
        <EvidenceTableRow
          no={6}
          parameter="Supporting Evidence Reference"
          subtitle="Select case evidence proving this link (CDR, CCTV, Bank Wire, Manifest)"
          status="compulsory"
          error={errors.supportingEvidence}
        >
          <MultiSelect
            options={evidenceOptions}
            value={formData.supportingEvidenceList || []}
            onChange={(val) => {
              setFormData({
                ...formData,
                supportingEvidenceList: val,
                supportingEvidence: val.join('; ')
              });
            }}
            placeholder="Select existing evidence item(s)..."
          />
        </EvidenceTableRow>

        {/* Row 7: Date First Observed */}
        <EvidenceTableRow
          no={7}
          parameter="Date First Observed"
          subtitle="Initial contact or earliest verified sighting date"
          status="optional"
        >
          <input
            type="date"
            value={formData.dateFirstObserved || ''}
            onChange={(e) => setFormData({ ...formData, dateFirstObserved: e.target.value })}
            className="w-full sm:w-56 px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
          />
        </EvidenceTableRow>

        {/* Row 8: Date Last Observed */}
        <EvidenceTableRow
          no={8}
          parameter="Date Last Observed"
          subtitle="Latest contact or most recent interaction date"
          status="optional"
        >
          <input
            type="date"
            value={formData.dateLastObserved || ''}
            onChange={(e) => setFormData({ ...formData, dateLastObserved: e.target.value })}
            className="w-full sm:w-56 px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
          />
        </EvidenceTableRow>

        {/* Row 9: Relationship Source */}
        <EvidenceTableRow
          no={9}
          parameter="Relationship Source"
          subtitle="Official reference (Subpoena #, Checkpost Log, Interrogation Deposition)"
          status="compulsory"
          error={errors.source}
        >
          <input
            type="text"
            placeholder="e.g., Airtel CDR Subpoena #8812 & Checkpost CCTV Footage"
            value={formData.source || ''}
            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
            className={`w-full px-3 py-1.5 text-xs bg-white border rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] ${
              errors.source ? 'border-red-400 ring-1 ring-red-400 bg-red-50/20' : 'border-[#CBD5E1]'
            }`}
          />
        </EvidenceTableRow>

        {/* Row 10: Relationship Description */}
        <EvidenceTableRow
          no={10}
          parameter="Relationship Description"
          subtitle="Summary narrative of interaction, contact frequency, or legal ownership"
          status="optional"
        >
          <textarea
            rows={2}
            placeholder="Contextual interaction summary, frequency of contact, co-ownership nature..."
            value={formData.relationshipDescription || ''}
            onChange={(e) => setFormData({ ...formData, relationshipDescription: e.target.value })}
            className="w-full px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
          />
        </EvidenceTableRow>

        {/* Row 11: Confidence Score */}
        <EvidenceTableRow
          no={11}
          parameter="Confidence Score"
          subtitle="Corroboration certainty percentage (0-100%, only when genuinely calculated)"
          status="optional"
        >
          <input
            type="number"
            min="0"
            max="100"
            placeholder="e.g., 95 (%)"
            value={formData.confidenceScore !== undefined ? formData.confidenceScore : ''}
            onChange={(e) => setFormData({ ...formData, confidenceScore: e.target.value })}
            className="w-full sm:w-48 px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
          />
        </EvidenceTableRow>

        {/* Row 12: Review Status */}
        <EvidenceTableRow
          no={12}
          parameter="Review Status"
          subtitle="Unreviewed, Suggested by AI, Confirmed by Investigator, Rejected"
          status="compulsory"
          error={errors.reviewStatus}
        >
          <select
            value={formData.reviewStatus || 'Confirmed by Investigator'}
            onChange={(e) => setFormData({ ...formData, reviewStatus: e.target.value })}
            className="w-full sm:w-64 px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] cursor-pointer"
          >
            {RELATIONSHIP_REVIEW_STATUSES.map((rs) => (
              <option key={rs} value={rs}>
                {rs}
              </option>
            ))}
          </select>
        </EvidenceTableRow>

        {/* Row 13: Reviewed By */}
        <EvidenceTableRow
          no={13}
          parameter="Reviewed By"
          subtitle="Authorized analyst or investigating officer"
          status="optional"
        >
          <input
            type="text"
            placeholder="e.g., Insp. A. Sharma"
            value={formData.reviewedBy || 'Insp. A. Sharma'}
            onChange={(e) => setFormData({ ...formData, reviewedBy: e.target.value })}
            className="w-full sm:w-64 px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
          />
        </EvidenceTableRow>

        {/* Row 14: Review Date */}
        <EvidenceTableRow
          no={14}
          parameter="Review Date"
          subtitle="Date confirmation was logged"
          status="optional"
        >
          <input
            type="date"
            value={formData.reviewDate || new Date().toISOString().split('T')[0]}
            onChange={(e) => setFormData({ ...formData, reviewDate: e.target.value })}
            className="w-full sm:w-56 px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
          />
        </EvidenceTableRow>

        {/* Row 15: Investigator Notes */}
        <EvidenceTableRow
          no={15}
          parameter="Investigator Notes"
          subtitle="Conflicting records, corroborated alibis, or follow-up directives"
          status="optional"
        >
          <textarea
            rows={2}
            placeholder="Analytical observations, conflicting accounts, corroborating evidence items, or directives..."
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
          />
        </EvidenceTableRow>
      </EvidenceInputTable>
    </div>
  );
};
