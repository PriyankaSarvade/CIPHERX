import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X, Check } from 'lucide-react';
import { FieldLabel } from './FieldLabel';

export const MultiSelect = ({
  label,
  options = [],
  value = [], // array of selected IDs or names
  onChange,
  placeholder = 'Select items...',
  required = false,
  compulsory = false,
  error = null,
  disabled = false,
  helpText = null
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  const selectedValues = Array.isArray(value) ? value : [];

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) => {
    const labelText = typeof opt === 'string' ? opt : (opt.label || opt.name || opt.id || '');
    const subText = typeof opt === 'object' && opt.sub ? opt.sub : '';
    const query = search.toLowerCase();
    return labelText.toLowerCase().includes(query) || subText.toLowerCase().includes(query);
  });

  const toggleOption = (opt) => {
    const optVal = typeof opt === 'string' ? opt : (opt.id || opt.value || opt.name);
    let next;
    if (selectedValues.includes(optVal)) {
      next = selectedValues.filter((v) => v !== optVal);
    } else {
      next = [...selectedValues, optVal];
    }
    onChange(next);
  };

  const removeItem = (itemVal, e) => {
    e.stopPropagation();
    onChange(selectedValues.filter((v) => v !== itemVal));
  };

  const getLabelForValue = (val) => {
    const found = options.find((opt) => {
      if (typeof opt === 'string') return opt === val;
      return opt.id === val || opt.value === val || opt.name === val;
    });
    if (!found) return val;
    return typeof found === 'string' ? found : (found.label || found.name || found.id);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <FieldLabel label={label} compulsory={compulsory || required} />
      )}

      {/* Trigger Box */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full min-h-[38px] px-2.5 py-1.5 text-xs bg-white border rounded-md flex flex-wrap items-center gap-1.5 cursor-pointer transition-colors ${
          disabled
            ? 'bg-slate-50 text-slate-400 cursor-not-allowed border-[#D7E4F0]'
            : error
            ? 'border-red-400 ring-1 ring-red-400'
            : isOpen
            ? 'border-[#3478C9] ring-1 ring-[#3478C9]'
            : 'border-[#D7E4F0] hover:border-[#9DBFD8]'
        }`}
      >
        {selectedValues.length === 0 ? (
          <span className="text-[#94A3B8] px-1">{placeholder}</span>
        ) : (
          selectedValues.map((val) => (
            <span
              key={val}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#EAF4FC] text-[#2866AE] border border-[#B9D7F2]"
            >
              <span className="truncate max-w-[140px]">{getLabelForValue(val)}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => removeItem(val, e)}
                  className="hover:text-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))
        )}

        <div className="ml-auto flex items-center pl-1">
          <ChevronDown className={`w-3.5 h-3.5 text-[#64748B] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {helpText && <p className="text-[11px] text-[#64748B] mt-0.5">{helpText}</p>}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#D7E4F0] rounded-md shadow-lg z-50 max-h-56 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="p-2 border-b border-[#D7E4F0] bg-[#F2F7FC]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-2 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                className="w-full pl-7 pr-2 py-1 text-xs bg-white border border-[#D7E4F0] rounded focus:outline-hidden focus:border-[#3478C9]"
              />
            </div>
          </div>

          <div className="overflow-y-auto max-h-44 p-1">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-xs text-[#64748B]">
                No matching options
              </div>
            ) : (
              filteredOptions.map((opt, idx) => {
                const optVal = typeof opt === 'string' ? opt : (opt.id || opt.value || opt.name);
                const optLabel = typeof opt === 'string' ? opt : (opt.label || opt.name || opt.id);
                const optSub = typeof opt === 'object' && opt.sub ? opt.sub : null;
                const isSelected = selectedValues.includes(optVal);

                return (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => toggleOption(opt)}
                    className={`w-full px-2.5 py-1.5 rounded text-left text-xs flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#EAF4FC] text-[#2866AE] font-semibold'
                        : 'text-[#243447] hover:bg-[#F2F7FC]'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="truncate">{optLabel}</div>
                      {optSub && (
                        <div className="text-[10px] text-[#64748B] truncate">{optSub}</div>
                      )}
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#3478C9] shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
