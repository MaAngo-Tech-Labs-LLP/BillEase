import React, { useRef } from 'react';
import { Calendar } from 'lucide-react';

interface DateInputWithPickerProps {
  id?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  title?: string;
}

export default function DateInputWithPicker({
  id,
  value,
  onChange,
  placeholder = 'YYYY-MM-DD',
  disabled = false,
  className = '',
  title = 'Select date',
}: DateInputWithPickerProps) {
  const pickerRef = useRef<HTMLInputElement>(null);

  // Helper to convert any valid date string to ISO YYYY-MM-DD for the native date input
  const toIsoDate = (val: string): string => {
    if (!val) return '';
    const trimmed = val.trim();
    // Match YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }
    // Match DD-MM-YYYY or DD/MM/YYYY
    const dmy = trimmed.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
    if (dmy) {
      const [, d, m, y] = dmy;
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
    // Match YYYY/MM/DD
    const ymd = trimmed.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
    if (ymd) {
      const [, y, m, d] = ymd;
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
    return '';
  };

  const handleOpenPicker = (e: React.MouseEvent) => {
    e.preventDefault();
    if (disabled) return;
    try {
      if (pickerRef.current && typeof pickerRef.current.showPicker === 'function') {
        pickerRef.current.showPicker();
      } else {
        pickerRef.current?.focus();
        pickerRef.current?.click();
      }
    } catch {
      pickerRef.current?.focus();
      pickerRef.current?.click();
    }
  };

  const isoValue = toIsoDate(value);

  return (
    <div className={`date-input-with-picker-wrapper ${className}`}>
      <input
        id={id}
        type="text"
        className="form-input date-text-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
      />
      <div className="date-picker-icon-box" title={title}>
        <button
          type="button"
          tabIndex={-1}
          className="date-picker-icon-btn"
          onClick={handleOpenPicker}
          disabled={disabled}
          aria-label="Open calendar"
        >
          <Calendar size={16} />
        </button>
        <input
          ref={pickerRef}
          type="date"
          className="date-picker-native-overlay"
          value={isoValue}
          onChange={(e) => {
            if (e.target.value) {
              const parts = e.target.value.split('-');
              if (parts.length === 3 && parts[0].length === 4) {
                onChange(`${parts[2]}-${parts[1]}-${parts[0]}`);
              } else {
                onChange(e.target.value);
              }
            }
          }}
          onClick={(e) => {
            try {
              (e.target as HTMLInputElement).showPicker?.();
            } catch (_) {}
          }}
          tabIndex={-1}
          aria-hidden="true"
          disabled={disabled}
        />
      </div>
    </div>
  );
}
