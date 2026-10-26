import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

export const CustomNode = memo(({ data, selected }) => {
  const { name, category, categoryInfo, isFocused, isInShortestPath, isDimmed } = data;
  const Icon = categoryInfo?.icon;
  const color = categoryInfo?.color || '#3478C9';
  const bgColor = categoryInfo?.bgColor || '#EAF4FC';

  let borderRingClass = 'border-[#D7E4F0] hover:border-[#9DBFD8]';
  if (isInShortestPath) {
    borderRingClass = 'border-amber-500 ring-4 ring-amber-400/40 shadow-xl scale-105 z-20';
  } else if (selected || isFocused) {
    borderRingClass = 'border-[#3478C9] ring-2 ring-[#3478C9]/30 shadow-md';
  }

  const opacityClass = isDimmed && !isInShortestPath ? 'opacity-35 transition-opacity duration-200' : 'opacity-100';

  return (
    <div
      className={`min-w-[190px] max-w-[240px] bg-white rounded-lg border shadow-xs transition-all duration-150 select-none ${borderRingClass} ${opacityClass}`}
    >
      {/* Top Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-2.5 h-2.5 bg-[#94A3B8] border-2 border-white rounded-full"
      />

      {/* Header with category color tag */}
      <div
        className="px-3 py-2 flex items-center justify-between border-b border-[#D7E4F0] rounded-t-lg"
        style={{ backgroundColor: isInShortestPath ? '#FEF3C7' : bgColor }}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          {Icon && (
            <Icon
              className="w-3.5 h-3.5 shrink-0"
              style={{ color: isInShortestPath ? '#D97706' : color }}
            />
          )}
          <span
            className="text-[11px] font-semibold uppercase tracking-wider truncate"
            style={{ color: isInShortestPath ? '#B45309' : color }}
          >
            {categoryInfo?.shortLabel || category}
          </span>
        </div>
        <span className="text-[10px] text-[#64748B] font-mono shrink-0 ml-1">
          {data.id}
        </span>
      </div>

      {/* Body: Entity Name & Key identifier */}
      <div className="p-3">
        <div
          className={`text-xs font-bold leading-snug line-clamp-2 ${
            isInShortestPath ? 'text-amber-950 font-extrabold' : 'text-[#243447]'
          }`}
          title={name}
        >
          {name}
        </div>

        {/* Shortest path badge if in path */}
        {isInShortestPath && (
          <div className="inline-block mt-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
            Path Node
          </div>
        )}

        {/* Small subtitle details depending on category */}
        {data.associatedPerson && (
          <div className="text-[11px] text-[#64748B] mt-1 truncate">
            Assoc: <span className="text-[#243447] font-medium">{data.associatedPerson}</span>
          </div>
        )}
        {data.amount && (
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">
            {data.amount}
          </div>
        )}
        {data.vehicleType && (
          <div className="text-[11px] text-[#64748B] mt-1 truncate">
            {data.vehicleType}
          </div>
        )}
      </div>

      {/* Bottom Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2.5 h-2.5 bg-[#3478C9] border-2 border-white rounded-full"
      />
    </div>
  );
});
