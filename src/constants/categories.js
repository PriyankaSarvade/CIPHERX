import {
  User,
  PhoneCall,
  MapPin,
  CreditCard,
  FileSpreadsheet,
  Car,
  Building2,
  GitFork,
  AlertTriangle
} from 'lucide-react';

export const EVIDENCE_CATEGORIES = [
  {
    id: 'Person',
    label: 'Person Details',
    shortLabel: 'Person',
    icon: User,
    color: '#3478C9', // primary blue
    bgColor: '#EAF4FC',
    borderColor: '#B9D7F2',
    prefix: 'PRS',
    description: 'Individuals, witnesses, persons of interest, and associates'
  },
  {
    id: 'Phone',
    label: 'Phone & Communication',
    shortLabel: 'Phone & CDR',
    icon: PhoneCall,
    color: '#0D9488', // teal
    bgColor: '#F0FDFA',
    borderColor: '#99F6E4',
    prefix: 'CDR',
    description: 'Call detail records, SMS, burner handsets, and communications'
  },
  {
    id: 'Location',
    label: 'Location Details',
    shortLabel: 'Location',
    icon: MapPin,
    color: '#D97706', // amber/warm
    bgColor: '#FFFBEB',
    borderColor: '#FDE68A',
    prefix: 'LOC',
    description: 'Residences, business premises, incident points, and coordinates'
  },
  {
    id: 'Financial',
    label: 'Financial Transactions',
    shortLabel: 'Financial',
    icon: CreditCard,
    color: '#059669', // emerald
    bgColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    prefix: 'TXN',
    description: 'Bank transfers, UPI, wire remittances, and account flows'
  },
  {
    id: 'DocumentDigital',
    label: 'Document & Digital Evidence',
    shortLabel: 'Documents & Digital',
    icon: FileSpreadsheet,
    color: '#EA580C', // orange
    bgColor: '#FFF7ED',
    borderColor: '#FED7AA',
    prefix: 'DOC',
    description: 'PDF manifests, digital images, seized media, and forensic dumps'
  },
  {
    id: 'Vehicle',
    label: 'Vehicle Details',
    shortLabel: 'Vehicle',
    icon: Car,
    color: '#4F46E5', // indigo
    bgColor: '#EEF2FF',
    borderColor: '#C7D2FE',
    prefix: 'VEH',
    description: 'Motor vehicles, cargo trucks, delivery vans, and marine vessels'
  },
  {
    id: 'Organization',
    label: 'Organization Details',
    shortLabel: 'Organization',
    icon: Building2,
    color: '#475569', // slate
    bgColor: '#F8FAFC',
    borderColor: '#CBD5E1',
    prefix: 'ORG',
    description: 'Registered businesses, front companies, agencies, and institutions'
  },
  {
    id: 'Relationships',
    label: 'Relationship Details',
    shortLabel: 'Relationships',
    icon: GitFork,
    color: '#2563EB', // royal blue
    bgColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    prefix: 'REL',
    description: 'Verified evidentiary connections and links between case entities'
  }
];

export const VERIFICATION_STATUSES = [
  'Unverified',
  'Under Review',
  'Verified',
  'Disputed'
];

export const EVIDENCE_TRACKING_STATUSES = [
  'Pending',
  'Collected',
  'Under Review',
  'Unavailable',
  'Not Applicable'
];

export const CRIME_TYPES = [
  'Murder/Homicide',
  'Kidnapping/Abduction',
  'Fraud/Financial Crime',
  'Cybercrime',
  'Theft/Robbery/Burglary',
  'Drug Trafficking',
  'Human Trafficking',
  'Extortion/Blackmail',
  'Missing Person',
  'Organized Crime/Smuggling',
  'Assault/Physical Violence',
  'Other/Unclassified'
];

