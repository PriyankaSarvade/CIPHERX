import React from 'react';
import {
  FolderKanban,
  UserCheck,
  ChevronRight,
  Shield,
  Layers
} from 'lucide-react';
import { useCaseContext } from '../../context/CaseContext';
import { NAV_ITEMS } from './Sidebar';

export const Header = () => {
  const {
    activeTab,
    cases,
    activeCaseId,
    setActiveCaseId,
    activeCase
  } = useCaseContext();

  const currentNav = NAV_ITEMS.find((item) => item.id === activeTab) || NAV_ITEMS[0];

  return (
    <header className="h-16 bg-white border-b border-[#D7E4F0] px-6 flex items-center justify-between shrink-0">
      {/* Title & Breadcrumbs */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-[#64748B]">CIPERX</span>
        <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
        <h1 className="text-sm font-semibold text-[#243447] m-0 flex items-center gap-2">
          {currentNav.label}
        </h1>
        {activeCase && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span className="text-xs px-2 py-0.5 rounded bg-[#EAF4FC] text-[#2866AE] border border-[#B9D7F2] font-medium truncate max-w-[200px]">
              {activeCase.id}: {activeCase.name}
            </span>
          </>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Active Case Selector */}
        {cases.length > 0 && (
          <div className="flex items-center gap-1.5 bg-[#F2F7FC] border border-[#D7E4F0] rounded-md px-2.5 py-1.5">
            <FolderKanban className="w-3.5 h-3.5 text-[#3478C9]" />
            <label htmlFor="case-select" className="text-xs font-medium text-[#64748B] shrink-0">
              Case:
            </label>
            <select
              id="case-select"
              value={activeCaseId}
              onChange={(e) => setActiveCaseId(e.target.value)}
              className="bg-transparent text-xs font-semibold text-[#243447] focus:outline-hidden cursor-pointer"
            >
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id} – {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Investigator User Profile */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-[#D7E4F0]">
          <div className="w-8 h-8 rounded-full bg-[#EAF4FC] border border-[#B9D7F2] flex items-center justify-center text-[#2866AE]">
            <Shield className="w-4 h-4" />
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-semibold text-[#243447] leading-none">
              Insp. A. Sharma
            </div>
            <div className="text-[10px] text-[#64748B] mt-0.5 leading-none">
              Senior Crime Analyst • ID #8841
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
