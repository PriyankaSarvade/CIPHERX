import React from 'react';

export const Badge = ({ children, variant = 'default', className = '' }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'active':
      case 'success':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'investigation':
      case 'warning':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'danger':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'blue':
      case 'primary':
        return 'bg-[#EAF4FC] text-[#2866AE] border-[#B9D7F2]';
      case 'neutral':
      case 'closed':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-[#F2F7FC] text-[#243447] border-[#D7E4F0]';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getVariantStyles()} ${className}`}
    >
      {children}
    </span>
  );
};
