import React, { useState } from 'react';
import {
  FolderKanban,
  FileSpreadsheet,
  Network,
  Activity,
  Plus,
  ArrowRight,
  Shield,
  Layers,
  Clock,
  Compass,
  Bot
} from 'lucide-react';
import { useCaseContext } from '../context/CaseContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { CaseFormModal } from '../components/forms/CaseFormModal';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { EVIDENCE_CATEGORIES, normalizeCategory } from '../constants/categories';

export const DashboardPage = () => {
  const {
    cases,
    evidence,
    activeCase,
    setActiveCaseId,
    setActiveTab,
    addCase
  } = useCaseContext();

  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);

  // Live Metric Calculations
  const totalCases = cases.length;
  const activeCases = cases.filter((c) => c.status === 'Active').length;
  const totalEvidenceItems = evidence.filter((e) => e.category !== 'Relationships').length;
  const totalConnections = evidence.filter((e) => e.category === 'Relationships').length;

  // Chart data: Evidence category distribution for the active case
  const activeEvidence = activeCase
    ? evidence.filter((e) => e.caseId === activeCase.id && e.category !== 'Relationships')
    : [];

  const categoryCounts = {};
  activeEvidence.forEach((e) => {
    const norm = normalizeCategory(e.category);
    categoryCounts[norm] = (categoryCounts[norm] || 0) + 1;
  });

  const chartData = Object.entries(categoryCounts).map(([cat, count]) => {
    const meta = EVIDENCE_CATEGORIES.find((c) => c.id === cat);
    return {
      name: meta?.shortLabel || cat,
      count,
      color: meta?.color || '#3478C9'
    };
  });

  const handleOpenCase = (caseId) => {
    setActiveCaseId(caseId);
    setActiveTab('evidence');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome & Quick Action */}
      <div className="bg-white rounded-lg border border-[#D7E4F0] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#243447]">
              Criminal Network Analysis Dashboard
            </h2>
            <Badge variant="blue">Investigation Support</Badge>
          </div>
          <p className="text-xs text-[#64748B] mt-1 max-w-2xl leading-relaxed">
            Organize case files, log multi-category evidence, discover entity linkages, and explore 
            investigative network graphs.
          </p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setIsCaseModalOpen(true)}
        >
          Create New Case
        </Button>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Cases */}
        <div className="bg-white rounded-lg border border-[#D7E4F0] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B]">Total Cases</span>
            <div className="p-2 rounded-md bg-[#EAF4FC] text-[#3478C9]">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#243447]">{totalCases}</span>
            <span className="text-xs text-[#64748B]">case dossiers</span>
          </div>
        </div>

        {/* Active Cases */}
        <div className="bg-white rounded-lg border border-[#D7E4F0] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B]">Active Cases</span>
            <div className="p-2 rounded-md bg-emerald-50 text-emerald-600">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-700">{activeCases}</span>
            <span className="text-xs text-[#64748B]">inquiry ongoing</span>
          </div>
        </div>

        {/* Evidence Items */}
        <div className="bg-white rounded-lg border border-[#D7E4F0] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B]">Evidence Items</span>
            <div className="p-2 rounded-md bg-[#EFF6FF] text-[#2563EB]">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#243447]">{totalEvidenceItems}</span>
            <span className="text-xs text-[#64748B]">across 10 categories</span>
          </div>
        </div>

        {/* Recorded Connections */}
        <div className="bg-white rounded-lg border border-[#D7E4F0] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B]">Recorded Connections</span>
            <div className="p-2 rounded-md bg-violet-50 text-violet-600">
              <Network className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-violet-700">{totalConnections}</span>
            <span className="text-xs text-[#64748B]">evidentiary links</span>
          </div>
        </div>
      </div>

      {/* Investigation Workflow Stepper Guide */}
      <div className="bg-white rounded-lg border border-[#D7E4F0] p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-[#243447] flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#3478C9]" />
            Standard Investigation Workflow
          </h3>
          <span className="text-[11px] text-[#64748B]">Interactive Pipeline</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-2 text-xs">
          <div
            onClick={() => setActiveTab('cases')}
            className="p-3 rounded-md bg-[#F2F7FC] hover:bg-[#EAF4FC] border border-[#D7E4F0] cursor-pointer transition-colors"
          >
            <div className="font-bold text-[#3478C9] mb-1">Step 1</div>
            <div className="font-semibold text-[#243447]">Create Case</div>
            <p className="text-[11px] text-[#64748B] mt-0.5">Register scope and lead officer</p>
          </div>

          <div
            onClick={() => setActiveTab('evidence')}
            className="p-3 rounded-md bg-[#F2F7FC] hover:bg-[#EAF4FC] border border-[#D7E4F0] cursor-pointer transition-colors"
          >
            <div className="font-bold text-[#3478C9] mb-1">Step 2</div>
            <div className="font-semibold text-[#243447]">Log Evidence</div>
            <p className="text-[11px] text-[#64748B] mt-0.5">Categorize persons, phones, vehicles</p>
          </div>

          <div
            onClick={() => setActiveTab('evidence')}
            className="p-3 rounded-md bg-[#F2F7FC] hover:bg-[#EAF4FC] border border-[#D7E4F0] cursor-pointer transition-colors"
          >
            <div className="font-bold text-[#3478C9] mb-1">Step 3</div>
            <div className="font-semibold text-[#243447]">Map Relationships</div>
            <p className="text-[11px] text-[#64748B] mt-0.5">Link entities with supporting proof</p>
          </div>

          <div
            onClick={() => setActiveTab('network')}
            className="p-3 rounded-md bg-[#F2F7FC] hover:bg-[#EAF4FC] border border-[#D7E4F0] cursor-pointer transition-colors"
          >
            <div className="font-bold text-[#3478C9] mb-1">Step 4</div>
            <div className="font-semibold text-[#243447]">Network Graph</div>
            <p className="text-[11px] text-[#64748B] mt-0.5">Interactive entity exploration</p>
          </div>

          <div
            onClick={() => setActiveTab('finder')}
            className="p-3 rounded-md bg-[#F2F7FC] hover:bg-[#EAF4FC] border border-[#D7E4F0] cursor-pointer transition-colors"
          >
            <div className="font-bold text-[#3478C9] mb-1">Step 5</div>
            <div className="font-semibold text-[#243447]">Connection Finder</div>
            <p className="text-[11px] text-[#64748B] mt-0.5">Trace direct & 2-hop links</p>
          </div>

          <div
            onClick={() => setActiveTab('assistant')}
            className="p-3 rounded-md bg-[#F2F7FC] hover:bg-[#EAF4FC] border border-[#D7E4F0] cursor-pointer transition-colors"
          >
            <div className="font-bold text-[#3478C9] mb-1">Step 6</div>
            <div className="font-semibold text-[#243447]">AI Assistant</div>
            <p className="text-[11px] text-[#64748B] mt-0.5">Query case records transparently</p>
          </div>
        </div>
      </div>

      {/* Active Case Evidence Chart & Overview */}
      {activeCase && chartData.length > 0 && (
        <div className="bg-white rounded-lg border border-[#D7E4F0] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#243447]">
                Evidence Distribution: {activeCase.name}
              </h3>
              <p className="text-xs text-[#64748B]">
                Count of documented evidence items by category in the active case
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={ArrowRight}
              onClick={() => setActiveTab('evidence')}
            >
              Manage Evidence
            </Button>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#D7E4F0',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Cases Table */}
      <div className="bg-white rounded-lg border border-[#D7E4F0] shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-[#D7E4F0] flex items-center justify-between bg-[#F2F7FC]">
          <div>
            <h3 className="text-sm font-bold text-[#243447]">Recent Case Files</h3>
            <p className="text-xs text-[#64748B]">All registered investigation dossiers</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setActiveTab('cases')}
          >
            View All Cases
          </Button>
        </div>

        {cases.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#64748B]">
            No cases recorded. Click "Create New Case" to begin an investigation.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#D7E4F0] bg-white text-[#64748B] font-semibold">
                  <th className="py-3 px-4">Case ID</th>
                  <th className="py-3 px-4">Case Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Lead Officer</th>
                  <th className="py-3 px-4">Last Updated</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D7E4F0]">
                {cases.map((c) => {
                  const isActiveCase = activeCase?.id === c.id;
                  const caseEvidenceCount = evidence.filter((e) => e.caseId === c.id).length;

                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-[#F2F7FC] transition-colors ${
                        isActiveCase ? 'bg-[#EAF4FC]/60' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-semibold text-[#2866AE]">
                        {c.id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#243447]">{c.name}</div>
                        <div className="text-[11px] text-[#64748B] truncate max-w-xs">
                          {c.description}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#64748B]">{c.category}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            c.status === 'Active'
                              ? 'active'
                              : c.status === 'Under Investigation'
                              ? 'investigation'
                              : 'closed'
                          }
                        >
                          {c.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-[#243447]">{c.officer}</td>
                      <td className="py-3 px-4 text-[#64748B]">{c.lastUpdated || c.dateOpened}</td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant={isActiveCase ? 'primary' : 'secondary'}
                          size="sm"
                          onClick={() => handleOpenCase(c.id)}
                        >
                          {isActiveCase ? 'Open Workspace' : 'Select Case'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Case Creation Modal */}
      <CaseFormModal
        isOpen={isCaseModalOpen}
        onClose={() => setIsCaseModalOpen(false)}
        onSubmit={addCase}
      />
    </div>
  );
};