export const CRIME_TYPE_OPTIONS = [
  { id: 'Murder/Homicide', label: 'Murder/Homicide', sub: 'Victim details, autopsy, forensic evidence, witness & motive ties' },
  { id: 'Kidnapping/Abduction', label: 'Kidnapping/Abduction', sub: 'Ransom calls, hostage tracking, safehouses, transit sightings' },
  { id: 'Fraud/Financial Crime', label: 'Fraud/Financial Crime', sub: 'Bank trails, money laundering, shell accounts, fraudulent transactions' },
  { id: 'Cybercrime', label: 'Cybercrime', sub: 'Digital forensics, IPs, server logs, malware, compromised accounts' },
  { id: 'Theft/Robbery/Burglary', label: 'Theft/Robbery/Burglary', sub: 'Stolen goods, break-ins, vehicle/CCTV tracking, pawn fences' },
  { id: 'Drug Trafficking', label: 'Drug Trafficking', sub: 'Narcotics supply chain, couriers, seizure records, stash houses' },
  { id: 'Human Trafficking', label: 'Human Trafficking', sub: 'Smuggling rings, transit routes, forged visas, victim rescue' },
  { id: 'Extortion/Blackmail', label: 'Extortion/Blackmail', sub: 'Threat communications, demand slips, drop points, payoff records' },
  { id: 'Missing Person', label: 'Missing Person', sub: 'Last known location, transit, personal belongings, phone tower logs' },
  { id: 'Organized Crime/Smuggling', label: 'Organized Crime/Smuggling', sub: 'Syndicates, contraband consignments, logistics, front entities' },
  { id: 'Assault/Physical Violence', label: 'Assault/Physical Violence', sub: 'Medical reports, weapon forensics, eyewitnesses, emergency calls' },
  { id: 'Other/Unclassified', label: 'Other/Unclassified', sub: 'General evidentiary inquiry, multi-disciplinary investigation' }
];

