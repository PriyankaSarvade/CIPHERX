import React from 'react';
import { EvidenceInputTable, EvidenceTableRow } from '../EvidenceInputTable';
import { SearchableSelect } from '../SearchableSelect';
import { MultiSelect } from '../MultiSelect';
import {
  CURRENCIES,
  TRANSACTION_METHODS,
  VERIFICATION_STATUSES
} from '../../../constants/categories';
import { UploadCloud, FileCheck, X, ShieldAlert } from 'lucide-react';

export const FinancialForm = ({
  formData,
  setFormData,
  errors = {},
  cases = [],
  existingTransactions = []
}) => {
  const caseOptions = cases.map((c) => ({
    id: c.id,
    label: `${c.id} – ${c.name}`
  }));

  const transactionOptions = existingTransactions
    .filter((t) => t.id !== formData.id)
    .map((t) => ({
      id: t.transactionId || t.name || t.id,
      label: `${t.transactionId || t.name || t.id} (${t.amount || 'N/A'})`
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
      {/* Evidentiary Notice */}
      <div className="p-2.5 bg-[#F2F7FC] border border-[#B9D7F2] rounded-md text-xs text-[#243447] flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-[#3478C9] shrink-0" />
        <span>
          <strong>Analytical Safeguard:</strong> Financial records show fund movements only. Do not interpret a financial transaction alone as verified proof of criminal activity.
        </span>
      </div>

      <EvidenceInputTable>
        {/* Row 1: Evidence ID */}
        <EvidenceTableRow
          no={1}
          parameter="Evidence ID"
          subtitle="Automatically generated internal financial ledger ID"
          status="automatic"
        >
          <input
            type="text"
            value={formData.id || ''}
            readOnly
            className="w-full px-3 py-1.5 text-xs font-mono font-bold bg-[#F2F7FC] text-[#2866AE] border border-[#CBD5E1] rounded cursor-not-allowed"
          />
        </EvidenceTableRow>

        {/* Row 2: Transaction ID */}
        <EvidenceTableRow
          no={2}
          parameter="Transaction ID"
          subtitle="Source UTR / IMPS / SWIFT ref (or internal record ID)"
          status="compulsory"
          error={errors.transactionId}
        >
          <input
            type="text"
            placeholder="e.g., TXN-88492-HK / UTR49281092"
            value={formData.transactionId || formData.id || ''}
            onChange={(e) => {
              const val = e.target.value;
              const amt = formData.transactionAmount
                ? ` (${formData.currency || 'INR'} ${Number(formData.transactionAmount).toLocaleString()})`
                : '';
              setFormData({
                ...formData,
                transactionId: val,
                name: `${val}${amt}`
              });
            }}
            className={`w-full px-3 py-1.5 text-xs bg-white border rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] ${
              errors.transactionId ? 'border-red-400 ring-1 ring-red-400' : 'border-[#CBD5E1]'
            }`}
          />
        </EvidenceTableRow>

        {/* Row 3: Associated Case */}
        <EvidenceTableRow
          no={3}
          parameter="Associated Case"
          subtitle="Dossier to which this financial transaction belongs"
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

        {/* Row 4: Transaction Amount */}
        <EvidenceTableRow
          no={4}
          parameter="Transaction Amount"
          subtitle="Exact numerical value transferred"
          status="compulsory"
          error={errors.transactionAmount}
        >
          <input
            type="number"
            step="any"
            min="0"
            placeholder="e.g., 3750000"
            value={formData.transactionAmount !== undefined && formData.transactionAmount !== null ? formData.transactionAmount : ''}
            onChange={(e) => {
              const amt = e.target.value;
              const txId = formData.transactionId || 'TXN';
              const cur = formData.currency || 'INR';
              setFormData({
                ...formData,
                transactionAmount: amt,
                amount: `${cur} ${Number(amt || 0).toLocaleString()}`,
                name: `${txId} (${cur} ${Number(amt || 0).toLocaleString()})`
              });
            }}
            className={`w-full sm:w-60 px-3 py-1.5 text-xs bg-white border rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] ${
              errors.transactionAmount ? 'border-red-400 ring-1 ring-red-400 bg-red-50/20' : 'border-[#CBD5E1]'
            }`}
          />
        </EvidenceTableRow>

        {/* Row 5: Currency */}
        <EvidenceTableRow
          no={5}
          parameter="Currency"
          subtitle="Denomination currency code (Default: INR)"
          status="compulsory"
          error={errors.currency}
        >
          <select
            value={formData.currency || 'INR'}
            onChange={(e) => {
              const cur = e.target.value;
              const txId = formData.transactionId || 'TXN';
              const amt = formData.transactionAmount || '0';
              setFormData({
                ...formData,
                currency: cur,
                amount: `${cur} ${Number(amt).toLocaleString()}`,
                name: `${txId} (${cur} ${Number(amt).toLocaleString()})`
              });
            }}
            className="w-full sm:w-48 px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] cursor-pointer"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </EvidenceTableRow>

        {/* Row 6: Transaction Date */}
        <EvidenceTableRow
          no={6}
          parameter="Transaction Date"
          subtitle="Date fund movement occurred"
          status="compulsory"
          error={errors.transactionDate}
        >
          <input
            type="date"
            value={formData.transactionDate || formData.dateAdded || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                transactionDate: e.target.value,
                dateAdded: e.target.value
              })
            }
            className={`w-full sm:w-56 px-3 py-1.5 text-xs bg-white border rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] ${
              errors.transactionDate ? 'border-red-400 ring-1 ring-red-400' : 'border-[#CBD5E1]'
            }`}
          />
        </EvidenceTableRow>

        {/* Row 7: Transaction Time */}
        <EvidenceTableRow
          no={7}
          parameter="Transaction Time"
          subtitle="Time of execution from bank statement or gateway"
          status="optional"
        >
          <input
            type="time"
            value={formData.transactionTime || ''}
            onChange={(e) => setFormData({ ...formData, transactionTime: e.target.value })}
            className="w-full sm:w-48 px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
          />
        </EvidenceTableRow>

        {/* Row 8: Sender / Originating Account */}
        <EvidenceTableRow
          no={8}
          parameter="Sender / Originating Account"
          subtitle="Debited account, IBAN, VPA, or entity identity"
          status="compulsory"
          error={errors.sender}
        >
          <input
            type="text"
            placeholder="e.g., A/C #0092104928 (or Apex Freight Solutions)"
            value={formData.senderAccount || formData.senderDetails || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                senderAccount: e.target.value,
                senderDetails: e.target.value
              })
            }
            className={`w-full px-3 py-1.5 text-xs bg-white border rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] ${
              errors.sender ? 'border-red-400 ring-1 ring-red-400 bg-red-50/20' : 'border-[#CBD5E1]'
            }`}
          />
        </EvidenceTableRow>

        {/* Row 9: Receiver / Destination Account */}
        <EvidenceTableRow
          no={9}
          parameter="Receiver / Destination Account"
          subtitle="Credited account, beneficiary IBAN, or recipient VPA"
          status="compulsory"
          error={errors.receiver}
        >
          <input
            type="text"
            placeholder="e.g., IBAN #HK88019 (or Trident Marine Holdings)"
            value={formData.receiverAccount || formData.receiverDetails || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                receiverAccount: e.target.value,
                receiverDetails: e.target.value
              })
            }
            className={`w-full px-3 py-1.5 text-xs bg-white border rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] ${
              errors.receiver ? 'border-red-400 ring-1 ring-red-400 bg-red-50/20' : 'border-[#CBD5E1]'
            }`}
          />
        </EvidenceTableRow>

        {/* Row 10: Sender Account Holder */}
        <EvidenceTableRow
          no={10}
          parameter="Sender Account Holder"
          subtitle="Legal name of originating party"
          status="optional"
        >
          <input
            type="text"
            placeholder="e.g., Apex Freight Solutions Private Limited"
            value={formData.senderAccountHolder || ''}
            onChange={(e) => setFormData({ ...formData, senderAccountHolder: e.target.value })}
            className="w-full px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
          />
        </EvidenceTableRow>

        {/* Row 11: Receiver Account Holder */}
        <EvidenceTableRow
          no={11}
          parameter="Receiver Account Holder"
          subtitle="Legal name of beneficiary entity"
          status="optional"
        >
          <input
            type="text"
            placeholder="e.g., Trident Marine Holdings Ltd"
            value={formData.receiverAccountHolder || ''}
            onChange={(e) => setFormData({ ...formData, receiverAccountHolder: e.target.value })}
            className="w-full px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
          />
        </EvidenceTableRow>

        {/* Row 12: Transaction Method */}
        <EvidenceTableRow
          no={12}
          parameter="Transaction Method"
          subtitle="Settlement channel"
          status="optional"
        >
          <select
            value={formData.transactionMethod || 'Bank Transfer'}
            onChange={(e) => setFormData({ ...formData, transactionMethod: e.target.value })}
            className="w-full sm:w-60 px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] cursor-pointer"
          >
            {TRANSACTION_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </EvidenceTableRow>

        {/* Row 13: Bank / Payment Provider */}
        <EvidenceTableRow
          no={13}
          parameter="Bank / Payment Provider"
          subtitle="Intermediary or clearing banking institution"
          status="optional"
        >
          <input
            type="text"
            placeholder="e.g., HDFC Bank, SBI Commercial, SWIFT Gateway"
            value={formData.bankPaymentProvider || ''}
            onChange={(e) => setFormData({ ...formData, bankPaymentProvider: e.target.value })}
            className="w-full px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
          />
        </EvidenceTableRow>

        {/* Row 14: Related Transaction IDs */}
        <EvidenceTableRow
          no={14}
          parameter="Related Transaction IDs"
          subtitle="Optionally link companion wire transfers in the same series"
          status="optional"
        >
          <MultiSelect
            options={transactionOptions}
            value={formData.relatedTransactionIds || []}
            onChange={(val) => setFormData({ ...formData, relatedTransactionIds: val })}
            placeholder="Select companion transaction transfers..."
          />
        </EvidenceTableRow>

        {/* Row 15: Source of Financial Record */}
        <EvidenceTableRow
          no={15}
          parameter="Source of Financial Record"
          subtitle="Official provenance (FIU STR #, Bank Statement, Remittance Slip)"
          status="compulsory"
          error={errors.source}
        >
          <input
            type="text"
            placeholder="e.g., FIU STR #8991, HDFC Bank Statement, SWIFT Advice"
            value={formData.source || ''}
            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
            className={`w-full px-3 py-1.5 text-xs bg-white border rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] ${
              errors.source ? 'border-red-400 ring-1 ring-red-400 bg-red-50/20' : 'border-[#CBD5E1]'
            }`}
          />
        </EvidenceTableRow>

        {/* Row 16: Supporting Document */}
        <EvidenceTableRow
          no={16}
          parameter="Supporting Document"
          subtitle="Bank statement PDF, transaction slip, or ledger export"
          status="optional"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
            <label className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F2F7FC] border border-[#CBD5E1] rounded text-xs font-semibold text-[#243447] hover:bg-[#EAF4FC] hover:border-[#3478C9] cursor-pointer shrink-0 transition-colors">
              <UploadCloud className="w-3.5 h-3.5 text-[#3478C9]" />
              Attach Statement / Slip
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
              <span className="text-[11px] text-[#64748B]">No statement attached (optional)</span>
            )}
          </div>
        </EvidenceTableRow>

        {/* Row 17: Verification Status */}
        <EvidenceTableRow
          no={17}
          parameter="Verification Status"
          subtitle="Defaults to Unverified until bank certificate confirmation"
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

        {/* Row 18: Investigator Notes */}
        <EvidenceTableRow
          no={18}
          parameter="Investigator Notes"
          subtitle="Structuring indicators, shell company accounts, offshore hops"
          status="optional"
        >
          <textarea
            rows={2}
            placeholder="Analytical notes on transaction velocity, round-dollar layering, or beneficiary entity ownership..."
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
          />
        </EvidenceTableRow>
      </EvidenceInputTable>
    </div>
  );
};
