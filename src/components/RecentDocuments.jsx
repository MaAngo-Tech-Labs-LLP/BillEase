import React from 'react';
import { FileText, Receipt, ArrowUpRight, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * RecentDocuments Component
 * Displays 3 sample recently generated documents in a minimal liquid-glass card list.
 */
export default function RecentDocuments({ onSelectDocument }) {
  const sampleDocs = [
    {
      id: 'doc-1',
      code: 'INV-2024-001',
      type: 'Invoice',
      client: 'Acme Studio Inc.',
      description: 'Brand Identity & Web Assets',
      date: 'May 28, 2026',
      amount: '$1,250.00',
      status: 'Paid',
      statusType: 'paid', // mint style
      icon: FileText,
      accent: 'mint',
    },
    {
      id: 'doc-2',
      code: 'BIL-2024-089',
      type: 'Bill',
      client: 'The Daily Roast Cafe',
      description: 'Artisan Coffee Beans & Supplies',
      date: 'Jun 01, 2026',
      amount: '$84.50',
      status: 'Completed',
      statusType: 'completed', // neutral / subtle style
      icon: Receipt,
      accent: 'neutral',
    },
    {
      id: 'doc-3',
      code: 'INV-2024-002',
      type: 'Invoice',
      client: 'Horizon Technologies',
      description: 'Quarterly Cloud Architecture',
      date: 'Jun 04, 2026',
      amount: '$3,400.00',
      status: 'Pending',
      statusType: 'pending', // lavender style
      icon: FileText,
      accent: 'lavender',
    },
  ];

  return (
    <section className="recent-docs-section" aria-label="Recently Created Documents">
      <div className="recent-docs-header">
        <div className="recent-title-wrap">
          <div className="recent-icon-dot"></div>
          <h2 className="recent-docs-title">Recently Created</h2>
        </div>
        <span className="recent-docs-count">3 recent documents</span>
      </div>

      <div className="recent-docs-list">
        {sampleDocs.map((doc) => {
          const Icon = doc.icon;
          return (
            <div
              key={doc.id}
              className="recent-doc-card-glass"
              onClick={() => onSelectDocument(doc)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectDocument(doc);
                }
              }}
              aria-label={`View ${doc.code} for ${doc.client}`}
            >
              {/* Left: Icon & Code/Client info */}
              <div className="recent-doc-left">
                <div className={`recent-type-icon icon-${doc.accent}`}>
                  <Icon size={18} />
                </div>

                <div className="recent-doc-info">
                  <div className="recent-code-row">
                    <span className="recent-code">{doc.code}</span>
                    <span className="recent-type-tag">{doc.type}</span>
                  </div>
                  <h3 className="recent-client-name">{doc.client}</h3>
                  <p className="recent-item-desc">{doc.description}</p>
                </div>
              </div>

              {/* Right: Date, Amount, Status badge, and View Arrow */}
              <div className="recent-doc-right">
                <div className="recent-meta-wrap">
                  <div className="recent-amount">{doc.amount}</div>
                  <div className="recent-date">
                    <Clock size={12} className="date-icon" />
                    <span>{doc.date}</span>
                  </div>
                </div>

                <div className="recent-status-col">
                  <span className={`status-pill status-${doc.statusType}`}>
                    {doc.statusType === 'paid' && <CheckCircle2 size={12} />}
                    {doc.statusType === 'pending' && <AlertCircle size={12} />}
                    {doc.statusType === 'completed' && <CheckCircle2 size={12} />}
                    <span>{doc.status}</span>
                  </span>

                  <div className="recent-action-arrow" title="View details">
                    <ArrowUpRight size={16} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