export const CRIME_TYPE_CONFIG = {
  'Murder/Homicide': {
    label: 'Murder / Homicide',
    categories: ['Person', 'Relationships', 'DocumentDigital', 'Phone', 'Location', 'Vehicle', 'Financial'],
    description: 'Requires victim profile, post-mortem/autopsy reports, forensic ballistics/DNA, eyewitnesses, CCTV, CDRs, and motive ties.',
    specificEvidenceHints: {
      DocumentDigital: 'Post-Mortem / Autopsy report, Forensic DNA/Ballistics report, CCTV surveillance footage, Inquest papers, Seizure memo',
      Person: 'Victim profile, Primary suspects, Eyewitnesses, Next-of-kin, Forensic medical examiner',
      Phone: 'Call Detail Records (CDR), Tower dump at incident time, Pre-incident threat calls/SMS',
      Location: 'Crime scene, Body recovery site, Last seen location, Suspect hideout',
      Vehicle: 'Getaway vehicle, Transport used, Checkpoint CCTV sightings',
      Financial: 'Insurance policies, Financial dispute trail, Contract payment records',
      Relationships: 'Victim-Suspect motive links, Eyewitness corroborations, Alibi connections'
    }
  },
  'Kidnapping/Abduction': {
    label: 'Kidnapping / Abduction',
    categories: ['Person', 'Phone', 'Location', 'Vehicle', 'Financial', 'DocumentDigital', 'Relationships'],
    description: 'Requires hostage details, ransom communications, captivity safehouses, snatch transport, and financial demands.',
    specificEvidenceHints: {
      Person: 'Hostage/Victim, Kidnappers, Family negotiators, Eyewitnesses to abduction',
      Phone: 'Ransom call audio records, Burner numbers, VoIP call logs, Threat SMS',
      Location: 'Abduction site, Captivity safehouse, Designated ransom drop-off point',
      Vehicle: 'Snatch vehicle, Transport van, ANPR license plate hits',
      Financial: 'Ransom demands, Hawala / Wire payout trail, Mule bank transfers',
      DocumentDigital: 'Demand notes, Proof-of-life media/videos, Abduction CCTV footage',
      Relationships: 'Captor-Victim connections, Inside informant links'
    }
  },
  'Fraud/Financial Crime': {
    label: 'Fraud / Financial Crime',
    categories: ['Financial', 'Organization', 'Person', 'DocumentDigital', 'Relationships', 'Phone'],
    description: 'Requires transaction ledgers, wire slips, corporate fronts, beneficial owners, and audit trails.',
    specificEvidenceHints: {
      Financial: 'Fraudulent transactions, Shell company wire slips, Bogus invoices, Hawala remittances, Stolen funds',
      Organization: 'Shell corporations, Bogus vendor fronts, Audited financial institutions',
      Person: 'Beneficial owners, Straw directors, Complicit accountants, Victims/Investors',
      DocumentDigital: 'Audit reports, Falsified balance sheets, Bank KYC dossiers, Seized accounting records',
      Relationships: 'Fund flow networks, Corporate control links, Shared account signatories',
      Phone: 'Telemarketing lines, Coordinated fraud calls, Phishing SMS logs'
    }
  },
  'Cybercrime': {
    label: 'Cybercrime',
    categories: ['DocumentDigital', 'Financial', 'Phone', 'Location', 'Person', 'Organization', 'Relationships'],
    description: 'Requires digital forensics, affected accounts, devices, target URLs/IPs, server login records, and forensic reports.',
    specificEvidenceHints: {
      DocumentDigital: 'Digital forensic disk images, Server login records, RAM dumps, Malware hashes, Packet pcaps, Phishing templates',
      Financial: 'Compromised bank accounts, Mule transfer accounts, Cryptocurrency wallets, Ransomware payouts',
      Phone: 'Compromised SIMs, OTP interception logs, VoIP spoofing records',
      Location: 'Target URLs / domains, C2 servers, Datacenter IP endpoints, Network access points',
      Person: 'Threat actor handles, System administrators, Compromised victims, Money mules',
      Organization: 'Targeted enterprise, Hosting providers, Registrars, Cloud services, ISPs',
      Relationships: 'Attack vectors, C2 infrastructure hops, Data exfiltration routes'
    }
  },
  'Theft/Robbery/Burglary': {
    label: 'Theft / Robbery / Burglary',
    categories: ['Location', 'Vehicle', 'Person', 'DocumentDigital', 'Relationships', 'Phone'],
    description: 'Requires burgled premise inspection, getaway vehicles, fence networks, serial numbers, and CCTV tracking.',
    specificEvidenceHints: {
      Location: 'Burgled premises, Point of forced entry/exit, Stash/Fence location',
      Vehicle: 'Getaway vehicle, ANPR checkpoint logs, Stolen transport',
      Person: 'Perpetrators, Pawnshop handlers/Fences, Security witnesses, Victims',
      DocumentDigital: 'CCTV surveillance footage, Latent fingerprints, Property inventory, Stolen serial registers',
      Relationships: 'Gang affiliations, Thief-to-Fence distribution links',
      Phone: 'Heist coordination calls, Lookout communications'
    }
  },
  'Drug Trafficking': {
    label: 'Drug Trafficking',
    categories: ['DocumentDigital', 'Location', 'Person', 'Vehicle', 'Financial', 'Phone', 'Organization', 'Relationships'],
    description: 'Requires narcotics seizure memos, chemical lab reports, stash houses, couriers, and hawala money trails.',
    specificEvidenceHints: {
      DocumentDigital: 'Narcotics seizure memo, Chemical forensic test reports, Courier manifests, Concealment photographs',
      Location: 'Stash house, Smuggling entry point, Transit warehouse, Interception checkpoint',
      Person: 'Cartel kingpin, Couriers/Mules, Street distributors, Corrupt facilitators',
      Vehicle: 'Modified trap-door vehicles, Cargo containers, Transport carriers',
      Financial: 'Cash proceeds, Money laundering accounts, Hawala transactions',
      Phone: 'Encrypted app chat logs, Burner phone CDRs, Satellite calls',
      Organization: 'Front logistics companies, Cartel sub-groups, Import-export fronts',
      Relationships: 'Supplier-Distributor hierarchies, Smuggling routes'
    }
  },
  'Human Trafficking': {
    label: 'Human Trafficking',
    categories: ['Person', 'Location', 'DocumentDigital', 'Financial', 'Phone', 'Vehicle', 'Organization', 'Relationships'],
    description: 'Requires victim profiles, transit hubs, forged identity documents, recruiter ties, and safehouses.',
    specificEvidenceHints: {
      Person: 'Trafficked victims, Recruiter/Agents, Safehouse caretakers, Exploitation handlers',
      Location: 'Recruitment village, Transit hub, Border crossing, Exploitation premises',
      DocumentDigital: 'Forged passports/Visas, Fraudulent work contracts, Ticket bookings, Victim identification files',
      Financial: 'Placement fees, Debt bondage ledgers, Transportation payments',
      Phone: 'Recruiter phone records, Cross-border communications',
      Vehicle: 'Transit buses, Clandestine transport, Border vehicles',
      Organization: 'Fake recruitment agencies, Shell travel firms, Cover businesses',
      Relationships: 'Recruiter-Victim ties, Transit ring connections'
    }
  },
  'Extortion/Blackmail': {
    label: 'Extortion / Blackmail',
    categories: ['Phone', 'DocumentDigital', 'Financial', 'Person', 'Location', 'Relationships'],
    description: 'Requires threat communications, compromising media, demand notes, payoff channels, and delivery points.',
    specificEvidenceHints: {
      Phone: 'Extortion calls, Threat SMS, WhatsApp / Telegram recordings, Burner numbers',
      DocumentDigital: 'Blackmail media, Compromising files, Written extortion letters, Digital audio logs',
      Financial: 'Extortion payoff demands, Cryptocurrency addresses, Cash drops',
      Person: 'Target/Victim, Extortionist/Syndicate muscle, Couriers, Intermediaries',
      Location: 'Threat delivery location, Designated drop-off spot, Victim residence',
      Relationships: 'Blackmailer-Target leverage links, Gang backing'
    }
  },
  'Missing Person': {
    label: 'Missing Person',
    categories: ['Person', 'Location', 'Phone', 'DocumentDigital', 'Vehicle', 'Financial', 'Relationships'],
    description: 'Requires last known sightings, cell tower triangulation, transit records, and recent associate contacts.',
    specificEvidenceHints: {
      Person: 'Missing individual profile, Last contact persons, Friends/Family, Potential abductors',
      Location: 'Last known physical location, Cell tower triangulation zone, Transit terminal',
      Phone: 'Last outgoing calls/SMS, Tower dump at disappearance time, Message history',
      DocumentDigital: 'Recent photographs, Dental/Medical records, CCTV station footage, Social media activity',
      Vehicle: 'Vehicle last driven, Public transit logs',
      Financial: 'Last ATM withdrawal, Credit card swipe before disappearance',
      Relationships: 'Family/Associate connections, Suspicious recent contacts'
    }
  },
  'Organized Crime/Smuggling': {
    label: 'Organized Crime / Smuggling',
    categories: ['Organization', 'Person', 'Vehicle', 'Location', 'Financial', 'DocumentDigital', 'Relationships', 'Phone'],
    description: 'Requires syndicate hierarchy, front logistics entities, cargo vessels, false manifests, and bribery trails.',
    specificEvidenceHints: {
      Organization: 'Crime syndicate, Front companies, Corrupt trade firms, Dockside logistics',
      Person: 'Syndicate boss, Lieutenants, Smuggling operators, Customs facilitators',
      Vehicle: 'Cargo vessels, Container trailers, Covert fleet vehicles',
      Location: 'Unregulated port piers, Warehouses, Smuggling landing points',
      Financial: 'Illicit trade ledgers, Trade-based money laundering, Off-book kickbacks',
      DocumentDigital: 'Falsified bills of lading, Port gate passes, Seizure reports',
      Relationships: 'Hierarchical command structure, Syndicate partnerships',
      Phone: 'Coordinated fleet communications, Satellite / Radio logs'
    }
  },
  'Assault/Physical Violence': {
    label: 'Assault / Physical Violence',
    categories: ['Person', 'DocumentDigital', 'Location', 'Relationships', 'Phone', 'Vehicle'],
    description: 'Requires victim injury reports, weapon forensics, incident scene evidence, and prior dispute relationships.',
    specificEvidenceHints: {
      Person: 'Victim, Primary assailant, Accomplices, Treating emergency physician, Eyewitnesses',
      DocumentDigital: 'Medical-legal injury report, Weapon forensic test, Scene photographs, 911/Control room audio',
      Location: 'Attack scene, Emergency hospital, Weapon disposal location',
      Relationships: 'Motive/Dispute links, Prior altercation history, Gang rivalries',
      Phone: 'Pre-altercation threats, Emergency dispatch calls',
      Vehicle: 'Assailant escape vehicle, Incident transport'
    }
  },
  'Other/Unclassified': {
    label: 'Other / Unclassified',
    categories: ['Person', 'Phone', 'Location', 'Financial', 'DocumentDigital', 'Vehicle', 'Organization', 'Relationships'],
    description: 'General multi-disciplinary evidentiary inquiry across all investigative categories.',
    specificEvidenceHints: {
      Person: 'Persons of interest, Complainants, Witnesses, Informants',
      Phone: 'Phone & CDR communication logs',
      Location: 'Associated premises, Incident sites, Coordinates',
      Financial: 'Financial transactions, Wire remittances, Accounts',
      DocumentDigital: 'Documents, Seized digital media, Cryptographic evidence files',
      Vehicle: 'Motor vehicles, Marine transport, Commercial carriers',
      Organization: 'Entities, Front businesses, Institutions',
      Relationships: 'Verified evidentiary connections between case entities'
    }
  }
};

