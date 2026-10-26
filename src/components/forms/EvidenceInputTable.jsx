import React from 'react';
import { StatusBadge } from './FieldLabel';

export const EvidenceInputTable = ({ children, className = '' }) => {
  return (
    <div className={`overflow-x-auto border border-[#D7E4F0] rounded-lg bg-white shadow-2xs ${className}`}>
      <table className="w-full text-xs text-left border-collapse min-w-[760px]">
        <thead className="bg-[#EAF4FC] text-[#243447] text-xs font-bold border-b border-[#D7E4F0] select-none">
          <tr>
            <th scope="col" className="py-2.5 px-3 w-14 text-center border-r border-[#D7E4F0]">
              No.
            </th>
            <th scope="col" className="py-2.5 px-4 w-64 sm:w-72 border-r border-[#D7E4F0]">
              Parameter
            </th>
            <th scope="col" className="py-2.5 px-4 border-r border-[#D7E4F0]">
              Enter Information
            </th>
            <th scope="col" className="py-2.5 px-4 w-44 text-center">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#D7E4F0] bg-white">
          {children}
        </tbody>
      </table>
    </div>
  );
};

export const EvidenceTableRow = ({
  no,
  parameter,
  subtitle = null,
  status = 'optional',
  statusLabel = null,
  error = null,
  children
}) => {
  return (
    <tr className={`transition-colors ${error ? 'bg-red-50/50' : 'hover:bg-[#F8FAFC]'}`}>
      <td className="py-3 px-3 text-center font-mono text-[#64748B] font-semibold border-r border-[#D7E4F0] align-top select-none">
        {no}
      </td>
      <td className="py-3 px-4 border-r border-[#D7E4F0] align-top">
        <div className="font-bold text-[#243447] text-xs leading-tight">{parameter}</div>
        {subtitle && (
          <div className="text-[10px] text-[#64748B] mt-1 leading-snug">{subtitle}</div>
        )}
      </td>
      <td className="py-2.5 px-4 border-r border-[#D7E4F0] align-top">
        {children}
        {error && (
          <p className="text-xs text-red-600 font-semibold mt-1 animate-in fade-in">
            {error}
          </p>
        )}
      </td>
      <td className="py-3 px-4 text-center align-top whitespace-nowrap">
        <StatusBadge type={status} label={statusLabel} />
      </td>
    </tr>
  );
};
