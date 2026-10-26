import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Notification = ({ notification, onClose }) => {
  if (!notification) return null;

  const { message, type } = notification;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />;
      case 'danger':
        return <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-[#3478C9] shrink-0" />;
    }
  };

  const getBg = () => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 border-emerald-200 text-emerald-900';
      case 'danger':
        return 'bg-red-50 border-red-200 text-red-900';
      default:
        return 'bg-[#EAF4FC] border-[#B9D7F2] text-[#243447]';
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm animate-in slide-in-from-bottom-3 duration-200">
      <div
        className={`flex items-start gap-3 p-3.5 rounded-lg border shadow-md text-sm ${getBg()}`}
      >
        <div className="mt-0.5">{getIcon()}</div>
        <div className="flex-1 text-xs font-medium leading-relaxed">{message}</div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 ml-1 p-0.5"
            title="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