export const normalizeCrimeType = (typeOrCategory) => {
  if (!typeOrCategory) return 'Other/Unclassified';
  const lower = typeOrCategory.toLowerCase();
  const match = CRIME_TYPES.find((ct) => ct.toLowerCase() === lower);
  if (match) return match;
  if (lower.includes('murder') || lower.includes('homicide')) return 'Murder/Homicide';
  if (lower.includes('kidnap') || lower.includes('abduction')) return 'Kidnapping/Abduction';
  if (lower.includes('financial') || lower.includes('fraud') || lower.includes('laundering')) return 'Fraud/Financial Crime';
  if (lower.includes('cyber') || lower.includes('breach')) return 'Cybercrime';
  if (lower.includes('theft') || lower.includes('burglary') || lower.includes('robbery')) return 'Theft/Robbery/Burglary';
  if (lower.includes('narcotics') || lower.includes('drug')) return 'Drug Trafficking';
  if (lower.includes('human') || lower.includes('trafficking')) return 'Human Trafficking';
  if (lower.includes('extortion') || lower.includes('blackmail')) return 'Extortion/Blackmail';
  if (lower.includes('missing')) return 'Missing Person';
  if (lower.includes('smuggling') || lower.includes('organized')) return 'Organized Crime/Smuggling';
  if (lower.includes('assault') || lower.includes('violence')) return 'Assault/Physical Violence';
  return 'Other/Unclassified';
};

