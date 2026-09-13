import React, { useEffect } from 'react';
import { HelpCircle, X } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FAQ_ITEMS = [
  {
    q: 'How do I create a bill or invoice?',
    a: 'Click "Create Bill" or "Create Invoice" from the top navigation or the Home page, fill in the details, then Save Draft, Preview, or Create/Download when you\'re done.',
  },
  {
    q: 'Where do my saved documents go?',
    a: 'Everything you create appears in "My Documents", and your most recent ones show up on the Home page too.',
  },
  {
    q: 'What happens if I don\'t finish a document?',
    a: 'Use "Save Draft" any time — it keeps your progress so you can pick up right where you left off next time.',
  },
  {
    q: 'Can I reuse my business details every time?',
    a: 'Yes — open "Profile & Settings" to save your business logo, name, and contact details once, and they\'ll auto-fill new documents.',
  },
];

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="help-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
    >
      <div className="help-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="help-modal-header">
          <div className="help-modal-title-group">
            <div className="help-modal-icon-badge" aria-hidden="true">
              <HelpCircle size={20} />
            </div>
            <h2 id="help-modal-title" className="help-modal-title">
              Help &amp; FAQ
            </h2>
          </div>
          <button
            type="button"
            className="help-modal-close-btn"
            onClick={onClose}
            aria-label="Close Help"
          >
            <X size={16} />
          </button>
        </div>

        <div className="help-modal-body">
          {FAQ_ITEMS.map((item) => (
            <div key={item.q} className="help-modal-faq-item">
              <p className="help-modal-faq-q">{item.q}</p>
              <p className="help-modal-faq-a">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
