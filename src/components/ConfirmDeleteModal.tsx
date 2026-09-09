import React, { useEffect } from 'react';
import { Trash2, X } from 'lucide-react';
import { BillDocument } from '../types';
import { CURRENCY_SYMBOLS } from '../data/templates';
import { calculateBillTotals, formatCurrencyAmount } from '../utils/billCalculations';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  document: BillDocument | null;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmDeleteModal({
  isOpen,
  document,
  onConfirm,
  onClose,
}: ConfirmDeleteModalProps) {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !document) return null;

  const sym = CURRENCY_SYMBOLS[document.currency] || '₹';
  const totals = calculateBillTotals(document);
  const formattedTotal = formatCurrencyAmount(totals.grandTotal, document.currency);
  const docTypeLabel = document.type === 'invoice' ? 'Invoice' : 'Bill';

  return (
    <div
      className="delete-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
    >
      <div className="delete-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Top Close Button */}
        <button
          type="button"
          className="delete-modal-close-btn"
          onClick={onClose}
          aria-label="Close confirmation dialog"
        >
          <X size={16} />
        </button>

        {/* Warning Icon Badge */}
        <div className="delete-modal-icon-badge" aria-hidden="true">
          <Trash2 size={24} />
        </div>

        {/* Header Text */}
        <h2 id="confirm-delete-title" className="delete-modal-title">
          Delete {docTypeLabel}?
        </h2>
        <p className="delete-modal-desc">
          Are you sure you want to delete this {docTypeLabel.toLowerCase()}? This action cannot be undone.
        </p>

        {/* Document Quick Summary Box */}
        <div className="delete-modal-doc-preview">
          <div className="delete-modal-preview-row">
            <span className="delete-modal-preview-label">{docTypeLabel} Number</span>
            <span className="delete-modal-preview-val" style={{ fontWeight: 700 }}>
              {document.billNumber}
            </span>
          </div>
          <div className="delete-modal-preview-row">
            <span className="delete-modal-preview-label">Client / Customer</span>
            <span className="delete-modal-preview-val">
              {document.clientName || 'Walk-in Customer'}
            </span>
          </div>
          <div className="delete-modal-preview-row">
            <span className="delete-modal-preview-label">Total Amount</span>
            <span className="delete-modal-preview-val delete-modal-amount">
              {sym}{formattedTotal} {document.currency}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="delete-modal-actions">
          <button
            type="button"
            className="delete-modal-btn-cancel"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="delete-modal-btn-delete"
            onClick={onConfirm}
            autoFocus
          >
            <Trash2 size={16} />
            <span>Delete {docTypeLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
