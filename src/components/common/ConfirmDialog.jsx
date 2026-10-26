import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './Button';

export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isDestructive = true
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E293B]/40 backdrop-blur-2xs animate-in fade-in duration-150">
      <div className="bg-white rounded-lg border border-[#D7E4F0] shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-150">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-red-50 text-red-600 shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#243447]">{title}</h3>
            <p className="text-sm text-[#64748B] mt-1.5 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <Button variant="secondary" size="md" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant={isDestructive ? 'danger-filled' : 'primary'}
            size="md"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
