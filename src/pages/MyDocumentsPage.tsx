import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Search,
  Plus,
  Trash2,
  ExternalLink,
  Filter,
  FileText,
  Receipt,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { BillDocument, DocumentType } from '../types';
import { CURRENCY_SYMBOLS } from '../data/templates';
import { calculateBillTotals, formatCurrencyAmount } from '../utils/billCalculations';

interface MyDocumentsPageProps {
  documents: BillDocument[];
  onSelectDocument: (doc: BillDocument) => void;
  onDeleteDocument: (id: string) => void;
  onNavigate: (tabId: string) => void;
}

export default function MyDocumentsPage({
  documents,
  onSelectDocument,
  onDeleteDocument,
  onNavigate,
}: MyDocumentsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'bill' | 'invoice' | 'Paid' | 'Sent' | 'Pending' | 'Draft'>('all');

  const filteredDocs = useMemo(() => {
    return [...documents]
      .filter((doc) => {
        // Filter by type or status
        if (activeFilter === 'bill' && doc.type !== 'bill') return false;
        if (activeFilter === 'invoice' && doc.type !== 'invoice') return false;
        if (
          (activeFilter === 'Paid' || activeFilter === 'Sent' || activeFilter === 'Pending' || activeFilter === 'Draft') &&
          doc.status !== activeFilter
        ) {
          return false;
        }

        // Filter by search term
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            doc.billNumber.toLowerCase().includes(q) ||
            doc.clientName.toLowerCase().includes(q) ||
            doc.title.toLowerCase().includes(q)
          );
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.updatedAt || a.createdAt || a.issueDate).getTime() || 0;
        const timeB = new Date(b.updatedAt || b.createdAt || b.issueDate).getTime() || 0;
        return timeB - timeA;
      });
  }, [documents, activeFilter, searchQuery]);

  return (
    <div className="my-documents-container" style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
            <span>Workspace</span>
            <span>•</span>
            <span>Document Repository</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            My Documents
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Manage, review, and export all your created bills and invoices.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn-secondary-glass"
            onClick={() => onNavigate('create-bill')}
          >
            <Receipt size={16} />
            <span>+ New Bill</span>
          </button>
          <button
            type="button"
            className="btn-primary-action"
            onClick={() => onNavigate('create-invoice')}
          >
            <FileText size={16} />
            <span>+ New Invoice</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', background: 'var(--glass-bg)', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', boxShadow: 'var(--glass-shadow)' }}>
        {/* Search Input */}
        <div style={{ position: 'relative', minWidth: 280, flex: '1 1 280px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.4rem' }}
            placeholder="Search by client, bill #, or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All' },
            { id: 'bill', label: 'Bills' },
            { id: 'invoice', label: 'Invoices' },
            { id: 'Paid', label: 'Paid' },
            { id: 'Sent', label: 'Sent' },
            { id: 'Pending', label: 'Pending' },
            { id: 'Draft', label: 'Draft' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id as any)}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.82rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 150ms ease',
                background: activeFilter === tab.id ? 'var(--builder-accent, #3525cd)' : 'var(--bg-ivory-soft)',
                color: activeFilter === tab.id ? '#ffffff' : 'var(--text-secondary)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Table / Grid */}
      {filteredDocs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--glass-bg)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--glass-border)' }}>
          <FileSpreadsheet size={40} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>No documents found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
            Try adjusting your search query or create a new document.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredDocs.map((doc) => {
            const sym = CURRENCY_SYMBOLS[doc.currency] || '$';
            const totals = calculateBillTotals(doc);
            const total = totals.grandTotal;
            const statusClass =
              doc.status === 'Paid'
                ? 'status-paid'
                : doc.status === 'Sent'
                ? 'status-sent'
                : 'status-draft';

            return (
              <div
                key={doc.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.15rem 1.5rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  boxShadow: 'var(--glass-shadow)',
                  gap: '1.25rem',
                  flexWrap: 'wrap',
                }}
              >
                {/* Left: Code, Title, Client */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 260 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: doc.type === 'bill' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(139, 92, 246, 0.12)',
                      color: doc.type === 'bill' ? '#10b981' : '#8b5cf6',
                    }}
                  >
                    {doc.type === 'bill' ? <Receipt size={22} /> : <FileText size={22} />}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                        {doc.billNumber}
                      </span>
                      <span className={`recent-status-pill ${statusClass}`}>{doc.status}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {doc.clientName}
                    </div>
                  </div>
                </div>

                {/* Center: Dates */}
                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Issue</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{doc.issueDate}</span>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Due</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{doc.dueDate}</span>
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {sym}
                      {formatCurrencyAmount(total, doc.currency)}
                    </span>
                    <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      {doc.currency}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className="btn-secondary-glass"
                      style={{ padding: '0.5rem 0.9rem', fontSize: '0.82rem' }}
                      onClick={() => onSelectDocument(doc)}
                      title="Open & Preview"
                    >
                      <ExternalLink size={15} />
                      <span>Open</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteDocument(doc.id)}
                      style={{
                        padding: '0.55rem',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-muted)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                      title="Delete document"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
