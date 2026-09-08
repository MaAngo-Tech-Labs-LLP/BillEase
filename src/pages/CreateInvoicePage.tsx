import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Download,
  Eye,
  Send,
  Loader2,
  LayoutGrid,
  ArrowRight,
  X,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';
import DocumentRenderer from '../components/DocumentRenderer';
import DateInputWithPicker from '../components/DateInputWithPicker';
import { BillDocument, CurrencyCode, TemplateId } from '../types';
import {
  DEFAULT_INVOICE,
  CURRENCY_SYMBOLS,
  TEMPLATES,
  INVOICE_TEMPLATES,
  BILL_TEMPLATES,
  normalizeTemplateId,
} from '../data/templates';

interface CreateInvoicePageProps {
  initialDocument?: BillDocument;
  onSave: (doc: BillDocument) => void;
  onNavigate: (tabId: string) => void;
  onNotify: (msg: string) => void;
}

export default function CreateInvoicePage({
  initialDocument,
  onSave,
  onNavigate,
  onNotify,
}: CreateInvoicePageProps) {
  const [showGallery, setShowGallery] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const [formData, setFormData] = useState<BillDocument>(() => {
    if (initialDocument) {
      return {
        ...DEFAULT_INVOICE,
        ...initialDocument,
        type: 'invoice',
        template: normalizeTemplateId(initialDocument.template || 'classic-pro'),
      };
    }
    const saved = localStorage.getItem('billease_invoice_draft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_INVOICE,
          ...parsed,
          type: 'invoice',
          template: normalizeTemplateId(parsed.template || 'classic-pro', 'invoice'),
        };
      } catch (e) {
        console.error(e);
      }
    }
    return {
      ...DEFAULT_INVOICE,
      type: 'invoice',
      template: 'classic-pro',
    };
  });

  // Sync initialDocument and localStorage whenever template changes or user applies from Templates page
  useEffect(() => {
    if (initialDocument) {
      setFormData((prev) => ({
        ...prev,
        ...initialDocument,
        template: normalizeTemplateId(initialDocument.template || prev.template, 'invoice'),
      }));
    } else {
      const stored = localStorage.getItem('billease_active_template');
      if (stored) {
        setFormData((prev) => ({
          ...prev,
          template: normalizeTemplateId(stored, 'invoice'),
        }));
      }
    }
  }, [initialDocument]);

  // Keep draft persisted in localStorage so switching to Templates and back retains all data
  useEffect(() => {
    try {
      localStorage.setItem('billease_invoice_draft', JSON.stringify(formData));
    } catch (_) {}
  }, [formData]);

  const currencySymbol = CURRENCY_SYMBOLS[formData.currency] || '$';

  const subtotal = useMemo(() => {
    return formData.items.reduce((sum, item) => {
      const q = Number(item.qty) || 0;
      const r = Number(item.rate) || 0;
      return sum + q * r;
    }, 0);
  }, [formData.items]);

  const taxAmount = useMemo(() => {
    const rate = Number(formData.taxRate) || 0;
    return (subtotal * rate) / 100;
  }, [subtotal, formData.taxRate]);

  const totalDue = useMemo(() => {
    return subtotal + taxAmount;
  }, [subtotal, taxAmount]);

  const formatPrice = (amount: number) => {
    const sym = CURRENCY_SYMBOLS[formData.currency] || '$';
    return `${sym}${Number(amount || 0).toFixed(2)}`;
  };

  const handleInputChange = (field: keyof BillDocument, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (id: string, field: 'description' | 'qty' | 'rate', value: string) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((it) => {
        if (it.id === id) {
          const parsed = field === 'qty' || field === 'rate' ? Math.max(0, parseFloat(value) || 0) : value;
          return { ...it, [field]: parsed };
        }
        return it;
      }),
    }));
  };

  const handleStepQty = (id: string, delta: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((it) => {
        if (it.id === id) {
          const current = Number(it.qty) || 1;
          const next = Math.max(1, current + delta);
          return { ...it, qty: next };
        }
        return it;
      }),
    }));
  };

  const handleAddItem = () => {
    const newItem = {
      id: Date.now().toString(),
      description: 'Consulting & Engineering Deliverable',
      qty: 1,
      rate: 100,
    };
    setFormData((prev) => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const handleRemoveItem = (id: string) => {
    if (formData.items.length <= 1) {
      onNotify('At least one item is required on the invoice.');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((it) => it.id !== id),
    }));
  };

  const handleSaveDraft = () => {
    const isTemplateDefaultId = !formData.id || formData.id === 'inv-acme-design' || formData.id.startsWith('default-');
    const uniqueId = isTemplateDefaultId
      ? `inv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
      : formData.id;

    const draftDoc: BillDocument = {
      ...formData,
      id: uniqueId,
      type: 'invoice',
      status: 'Draft',
      updatedAt: new Date().toISOString(),
    };
    setFormData(draftDoc);
    onSave(draftDoc);
    try {
      localStorage.setItem('billease_invoice_draft', JSON.stringify(draftDoc));
    } catch (_) {}
    onNotify(`Invoice #${draftDoc.billNumber} draft saved!`);
  };

  const handleCreateInvoiceAndFinish = (destination: 'my-documents' | 'home' = 'my-documents') => {
    if (!formData.clientName?.trim()) {
      onNotify('Please enter a Client or Company Name.');
      return;
    }
    if (!formData.items || formData.items.length === 0) {
      onNotify('Please add at least one line item to the invoice.');
      return;
    }

    const isTemplateDefaultId = !formData.id || formData.id === 'inv-acme-design' || formData.id.startsWith('default-');
    const uniqueId = isTemplateDefaultId
      ? `inv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
      : formData.id;

    const finalizedInvoice: BillDocument = {
      ...formData,
      id: uniqueId,
      type: 'invoice',
      status: formData.status === 'Draft' ? 'Sent' : (formData.status || 'Sent'),
      createdAt: formData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(finalizedInvoice);

    // Clear working draft so subsequent invoice creations start fresh
    try {
      localStorage.removeItem('billease_invoice_draft');
    } catch (_) {}

    onNotify(`Invoice #${finalizedInvoice.billNumber} created successfully! Added to My Documents and Home.`);
    onNavigate(destination);
  };

  const handleFinalizeAndSend = () => {
    handleCreateInvoiceAndFinish('my-documents');
  };

  const handleGeneratePdf = () => {
    setIsGeneratingPdf(true);
    const invoiceToSave = {
      ...formData,
      updatedAt: new Date().toISOString(),
    };
    onSave(invoiceToSave);
    setTimeout(() => {
      setIsGeneratingPdf(false);
      onNotify(`Invoice ${formData.billNumber} ready! Launching print/PDF preview...`);
      window.print();
    }, 1000);
  };

  return (
    <div className="invoice-builder-page-wrapper">
      {/* Page Title & Top Actions Bar */}
      <div className="invoice-builder-header-row">
        <h1 className="invoice-builder-main-title">Professional Invoice Builder</h1>

        <div className="invoice-builder-actions">
          <button
            type="button"
            className="btn-invoice-draft"
            onClick={handleSaveDraft}
            title="Save draft without leaving"
          >
            <FileText size={16} className="btn-icon-draft" />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            className="btn-invoice-finalize"
            onClick={() => handleCreateInvoiceAndFinish('my-documents')}
            title="Create and save invoice to My Documents and Home"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              borderRadius: '9999px',
              fontWeight: 700,
              fontSize: '0.86rem',
              color: '#ffffff',
              background: '#059669',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)',
              transition: 'all 0.2s ease',
            }}
          >
            <CheckCircle2 size={16} />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      {/* Main Content Grid: Left Form (4 Section Cards) + Right Sticky A4 Preview */}
      <div className="invoice-builder-two-col-grid">
        {/* LEFT COLUMN: 3 Continuous Section Cards */}
        <div className="invoice-form-column">
          {/* SECTION 1: Client & Invoice Metadata */}
          <section className="invoice-section-card">
            <div className="section-card-header">
              <h2 className="section-card-title">1. Client &amp; Invoice Metadata</h2>
            </div>

            <div className="section-form-stack">
              {/* Row 1: Client Name & Email */}
              <div className="form-row-two-col">
                <div className="invoice-input-group">
                  <label className="invoice-input-label" htmlFor="inv-client-name">
                    Client Name / Company
                  </label>
                  <input
                    id="inv-client-name"
                    type="text"
                    className="invoice-form-input"
                    value={formData.clientName}
                    onChange={(e) => handleInputChange('clientName', e.target.value)}
                    placeholder="Acme Corporation Ltd."
                  />
                </div>

                <div className="invoice-input-group">
                  <label className="invoice-input-label" htmlFor="inv-client-email">
                    Client Email
                  </label>
                  <input
                    id="inv-client-email"
                    type="email"
                    className="invoice-form-input"
                    value={formData.clientEmail}
                    onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                    placeholder="billing@acmecorp.com"
                  />
                </div>
              </div>

              {/* Row 2: Client Billing Address */}
              <div className="invoice-input-group">
                <label className="invoice-input-label" htmlFor="inv-client-address">
                  Client Billing Address
                </label>
                <textarea
                  id="inv-client-address"
                  className="invoice-form-textarea address-textarea"
                  rows={2}
                  value={formData.clientAddress}
                  onChange={(e) => handleInputChange('clientAddress', e.target.value)}
                  placeholder="1042 Innovation Way, Suite 400&#10;San Francisco, CA 94107"
                />
              </div>

              {/* Row 3: Invoice Number, Issue Date, Due Date */}
              <div className="form-row-three-col">
                <div className="invoice-input-group">
                  <label className="invoice-input-label" htmlFor="inv-bill-number">
                    Invoice Number
                  </label>
                  <input
                    id="inv-bill-number"
                    type="text"
                    className="invoice-form-input"
                    value={formData.billNumber}
                    onChange={(e) => handleInputChange('billNumber', e.target.value)}
                    placeholder="INV 2024-089"
                  />
                </div>

                <div className="invoice-input-group">
                  <label className="invoice-input-label" htmlFor="inv-issue-date">
                    Issue Date
                  </label>
                  <DateInputWithPicker
                    id="inv-issue-date"
                    value={formData.issueDate}
                    onChange={(val) => handleInputChange('issueDate', val)}
                    placeholder="24-10-2024"
                    title="Select Issue Date"
                  />
                </div>

                <div className="invoice-input-group">
                  <label className="invoice-input-label" htmlFor="inv-due-date">
                    Due Date
                  </label>
                  <DateInputWithPicker
                    id="inv-due-date"
                    value={formData.dueDate}
                    onChange={(val) => handleInputChange('dueDate', val)}
                    placeholder="24-11-2024"
                    title="Select Due Date"
                  />
                </div>
              </div>

              {/* Row 4: Currency & Tax Rate */}
              <div className="form-row-two-col">
                <div className="invoice-input-group">
                  <label className="invoice-input-label" htmlFor="inv-currency">
                    Currency
                  </label>
                  <select
                    id="inv-currency"
                    className="invoice-form-select"
                    value={formData.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value as CurrencyCode)}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="CAD">CAD ($)</option>
                  </select>
                </div>

                <div className="invoice-input-group">
                  <label className="invoice-input-label" htmlFor="inv-tax-rate">
                    Tax Rate (%)
                  </label>
                  <select
                    id="inv-tax-rate"
                    className="invoice-form-select"
                    value={formData.taxRate}
                    onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value) || 0)}
                  >
                    <option value="0">None (0%)</option>
                    <option value="5">VAT / GST (5%)</option>
                    <option value="10">VAT / GST (10%)</option>
                    <option value="18">VAT / GST (18%)</option>
                    <option value="20">VAT / GST (20%)</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: Itemized Services & Products */}
          <section className="invoice-section-card">
            <div className="section-card-header flex-header">
              <h2 className="section-card-title">2. Itemized Services &amp; Products</h2>
              <button
                type="button"
                className="btn-add-line-item"
                onClick={handleAddItem}
              >
                <Plus size={15} />
                <span>Add Line Item</span>
              </button>
            </div>

            <div className="invoice-items-list">
              {formData.items.map((item) => (
                <div key={item.id} className="invoice-item-card-row">
                  <div className="item-input-col desc-col">
                    <input
                      type="text"
                      className="invoice-item-input"
                      value={item.description}
                      onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                      placeholder="Service or product description..."
                    />
                  </div>

                  <div className="item-input-col qty-col">
                    <div className="number-stepper-wrapper" style={{ width: '100%' }}>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        className="invoice-item-input text-center number-stepper-input"
                        value={item.qty}
                        onChange={(e) => handleItemChange(item.id, 'qty', e.target.value)}
                        placeholder="Qty"
                      />
                      <div className="number-stepper-btns">
                        <button
                          type="button"
                          className="number-stepper-btn up"
                          onClick={() => handleStepQty(item.id, 1)}
                          title="Increase Quantity"
                          aria-label="Increase Quantity"
                        >
                          <ChevronUp size={11} strokeWidth={2.6} />
                        </button>
                        <button
                          type="button"
                          className="number-stepper-btn down"
                          onClick={() => handleStepQty(item.id, -1)}
                          title="Decrease Quantity"
                          aria-label="Decrease Quantity"
                        >
                          <ChevronDown size={11} strokeWidth={2.6} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="item-input-col price-col">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="invoice-item-input text-right"
                      value={item.rate}
                      onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="item-input-col total-col">
                    <span className="item-computed-total">
                      {formatPrice((Number(item.qty) || 0) * (Number(item.rate) || 0))}
                    </span>
                  </div>

                  <div className="item-input-col action-col">
                    <button
                      type="button"
                      className="btn-trash-line-item"
                      onClick={() => handleRemoveItem(item.id)}
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 3: Notes & Payment Terms */}
          <section className="invoice-section-card">
            <div className="section-card-header">
              <h2 className="section-card-title">3. Notes &amp; Payment Terms</h2>
            </div>

            <div className="invoice-input-group">
              <label className="invoice-input-label" htmlFor="inv-payment-notes">
                Payment Instructions / Thank You Note
              </label>
              <textarea
                id="inv-payment-notes"
                className="invoice-form-textarea notes-textarea"
                rows={5}
                value={formData.paymentNotes}
                onChange={(e) => handleInputChange('paymentNotes', e.target.value)}
                placeholder="Payment instructions, bank wire info, or note of appreciation..."
              />
            </div>
          </section>

          {/* Form Bottom Finish Action Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
              padding: '1.25rem 1.5rem',
              borderRadius: '16px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
              marginTop: '1rem',
            }}
          >
            <button
              type="button"
              onClick={handleSaveDraft}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.1rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                color: '#475569',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              <FileText size={15} />
              <span>Save Draft</span>
            </button>

            <button
              type="button"
              onClick={() => handleCreateInvoiceAndFinish('my-documents')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.4rem',
                borderRadius: '8px',
                background: '#059669',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.9rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
              }}
            >
              <CheckCircle2 size={16} />
              <span>Finish &amp; View in My Documents</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Layout Architecture matching Screenshot */}
        <aside className="live-layout-architecture-card" aria-label="Live Layout Architecture">
          {/* Card Header with Green Eye Icon, Dropdown, and Gallery Button */}
          <div className="live-arch-header">
            <div className="live-arch-title-group">
              <Eye size={18} className="live-arch-eye-icon" />
              <span className="live-arch-title">Live Layout Architecture</span>
            </div>

            <div className="live-arch-controls">
              <div className="select-wrapper">
                <select
                  id="template-arch-select"
                  className="template-arch-select"
                  value={normalizeTemplateId(formData.template, 'invoice')}
                  onChange={(e) => {
                    const chosen = e.target.value as TemplateId;
                    handleInputChange('template', chosen);
                    try {
                      localStorage.setItem('billease_active_template', chosen);
                      localStorage.setItem('billease_invoice_draft', JSON.stringify({ ...formData, template: chosen }));
                    } catch (_) {}
                    onNotify(`Layout switched to ${chosen}`);
                  }}
                  title="Choose Document Template"
                >
                  <optgroup label="Invoice Templates">
                    {INVOICE_TEMPLATES.map((tpl) => (
                      <option key={tpl.id} value={tpl.id}>
                        {tpl.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Bill Templates">
                    {BILL_TEMPLATES.map((tpl) => (
                      <option key={tpl.id} value={tpl.id}>
                        {tpl.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <button
                type="button"
                className="btn-gallery-trigger"
                onClick={() => {
                  try {
                    localStorage.setItem('billease_invoice_draft', JSON.stringify(formData));
                    localStorage.setItem('billease_active_template', normalizeTemplateId(formData.template));
                  } catch (_) {}
                  onNavigate('templates');
                }}
                title="Browse Full Templates Gallery"
                aria-label="Open Template Gallery"
              >
                <LayoutGrid size={15} />
                <span>Gallery</span>
              </button>
            </div>
          </div>

          {/* The A4 Canvas Rendered Live */}
          <div className="live-arch-paper-container">
            <DocumentRenderer document={formData} />
          </div>

          {/* Bottom Card Footer */}
          <div
            className="invoice-preview-card-footer"
            style={{
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid #eef2f6',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span className="a4-format-tag" style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Format: A4 Standard (210 × 297 mm)
            </span>
            <button
              type="button"
              className="btn-card-download-pdf"
              onClick={handleGeneratePdf}
              disabled={isGeneratingPdf}
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Download size={13} />
                  <span>Download PDF</span>
                </>
              )}
            </button>
          </div>
        </aside>
      </div>

      {/* Gallery Modal / Drawer */}
      {showGallery && (
        <div className="gallery-modal-overlay" onClick={() => setShowGallery(false)}>
          <div className="gallery-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="gallery-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <LayoutGrid size={18} style={{ color: '#10b981' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Choose Template Layout</h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      localStorage.setItem('billease_invoice_draft', JSON.stringify(formData));
                      localStorage.setItem('billease_active_template', normalizeTemplateId(formData.template));
                    } catch (_) {}
                    setShowGallery(false);
                    onNavigate('templates');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#0d9468',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    padding: '6px 12px',
                    borderRadius: 8,
                    cursor: 'pointer',
                  }}
                >
                  <span>Open Full Templates Page</span>
                  <ArrowRight size={14} />
                </button>
                <button
                  type="button"
                  className="gallery-close-btn"
                  onClick={() => setShowGallery(false)}
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="gallery-templates-grid">
              {TEMPLATES.map((tpl) => {
                const isSelected = normalizeTemplateId(formData.template) === tpl.id;
                return (
                  <div
                    key={tpl.id}
                    className={`gallery-card-item ${isSelected ? 'active' : ''}`}
                    onClick={() => {
                      handleInputChange('template', tpl.id);
                      try {
                        localStorage.setItem('billease_active_template', tpl.id);
                        localStorage.setItem('billease_invoice_draft', JSON.stringify({ ...formData, template: tpl.id }));
                      } catch (_) {}
                      setShowGallery(false);
                      onNotify(`Applied ${tpl.name} layout!`);
                    }}
                  >
                    <div className="gallery-card-meta">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#349b73', textTransform: 'uppercase' }}>
                          {tpl.categoryTag}
                        </span>
                        {isSelected && (
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#0d9468', background: '#d1fae5', padding: '1px 6px', borderRadius: 4 }}>
                            Active
                          </span>
                        )}
                      </div>
                      <div className="gallery-card-title">{tpl.name}</div>
                      <div className="gallery-card-desc">{tpl.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Page Bottom Copyright */}
      <footer className="invoice-builder-page-footer">
        © 2026 BillEase Professional Freelance Billing. All rights reserved.
      </footer>
    </div>
  );
}
