import React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  FileSpreadsheet,
  Network,
  Compass,
  Bot,
  ShieldCheck,
  RotateCcw,
  Trash2
} from 'lucide-react';
import { useCaseContext } from '../../context/CaseContext';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'cases', label: 'Cases', icon: FolderKanban },
  { id: 'evidence', label: 'Evidence Management', icon: FileSpreadsheet },
  { id: 'network', label: 'Network Explorer', icon: Network },
  { id: 'finder', label: 'Connection Finder', icon: Compass },
  { id: 'assistant', label: 'AI Assistant', icon: Bot }
];

export const Sidebar = () => {
  const {
    activeTab,
    setActiveTab,
    cases,
    activeCase,
    activeCaseEvidence,
    resetToSampleData,
    clearAllData
  } = useCaseContext();

  return (
    <aside className="w-64 bg-[#F2F7FC] border-r border-[#D7E4F0] flex flex-col shrink-0 select-none min-h-screen">
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-[#D7E4F0] flex items-center gap-3 bg-white">
        <div className="w-9 h-9 rounded-md bg-[#3478C9] flex items-center justify-center text-white shadow-xs">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-base tracking-tight text-[#243447]">CIPERX</span>
            <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-[#EAF4FC] text-[#2866AE] border border-[#B9D7F2]">
              PROTOTYPE
            </span>
          </div>
          <p className="text-[11px] text-[#64748B] font-medium leading-none mt-0.5">
            Criminal Network Analysis
          </p>
        </div>
      </div>

      {/* Active Case Context Pill */}
      {activeCase ? (
        <div className="mx-3 mt-3 p-2.5 bg-white border border-[#D7E4F0] rounded-md">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B] flex items-center justify-between">
            <span>Active Case</span>
            <span className="text-[#3478C9] font-medium">{activeCase.id}</span>
          </div>
          <div className="text-xs font-semibold text-[#243447] truncate mt-1" title={activeCase.name}>
            {activeCase.name}
          </div>
          <div className="text-[11px] text-[#64748B] mt-0.5">
            {activeCaseEvidence.length} items logged
          </div>
        </div>
      ) : (
        <div className="mx-3 mt-3 p-2.5 bg-[#EAF4FC] border border-[#B9D7F2] rounded-md text-center text-xs text-[#2866AE]">
          No active case selected
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-2 pb-1.5 text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
          Investigation Workflow
        </div>

        {NAV_ITEMS.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium transition-colors text-left cursor-pointer ${
                isActive
                  ? 'bg-[#3478C9] text-white shadow-xs font-semibold'
                  : 'text-[#243447] hover:bg-[#EAF4FC] hover:text-[#2866AE]'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#64748B]'}`} />
              <span className="flex-1">{item.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded ${
                isActive ? 'bg-white/20 text-white' : 'text-[#94A3B8]'
              }`}>
                0{index + 1}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Demonstration Controls & Notice */}
      <div className="p-3 border-t border-[#D7E4F0] bg-[#F2F7FC] space-y-2">
        <div className="text-[10px] font-semibold uppercase text-[#64748B] px-1">
          Workspace Data
        </div>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={resetToSampleData}
            className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-white border border-[#D7E4F0] rounded text-[11px] text-[#243447] hover:bg-[#EAF4FC] hover:text-[#2866AE] transition-colors cursor-pointer"
            title="Reset to pre-loaded fictional investigation data"
          >
            <RotateCcw className="w-3 h-3 text-[#3478C9]" />
            Reset Data
          </button>
          <button
            type="button"
            onClick={clearAllData}
            className="flex items-center justify-center gap-1 px-2 py-1.5 bg-white border border-[#D7E4F0] rounded text-[11px] text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            title="Clear all workspace data to test empty states"
          >
            <Trash2 className="w-3 h-3 text-red-500" />
            Clear
          </button>
        </div>

        <div className="p-2 bg-white rounded border border-[#D7E4F0] text-[10px] text-[#64748B] leading-tight">
          <span className="font-semibold text-[#243447]">Notice:</span> Demonstration prototype. All records are fictional and stored locally.
        </div>
      </div>
    </aside>
  );
};
