import React, { useEffect } from 'react';
import { Save, AlertTriangle } from 'lucide-react';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  docTypeLabel: 'Bill' | 'Invoice';
  onSaveAndContinue: () => void;
  onCancel: () => void;
}

/**
 * Blocks navigating away from a dirty Bill/Invoice editor until the draft is
 * saved. Deliberately offers no "leave without saving" path — saving is
 * mandatory, matching how the app is meant to guarantee no work is lost when
 * switching between Bill and Invoice (or anywhere else).
 */
export default function UnsavedChangesModal({
  isOpen,
  docTypeLabel,
  onSaveAndContinue,
  onCancel,
}: UnsavedChangesModalProps) {
  // Escape acts the same as Cancel (stay on the page) — never a silent
  // "discard and leave" shortcut.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="delete-modal-backdrop"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="unsaved-changes-title"
    >
      <div className="delete-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="delete-modal-icon-badge delete-modal-icon-badge-warn" aria-hidden="true">
          <AlertTriangle size={24} />
        </div>

        <h2 id="unsaved-changes-title" className="delete-modal-title">
          Unsaved changes
        </h2>
        <p className="delete-modal-desc">
          This {docTypeLabel.toLowerCase()} has changes that haven't been saved yet. Save your draft before
          leaving this page.
        </p>

        <div className="delete-modal-actions">
          <button type="button" className="delete-modal-btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="delete-modal-btn-save"
            onClick={onSaveAndContinue}
            autoFocus
          >
            <Save size={16} />
            <span>Save Draft &amp; Continue</span>
          </button>
        </div>
      </div>
    </div>
  );
}
