import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-xl'
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E293B]/40 backdrop-blur-2xs animate-in fade-in duration-150">
      <div
        className={`bg-white rounded-lg border border-[#D7E4F0] shadow-xl w-full ${maxWidth} max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D7E4F0] bg-[#F2F7FC]">
          <div>
            <h3 className="text-base font-semibold text-[#243447]">{title}</h3>
            {subtitle && (
              <p className="text-xs text-[#64748B] mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-[#64748B] hover:text-[#243447] hover:bg-[#EAF4FC] transition-colors"
            title="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};
