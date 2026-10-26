import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { FieldLabel } from './FieldLabel';

export const MultiInput = ({
  label,
  items = [],
  onChange,
  placeholder = 'Add new entry...',
  type = 'text',
  helpText = null,
  required = false,
  compulsory = false,
  error = null
}) => {
  const [inputValue, setInputValue] = useState('');

  const currentItems = Array.isArray(items) ? items : [];

  const handleAdd = (e) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    if (!currentItems.includes(inputValue.trim())) {
      onChange([...currentItems, inputValue.trim()]);
    }
    setInputValue('');
  };

  const handleRemove = (index) => {
    const updated = currentItems.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div>
      {label && (
        <FieldLabel label={label} compulsory={compulsory || required} />
      )}

      {/* Input row */}
      <div className="flex gap-2">
        <input
          type={type}
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`flex-1 px-3 py-2 text-xs bg-white border rounded-md focus:outline-hidden focus:ring-1 focus:ring-[#3478C9] ${
            error ? 'border-red-400' : 'border-[#D7E4F0]'
          }`}
        />
        <button
          type="button"
          onClick={handleAdd}
          className="px-3 py-2 bg-[#EAF4FC] hover:bg-[#D7E4F0] text-[#2866AE] border border-[#B9D7F2] rounded-md text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add
        </button>
      </div>

      {helpText && <p className="text-[11px] text-[#64748B] mt-1">{helpText}</p>}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      {/* Tags List */}
      {currentItems.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {currentItems.map((item, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-[#F2F7FC] text-[#243447] border border-[#D7E4F0]"
            >
              <span>{item}</span>
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="text-[#94A3B8] hover:text-red-600 transition-colors"
                title="Remove"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
