import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export const FormSection = ({
  title,
  subtitle,
  children,
  defaultOpen = true,
  badge = null,
  icon: Icon = null
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-lg border border-[#D7E4F0] shadow-2xs overflow-hidden transition-all duration-150 mb-3">
      {/* Header with toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-[#F2F7FC]/70 hover:bg-[#F2F7FC] flex items-center justify-between text-left cursor-pointer transition-colors border-b border-[#D7E4F0]"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-[#3478C9]" />}
          <div>
            <div className="text-xs font-bold text-[#243447] flex items-center gap-2">
              <span>{title}</span>
              {badge && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EAF4FC] text-[#2866AE] border border-[#B9D7F2]">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-[11px] text-[#64748B] mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="p-1 rounded text-[#64748B] hover:text-[#243447]">
          {isOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      </button>

      {/* Collapsible Body */}
      {isOpen && <div className="p-4">{children}</div>}
    </div>
  );
};
