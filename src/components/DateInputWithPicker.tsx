import React, { useRef } from 'react';
import { Calendar } from 'lucide-react';
import { toIsoDate } from '../utils/dates';

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
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onBlur={(e) => {
          // Normalize whatever the user typed to canonical ISO (YYYY-MM-DD)
          // once they're done editing, so every stored date is unambiguous
          // regardless of which format (DD-MM-YYYY, DD/MM/YYYY, etc.) they
          // typed it in. Leave unparseable/partial input alone rather than
          // silently blanking it.
          const iso = toIsoDate(e.target.value);
          if (iso && iso !== e.target.value) {
            onChange(iso);
          }
        }}
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
              onChange(e.target.value);
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
