import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { EVIDENCE_CATEGORIES, normalizeCategory } from '../../constants/categories';
import {
  User,
  PhoneCall,
  MapPin,
  CreditCard,
  FileSpreadsheet,
  Car,
  Building2,
  GitFork,
  Paperclip,
  CheckCircle2,
  Calendar,
  Lock,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const EvidenceDetailModal = ({ item, isOpen, onClose, onEdit }) => {
  if (!item || !isOpen) return null;

  const categoryId = normalizeCategory(item.category);
  const catMeta = EVIDENCE_CATEGORIES.find((c) => c.id === categoryId) || EVIDENCE_CATEGORIES[0];
  const Icon = catMeta.icon;

  const renderCategoryDetails = () => {
    switch (categoryId) {
      case 'Person':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#F2F7FC] rounded-lg border border-[#D7E4F0]">
              <div>
                <span className="text-[10px] font-semibold text-[#64748B] uppercase">Full Name</span>
                <div className="text-sm font-bold text-[#243447]">{item.name || item.fullName}</div>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-[#64748B] uppercase">Alias / Nickname</span>
                <div className="text-xs font-semibold text-[#243447]">{item.alias || 'None logged'}</div>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-[#64748B] uppercase">Date of Birth / Age</span>
                <div className="text-xs text-[#243447]">
                  {item.dob ? `${item.dob} (Age: ${item.age || 'N/A'})` : (item.age ? `Age: ${item.age}` : 'Not recorded')}
                </div>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-[#64748B] uppercase">Gender</span>
                <div className="text-xs text-[#243447]">{item.gender || 'Not specified'}</div>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-[#64748B] uppercase">Role in Case</span>
                <div className="text-xs font-semibold text-[#3478C9]">{item.roleInCase || 'Other Person of Interest'}</div>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-[#64748B] uppercase">Verification Status</span>
                <div>
                  <Badge variant={item.verificationStatus === 'Verified' ? 'active' : 'investigation'}>
                    {item.verificationStatus || 'Unverified'}
                  </Badge>
                </div>
              </div>
              {item.aadhaar && (
                <div>
                  <span className="text-[10px] font-semibold text-[#64748B] uppercase">Aadhaar Card Number</span>
                  <div className="text-xs font-mono font-semibold text-[#243447]">{item.aadhaar}</div>
                </div>
              )}
              {(item.identityDocName || item.fileName) && (
                <div>
                  <span className="text-[10px] font-semibold text-[#64748B] uppercase">Identity Document</span>
                  <div className="text-xs text-[#2866AE] flex items-center gap-1.5 mt-0.5">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span className="font-semibold truncate">{item.identityDocName || item.fileName}</span>
                    {(item.identityDocSize || item.fileSize) && (
                      <span className="text-[10px] text-[#64748B]">({item.identityDocSize || item.fileSize})</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Contact details */}
            <div className="p-3 bg-white rounded-lg border border-[#D7E4F0] space-y-2">
              <div>
                <span className="text-[10px] font-semibold text-[#64748B] uppercase">Phone Numbers:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {item.phoneNumbers && item.phoneNumbers.length > 0 ? (
                    item.phoneNumbers.map((p, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-[#F2F7FC] border border-[#D7E4F0] text-xs font-mono text-[#243447]">
                        {p}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-[#64748B]">None registered</span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-[#64748B] uppercase">Email Addresses:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {item.emailAddresses && item.emailAddresses.length > 0 ? (
                    item.emailAddresses.map((em, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-[#F2F7FC] border border-[#D7E4F0] text-xs font-mono text-[#243447]">
                        {em}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-[#64748B]">None registered</span>
                  )}
                </div>
              </div>

              {item.residentialAddress && (
                <div>
                  <span className="text-[10px] font-semibold text-[#64748B] uppercase">Residential Address:</span>
                  <p className="text-xs text-[#243447] mt-0.5">{item.residentialAddress}</p>
                </div>
              )}

              {item.officeAddress && (
                <div>
                  <span className="text-[10px] font-semibold text-[#64748B] uppercase">Office Address:</span>
                  <p className="text-xs text-[#243447] mt-0.5">{item.officeAddress}</p>
                </div>
              )}

              {!item.residentialAddress && !item.officeAddress && item.address && (
                <div>
                  <span className="text-[10px] font-semibold text-[#64748B] uppercase">Address:</span>
                  <p className="text-xs text-[#243447] mt-0.5">{item.address}</p>
                </div>
              )}
            </div>

            {/* Known Associates & Locations */}
            {(item.knownAssociates?.length > 0 || item.knownLocations?.length > 0) && (
              <div className="p-3 bg-white rounded-lg border border-[#D7E4F0] space-y-2">
                {item.knownAssociates?.length > 0 && (
                  <div>
                    <span className="text-[10px] font-semibold text-[#64748B] uppercase">Known Associates:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {item.knownAssociates.map((a, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-[#EAF4FC] border border-[#B9D7F2] text-xs text-[#2866AE]">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {item.knownLocations?.length > 0 && (
                  <div>
                    <span className="text-[10px] font-semibold text-[#64748B] uppercase">Known Locations:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {item.knownLocations.map((l, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-[#FFFBEB] border border-[#FDE68A] text-xs text-[#D97706]">
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'Phone':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#F2F7FC] rounded-lg border border-[#D7E4F0]">
              <div>
                <span className="text-[10px] font-semibold text-[#64748B] uppercase">Phone Number</span>
                <div className="text-sm font-mono font-bold text-[#243447]">{item.phoneNumber || item.name}</div>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-[#64748B] uppercase">Phone Record ID</span>
                <div className="text-xs font-mono font-semibold text-[#2866AE]">{item.phoneRecordId || 'N/A'}</div>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-[#64748B] uppercase">Associated Person</span>
                <div className="text-xs font-bold text-[#243447]">{item.associatedPerson || 'Unassigned'}</div>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-[#64748B] uppercase">Communication Type</span>
                <div className="text-xs text-[#243447]">{item.communicationType || 'Call'}</div>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-[#64748B] uppercase">Direction & Duration</span>
                <div className="text-xs text-[#243447]">
                  {item.direction || 'Unknown'} {item.callDuration ? `(${item.callDuration}s)` : ''}
                </div>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-[#64748B] uppercase">Platform / Carrier</span>
                <div className="text-xs text-[#243447]">{item.communicationPlatform || item.carrier || 'Cellular'}</div>
              </div>
            </div>

            {(item.sender || item.receiver) && (
              <div className="p-3 bg-white rounded-lg border border-[#D7E4F0] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-[#64748B] block">Caller / Sender:</span>
                  <span className="font-bold text-[#243447]">{item.sender || 'Unknown'}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#3478C9]" />
                <div>
                  <span className="text-[10px] text-[#64748B] block">Recipient / Receiver:</span>
                  <span className="font-bold text-[#243447]">{item.receiver || 'Unknown'}</span>
                </div>
              </div>
            )}
          </div>
        );

      case 'Location':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#F2F7FC] rounded-lg border border-[#D7E4F0]">
              <div className="sm:col-span-2">
                <span className="text-[10px] font-semibold text-[#64748B] uppercase">Location Name</span>
                <div className="text-sm font-bold text-[#243447]">{item.name || item.locationName}</div>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-[#64748B] uppercase">Location Type</span>
                <div className="text-xs text-[#243447]">{item.locationType || 'Business'}</div>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-[#64748B] uppercase">Associated Entity</span>
                <div className="text-xs font-semibold text-[#2866AE]">{item.associatedEntity || 'None linked'}</div>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-[#64748B] uppercase">City, State</span>
                <div className="text-xs text-[#243447]">{item.city || ''} {item.state ? `, ${item.state}` : ''}</div>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-[#64748B] uppercase">Postal Code</span>
                <div className="text-xs font-mono text-[#243447]">{item.postalCode || 'N/A'}</div>
              </div>
              {(item.latitude || item.longitude || item.coordinates) && (
                <div className="sm:col-span-2">
                  <span className="text-[10px] font-semibold text-[#64748B] uppercase">Coordinates</span>
                  <div className="text-xs font-mono text-[#243447]">
                    {item.latitude ? `${item.latitude}° N, ${item.longitude}° E` : item.coordinates}
                  </div>
                </div>
              )}
            </div>

            {item.address && (
              <div className="p-3 bg-white rounded-lg border border-[#D7E4F0]">
                <span className="text-[10px] font-semibold text-[#64748B] uppercase">Full Address:</span>
                <p className="text-xs text-[#243447] mt-0.5">{item.address}</p>
              </div>
            )}
          </div>
        );

      case 'Financial':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#F2F7FC] rounded-lg border border-[#D7E4F0]">
              <div>
                <span className="text-[10px] font-semibold text-[#64748B] uppercase">Transaction Amount</span>
                <div className="text-base font-bold text-emerald-700">
                  {item.amount || `${item.currency || 'INR'} ${Number(item.transactionAmount || 0).toLocaleString()}`}
                </div>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-[#64748B] uppercase">Transaction ID / UTR</span>
                <div className="text-xs font-mono font-bold text-[#2866AE]">{item.transactionId || item.id}</div>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-[#64748B] uppercase">Method</span>
                <div className="text-xs text-[#243447]">{item.transactionMethod || 'Bank Transfer'}</div>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-[#64748B] uppercase">Bank / Provider</span>
                <div className="text-xs text-[#243447]">{item.bankPaymentProvider || 'N/A'}</div>
              </div>
            </div>

            {/* Account Parties */}
            <div className="p-3 bg-white rounded-lg border border-[#D7E4F0] space-y-2 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-2 bg-[#F2F7FC] rounded">
                  <span className="text-[10px] text-[#64748B] block uppercase font-semibold">Origin / Sender</span>
                  <div className="font-bold text-[#243447]">{item.senderAccountHolder || 'N/A'}</div>
                  <div className="text-[11px] font-mono text-[#64748B] mt-0.5">{item.senderAccount || 'No account logged'}</div>
                </div>
                <div className="p-2 bg-[#F2F7FC] rounded">
                  <span className="text-[10px] text-[#64748B] block uppercase font-semibold">Destination / Beneficiary</span>
                  <div className="font-bold text-[#243447]">{item.receiverAccountHolder || 'N/A'}</div>
                  <div className="text-[11px] font-mono text-[#64748B] mt-0.5">{item.receiverAccount || 'No account logged'}</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'DocumentDigital':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#F2F7FC] rounded-lg border border-[#D7E4F0]">
              <div className="sm:col-span-2">
                <span className="text-[10px] font-semibold text-[#64748B] uppercase">Evidence Title</span>
                <div className="text-sm font-bold text-[#243447]">{item.name || item.evidenceTitle}</div>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-[#64748B] uppercase">Evidence Type</span>
                <div className="text-xs font-semibold text-[#243447]">{item.evidenceType || item.documentType || item.digitalType || 'Document'}</div>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-[#64748B] uppercase">Review Status</span>
                <div>
                  <Badge variant={item.reviewStatus === 'Reviewed' ? 'active' : 'investigation'}>
                    {item.reviewStatus || 'Under Review'}
                  </Badge>
                </div>
              </div>
              {item.sha256Hash && (
                <div className="sm:col-span-2">
                  <span className="text-[10px] font-semibold text-[#64748B] uppercase flex items-center gap-1">
                    <Lock className="w-3 h-3 text-[#3478C9]" />
                    SHA-256 Checksum
                  </span>
                  <div className="text-[11px] font-mono bg-white p-1.5 rounded border border-[#D7E4F0] text-[#243447] break-all">
                    {item.sha256Hash}
                  </div>
                </div>
              )}
            </div>

            {item.description && (
              <div className="p-3 bg-white rounded-lg border border-[#D7E4F0]">
                <span className="text-[10px] font-semibold text-[#64748B] uppercase">Description:</span>
                <p className="text-xs text-[#243447] mt-0.5 leading-relaxed">{item.description}</p>
              </div>
            )}

            {/* Chain of custody */}
            {item.chainOfCustody && item.chainOfCustody.length > 0 && (
              <div className="p-3 bg-white rounded-lg border border-[#D7E4F0]">
                <span className="text-[10px] font-semibold text-[#64748B] uppercase block mb-1.5">
                  Chain-of-Custody Transfers:
                </span>
                <div className="space-y-1.5">
                  {item.chainOfCustody.map((step, idx) => (
                    <div key={idx} className="p-2 bg-[#F2F7FC] rounded text-[11px] flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-[#243447]">{step.handler}</span> • <span>{step.action}</span>
                      </div>
                      <span className="text-[10px] text-[#64748B] font-mono">{step.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'Vehicle':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#F2F7FC] rounded-lg border border-[#D7E4F0]">
              <div>
                <span className="text-[10px] font-semibold text-[#64748B] uppercase">Registration Number</span>
                <div className="text-sm font-mono font-bold text-[#243447]">{item.registrationNumber || item.name}</div>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-[#64748B] uppercase">Body Type</span>
                <div className="text-xs text-[#243447]">{item.vehicleType || 'Vehicle'}</div>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-[#64748B] uppercase">Make & Model</span>
                <div className="text-xs text-[#243447]">{item.make || ''} {item.model || ''}</div>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-[#64748B] uppercase">Colour</span>
                <div className="text-xs text-[#243447]">{item.colour || 'Not recorded'}</div>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-[#64748B] uppercase">Registered Owner</span>
                <div className="text-xs font-semibold text-[#2866AE]">{item.registeredOwner || 'RTO Search Pending'}</div>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-[#64748B] uppercase">Associated Person</span>
                <div className="text-xs font-semibold text-[#243447]">{item.associatedPerson || 'Unassigned'}</div>
              </div>
            </div>
          </div>
        );

      case 'Organization':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#F2F7FC] rounded-lg border border-[#D7E4F0]">
              <div className="sm:col-span-2">
                <span className="text-[10px] font-semibold text-[#64748B] uppercase">Organization Name</span>
                <div className="text-sm font-bold text-[#243447]">{item.name || item.organizationName}</div>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-[#64748B] uppercase">Structure Type</span>
                <div className="text-xs text-[#243447]">{item.organizationType || 'Company'}</div>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-[#64748B] uppercase">Registration / CIN</span>
                <div className="text-xs font-mono font-semibold text-[#2866AE]">{item.registrationNumber || 'N/A'}</div>
              </div>
              {item.contactPhone && (
                <div>
                  <span className="text-[10px] font-semibold text-[#64748B] uppercase">Phone</span>
                  <div className="text-xs font-mono text-[#243447]">{item.contactPhone}</div>
                </div>
              )}
              {item.contactEmail && (
                <div>
                  <span className="text-[10px] font-semibold text-[#64748B] uppercase">Email</span>
                  <div className="text-xs font-mono text-[#243447]">{item.contactEmail}</div>
                </div>
              )}
            </div>

            {item.registeredAddress && (
              <div className="p-3 bg-white rounded-lg border border-[#D7E4F0]">
                <span className="text-[10px] font-semibold text-[#64748B] uppercase">Registered Address:</span>
                <p className="text-xs text-[#243447] mt-0.5">{item.registeredAddress}</p>
              </div>
            )}
          </div>
        );

      case 'Relationships':
        return (
          <div className="space-y-4">
            <div className="p-3 bg-[#EAF4FC] rounded-lg border border-[#B9D7F2]">
              <span className="text-[10px] font-semibold uppercase text-[#2866AE]">Relational Link</span>
              <div className="flex items-center gap-2 text-xs mt-1">
                <span className="font-bold text-[#243447]">{item.sourceEntityName || 'Origin'}</span>
                <ArrowRight className="w-4 h-4 text-[#3478C9]" />
                <span className="font-semibold px-2 py-0.5 rounded bg-white border border-[#B9D7F2] text-[#3478C9]">
                  {item.relationshipType}
                </span>
                <ArrowRight className="w-4 h-4 text-[#3478C9]" />
                <span className="font-bold text-[#243447]">{item.targetEntityName || 'Destination'}</span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#D7E4F0] space-y-2 text-xs">
              <div>
                <span className="text-[10px] font-semibold text-[#64748B] uppercase">Supporting Evidence:</span>
                <p className="text-xs text-[#243447] mt-0.5 p-2 bg-[#F2F7FC] rounded border border-[#D7E4F0] leading-relaxed">
                  {item.supportingEvidence || 'Case file records'}
                </p>
              </div>

              {item.relationshipDescription && (
                <div>
                  <span className="text-[10px] font-semibold text-[#64748B] uppercase">Description:</span>
                  <p className="text-xs text-[#243447] mt-0.5">{item.relationshipDescription}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-[10px] text-[#64748B] block">Review Status:</span>
                  <Badge variant={item.reviewStatus === 'Confirmed by Investigator' ? 'active' : 'investigation'}>
                    {item.reviewStatus || 'Unreviewed'}
                  </Badge>
                </div>
                {item.confidenceScore !== undefined && item.confidenceScore !== '' && (
                  <div>
                    <span className="text-[10px] text-[#64748B] block">Confidence Score:</span>
                    <span className="font-bold text-[#2866AE]">{item.confidenceScore}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-3 bg-[#F2F7FC] rounded text-xs text-[#243447]">
            {item.description || item.notes || 'Recorded item'}
          </div>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${catMeta.label}: ${item.id}`}
      subtitle={`Case Reference: ${item.caseId || 'Active Dossier'}`}
      maxWidth="max-w-xl"
    >
      <div className="space-y-4 text-xs">
        {/* Category Badge & Date */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#D7E4F0]">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
              style={{
                backgroundColor: catMeta.bgColor,
                borderColor: catMeta.borderColor,
                color: catMeta.color
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              {catMeta.label}
            </span>
            {item.investigationStatus && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                item.investigationStatus === 'Collected'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : item.investigationStatus === 'Under Review'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : item.investigationStatus === 'Pending'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-slate-100 text-slate-600 border-slate-300'
              }`}>
                Status: {item.investigationStatus}
              </span>
            )}
          </div>
          <span className="text-[11px] text-[#64748B]">Logged: {item.dateAdded || 'N/A'}</span>
        </div>

        {/* Dynamic Category Details */}
        {renderCategoryDetails()}

        {/* File attachment preview */}
        {item.fileName && (
          <div className="p-3 bg-[#EAF4FC] rounded-lg border border-[#B9D7F2] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium text-[#2866AE]">
              <Paperclip className="w-4 h-4" />
              <span>{item.fileName}</span>
            </div>
            <span className="text-[11px] text-[#64748B]">{item.fileSize}</span>
          </div>
        )}

        {/* Provenance and Notes */}
        <div className="p-3 bg-[#F2F7FC] rounded-lg border border-[#D7E4F0] space-y-2">
          <div>
            <span className="text-[10px] font-semibold text-[#64748B] uppercase block">
              Identification / Evidentiary Source:
            </span>
            <div className="text-xs text-[#243447] font-medium">{item.source || 'Documented record'}</div>
          </div>

          {item.notes && (
            <div>
              <span className="text-[10px] font-semibold text-[#64748B] uppercase block">
                Investigator Notes:
              </span>
              <p className="text-xs text-[#243447] leading-relaxed mt-0.5">{item.notes}</p>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="pt-3 border-t border-[#D7E4F0] flex items-center justify-between">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          {onEdit && (
            <Button
              variant="primary"
              onClick={() => {
                onClose();
                onEdit(item);
              }}
            >
              Edit This Record
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