export const getCategoriesForCrimeType = (crimeType) => {
  const normalized = normalizeCrimeType(crimeType);
  const config = CRIME_TYPE_CONFIG[normalized];
  if (!config) return EVIDENCE_CATEGORIES;
  return EVIDENCE_CATEGORIES.filter((cat) => config.categories.includes(cat.id));
};

export const PERSON_ROLES = [
  'Victim',
  'Primary Suspect',
  'Eyewitness',
  'Informant',
  'Accomplice / Co-conspirator',
  'Next-of-Kin',
  'Treating Doctor / Medical Examiner',
  'System Administrator',
  'Money Mule',
  'Other Person of Interest',
  'Unknown'
];

export const GENDERS = [
  'Male',
  'Female',
  'Non-Binary',
  'Other',
  'Prefer Not to Disclose'
];

export const COMMUNICATION_TYPES = [
  'Call (Voice)',
  'SMS / Text',
  'WhatsApp / Encrypted Chat',
  'Telegram / Signal',
  'VoIP Call',
  'Satellite Call',
  'Tower Intercept / Dump',
  'Ransom Call Recording',
  'Other'
];

export const COMMUNICATION_DIRECTIONS = [
  'Incoming',
  'Outgoing',
  'Unknown'
];

export const LOCATION_TYPES = [
  'Crime Scene / Primary Incident Location',
  'Body Recovery Location',
  'Captivity Safehouse / Hideout',
  'Stash House / Warehouse',
  'Ransom / Drop-off Point',
  'Server Datacenter / IP Endpoint',
  'Residence',
  'Business Premise',
  'Transit Terminal / Port Pier',
  'Public Place',
  'Other Location'
];

