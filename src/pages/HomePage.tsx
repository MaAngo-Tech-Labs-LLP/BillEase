import React from 'react';
import {
  ArrowRight,
  FileText,
  Clock,
  ChevronRight,
  Receipt,
  Banknote,
} from 'lucide-react';
import { BillDocument } from '../types';
import { CURRENCY_SYMBOLS } from '../data/templates';

import { calculateBillTotals, formatCurrencyAmount } from '../utils/billCalculations';

interface HomePageProps {
  documents: BillDocument[];
  onNavigate: (tabId: string) => void;
  onSelectDocument: (doc: BillDocument) => void;
}

export default function HomePage({
  documents,
  onNavigate,
  onSelectDocument,
}: HomePageProps) {
  // Sort documents by most recent (updatedAt || createdAt || issueDate)
  const recentDocs = React.useMemo(() => {
    return [...documents]
      .sort((a, b) => {
        const timeA = new Date(a.updatedAt || a.createdAt || a.issueDate).getTime() || 0;
        const timeB = new Date(b.updatedAt || b.createdAt || b.issueDate).getTime() || 0;
        return timeB - timeA;
      })
      .slice(0, 5);
  }, [documents]);

  return (
    <div className="homepage-exact-container">
      {/* 1. Centered Hero Header */}
      <section className="home-hero-centered" aria-label="What will you create">
        <div className="home-hero-tagline">FAST &bull; SIMPLE &bull; PROFESSIONAL</div>
        <h1 className="home-hero-main-title">
          What will <span className="hero-gradient-text">you create?</span>
        </h1>
        <p className="home-hero-main-subtitle">
          Create professional documents in a few simple steps.
        </p>
      </section>

      {/* 2. Action Cards Grid */}
      <section className="home-action-cards-grid" aria-label="Creation Options">
        {/* Card 1: Create Bill */}
        <div
          className="home-card-item quick-action-card card-mint-hover"
          onClick={() => onNavigate('create-bill')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onNavigate('create-bill');
            }
          }}
          role="button"
          tabIndex={0}
        >
          <div className="home-card-top-row">
            <div className="home-card-icon-box icon-box-mint">
              <Banknote size={20} />
            </div>
            <div className="home-card-circle-arrow">
              <ArrowRight size={15} />
            </div>
          </div>

          <div className="home-card-badge badge-mint-pill">QUICK &amp; SIMPLE</div>
          <h2 className="home-card-title">Create Bill</h2>
          <p className="home-card-desc">
            Create a simple bill for your customer in just a few clicks.
          </p>
        </div>

        {/* Card 2: Create Invoice */}
        <div
          className="home-card-item quick-action-card card-lavender-hover"
          onClick={() => onNavigate('create-invoice')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onNavigate('create-invoice');
            }
          }}
          role="button"
          tabIndex={0}
        >
          <div className="home-card-top-row">
            <div className="home-card-icon-box icon-box-lavender">
              <FileText size={20} />
            </div>
            <div className="home-card-circle-arrow">
              <ArrowRight size={15} />
            </div>
          </div>

          <div className="home-card-badge badge-lavender-pill">PROFESSIONAL</div>
          <h2 className="home-card-title">Create Invoice</h2>
          <p className="home-card-desc">
            Create a detailed invoice with items, tax, and payment details.
          </p>
        </div>
      </section>

      {/* 3. Recently Created Section (Connected to My Documents) */}
      <section className="home-recent-wrapper" aria-label="Recently Created">
        <div className="home-recent-top-bar">
          <div
            className="home-recent-title-label"
            onClick={() => onNavigate('my-documents')}
            style={{ cursor: 'pointer' }}
            title="Go to My Documents"
          >
            <Clock size={13} />
            <span>RECENTLY CREATED</span>
          </div>
          <button
            type="button"
            className="home-recent-view-all-link"
            onClick={() => onNavigate('my-documents')}
            title="View all documents in My Documents"
          >
            View all ({documents.length}) →
          </button>
        </div>

        {/* Document list rows */}
        <div className="home-recent-list-container">
          {recentDocs.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '24px',
                color: '#6b7280',
                background: '#ffffff',
                borderRadius: '18px',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                fontSize: '0.9rem',
              }}
            >
              No documents created yet.{' '}
              <button
                type="button"
                onClick={() => onNavigate('create-bill')}
                style={{
                  color: '#059669',
                  fontWeight: 600,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Create your first bill
              </button>
            </div>
          ) : (
            recentDocs.map((doc) => {
              const sym = CURRENCY_SYMBOLS[doc.currency] || '₹';
              const totals = calculateBillTotals(doc);
              const formattedTotal = formatCurrencyAmount(totals.grandTotal, doc.currency);
              const isInvoice = doc.type === 'invoice';

              return (
                <div
                  key={doc.id}
                  className={`home-recent-row-item row-status-${(doc.status || 'paid').toLowerCase()}`}
                  onClick={() => onSelectDocument(doc)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectDocument(doc);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  title={`Open preview for ${doc.billNumber}`}
                >
                  <div className="home-recent-row-left">
                    <div
                      className={`home-recent-square-icon ${
                        isInvoice ? 'icon-invoice-lavender' : 'icon-bill-mint'
                      }`}
                    >
                      {isInvoice ? <FileText size={17} /> : <Receipt size={17} />}
                    </div>
                    <div className="home-recent-meta">
                      <div className="home-recent-doc-title">
                        {isInvoice ? 'Invoice' : 'Bill'} #{doc.billNumber}
                      </div>
                      <div className="home-recent-doc-sub">
                        {doc.clientName || 'Walk-in Customer'} • {doc.issueDate}
                      </div>
                    </div>
                  </div>

                  <div className="home-recent-row-right">
                    <span className="home-recent-amount">
                      {sym}{formattedTotal}
                    </span>
                    <span
                      className={`home-status-tag status-${doc.status?.toLowerCase() || 'paid'}`}
                    >
                      {doc.status || 'Paid'}
                    </span>
                    <ChevronRight size={16} className="home-chevron-icon" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
