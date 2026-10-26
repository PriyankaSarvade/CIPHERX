import React from 'react';
import { EVIDENCE_CATEGORIES } from '../../constants/categories';

export const GraphLegend = () => {
  return (
    <div className="bg-white/95 backdrop-blur-2xs p-3 rounded-lg border border-[#D7E4F0] shadow-xs max-w-xs text-xs">
      <div className="font-semibold text-[#243447] text-[11px] uppercase tracking-wider mb-2">
        Entity Categories
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
        {EVIDENCE_CATEGORIES.filter((c) => c.id !== 'Relationships').map((cat) => {
          const Icon = cat.icon;
          return (
            <div key={cat.id} className="flex items-center gap-1.5 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-[11px] text-[#243447] truncate" title={cat.label}>
                {cat.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-2.5 pt-2 border-t border-[#D7E4F0] text-[10px] text-[#64748B]">
        Drag nodes • Scroll to zoom • Click node or edge to inspect details
      </div>
    </div>
  );
};