export const TRANSACTION_METHODS = [
  'Bank Transfer',
  'UPI',
  'Card',
  'Cash',
  'Cryptocurrency / Blockchain',
  'Hawala / Informal Remittance',
  'Ransom / Extortion Payoff',
  'Other',
  'Unknown'
];

export const CURRENCIES = [
  'INR',
  'USD',
  'EUR',
  'GBP',
  'AED',
  'SGD',
  'Other'
];

export const DOCUMENT_TYPES = [
  'Post-Mortem / Autopsy Report',
  'Forensic Lab Report (DNA / Ballistics / Fingerprints)',
  'CCTV Surveillance Footage',
  'Digital Forensic Image / Disk Dump',
  'Server Access / Login Records',
  'Network Packet Capture (PCAP)',
  'Malware Sample / Binary Hash',
  'Telecom CDR / Tower Dump File',
  'Bank Statement / Financial Audit',
  'Seizure Memo / Recovery Panchnama',
  'Medical Injury Report (MLC)',
  'PDF Document',
  'Digital Image / Photo',
  'Audio Recording / Wiretap',
  'Spreadsheet / Ledger',
  'Text Document',
  'Other Digital Evidence'
];

export const DOCUMENT_REVIEW_STATUSES = [
  'Unreviewed',
  'Under Review',
  'Reviewed'
];

export const VEHICLE_TYPES = [
  'Two-Wheeler',
  'Sedan',
  'SUV',
  'Commercial Cargo Truck',
  'Delivery Van',
  'Container Trailer',
  'Boat / Marine Vessel',
  'Other'
];

export const ORGANIZATION_TYPES = [
  'Company',
  'Business',
  'Institution',
  'Other'
];

export const RELATIONSHIP_TYPES = [
  'Communicated With',
  'Financial Transaction With',
  'Associated With Location',
  'Associated With Vehicle',
  'Associated With Organization',
  'Victim-Suspect Motive Link',
  'Eyewitness Sighted At',
  'Attacked / Murdered',
  'Kidnapped / Held In',
  'Exfiltrated Data To',
  'Command & Control Link',
  'Shared Verified Identifier',
  'Mentioned in Same Document',
  'Other'
];

export const RELATIONSHIP_REVIEW_STATUSES = [
  'Unreviewed',
  'Suggested by AI',
  'Confirmed by Investigator',
  'Rejected'
];

export const CASE_STATUSES = [
  { id: 'Active', label: 'Active', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'Under Investigation', label: 'Under Investigation', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'Closed', label: 'Closed', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  { id: 'Archived', label: 'Archived', color: 'bg-blue-50 text-blue-700 border-blue-200' }
];

export const CASE_CATEGORIES = CRIME_TYPES;

// Helper to normalize category ID for backwards compatibility
export const normalizeCategory = (cat) => {
  if (!cat) return 'Person';
  if (cat === 'Documents' || cat === 'Digital' || cat === 'DocumentDigital') {
    return 'DocumentDigital';
  }
  return cat;
};
