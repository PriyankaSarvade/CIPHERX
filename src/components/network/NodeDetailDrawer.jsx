import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  GitFork,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  FileText,
  ArrowRight,
  Database,
  ExternalLink,
  Info
} from 'lucide-react';
import { Button } from '../common/Button';
import { graphApi } from '../../services/graphApi';

export const NodeDetailDrawer = ({
  selectedItem,
  onClose,
  onFindConnections,
  connectedRelationships = [],
  caseId
}) => {
  const [evidenceProvenance, setEvidenceProvenance] = useState(null);
  const [loadingEvidence, setLoadingEvidence] = useState(false);

  const isEdge = !!(selectedItem && (selectedItem.relationshipType || selectedItem.sourceEntityName));
  const item = selectedItem;

  // Fetch real-time evidence provenance from backend when edge is selected
  useEffect(() => {
    if (!item || !isEdge) {
      setEvidenceProvenance(null);
      return;
    }

    const relId = item.id;
    if (!relId || !caseId) return;

    let isMounted = true;
    setLoadingEvidence(true);

    graphApi
      .getRelationshipEvidence(caseId, relId)
      .then((prov) => {
        if (isMounted) {
          setEvidenceProvenance(prov);
        }
      })
      .catch(() => {
        if (isMounted) setEvidenceProvenance(null);
      })
      .finally(() => {
        if (isMounted) setLoadingEvidence(false);
      });

    return () => {
      isMounted = false;
    };
  }, [item, isEdge, caseId]);

  if (!selectedItem) return null;

  const hasSource = isEdge
    ? evidenceProvenance?.has_source_evidence ??
      (item.has_source_evidence || !!item.supportingEvidence || !!item.source)
    : true;

  return (
    <div className="absolute right-4 top-4 bottom-4 w-80 sm:w-96 bg-white rounded-lg border border-[#D7E4F0] shadow-xl flex flex-col z-20 overflow-hidden animate-in slide-in-from-right duration-150">
      {/* Header */}
      <div className="p-4 border-b border-[#D7E4F0] bg-[#F2F7FC] flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white border border-[#D7E4F0] text-[#2866AE]">
            {isEdge ? 'Relationship Link (Edge)' : item.category || 'Entity Node'}
          </span>
          <h4 className="text-sm font-bold text-[#243447] mt-1 line-clamp-1">
            {isEdge ? item.relationshipType || item.label : item.name}
          </h4>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-[#64748B] hover:text-[#243447] hover:bg-white transition-colors cursor-pointer"
          title="Close details"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
        {isEdge ? (
          /* Edge Details & Evidence Provenance */
          <div className="space-y-3">
            {/* Visual link representation */}
            <div className="p-3 bg-[#EAF4FC] rounded-lg border border-[#B9D7F2]">
              <div className="text-[11px] font-semibold text-[#64748B]">Origin Entity</div>
              <div className="text-xs font-bold text-[#243447] mt-0.5">
                {item.sourceEntityName || item.source}
              </div>

              <div className="flex items-center gap-2 my-2 text-[#3478C9]">
                <ArrowRight className="w-4 h-4" />
                <span className="font-semibold text-xs">
                  {item.relationshipType || item.label}
                </span>
              </div>

              <div className="text-[11px] font-semibold text-[#64748B]">Target Entity</div>
              <div className="text-xs font-bold text-[#243447] mt-0.5">
                {item.targetEntityName || item.target}
              </div>
            </div>

            {/* Source Evidence Provenance Badge */}
            <div
              className={`p-3 rounded-lg border ${
                hasSource
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-xs mb-1">
                {hasSource ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Backed by Verified Evidence</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span>Lacks Linked Source Evidence</span>
                  </>
                )}
              </div>
              <p className="text-[11px] leading-relaxed">
                {hasSource
                  ? 'This edge is substantiated by recorded case evidence records in the database.'
                  : '⚠️ No verified documentary or digital evidence is attached to this connection. Marked as unverified.'}
              </p>
            </div>

            {/* Primary Supporting Evidence Text */}
            <div>
              <span className="font-semibold text-[#64748B] block mb-0.5">
                Primary Supporting Evidence:
              </span>
              <p className="text-[#243447] bg-[#F2F7FC] p-2.5 rounded border border-[#D7E4F0] leading-relaxed">
                {item.supportingEvidence ||
                  evidenceProvenance?.source_reference ||
                  item.source ||
                  'No inline evidence recorded.'}
              </p>
            </div>

            {/* Detailed Evidence Registry Items if available */}
            {evidenceProvenance?.evidence_items && evidenceProvenance.evidence_items.length > 0 && (
              <div>
                <span className="font-semibold text-[#64748B] block mb-1">
                  Referenced Case Evidence IDs:
                </span>
                <div className="space-y-1.5">
                  {evidenceProvenance.evidence_items.map((ev, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-white rounded border border-[#D7E4F0] flex items-center justify-between text-[11px]"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-[#3478C9]" />
                        <span className="font-mono font-bold text-[#243447]">{ev.id}</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F2F7FC] border border-[#D7E4F0] text-[#64748B]">
                        {ev.verification_status || 'Logged'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timestamps */}
            {(item.dateFirstObserved || item.first_observed) && (
              <div className="flex items-center gap-2 text-[#64748B] text-[11px] pt-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  First Observed:{' '}
                  <strong className="text-[#243447]">
                    {item.dateFirstObserved || item.first_observed}
                  </strong>
                </span>
              </div>
            )}

            {/* Notes */}
            {item.notes && (
              <div>
                <span className="font-semibold text-[#64748B] block mb-0.5">
                  Investigator Notes:
                </span>
                <p className="text-[#243447] bg-[#F8FAFC] p-2 rounded border border-[#D7E4F0] leading-relaxed">
                  {item.notes}
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Node Details */
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 p-2.5 bg-[#F2F7FC] rounded border border-[#D7E4F0]">
              <div>
                <span className="text-[10px] text-[#64748B] block">Entity ID</span>
                <span className="font-mono font-semibold text-[#243447]">{item.id}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#64748B] block">Category</span>
                <span className="font-semibold text-[#3478C9]">{item.category}</span>
              </div>
            </div>

            {item.verification_status && (
              <div>
                <span className="text-[10px] text-[#64748B] block mb-0.5">
                  Verification Status
                </span>
                <span className="inline-block px-2 py-0.5 rounded font-medium text-[11px] bg-[#EAF4FC] border border-[#B9D7F2] text-[#2866AE]">
                  {item.verification_status}
                </span>
              </div>
            )}

            {item.physicalDescription && (
              <div>
                <span className="font-semibold text-[#64748B] block mb-0.5">
                  Physical Description:
                </span>
                <p className="text-[#243447] bg-white p-2 rounded border border-[#D7E4F0] leading-relaxed">
                  {item.physicalDescription}
                </p>
              </div>
            )}

            {item.associatedPerson && (
              <div>
                <span className="font-semibold text-[#64748B] block mb-0.5">
                  Associated Person:
                </span>
                <p className="text-[#243447] font-medium">{item.associatedPerson}</p>
              </div>
            )}

            {item.amount && (
              <div>
                <span className="font-semibold text-[#64748B] block mb-0.5">Amount:</span>
                <p className="text-emerald-700 font-bold">{item.amount}</p>
              </div>
            )}

            {item.source && (
              <div>
                <span className="font-semibold text-[#64748B] block mb-0.5">
                  Source / Chain of Custody:
                </span>
                <p className="text-[#243447] bg-[#F8FAFC] p-2 rounded border border-[#D7E4F0]">
                  {item.source}
                </p>
              </div>
            )}

            {item.notes && (
              <div>
                <span className="font-semibold text-[#64748B] block mb-0.5">
                  Investigator Notes:
                </span>
                <p className="text-[#243447] leading-relaxed">{item.notes}</p>
              </div>
            )}

            {/* Direct Connected Relationships */}
            {connectedRelationships.length > 0 ? (
              <div className="pt-2 border-t border-[#D7E4F0]">
                <span className="font-semibold text-[#243447] block mb-2 flex items-center gap-1.5">
                  <GitFork className="w-3.5 h-3.5 text-[#3478C9]" />
                  Direct Connections ({connectedRelationships.length}):
                </span>
                <div className="space-y-1.5">
                  {connectedRelationships.map((rel) => {
                    const isSrc =
                      rel.sourceEntityName?.toLowerCase() === item.name?.toLowerCase() ||
                      rel.sourceEntityId === item.id;
                    const otherName = isSrc
                      ? rel.targetEntityName || rel.targetEntityId
                      : rel.sourceEntityName || rel.sourceEntityId;
                    return (
                      <div
                        key={rel.id}
                        className="p-2 bg-[#F2F7FC] rounded border border-[#D7E4F0] text-[11px]"
                      >
                        <div className="font-medium text-[#243447]">
                          <span className="text-[#3478C9] font-semibold">
                            {rel.relationshipType || rel.label}
                          </span>{' '}
                          ➔ {otherName}
                        </div>
                        <div className="text-[10px] text-[#64748B] mt-0.5 truncate">
                          {rel.supportingEvidence || rel.source || 'Case file connection'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              (item.category === 'Phone' || item.phoneNumber) && (
                <div className="pt-2 border-t border-[#D7E4F0]">
                  <div className="p-2.5 bg-[#F8FAFC] border border-[#D7E4F0] rounded text-xs text-[#64748B] text-center font-medium">
                    No CDR records are available for this number.
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {!isEdge && (
        <div className="p-3 border-t border-[#D7E4F0] bg-[#F2F7FC] flex gap-2">
          <Button
            variant="primary"
            size="sm"
            className="w-full"
            icon={Search}
            onClick={() => onFindConnections(item.name)}
          >
            Find Connections in Finder
          </Button>
        </div>
      )}
    </div>
  );
};
