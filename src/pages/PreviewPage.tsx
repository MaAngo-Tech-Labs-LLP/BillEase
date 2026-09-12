import React, { useState } from 'react';
import { Download, ArrowLeft, Printer, Share2, Check, Loader2, Sparkles, FileText } from 'lucide-react';
import DocumentRenderer from '../components/DocumentRenderer';
import { BillDocument } from '../types';

interface PreviewPageProps {
  document: BillDocument;
  onBack: () => void;
  onNotify: (msg: string) => void;
}

export default function PreviewPage({
  document,
  onBack,
  onNotify,
}: PreviewPageProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [hasDownloaded, setHasDownloaded] = useState(false);

  const isInvoice = document.type === 'invoice';
  const docNumber = document.billNumber || (isInvoice ? 'INV-2026-1817' : 'BIL-2026-5479');

  const handlePrint = () => {
    const prevTitle = window.document.title;
    window.document.title = isInvoice ? `Invoice_${docNumber}` : `Bill_${docNumber}`;
    window.print();
    setTimeout(() => {
      window.document.title = prevTitle;
    }, 1500);
  };

  const handleDownload = () => {
    setIsDownloading(true);
    const prevTitle = window.document.title;
    window.document.title = isInvoice ? `Invoice_${docNumber}` : `Bill_${docNumber}`;
    setTimeout(() => {
      setIsDownloading(false);
      setHasDownloaded(true);
      onNotify(`${isInvoice ? 'Invoice #' : 'Document #'}${document.billNumber || docNumber} successfully prepared for download!`);
      window.print();
      setTimeout(() => {
        window.document.title = prevTitle;
      }, 1500);
    }, 700);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      onNotify('Document link copied to clipboard!');
    } else {
      onNotify('Sharing link ready.');
    }
  };

  return (
    <div className="preview-page-container" style={{ maxWidth: 1040, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
      {/* Top action bar */}
      <div className="preview-top-action-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <button
          type="button"
          className="btn-secondary-glass"
          onClick={onBack}
        >
          <ArrowLeft size={16} />
          <span>Back to Editor</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn-secondary-glass"
            onClick={handleShare}
            title="Share Document Link"
          >
            <Share2 size={16} />
            <span>Share</span>
          </button>

          <button
            type="button"
            className="btn-secondary-glass"
            onClick={handlePrint}
            title="Print Document"
          >
            <Printer size={16} />
            <span>Print</span>
          </button>

          <button
            type="button"
            className="btn-primary-action"
            onClick={handleDownload}
            disabled={isDownloading}
            style={isInvoice ? { background: '#6E5CB6', borderColor: '#6E5CB6' } : undefined}
          >
            {isDownloading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : hasDownloaded ? (
              <>
                <Check size={16} />
                <span>Downloaded PDF</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>Download PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* PDF Ready Status Banner */}
      <div
        className="preview-status-banner"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.5rem',
          borderRadius: 'var(--radius-md)',
          background: isInvoice ? 'rgba(110, 92, 182, 0.08)' : 'rgba(16, 185, 129, 0.08)',
          border: isInvoice ? '1px solid rgba(110, 92, 182, 0.25)' : '1px solid rgba(16, 185, 129, 0.2)',
          marginBottom: '2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: isInvoice ? 'rgba(110, 92, 182, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              color: isInvoice ? '#6E5CB6' : '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FileText size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>
              {document.billNumber || docNumber} • Ready for PDF Export
            </div>
            <div style={{ fontSize: '0.78rem', opacity: 0.85 }}>
              Standard ISO A4 Portrait • 300 DPI Vector Ready
            </div>
          </div>
        </div>

        <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>
          Client: {document.clientName || '(Not Specified)'}
        </div>
      </div>

      {/* Center A4 Canvas */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 760 }}>
          <DocumentRenderer document={document} />
        </div>
      </div>
    </div>
  );
}
