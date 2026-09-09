import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Download,
  Eye,
  Save,
  Sparkles,
  LayoutGrid,
  ArrowRight,
  X,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  Loader2,
  Upload,
} from 'lucide-react';
import DocumentRenderer from '../components/DocumentRenderer';
import DateInputWithPicker from '../components/DateInputWithPicker';
import { BillDocument, CurrencyCode, TemplateId, DocStatus } from '../types';
import {
  DEFAULT_INVOICE,
  CURRENCY_SYMBOLS,
  INVOICE_TEMPLATES,
  BILL_TEMPLATES,
  normalizeTemplateId,
  getTemplateById,
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
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const sanitizeInvoiceDoc = (doc: Partial<BillDocument>): BillDocument => {
    const rawItems = doc.items && doc.items.length ? doc.items : DEFAULT_INVOICE.items;
    const items = rawItems.map((it) => ({
      ...it,
      name: it.name !== undefined && it.name !== null ? it.name : (it.description || ''),
      description: it.description || '',
    }));

    let bankName = doc.bankName;
    let accountNumber = doc.accountNumber;
    let ifscCode = doc.ifscCode;
    let upiId = doc.upiId;

    if (!bankName && !accountNumber && !ifscCode && !upiId && doc.paymentNotes) {
      const lines = doc.paymentNotes.split('\n');
      for (const line of lines) {
        const lower = line.toLowerCase();
        const colonIdx = line.indexOf(':');
        const val = colonIdx !== -1 ? line.slice(colonIdx + 1).trim() : line.trim();
        if (lower.includes('bank') && !bankName) bankName = val;
        else if ((lower.includes('account') || lower.includes('a/c') || lower.includes('acct')) && !accountNumber) accountNumber = val;
        else if (lower.includes('ifsc') && !ifscCode) ifscCode = val;
        else if (lower.includes('upi') && !upiId) upiId = val;
      }
    }

    return {
      ...DEFAULT_INVOICE,
      ...doc,
      bankName: bankName || DEFAULT_INVOICE.bankName,
      accountNumber: accountNumber || DEFAULT_INVOICE.accountNumber,
      ifscCode: ifscCode || DEFAULT_INVOICE.ifscCode,
      upiId: upiId || DEFAULT_INVOICE.upiId,
      items,
      senderLogo: doc.senderLogo || (doc as any)?.logo || DEFAULT_INVOICE.senderLogo,
      type: 'invoice',
      template: normalizeTemplateId(doc.template || 'modern-minimal', 'invoice'),
    };
  };

  const [formData, setFormData] = useState<BillDocument>(() => {
    if (initialDocument) {
      return sanitizeInvoiceDoc(initialDocument);
    }
    const saved = localStorage.getItem('billease_invoice_draft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.id !== 'inv-acme-design' && parsed.clientName !== 'Acme Corporation Ltd.' && parsed.clientName !== 'Stellar Innovations Pvt. Ltd.') {
          return sanitizeInvoiceDoc(parsed);
        }
      } catch (e) {
        console.error(e);
      }
    }
    return sanitizeInvoiceDoc({
      template: 'modern-minimal',
    });
  });

  // Sync initialDocument and active template
  useEffect(() => {
    if (initialDocument) {
      setFormData(sanitizeInvoiceDoc(initialDocument));
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

  // Persist draft to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('billease_invoice_draft', JSON.stringify(formData));
    } catch (_) {}
  }, [formData]);

  const currencySymbol = CURRENCY_SYMBOLS[formData.currency] || '₹';

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
    const sym = CURRENCY_SYMBOLS[formData.currency] || '₹';
    const locale = formData.currency === 'INR' ? 'en-IN' : 'en-US';
    return `${sym}${Number(amount || 0).toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleInputChange = (field: keyof BillDocument, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBankDetailChange = (field: 'bankName' | 'accountNumber' | 'ifscCode' | 'upiId', value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      const lines = [];
      if (updated.bankName) lines.push(`Bank: ${updated.bankName}`);
      if (updated.accountNumber) lines.push(`Account: ${updated.accountNumber}`);
      if (updated.ifscCode) lines.push(`IFSC: ${updated.ifscCode}`);
      if (updated.upiId) lines.push(`UPI: ${updated.upiId}`);
      updated.paymentNotes = lines.join('\n');
      return updated;
    });
  };

  const handleItemChange = (id: string, field: 'name' | 'description' | 'qty' | 'rate', value: string) => {
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
      name: 'Service / Product Item',
      description: 'Consulting deliverable or product item description',
      qty: 1,
      rate: 1000,
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

  // Client-side logo processing & auto-downscale matching CreateBillPage (52 × 52px slot)
  const processLogoFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      onNotify('Please select a valid image file (PNG, JPG, SVG, WEBP).');
      return;
    }

    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          handleInputChange('senderLogo', reader.result);
          onNotify('Vector logo uploaded and scaled to template (52×52px)!');
        }
      };
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const rawDataUrl = reader.result;
      if (typeof rawDataUrl !== 'string') return;

      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 256;
        let { width, height } = img;

        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          handleInputChange('senderLogo', rawDataUrl);
          onNotify('Business logo applied to template.');
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const optimizedLogo = canvas.toDataURL('image/png', 0.92);
        handleInputChange('senderLogo', optimizedLogo);
        onNotify('Desktop image uploaded & scaled to template size (52×52px)!');
      };
      img.onerror = () => {
        onNotify('Could not decode the selected image. Please try another file.');
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processLogoFile(file);
    }
  };

  const handleLogoDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingLogo(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processLogoFile(file);
    }
  };

  const handleRemoveLogo = () => {
    handleInputChange('senderLogo', '');
    onNotify('Logo removed from invoice.');
  };

  const handleLoadSampleData = () => {
    const freshSample: BillDocument = {
      ...DEFAULT_INVOICE,
      id: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      template: normalizeTemplateId(formData.template || 'modern-minimal', 'invoice'),
    };
    setFormData(freshSample);
    try {
      localStorage.setItem('billease_invoice_draft', JSON.stringify(freshSample));
    } catch (_) {}
    onNotify('✨ Loaded sample SaaS enterprise invoice data!');
  };

  const handleSaveDraft = () => {
    const isTemplateDefaultId = !formData.id || formData.id.startsWith('default-');
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

  const handleCreateInvoiceAndFinish = (destination: 'my-documents' | 'preview' | 'stay' = 'my-documents') => {
    if (!formData.clientName?.trim()) {
      onNotify('Please enter a Client or Company Name.');
      return;
    }
    if (!formData.items || formData.items.length === 0) {
      onNotify('Please add at least one line item to the invoice.');
      return;
    }

    const isTemplateDefaultId = !formData.id || formData.id.startsWith('default-');
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

    if (destination === 'stay') {
      setFormData(finalizedInvoice);
      onNotify(`Invoice #${finalizedInvoice.billNumber} saved successfully!`);
      return;
    }

    try {
      localStorage.removeItem('billease_invoice_draft');
    } catch (_) {}

    onNotify(`Invoice #${finalizedInvoice.billNumber} created successfully! Added to My Documents and Home.`);
    onNavigate(destination);
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
    }, 800);
  };

  return (
    <div className="bill-builder-container" style={{ '--builder-accent': '#6E5CB6' } as React.CSSProperties}>
      {/* Top Header Bar Matching Create Bill */}
      <div className="builder-top-bar">
        <div className="builder-header-left">
          <div className="builder-pill-badge" style={{ color: '#6E5CB6' }}>
            <FileText size={14} className="builder-pill-icon" style={{ color: '#6E5CB6' }} />
            <span>INVOICE BUILDER</span>
          </div>
          <h1 className="builder-title">Create New Invoice</h1>
        </div>

        <div className="builder-top-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button type="button" className="btn-draft-preview" onClick={handleSaveDraft} title="Save draft without leaving">
            <Save size={15} />
            <span>Save Draft</span>
          </button>
          <button
            type="button"
            className="btn-download-pdf"
            onClick={() => handleCreateInvoiceAndFinish('my-documents')}
            title="Create and save invoice to My Documents and Home"
            style={{ background: '#059669', borderColor: '#059669', boxShadow: '0 2px 6px rgba(5,150,105,0.28)' }}
          >
            <CheckCircle2 size={15} />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Content: Form Column (Left) + Live Layout Architecture (Right) */}
      <div className="builder-main-grid invoice-builder-two-col-grid">
        {/* LEFT COLUMN: Section Cards */}
        <div className="invoice-form-column">
          {/* SECTION 1: Client & Invoice Metadata */}
          <section className="invoice-section-card">
            <div className="section-card-header">
              <h2 className="section-card-title">1. Client &amp; Invoice Metadata</h2>
            </div>

            <div className="form-fields-stack">
              {/* Row 1: Client Name & Email */}
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Client / Company Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.clientName}
                    onChange={(e) => handleInputChange('clientName', e.target.value)}
                    placeholder="NovaTech AI Solutions Inc."
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Client Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.clientEmail}
                    onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                    placeholder="finance@novatech-ai.com"
                  />
                </div>
              </div>

              {/* Row 2: Client Phone & Payment Terms */}
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Client Phone</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={formData.clientPhone || ''}
                    onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Terms</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.paymentTerms || 'Net 30'}
                    onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
                    placeholder="Net 30"
                  />
                </div>
              </div>

              {/* Row 3: Client Billing Address */}
              <div className="form-group">
                <label className="form-label">Client Billing Address</label>
                <textarea
                  className="form-input"
                  rows={2}
                  value={formData.clientAddress}
                  onChange={(e) => handleInputChange('clientAddress', e.target.value)}
                  placeholder="Tower 4, Level 11, TechPark SEZ, Outer Ring Road, Bengaluru 560103"
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Row 4: Invoice Number, Issue Date, Due Date */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Invoice Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.billNumber}
                    onChange={(e) => handleInputChange('billNumber', e.target.value)}
                    placeholder="INV-2026-1817"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Issue Date</label>
                  <DateInputWithPicker
                    id="inv-issue-date"
                    value={formData.issueDate}
                    onChange={(val) => handleInputChange('issueDate', val)}
                    placeholder="08-09-2026"
                    title="Select Issue Date"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <DateInputWithPicker
                    id="inv-due-date"
                    value={formData.dueDate}
                    onChange={(val) => handleInputChange('dueDate', val)}
                    placeholder="08-10-2026"
                    title="Select Due Date"
                  />
                </div>
              </div>

              {/* Row 5: Currency & GST */}
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Currency</label>
                  <select
                    className="form-input"
                    value={formData.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value as CurrencyCode)}
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD ($)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">GST / Tax Rate (%)</label>
                  <select
                    className="form-input"
                    value={formData.taxRate}
                    onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value) || 0)}
                  >
                    <option value="0">None (0%)</option>
                    <option value="5">GST 5%</option>
                    <option value="12">GST 12%</option>
                    <option value="18">GST 18%</option>
                    <option value="28">GST 28%</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: Your Information (BILL FROM) with 52x52 Logo Arrangement */}
          <section className="invoice-section-card">
            <div className="section-card-header">
              <h2 className="section-card-title">2. Your Information (BILL FROM)</h2>
            </div>

            <div className="form-fields-stack">
              {/* Business Logo Upload Area Matching CreateBillPage (52 × 52px slot) */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <label className="form-label" style={{ margin: 0 }}>Business Logo</label>
                  <span style={{ fontSize: '0.73rem', color: '#64748b', fontWeight: 500 }}>
                    Visible in invoice header (52 × 52px)
                  </span>
                </div>
                <div
                  className="bill-logo-upload-zone"
                  style={{
                    border: isDraggingLogo ? '2px dashed #6E5CB6' : '2px dashed #cbd5e1',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    textAlign: 'center',
                    background: isDraggingLogo ? '#f5f3ff' : '#f8fafc',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isDraggingLogo ? '0 0 0 4px rgba(110,92,182,0.12)' : 'none',
                  }}
                  onClick={() => logoInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingLogo(true);
                  }}
                  onDragLeave={() => setIsDraggingLogo(false)}
                  onDrop={handleLogoDrop}
                >
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleLogoUpload}
                  />
                  {formData.senderLogo ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: 52,
                            height: 52,
                            borderRadius: 10,
                            background: '#ffffff',
                            border: '1.5px solid #e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                            flexShrink: 0,
                          }}
                        >
                          <img
                            src={formData.senderLogo}
                            alt="Logo Preview"
                            style={{ maxWidth: 52, maxHeight: 52, width: 'auto', height: 'auto', objectFit: 'contain', display: 'block' }}
                          />
                        </div>
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1e293b' }}>
                            Business Logo
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>
                            ✓ Scaled to 52 × 52px slot
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                          type="button"
                          className="btn-secondary-glass"
                          style={{ fontSize: '0.78rem', padding: '5px 12px' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            logoInputRef.current?.click();
                          }}
                        >
                          Upload from Desktop
                        </button>
                        <button
                          type="button"
                          className="btn-secondary-glass"
                          style={{ fontSize: '0.78rem', padding: '5px 10px', color: '#ef4444' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveLogo();
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: '50%',
                          background: '#ede9fe',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#6E5CB6',
                        }}
                      >
                        <Upload size={18} />
                      </div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b' }}>
                        Click to upload or drag &amp; drop logo
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        Auto-scaled to 52 × 52px slot · PNG, JPG, SVG, WEBP
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Your Name / Business</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.senderName || ''}
                    onChange={(e) => handleInputChange('senderName', e.target.value)}
                    placeholder="Studio Pulse"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">GST / PAN Number (optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.senderTaxNumber || ''}
                    onChange={(e) => handleInputChange('senderTaxNumber', e.target.value)}
                    placeholder="22AAAAA0000A1Z5"
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Your Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.senderEmail || ''}
                    onChange={(e) => handleInputChange('senderEmail', e.target.value)}
                    placeholder="billing@studiopulse.design"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Your Phone</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={formData.senderPhone || ''}
                    onChange={(e) => handleInputChange('senderPhone', e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Your Address</label>
                <textarea
                  className="form-input"
                  rows={2}
                  value={formData.senderAddress || ''}
                  onChange={(e) => handleInputChange('senderAddress', e.target.value)}
                  placeholder="74 Nordic Creative Park, Indiranagar 100ft Rd, Bengaluru 560038"
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>
          </section>

          {/* SECTION 3: Itemized Services & Products */}
          <section className="invoice-section-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h2 className="section-card-title">3. Itemized Services &amp; Products</h2>
                <p style={{ fontSize: '0.74rem', color: '#64748b', margin: '3px 0 0' }}>
                  Add work deliverables, subscriptions, or goods.
                </p>
              </div>

              <button
                type="button"
                className="btn-add-line-item"
                onClick={handleAddItem}
              >
                <Plus size={14} />
                <span>Add Item</span>
              </button>
            </div>

            {/* Table Column Headers */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(140px, 2fr) 80px 95px 85px 36px',
                gap: '8px',
                padding: '0 4px 6px',
                borderBottom: '1px solid #e2e8f0',
                fontSize: '0.68rem',
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              <div>
                <div style={{ color: '#0f172a', fontWeight: 800 }}>ITEM</div>
                <div style={{ fontSize: '0.60rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.3px', marginTop: '1px' }}>
                  DESCRIPTION
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>QTY</div>
              <div style={{ textAlign: 'right' }}>RATE ({currencySymbol})</div>
              <div style={{ textAlign: 'right' }}>AMOUNT</div>
              <div />
            </div>

            {/* Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
              {formData.items.map((item) => {
                const itemAmount = (Number(item.qty) || 0) * (Number(item.rate) || 0);
                return (
                  <div
                    key={item.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'minmax(140px, 2fr) 80px 95px 85px 36px',
                      gap: '8px',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <input
                        type="text"
                        className="form-input"
                        value={item.name || ''}
                        onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                        placeholder="Item name / title..."
                        style={{ padding: '0.45rem 0.65rem', fontSize: '0.82rem', fontWeight: 600 }}
                      />
                      <input
                        type="text"
                        className="form-input"
                        value={item.description || ''}
                        onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                        placeholder="Description (optional)..."
                        style={{ padding: '0.38rem 0.65rem', fontSize: '0.76rem', color: '#64748b' }}
                      />
                    </div>

                    <div>
                      <div className="number-stepper-wrapper" style={{ width: '100%', position: 'relative' }}>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          className="form-input"
                          value={item.qty}
                          onChange={(e) => handleItemChange(item.id, 'qty', e.target.value)}
                          style={{ textAlign: 'center', padding: '0.5rem 24px 0.5rem 0.5rem', fontSize: '0.83rem' }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            right: '3px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            display: 'flex',
                            flexDirection: 'column',
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => handleStepQty(item.id, 1)}
                            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#64748b' }}
                            title="Increase Quantity"
                          >
                            <ChevronUp size={10} strokeWidth={2.5} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStepQty(item.id, -1)}
                            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#64748b' }}
                            title="Decrease Quantity"
                          >
                            <ChevronDown size={10} strokeWidth={2.5} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="form-input"
                        value={item.rate}
                        onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)}
                        placeholder="0.00"
                        style={{ textAlign: 'right', padding: '0.5rem 0.65rem', fontSize: '0.83rem' }}
                      />
                    </div>

                    <div style={{ textAlign: 'right', fontWeight: 700, fontSize: '0.82rem', color: '#0f172a' }}>
                      {formatPrice(itemAmount)}
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        title="Remove item"
                        className="invoice-item-delete-btn"
                        style={{ width: '30px', height: '30px' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Summary Bar */}
            <div
              style={{
                marginTop: '1.25rem',
                paddingTop: '0.85rem',
                borderTop: '1px solid #eef2f6',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <div style={{ minWidth: '140px' }}>
                <label className="form-label" style={{ fontSize: '0.74rem' }}>GST / Tax Rate</label>
                <select
                  className="form-input"
                  value={formData.taxRate}
                  onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value) || 0)}
                  style={{ width: '140px', padding: '5px 8px', fontSize: '0.8rem' }}
                >
                  <option value="0">GST 0%</option>
                  <option value="5">GST 5%</option>
                  <option value="12">GST 12%</option>
                  <option value="18">GST 18%</option>
                  <option value="28">GST 28%</option>
                </select>
              </div>

              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                  Subtotal: <strong style={{ color: '#0f172a' }}>{formatPrice(subtotal)}</strong>
                </div>
                <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                  Tax ({formData.taxRate}%): <strong style={{ color: '#0f172a' }}>{formatPrice(taxAmount)}</strong>
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#6E5CB6', marginTop: '2px' }}>
                  Total: {formatPrice(totalDue)}
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 4: Notes & Payment Details */}
          <section className="invoice-section-card">
            <div className="section-card-header">
              <h2 className="section-card-title">4. Notes &amp; Payment Details</h2>
            </div>

            <div className="form-fields-stack">
              <div style={{ marginBottom: '0.85rem' }}>
                <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px', display: 'block', color: '#1e293b' }}>
                  Bank &amp; Payment Settlement Details
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" htmlFor="input-bank-name" style={{ fontSize: '0.70rem', color: '#64748b' }}>
                      Bank Name
                    </label>
                    <input
                      id="input-bank-name"
                      type="text"
                      className="form-input"
                      value={formData.bankName || ''}
                      onChange={(e) => handleBankDetailChange('bankName', e.target.value)}
                      placeholder="e.g. HDFC Bank Ltd."
                      style={{ padding: '0.45rem 0.65rem', fontSize: '0.82rem' }}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" htmlFor="input-acct-number" style={{ fontSize: '0.70rem', color: '#64748b' }}>
                      Account Number
                    </label>
                    <input
                      id="input-acct-number"
                      type="text"
                      className="form-input"
                      value={formData.accountNumber || ''}
                      onChange={(e) => handleBankDetailChange('accountNumber', e.target.value)}
                      placeholder="e.g. 502000486720194"
                      style={{ padding: '0.45rem 0.65rem', fontSize: '0.82rem' }}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" htmlFor="input-ifsc-code" style={{ fontSize: '0.70rem', color: '#64748b' }}>
                      IFSC Code / Swift
                    </label>
                    <input
                      id="input-ifsc-code"
                      type="text"
                      className="form-input"
                      value={formData.ifscCode || ''}
                      onChange={(e) => handleBankDetailChange('ifscCode', e.target.value)}
                      placeholder="e.g. HDFC0001234"
                      style={{ padding: '0.45rem 0.65rem', fontSize: '0.82rem' }}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" htmlFor="input-upi-id" style={{ fontSize: '0.70rem', color: '#64748b' }}>
                      UPI ID
                    </label>
                    <input
                      id="input-upi-id"
                      type="text"
                      className="form-input"
                      value={formData.upiId || ''}
                      onChange={(e) => handleBankDetailChange('upiId', e.target.value)}
                      placeholder="e.g. yourname@hdfcbank"
                      style={{ padding: '0.45rem 0.65rem', fontSize: '0.82rem' }}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Additional Notes / Thank You Message</label>
                <textarea
                  className="form-input"
                  rows={2}
                  value={formData.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Thank you for your business! Payment is due within 30 days."
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Invoice Status</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(['unpaid', 'paid', 'pending', 'draft'] as DocStatus[]).map((st) => {
                    const isActive = (formData.status || 'unpaid').toLowerCase() === st;
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleInputChange('status', st)}
                        style={{
                          flex: 1,
                          padding: '7px 10px',
                          borderRadius: '8px',
                          border: isActive ? '2px solid #6E5CB6' : '1px solid #e2e8f0',
                          background: isActive ? '#f5f3ff' : '#ffffff',
                          color: isActive ? '#6E5CB6' : '#475569',
                          fontWeight: isActive ? 700 : 500,
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          textTransform: 'capitalize',
                          transition: 'all 0.15s',
                        }}
                      >
                        {st}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                marginTop: '1.25rem',
                paddingTop: '1.15rem',
                borderTop: '1px solid #eef2f6',
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                className="btn-draft-preview"
                onClick={handleSaveDraft}
                style={{ flex: '1 1 140px', justifyContent: 'center' }}
              >
                <Save size={15} />
                <span>Save Draft</span>
              </button>

              <button
                type="button"
                className="btn-draft-preview"
                onClick={() => handleCreateInvoiceAndFinish('preview')}
                style={{ flex: '1 1 140px', justifyContent: 'center', borderColor: '#6E5CB6', color: '#6E5CB6' }}
              >
                <Eye size={15} />
                <span>Save &amp; Preview</span>
              </button>

              <button
                type="button"
                className="btn-download-pdf"
                onClick={handleGeneratePdf}
                disabled={isGeneratingPdf}
                style={{ flex: '2 1 180px', justifyContent: 'center' }}
              >
                {isGeneratingPdf ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                <span>Save &amp; Download PDF</span>
              </button>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Live Layout Architecture Matching CreateBillPage Sizing Arrangement */}
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
                    onNotify(`Applied ${getTemplateById(chosen)?.name || chosen} layout!`);
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
                onClick={() => setShowGallery(true)}
                title="Browse Full Templates Gallery"
                aria-label="Open Template Gallery"
              >
                <LayoutGrid size={15} />
                <span>Gallery</span>
              </button>
            </div>
          </div>

          {/* The A4 Canvas Rendered Live - Exact same size arrangement as CreateBillPage */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={handleLoadSampleData}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6E5CB6',
                  fontWeight: 700,
                  fontSize: '0.76rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  borderRadius: '6px',
                }}
                title="Load full sample SaaS invoice content"
              >
                <Sparkles size={13} />
                <span>Sample Data</span>
              </button>
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
                    <span>Save &amp; Download PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Gallery Modal */}
      {showGallery && (
        <div className="gallery-modal-overlay" onClick={() => setShowGallery(false)}>
          <div className="gallery-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="gallery-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <LayoutGrid size={18} style={{ color: '#6E5CB6' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Choose Invoice Template</h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowGallery(false);
                    onNavigate('templates');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#6E5CB6',
                    background: 'rgba(110, 92, 182, 0.1)',
                    border: '1px solid rgba(110, 92, 182, 0.3)',
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
              {INVOICE_TEMPLATES.map((tpl) => {
                const isSelected = normalizeTemplateId(formData.template, 'invoice') === tpl.id;
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
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6E5CB6', textTransform: 'uppercase' }}>
                          {tpl.categoryTag}
                        </span>
                        {isSelected && (
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#6E5CB6', background: 'rgba(110,92,182,0.12)', padding: '1px 6px', borderRadius: 4 }}>
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
    </div>
  );
}
