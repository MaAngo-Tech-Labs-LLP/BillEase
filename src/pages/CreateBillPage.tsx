import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Calendar,
  User,
  Mail,
  Plus,
  Trash2,
  Save,
  Download,
  Eye,
  ArrowLeft,
  ArrowRight,
  Receipt,
  Building2,
  Phone,
  LayoutGrid,
  X,
  Loader2,
  ChevronUp,
  ChevronDown,
  Upload,
  Image as ImageIcon,
  Globe,
  Truck,
  CreditCard,
  Landmark,
  ShieldCheck,
  FileText,
  CheckCircle2,
  Check,
  Palette,
  Layers,
  Sparkles,
  ArrowUp,
  ArrowDown,
  RotateCcw,
} from 'lucide-react';
import DocumentRenderer from '../components/DocumentRenderer';
import DateInputWithPicker from '../components/DateInputWithPicker';
import { BillDocument, TemplateId, CurrencyCode, BusinessProfile, STORAGE_PROFILE_KEY } from '../types';
import {
  DEFAULT_BILL,
  SAMPLE_BILL_DATA,
  CURRENCY_SYMBOLS,
  ACCENT_COLOR_MAP,
  TEMPLATES,
  BILL_TEMPLATES,
  normalizeTemplateId,
  fillSampleIntoEmpty,
  looksLikeStaleSampleDraft,
  getTodayIsoDate,
  getFutureIsoDate,
} from '../data/templates';
import { calculateBillTotals, formatCurrencyAmount } from '../utils/billCalculations';
import { applyBusinessProfileToDoc, getSavedBusinessProfile, PROFILE_UPDATED_EVENT } from '../utils/profileSync';

interface CreateBillPageProps {
  initialDocument?: BillDocument;
  onSave: (doc: BillDocument) => void;
  onPreview?: (doc: BillDocument) => void;
  onNavigate: (tabId: string) => void;
  onNotify: (msg: string) => void;
  /** Reports whether the form has changes that haven't been committed via
   * Save Draft / Create Bill, so the app shell can warn before navigating
   * away (mirrors the "unsaved changes" prompt in Word/Office). */
  onDirtyChange?: (isDirty: boolean) => void;
  /** Lets the app shell trigger this page's own Save Draft action from
   * outside (e.g. a "Save & Continue" choice in the unsaved-changes prompt
   * when switching tabs), so saving goes through the same validated path as
   * clicking the button here. */
  onRegisterSaveDraft?: (fn: () => void) => void;
}

export default function CreateBillPage({
  initialDocument,
  onSave,
  onPreview,
  onNavigate,
  onNotify,
  onDirtyChange,
  onRegisterSaveDraft,
}: CreateBillPageProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showGallery, setShowGallery] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const [lastDueDate, setLastDueDate] = useState('');
  const [showSampleData, setShowSampleData] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const sanitizeBillDoc = (doc: Partial<BillDocument>): BillDocument => {
    const cleanTitle =
      doc.title &&
      !doc.title.toLowerCase().includes('enterprise') &&
      !doc.title.toLowerCase().includes('architecture') &&
      !doc.title.toLowerCase().includes('consulting') &&
      doc.title.trim().length <= 40
        ? doc.title.trim()
        : (doc.title?.trim() || 'BILL');

    // Clear any previous shopping cart SVG so the light grey image icon displays
    const cleanSenderLogo =
      doc.senderLogo &&
      (doc.senderLogo.includes('circle cx="19"') ||
        doc.senderLogo.includes('22c55e') ||
        doc.senderLogo.includes('DEFAULT_BUSINESS_LOGO'))
        ? undefined
        : doc.senderLogo;

    const baseDoc: BillDocument = {
      ...DEFAULT_BILL,
      ...doc,
      senderLogo: cleanSenderLogo,
      title: cleanTitle,
      type: 'bill',
      template: normalizeTemplateId(doc.template || 'apex-corporate-bill', 'bill'),
    };

    return applyBusinessProfileToDoc(baseDoc);
  };

  const [formData, setFormData] = useState<BillDocument>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tplParam = params.get('template');
      if (tplParam) {
        return sanitizeBillDoc({ template: tplParam, issueDate: getTodayIsoDate(), dueDate: getFutureIsoDate(30) });
      }
    } catch (_) {}
    if (initialDocument) {
      return sanitizeBillDoc(initialDocument);
    }
    const saved = localStorage.getItem('billease_bill_draft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Older builds could persist full sample content into the draft
        // (before "Sample Data" became preview-only). Discard it rather
        // than showing leftover example content as if it were real data.
        if (looksLikeStaleSampleDraft(parsed)) {
          localStorage.removeItem('billease_bill_draft');
        } else {
          return sanitizeBillDoc(parsed);
        }
      } catch (e) {
        console.error(e);
      }
    }
    return sanitizeBillDoc({
      template: 'apex-corporate-bill',
      // DEFAULT_BILL.issueDate/dueDate are frozen at app-load time, so a
      // brand-new document must not fall back to them — compute fresh here.
      issueDate: getTodayIsoDate(),
      dueDate: getFutureIsoDate(30),
    });
  });

  // Snapshot of formData as of the last successful Save Draft / Create Bill /
  // Download PDF, used to detect unsaved changes. Starts as the initial load
  // so a freshly opened (unchanged) form is never considered dirty.
  const lastSavedSnapshot = useRef<string>(JSON.stringify(formData));

  // Sync initialDocument and localStorage whenever template changes or user applies from Templates page
  useEffect(() => {
    setShowSampleData(false); // never carry a stale sample preview into a different document
    if (initialDocument) {
      setFormData((prev) => {
        const next = sanitizeBillDoc({ ...prev, ...initialDocument });
        lastSavedSnapshot.current = JSON.stringify(next); // loading a document is not "dirty"
        return next;
      });
    } else {
      const stored = localStorage.getItem('billease_active_template');
      if (stored) {
        setFormData((prev) => ({
          ...prev,
          template: normalizeTemplateId(stored, 'bill'),
        }));
      }
    }
  }, [initialDocument]);

  // Keep draft persisted in localStorage so switching to Templates and back retains all data
  useEffect(() => {
    try {
      localStorage.setItem('billease_bill_draft', JSON.stringify(formData));
    } catch (_) {}
  }, [formData]);

  // Report unsaved-changes state up to the app shell so it can warn before
  // navigating away (Save Draft / Create Bill / Download PDF all update the
  // snapshot to mark the form as clean again).
  useEffect(() => {
    onDirtyChange?.(JSON.stringify(formData) !== lastSavedSnapshot.current);
  }, [formData, onDirtyChange]);

  // Automatically sync with Business Profile Defaults in real-time
  useEffect(() => {
    const handleProfileUpdate = (e: any) => {
      const p = e?.detail || getSavedBusinessProfile();
      if (p) {
        setFormData((prev) => applyBusinessProfileToDoc(prev, p, true));
        onNotify('✨ Business information automatically updated from Profile & Settings!');
      }
    };

    window.addEventListener(PROFILE_UPDATED_EVENT, handleProfileUpdate as EventListener);
    return () => {
      window.removeEventListener(PROFILE_UPDATED_EVENT, handleProfileUpdate as EventListener);
    };
  }, [onNotify]);

  const activeAccentHex = ACCENT_COLOR_MAP[formData.accent] || '#1e3a8a';
  const currencySymbol = CURRENCY_SYMBOLS[formData.currency] || '₹';

  // Live calculations using standalone calculation engine
  const calc = useMemo(() => {
    return calculateBillTotals(formData);
  }, [formData]);

  const formatAmount = (val: number) => {
    return formatCurrencyAmount(val, formData.currency);
  };

  const handleInputChange = (field: keyof BillDocument, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      // If updating billing address and "shipping same as billing" is checked, keep shipping synced
      if (field === 'clientAddress' && prev.shippingSameAsBilling) {
        updated.shippingAddress = value;
      }
      return updated;
    });

    // Clear validation error on field change
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleItemChange = (
    id: string,
    field: 'name' | 'description' | 'qty' | 'rate' | 'taxRate' | 'discount',
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((it) => {
        if (it.id === id) {
          if (field === 'qty' || field === 'rate' || field === 'taxRate' || field === 'discount') {
            if (value === '' || value === null || value === undefined) {
              return { ...it, [field]: '' };
            }
            const numVal = Math.max(0, parseFloat(value) || 0);
            return { ...it, [field]: numVal };
          }
          return { ...it, [field]: value };
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
          const current = Number(it.qty) || 0;
          const next = Math.max(1, current + delta);
          return { ...it, qty: next };
        }
        return it;
      }),
    }));
  };

  const handleStepRate = (id: string, delta: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((it) => {
        if (it.id === id) {
          const current = Number(it.rate) || 0;
          const next = Math.max(0, parseFloat((current + delta).toFixed(2)));
          return { ...it, rate: next };
        }
        return it;
      }),
    }));
  };

  const handleStepItemTax = (id: string, delta: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((it) => {
        if (it.id === id) {
          const current = Number(it.taxRate ?? prev.taxRate ?? 18) || 0;
          const next = Math.min(100, Math.max(0, current + delta));
          return { ...it, taxRate: next };
        }
        return it;
      }),
    }));
  };

  const handleAddItem = () => {
    const newItem = {
      id: Date.now().toString(),
      name: '',
      description: '',
      qty: '' as any,
      rate: '' as any,
      taxRate: '' as any,
      discount: 0,
    };
    setFormData((prev) => ({ ...prev, items: [...prev.items, newItem] }));
    onNotify('✨ Added new line item');
  };

  const handleRemoveItem = (id: string) => {
    if (formData.items.length <= 1) {
      onNotify('At least one line item is required on the bill.');
      return;
    }
    setFormData((prev) => ({ ...prev, items: prev.items.filter((it) => it.id !== id) }));
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    setFormData((prev) => {
      const items = [...prev.items];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= items.length) return prev;
      const temp = items[index];
      items[index] = items[targetIndex];
      items[targetIndex] = temp;
      return { ...prev, items };
    });
  };

  const handleStepTaxRate = (delta: number) => {
    setFormData((prev) => {
      const current = Number(prev.taxRate) || 0;
      const nextVal = Math.min(100, Math.max(0, Math.round((current + delta) * 10) / 10));
      return { ...prev, taxRate: nextVal };
    });
  };

  const handleStepDiscount = (delta: number) => {
    setFormData((prev) => {
      const current = Number(prev.discount) || 0;
      const nextVal = Math.max(0, Math.round(current + delta));
      return { ...prev, discount: nextVal };
    });
  };

  const handleStepAdditionalCharges = (delta: number) => {
    setFormData((prev) => {
      const current = Number(prev.additionalCharges) || 0;
      const nextVal = Math.max(0, Math.round(current + delta));
      return { ...prev, additionalCharges: nextVal };
    });
  };

  const handleStepAmountPaid = (delta: number) => {
    setFormData((prev) => {
      const current = Number(prev.amountPaid) || 0;
      const nextVal = Math.max(0, parseFloat((current + delta).toFixed(2)));
      return { ...prev, amountPaid: nextVal };
    });
  };

  // Sample data is a PREVIEW ONLY — it is never written to formData or
  // localStorage, so it can never be confused with, or accidentally saved
  // as, the user's real data. Toggling it off instantly reverts the preview
  // to showing only what the user actually entered.
  const handleToggleSampleData = () => {
    setShowSampleData((prev) => {
      const next = !prev;
      onNotify(next ? '✨ Previewing with sample content — nothing is saved' : 'Cleared sample preview');
      return next;
    });
  };

  const previewDocument = showSampleData
    ? fillSampleIntoEmpty(formData, SAMPLE_BILL_DATA)
    : formData;

  // Wipes the working draft back to a blank bill — clears formData AND
  // the persisted draft/template choice in localStorage. Useful for testing
  // and for anyone who wants to start completely fresh.
  const handleResetForm = () => {
    const blank: BillDocument = {
      ...DEFAULT_BILL,
      id: `bill-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      billNumber: `BIL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      // DEFAULT_BILL.issueDate/dueDate are frozen at app-load time —
      // recompute fresh so a reset form always starts on today's date.
      issueDate: getTodayIsoDate(),
      dueDate: getFutureIsoDate(30),
      createdAt: new Date().toISOString(),
    };
    setShowSampleData(false);
    setFormData(blank);
    try {
      localStorage.removeItem('billease_bill_draft');
      localStorage.removeItem('billease_active_template');
    } catch (_) {}
    onNotify('Form reset — starting with a blank bill');
  };

  const handleAutoFillFromProfile = () => {
    const profile = getSavedBusinessProfile();
    if (!profile || (!profile.companyName && !profile.email && !profile.phone && !profile.address && !profile.gstPanNumber && !profile.bankUpiId && !profile.logo)) {
      onNotify('No saved profile found. Click "Profile & Settings" in the top bar to set your business defaults!');
      return;
    }
    setFormData((prev) => applyBusinessProfileToDoc(prev, profile, true));
    onNotify('✨ Synced business information with your Profile & Settings defaults!');
  };

  // Process and downscale logo image from desktop (via canvas) to match the 52px template size perfectly
  const processLogoFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      onNotify('Please select a valid image file (PNG, JPG, SVG, WEBP).');
      return;
    }

    // If SVG, read directly as data URL to preserve sharp vector rendering
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          handleInputChange('senderLogo', reader.result);
          onNotify('Vector logo uploaded!');
        }
      };
      reader.readAsDataURL(file);
      return;
    }

    // For any raster desktop image (even 5MB+ photos), resize client-side to crisp high-DPI (max 256x256)
    const reader = new FileReader();
    reader.onload = () => {
      const rawDataUrl = reader.result;
      if (typeof rawDataUrl !== 'string') return;

      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 256; // Cap resolution for a lightweight file while staying crisp at any display size
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

        // Convert to lightweight data URL (typically ~15-35KB, well within storage limits)
        const optimizedLogo = canvas.toDataURL('image/png', 0.92);
        handleInputChange('senderLogo', optimizedLogo);
        onNotify('Desktop image uploaded!');
      };
      img.onerror = () => {
        onNotify('Could not decode the selected image. Please try another file.');
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Logo file upload handler from file picker
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsDraggingLogo(false); // never leave the drag-hover highlight stuck on
    const file = e.target.files?.[0];
    if (!file) return;
    processLogoFile(file);
  };

  // Drag-and-drop handler directly from Windows Desktop or Explorer
  const handleLogoDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingLogo(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processLogoFile(file);
    }
  };

  const handleRemoveLogo = () => {
    handleInputChange('senderLogo', undefined);
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
    onNotify('Logo removed.');
  };

  // Validation function per step
  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.billNumber?.trim()) {
        errors.billNumber = 'Bill Number is required.';
      }
      if (!formData.issueDate?.trim()) {
        errors.issueDate = 'Bill Date is required.';
      }
    }

    if (step === 2) {
      if (!formData.clientName?.trim()) {
        errors.clientName = 'Customer or Company Name is required.';
      }
      if (formData.clientEmail?.trim() && !/^\S+@\S+\.\S+$/.test(formData.clientEmail.trim())) {
        errors.clientEmail = 'Please enter a valid email address.';
      }
    }

    if (step === 3) {
      if (!formData.senderName?.trim()) {
        errors.senderName = 'Business Name is required.';
      }
      if (formData.senderEmail?.trim() && !/^\S+@\S+\.\S+$/.test(formData.senderEmail.trim())) {
        errors.senderEmail = 'Please enter a valid business email address.';
      }
    }

    if (step === 4) {
      if (!formData.items || formData.items.length === 0) {
        errors.items = 'At least one line item is required.';
      } else {
        const invalidItem = formData.items.find(
          (it) => (!it.name?.trim() && !it.description?.trim()) || Number(it.qty) <= 0 || Number(it.rate) < 0
        );
        if (invalidItem) {
          if (!invalidItem.name?.trim() && !invalidItem.description?.trim()) {
            errors.items = 'Each item must have an item or service name.';
          } else if (Number(invalidItem.qty) <= 0) {
            errors.items = 'Item quantity must be greater than 0.';
          } else if (Number(invalidItem.rate) < 0) {
            errors.items = 'Item rate cannot be negative.';
          } else {
            errors.items = 'Please check item details.';
          }
        }
      }
    }

    if (step === 5) {
      if (Number(formData.amountPaid) < 0) {
        errors.amountPaid = 'Amount paid cannot be negative.';
      }
      if (Number(formData.amountPaid) > calc.grandTotal) {
        errors.amountPaid = `Amount paid cannot exceed Grand Total (${currencySymbol}${formatAmount(calc.grandTotal)}).`;
      }
    }

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      onNotify(firstError);
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(6, prev + 1));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleStepClick = (stepNum: number) => {
    if (stepNum < currentStep || validateStep(currentStep)) {
      setCurrentStep(stepNum);
    }
  };

  const handleSaveDraft = () => {
    const isTemplateDefaultId =
      !formData.id ||
      formData.id === 'doc-apex-billing' ||
      formData.id === 'inv-studio-pulse' ||
      formData.id === 'inv-acme-design' ||
      formData.id.startsWith('default-');
    const uniqueId = isTemplateDefaultId
      ? `bill-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
      : formData.id;

    const savedDoc: BillDocument = {
      ...formData,
      id: uniqueId,
      status: 'Draft' as const,
      updatedAt: new Date().toISOString(),
    };
    if (isTemplateDefaultId) {
      setFormData((prev) => ({ ...prev, id: uniqueId }));
    }
    onSave(savedDoc);
    try {
      localStorage.setItem('billease_bill_draft', JSON.stringify(savedDoc));
    } catch (_) {}
    lastSavedSnapshot.current = JSON.stringify(savedDoc);
    onDirtyChange?.(false);
    onNotify(`Bill #${formData.billNumber} saved successfully to your documents!`);
  };

  // Keep the app shell's reference to this page's Save Draft action current,
  // so it can trigger a real save (going through the same validated path as
  // clicking the button) from the unsaved-changes prompt when switching tabs.
  useEffect(() => {
    onRegisterSaveDraft?.(handleSaveDraft);
  });

  const handleCreateBillAndFinish = (destination: 'my-documents' | 'home' = 'my-documents') => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4)) {
      onNotify('Please complete the required bill information.');
      return;
    }

    const isTemplateDefaultId =
      !formData.id ||
      formData.id === 'doc-apex-billing' ||
      formData.id === 'inv-studio-pulse' ||
      formData.id === 'inv-acme-design' ||
      formData.id.startsWith('default-');
    const uniqueId = isTemplateDefaultId
      ? `bill-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
      : formData.id;

    const completedDoc: BillDocument = {
      ...formData,
      id: uniqueId,
      type: 'bill',
      status: formData.status || 'Paid',
      createdAt: formData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(completedDoc);

    // Clear the active working draft so next creation starts fresh
    try {
      localStorage.removeItem('billease_bill_draft');
    } catch (_) {}
    lastSavedSnapshot.current = JSON.stringify(completedDoc);
    onDirtyChange?.(false);

    onNotify(`Bill #${completedDoc.billNumber} created successfully! Added to My Documents and Home.`);
    onNavigate(destination);
  };

  const handleGeneratePdf = () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4)) {
      return;
    }

    setIsGeneratingPdf(true);
    const completedDoc: BillDocument = {
      ...formData,
      updatedAt: new Date().toISOString(),
    };
    onSave(completedDoc);
    lastSavedSnapshot.current = JSON.stringify(completedDoc);
    onDirtyChange?.(false);
    const prevTitle = document.title;
    const docNumber = formData.billNumber || 'BILL-2026-5479';
    document.title = `Bill_${docNumber}`;
    setTimeout(() => {
      setIsGeneratingPdf(false);
      onNotify(`Bill #${formData.billNumber} ready! Opening print/PDF view...`);
      window.print();
      setTimeout(() => {
        document.title = prevTitle;
      }, 1500);
    }, 700);
  };

  const stepsList = [
    { num: 1, title: 'Details' },
    { num: 2, title: 'Customer' },
    { num: 3, title: 'My Info' },
    { num: 4, title: 'Items' },
    { num: 5, title: 'Payment' },
    { num: 6, title: 'Template' },
  ];

  return (
    <div className="bill-builder-container" style={{ '--builder-accent': activeAccentHex } as React.CSSProperties}>
      {/* Top Header Bar */}
      <div className="builder-top-bar">
        <div className="builder-header-left">
          <div className="builder-pill-badge">
            <Receipt size={14} className="builder-pill-icon" />
            <span>BILL BUILDER</span>
          </div>
          <h1 className="builder-title">Create New Bill</h1>
        </div>

        <div className="builder-top-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button type="button" className="btn-draft-preview" onClick={handleSaveDraft} title="Save draft without leaving">
            <Save size={15} />
            <span>Save Draft</span>
          </button>
          {currentStep === 6 && (
            <button
              type="button"
              className="btn-download-pdf"
              onClick={handleGeneratePdf}
              disabled={isGeneratingPdf}
              title="Save and open print/PDF preview"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Download size={15} />
                  <span>PDF</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Stepper Navigation */}
      <nav className="stepper-rounded-container" aria-label="Bill Creation Steps">
        <div className="stepper-horizontal-track">
          {stepsList.map((step) => {
            const isActive = currentStep === step.num;
            const isCompleted = currentStep > step.num;
            return (
              <button
                key={step.num}
                type="button"
                className={`step-pill-btn ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => handleStepClick(step.num)}
                title={`Go to Step ${step.num}: ${step.title}`}
              >
                <span className="step-pill-number">
                  {isCompleted ? <CheckCircle2 size={13} /> : step.num}
                </span>
                <span className="step-pill-title">{step.title}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main 2-Column Content: Form Card (Left) + Live Layout Architecture (Right) */}
      <div className="builder-main-grid">
        {/* Left Column: Interactive Form Card */}
        <div className="builder-form-card">
          {/* STEP 1: Details */}
          {currentStep === 1 && (
            <div className="form-step-content">
              <div className="form-step-header">
                <h2>1. Bill Details</h2>
                <p>Set the bill number, dates, currency, and choose your bill template.</p>
              </div>

              <div className="form-fields-stack">
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="input-bill-num">
                      Bill Number <span className="req-star">*</span>
                    </label>
                    <input
                      id="input-bill-num"
                      className={`form-input ${validationErrors.billNumber ? 'input-error' : ''}`}
                      type="text"
                      value={formData.billNumber}
                      onChange={(e) => handleInputChange('billNumber', e.target.value)}
                      placeholder="e.g. BILL-2026-5479"
                    />
                    {validationErrors.billNumber && (
                      <span className="field-error-text">{validationErrors.billNumber}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="input-bill-title">
                      Bill Title / Type
                    </label>
                    <select
                      id="input-bill-title"
                      className="form-input"
                      value={formData.title || 'BILL'}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                    >
                      <option value="BILL">BILL (Standard)</option>
                      <option value="TAX BILL">TAX BILL</option>
                      <option value="CASH MEMO">CASH MEMO</option>
                      <option value="RETAIL INVOICE">RETAIL INVOICE</option>
                      <option value="RECEIPT">RECEIPT</option>
                      <option value="PROFORMA INVOICE">PROFORMA INVOICE</option>
                      <option value="COMMERCIAL INVOICE">COMMERCIAL INVOICE</option>
                      {!['BILL', 'TAX BILL', 'CASH MEMO', 'RETAIL INVOICE', 'RECEIPT', 'PROFORMA INVOICE', 'COMMERCIAL INVOICE'].includes(formData.title || 'BILL') && (
                        <option value={formData.title}>{formData.title}</option>
                      )}
                    </select>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="input-po-num">
                      Reference / PO (optional)
                    </label>
                    <input
                      id="input-po-num"
                      className="form-input"
                      type="text"
                      value={formData.poNumber || ''}
                      onChange={(e) => handleInputChange('poNumber', e.target.value)}
                      placeholder="PO-12345"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="input-currency-sel">
                      Billing Currency
                    </label>
                    <select
                      id="input-currency-sel"
                      className="form-input"
                      value={formData.currency}
                      onChange={(e) => handleInputChange('currency', e.target.value as CurrencyCode)}
                    >
                      <option value="INR">INR (₹ - Indian Rupee)</option>
                      <option value="USD">USD ($ - US Dollar)</option>
                      <option value="EUR">EUR (€ - Euro)</option>
                      <option value="GBP">GBP (£ - British Pound)</option>
                      <option value="CAD">CAD ($ - Canadian Dollar)</option>
                    </select>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="input-issue-date">
                      Bill Date <span className="req-star">*</span>
                    </label>
                    <DateInputWithPicker
                      id="input-issue-date"
                      value={formData.issueDate}
                      onChange={(val) => handleInputChange('issueDate', val)}
                      placeholder="YYYY-MM-DD"
                      title="Select Bill Date from calendar"
                    />
                    {validationErrors.issueDate && (
                      <span className="field-error-text">{validationErrors.issueDate}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="input-due-date">
                      Due Date
                    </label>
                    <DateInputWithPicker
                      id="input-due-date"
                      value={formData.dueDate}
                      onChange={(val) => handleInputChange('dueDate', val)}
                      placeholder="YYYY-MM-DD"
                      title="Select Due Date from calendar"
                      disabled={!formData.dueDate}
                    />
                    <label htmlFor="bill-no-due-date" className="no-due-date-toggle" title="Check this if the bill has no due date (e.g. a one-off receipt or cash sale)">
                      <input
                        id="bill-no-due-date"
                        type="checkbox"
                        checked={!formData.dueDate}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setLastDueDate(formData.dueDate);
                            handleInputChange('dueDate', '');
                          } else {
                            handleInputChange('dueDate', lastDueDate || new Date().toISOString().slice(0, 10));
                          }
                        }}
                      />
                      <span>No due date</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Customer */}
          {currentStep === 2 && (
            <div className="form-step-content">
              <div className="form-step-header">
                <h2>2. Customer Information (BILL TO)</h2>
                <p>Billing address, shipping address, and contact person for this bill.</p>
              </div>

              <div className="form-fields-stack">
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="input-client-name">
                      Customer / Contact Name <span className="req-star">*</span>
                    </label>
                    <div className="input-with-icon">
                      <span className="input-icon-adornment">
                        <User size={16} />
                      </span>
                      <input
                        id="input-client-name"
                        className={`form-input ${validationErrors.clientName ? 'input-error' : ''}`}
                        type="text"
                        value={formData.clientName}
                        onChange={(e) => handleInputChange('clientName', e.target.value)}
                        placeholder="e.g. Stellar Innovations Pvt. Ltd."
                      />
                    </div>
                    {validationErrors.clientName && (
                      <span className="field-error-text">{validationErrors.clientName}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="input-client-company">
                      Company Name (optional)
                    </label>
                    <div className="input-with-icon">
                      <span className="input-icon-adornment">
                        <Building2 size={16} />
                      </span>
                      <input
                        id="input-client-company"
                        className="form-input"
                        type="text"
                        value={formData.clientCompany || ''}
                        onChange={(e) => handleInputChange('clientCompany', e.target.value)}
                        placeholder="e.g. Stellar Group Ltd."
                      />
                    </div>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="input-client-email">
                      Contact Email
                    </label>
                    <div className="input-with-icon">
                      <span className="input-icon-adornment">
                        <Mail size={16} />
                      </span>
                      <input
                        id="input-client-email"
                        className={`form-input ${validationErrors.clientEmail ? 'input-error' : ''}`}
                        type="email"
                        value={formData.clientEmail}
                        onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                        placeholder="accounts@stellarinnovations.com"
                      />
                    </div>
                    {validationErrors.clientEmail && (
                      <span className="field-error-text">{validationErrors.clientEmail}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="input-client-phone">
                      Contact Phone
                    </label>
                    <div className="input-with-icon">
                      <span className="input-icon-adornment">
                        <Phone size={16} />
                      </span>
                      <input
                        id="input-client-phone"
                        className="form-input"
                        type="text"
                        value={formData.clientPhone || ''}
                        onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                        placeholder="+91 98111 22334"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="input-client-tax">
                    Customer GST / Tax Number (optional)
                  </label>
                  <div className="input-with-icon">
                    <span className="input-icon-adornment">
                      <ShieldCheck size={16} />
                    </span>
                    <input
                      id="input-client-tax"
                      className="form-input"
                      type="text"
                      value={formData.clientTaxNumber || ''}
                      onChange={(e) => handleInputChange('clientTaxNumber', e.target.value)}
                      placeholder="e.g. 29AABCS5678G1Z2"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="input-client-addr">
                    Billing Address
                  </label>
                  <textarea
                    id="input-client-addr"
                    className="form-input form-textarea"
                    rows={2}
                    value={formData.clientAddress}
                    onChange={(e) => handleInputChange('clientAddress', e.target.value)}
                    placeholder="Enter street, city, state, postal code, and country"
                  />
                </div>

                {/* Shipping Address same as billing toggle */}
                <div className="form-checkbox-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
                  <input
                    id="chk-shipping-same"
                    type="checkbox"
                    checked={formData.shippingSameAsBilling ?? true}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setFormData((prev) => ({
                        ...prev,
                        shippingSameAsBilling: checked,
                        shippingAddress: checked ? prev.clientAddress : prev.shippingAddress || '',
                      }));
                    }}
                    style={{ width: 16, height: 16, cursor: 'pointer' }}
                  />
                  <label htmlFor="chk-shipping-same" style={{ fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer', userSelect: 'none' }}>
                    Shipping address same as billing address
                  </label>
                </div>

                {!formData.shippingSameAsBilling && (
                  <div className="form-group" style={{ marginTop: '0.5rem' }}>
                    <label className="form-label" htmlFor="input-shipping-addr">
                      Shipping / Delivery Address
                    </label>
                    <textarea
                      id="input-shipping-addr"
                      className="form-input form-textarea"
                      rows={2}
                      value={formData.shippingAddress || ''}
                      onChange={(e) => handleInputChange('shippingAddress', e.target.value)}
                      placeholder="Enter warehouse, dispatch dock, or site address"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: My Info (BILL FROM) */}
          {currentStep === 3 && (
            <div className="form-step-content">
              <div className="form-step-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h2>3. My Business Information (BILL FROM)</h2>
                  <p>Upload your logo and business details appearing on the bill.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {Boolean(getSavedBusinessProfile()?.companyName) && (
                    <span className="profile-sync-badge" title="Automatically connected with Profile & Settings in top bar">
                      <CheckCircle2 size={12} style={{ color: '#10b981' }} />
                      <span>Connected to Profile</span>
                    </span>
                  )}
                  <button
                    type="button"
                    className="btn-autofill-profile"
                    onClick={handleAutoFillFromProfile}
                    title="Sync with saved Business Profile Defaults"
                  >
                    <Sparkles size={13} />
                    <span>Sync Profile</span>
                  </button>
                </div>
              </div>

              <div className="form-fields-stack">
                {/* Clean Logo Upload Area */}
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label className="form-label" style={{ margin: 0 }}>Business Logo</label>
                    <span style={{ fontSize: '0.73rem', color: 'var(--text-muted, #64748b)', fontWeight: 500 }}>
                      Shown at its natural size in the bill header
                    </span>
                  </div>
                  <div
                    className="bill-logo-upload-zone"
                    style={{
                      border: isDraggingLogo ? '2px dashed #0284c7' : '2px dashed var(--glass-border, #cbd5e1)',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      textAlign: 'center',
                      background: isDraggingLogo ? 'rgba(2, 132, 199, 0.15)' : 'var(--glass-bg-subtle, #f8fafc)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: isDraggingLogo ? '0 0 0 4px rgba(2,132,199,0.12)' : 'none',
                    }}
                    onClick={() => logoInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingLogo(true);
                    }}
                    onDragLeave={() => setIsDraggingLogo(false)}
                    onDragEnd={() => setIsDraggingLogo(false)}
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
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={formData.senderLogo}
                            alt="Logo Preview"
                            style={{ maxWidth: 130, maxHeight: 52, width: 'auto', height: 'auto', objectFit: 'contain', display: 'block', flexShrink: 0 }}
                          />
                          <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary, #1e293b)' }}>
                              Business Logo
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>
                              ✓ Uploaded
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
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: 'var(--text-muted, #64748b)' }}>
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 10,
                            background: 'var(--glass-bg-subtle, #f1f5f9)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 2,
                          }}
                        >
                          <ImageIcon size={24} style={{ color: 'var(--text-dim, #94a3b8)' }} />
                        </div>
                        <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary, #1e293b)' }}>
                          Drag & drop image from desktop or click to upload
                        </span>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted, #64748b)' }}>
                          PNG, JPG, SVG or WEBP • Displayed at its natural size
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="input-sender-name">
                      Business / Company Name <span className="req-star">*</span>
                    </label>
                    <div className="input-with-icon">
                      <span className="input-icon-adornment">
                        <Building2 size={16} />
                      </span>
                      <input
                        id="input-sender-name"
                        className={`form-input ${validationErrors.senderName ? 'input-error' : ''}`}
                        type="text"
                        value={formData.senderName || ''}
                        onChange={(e) => handleInputChange('senderName', e.target.value)}
                        placeholder="e.g. Apex Corporate"
                      />
                    </div>
                    {validationErrors.senderName && (
                      <span className="field-error-text">{validationErrors.senderName}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="input-sender-tagline">
                      Tagline / Business Department
                    </label>
                    <input
                      id="input-sender-tagline"
                      className="form-input"
                      type="text"
                      value={formData.senderTagline || ''}
                      onChange={(e) => handleInputChange('senderTagline', e.target.value)}
                      placeholder="Corporate Billing Services"
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="input-sender-email">
                      Business Email
                    </label>
                    <div className="input-with-icon">
                      <span className="input-icon-adornment">
                        <Mail size={16} />
                      </span>
                      <input
                        id="input-sender-email"
                        className={`form-input ${validationErrors.senderEmail ? 'input-error' : ''}`}
                        type="email"
                        value={formData.senderEmail || ''}
                        onChange={(e) => handleInputChange('senderEmail', e.target.value)}
                        placeholder="billing@apexcorp.com"
                      />
                    </div>
                    {validationErrors.senderEmail && (
                      <span className="field-error-text">{validationErrors.senderEmail}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="input-sender-phone">
                      Support Phone
                    </label>
                    <div className="input-with-icon">
                      <span className="input-icon-adornment">
                        <Phone size={16} />
                      </span>
                      <input
                        id="input-sender-phone"
                        className="form-input"
                        type="text"
                        value={formData.senderPhone || ''}
                        onChange={(e) => handleInputChange('senderPhone', e.target.value)}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="input-sender-web">
                      Business Website
                    </label>
                    <div className="input-with-icon">
                      <span className="input-icon-adornment">
                        <Globe size={16} />
                      </span>
                      <input
                        id="input-sender-web"
                        className="form-input"
                        type="text"
                        value={formData.senderWebsite || ''}
                        onChange={(e) => handleInputChange('senderWebsite', e.target.value)}
                        placeholder="www.apexcorp.com"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="input-sender-tax">
                      GSTIN / Business Tax Number
                    </label>
                    <div className="input-with-icon">
                      <span className="input-icon-adornment">
                        <ShieldCheck size={16} />
                      </span>
                      <input
                        id="input-sender-tax"
                        className="form-input"
                        type="text"
                        value={formData.senderTaxNumber || ''}
                        onChange={(e) => handleInputChange('senderTaxNumber', e.target.value)}
                        placeholder="27AABCA1234F1Z9"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="input-sender-addr">
                    Office / Registered Address
                  </label>
                  <textarea
                    id="input-sender-addr"
                    className="form-input form-textarea"
                    rows={2}
                    value={formData.senderAddress || ''}
                    onChange={(e) => handleInputChange('senderAddress', e.target.value)}
                    placeholder="101 Cyber Towers, BKC, Mumbai 400051"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Items */}
          {currentStep === 4 && (
            <div className="form-step-content">
              <div className="form-step-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2>4. Line Items</h2>
                  <p>Add products, consulting services, unit rates, and taxes.</p>
                </div>
                <button type="button" className="btn-add-item" onClick={handleAddItem}>
                  <Plus size={15} />
                  <span>Add Line Item</span>
                </button>
              </div>

              {validationErrors.items && (
                <div className="field-error-text" style={{ marginBottom: '1rem', padding: '6px 12px', background: '#fee2e2', borderRadius: 6 }}>
                  {validationErrors.items}
                </div>
              )}

              <div className="items-list-stack">
                {formData.items.map((item, idx) => {
                  const lineTotal = (Number(item.qty) || 0) * (Number(item.rate) || 0);

                  return (
                    <div key={item.id} className="item-row-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', width: '100%', gap: '12px', padding: '14px', background: 'var(--glass-bg-subtle, #f8fafc)', border: '1px solid var(--glass-border-subtle, #e2e8f0)', borderRadius: '12px', marginBottom: '12px', boxSizing: 'border-box' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase' }}>
                          Item #{idx + 1}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            type="button"
                            className="item-btn-reorder"
                            onClick={() => handleMoveItem(idx, 'up')}
                            disabled={idx === 0}
                            title="Move Up"
                            style={{ padding: '2px 6px', border: '1px solid var(--glass-border-subtle, #cbd5e1)', borderRadius: '4px', background: 'var(--glass-bg, #fff)', color: 'var(--text-primary)', cursor: idx === 0 ? 'not-allowed' : 'pointer', opacity: idx === 0 ? 0.4 : 1 }}
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button
                            type="button"
                            className="item-btn-reorder"
                            onClick={() => handleMoveItem(idx, 'down')}
                            disabled={idx === formData.items.length - 1}
                            title="Move Down"
                            style={{ padding: '2px 6px', border: '1px solid var(--glass-border-subtle, #cbd5e1)', borderRadius: '4px', background: 'var(--glass-bg, #fff)', color: 'var(--text-primary)', cursor: idx === formData.items.length - 1 ? 'not-allowed' : 'pointer', opacity: idx === formData.items.length - 1 ? 0.4 : 1 }}
                          >
                            <ArrowDown size={12} />
                          </button>
                          <button
                            type="button"
                            className="item-delete-btn"
                            onClick={() => handleRemoveItem(item.id)}
                            title={formData.items.length <= 1 ? 'At least one item required' : 'Remove item'}
                            disabled={formData.items.length <= 1}
                            style={{ padding: '2px 6px', border: '1px solid rgba(239, 68, 68, 0.35)', borderRadius: '4px', background: 'var(--glass-bg, #fff)', color: '#ef4444', cursor: formData.items.length <= 1 ? 'not-allowed' : 'pointer' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <div className="form-grid-2" style={{ gap: '12px', width: '100%' }}>
                        <div className="form-group" style={{ gap: '6px' }}>
                          <label className="form-label" style={{ fontSize: '0.74rem', whiteSpace: 'nowrap' }}>
                            Item / Service Name
                          </label>
                          <input
                            className="form-input"
                            type="text"
                            value={item.name || ''}
                            onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                            placeholder="e.g. Architecture Consulting"
                          />
                        </div>

                        <div className="form-group" style={{ gap: '6px' }}>
                          <label className="form-label" style={{ fontSize: '0.74rem', whiteSpace: 'nowrap' }}>
                            Description <span style={{ color: '#94a3b8', fontWeight: 400 }}>(Optional)</span>
                          </label>
                          <input
                            className="form-input"
                            type="text"
                            value={item.description || ''}
                            onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                            placeholder="Optional item description"
                          />
                        </div>
                      </div>

                      <div className="item-inputs-grid" style={{ width: '100%' }}>
                        <div className="form-group" style={{ gap: '6px' }}>
                          <label className="form-label" style={{ fontSize: '0.74rem' }}>
                            Qty
                          </label>
                          <div className="number-stepper-wrapper">
                            <input
                              className="form-input number-stepper-input"
                              type="number"
                              min="1"
                              step="1"
                              value={item.qty ?? ''}
                              placeholder="1"
                              onChange={(e) => handleItemChange(item.id, 'qty', e.target.value)}
                            />
                            <div className="number-stepper-btns">
                              <button
                                type="button"
                                className="number-stepper-btn up"
                                onClick={() => handleStepQty(item.id, 1)}
                                title="Increase Quantity"
                              >
                                <ChevronUp size={11} strokeWidth={2.6} />
                              </button>
                              <button
                                type="button"
                                className="number-stepper-btn down"
                                onClick={() => handleStepQty(item.id, -1)}
                                title="Decrease Quantity"
                              >
                                <ChevronDown size={11} strokeWidth={2.6} />
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="form-group" style={{ gap: '6px' }}>
                          <label className="form-label" style={{ fontSize: '0.74rem' }}>
                            Rate ({currencySymbol})
                          </label>
                          <div className="number-stepper-wrapper">
                            <input
                              className="form-input number-stepper-input"
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.rate ?? ''}
                              placeholder="0.00"
                              onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)}
                            />
                            <div className="number-stepper-btns">
                              <button
                                type="button"
                                className="number-stepper-btn up"
                                onClick={() => handleStepRate(item.id, 1)}
                                title="Increase Rate"
                              >
                                <ChevronUp size={11} strokeWidth={2.6} />
                              </button>
                              <button
                                type="button"
                                className="number-stepper-btn down"
                                onClick={() => handleStepRate(item.id, -1)}
                                title="Decrease Rate"
                              >
                                <ChevronDown size={11} strokeWidth={2.6} />
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="form-group" style={{ gap: '6px' }}>
                          <label className="form-label" style={{ fontSize: '0.74rem' }}>
                            Tax (%)
                          </label>
                          <div className="number-stepper-wrapper">
                            <input
                              className="form-input number-stepper-input"
                              type="number"
                              min="0"
                              max="100"
                              step="1"
                              value={item.taxRate ?? ''}
                              placeholder="0"
                              onChange={(e) => handleItemChange(item.id, 'taxRate', e.target.value)}
                            />
                            <div className="number-stepper-btns">
                              <button
                                type="button"
                                className="number-stepper-btn up"
                                onClick={() => handleStepItemTax(item.id, 1)}
                                title="Increase Tax Rate"
                              >
                                <ChevronUp size={11} strokeWidth={2.6} />
                              </button>
                              <button
                                type="button"
                                className="number-stepper-btn down"
                                onClick={() => handleStepItemTax(item.id, -1)}
                                title="Decrease Tax Rate"
                              >
                                <ChevronDown size={11} strokeWidth={2.6} />
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="form-group" style={{ textAlign: 'right', gap: '6px' }}>
                          <label className="form-label" style={{ fontSize: '0.74rem', textAlign: 'right', display: 'block' }}>
                            Line Total
                          </label>
                          <div className="item-line-total-value">
                            {currencySymbol}{formatAmount(lineTotal)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(59, 130, 246, 0.12)', borderRadius: '8px', marginTop: '8px', border: '1px solid rgba(59, 130, 246, 0.22)' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#3b82f6' }}>
                  Items Subtotal ({formData.items.length} items):
                </span>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#3b82f6' }}>
                  {currencySymbol}{formatAmount(calc.subtotal)}
                </span>
              </div>
            </div>
          )}

          {/* STEP 5: Payment */}
          {currentStep === 5 && (
            <div className="form-step-content">
              <div className="form-step-header">
                <h2>5. Payment, Taxes &amp; Charges</h2>
                <p>Payment method, bank accounts, discounts, and amount paid.</p>
              </div>

              <div className="form-fields-stack">
                {/* Payment Method Selector */}
                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {(['Bank Transfer', 'UPI', 'Cash', 'Card', 'Other'] as const).map((method) => {
                      const isSelected = (formData.paymentMethod || 'Bank Transfer') === method;
                      return (
                        <button
                          key={method}
                          type="button"
                          className={`btn-secondary-glass ${isSelected ? 'active' : ''}`}
                          style={{
                            padding: '6px 14px',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            borderRadius: '8px',
                            border: isSelected ? '1.5px solid #2563eb' : '1px solid var(--glass-border-subtle, #cbd5e1)',
                            background: isSelected ? 'rgba(37, 99, 235, 0.15)' : 'var(--glass-bg, #ffffff)',
                            color: isSelected ? '#3b82f6' : 'var(--text-secondary, #334155)',
                            cursor: 'pointer',
                          }}
                          onClick={() => handleInputChange('paymentMethod', method)}
                        >
                          {method}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bank / UPI Details */}
                <div style={{ padding: '14px', background: 'var(--glass-bg-subtle, #f8fafc)', borderRadius: '12px', border: '1px solid var(--glass-border-subtle, #e2e8f0)' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary, #1e40af)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Landmark size={15} />
                    <span>Bank &amp; UPI Account Details (Optional)</span>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label" htmlFor="input-bank-name" style={{ fontSize: '0.74rem' }}>
                        Bank Name
                      </label>
                      <input
                        id="input-bank-name"
                        className="form-input"
                        type="text"
                        value={formData.bankName || ''}
                        onChange={(e) => handleInputChange('bankName', e.target.value)}
                        placeholder="e.g. HDFC Bank Ltd."
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="input-acct-num" style={{ fontSize: '0.74rem' }}>
                        Account Number
                      </label>
                      <input
                        id="input-acct-num"
                        className="form-input"
                        type="text"
                        value={formData.accountNumber || ''}
                        onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                        placeholder="e.g. 50200084920194"
                      />
                    </div>
                  </div>

                  <div className="form-grid-2" style={{ marginTop: '8px' }}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="input-ifsc" style={{ fontSize: '0.74rem' }}>
                        IFSC Code / Swift
                      </label>
                      <input
                        id="input-ifsc"
                        className="form-input"
                        type="text"
                        value={formData.ifscCode || ''}
                        onChange={(e) => handleInputChange('ifscCode', e.target.value)}
                        placeholder="e.g. HDFC0001234"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="input-branch" style={{ fontSize: '0.74rem' }}>
                        Branch Location
                      </label>
                      <input
                        id="input-branch"
                        className="form-input"
                        type="text"
                        value={formData.branch || ''}
                        onChange={(e) => handleInputChange('branch', e.target.value)}
                        placeholder="e.g. BKC Premier Mumbai"
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: '8px' }}>
                    <label className="form-label" htmlFor="input-upi-id" style={{ fontSize: '0.74rem' }}>
                      UPI ID (optional)
                    </label>
                    <input
                      id="input-upi-id"
                      className="form-input"
                      type="text"
                      value={formData.upiId || ''}
                      onChange={(e) => handleInputChange('upiId', e.target.value)}
                      placeholder="e.g. apexcorp@hdfcbank"
                    />
                  </div>
                </div>

                {/* Payment Terms */}
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="sel-pay-terms">
                      Payment Terms
                    </label>
                    <select
                      id="sel-pay-terms"
                      className="form-input"
                      value={formData.paymentTerms || '30 days'}
                      onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
                    >
                      <option value="Due on receipt">Due on receipt</option>
                      <option value="7 days">7 days</option>
                      <option value="15 days">15 days</option>
                      <option value="30 days">30 days</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>

                  {formData.paymentTerms === 'Custom' && (
                    <div className="form-group">
                      <label className="form-label" htmlFor="input-custom-terms">
                        Custom Terms Specification
                      </label>
                      <input
                        id="input-custom-terms"
                        className="form-input"
                        type="text"
                        value={formData.customPaymentTerms || ''}
                        onChange={(e) => handleInputChange('customPaymentTerms', e.target.value)}
                        placeholder="e.g. 50% advance, balance on delivery"
                      />
                    </div>
                  )}
                </div>

                {/* Adjustments: Discount, Overall Tax, Additional Charges */}
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="input-discount-amt">
                      Bill Discount ({currencySymbol})
                    </label>
                    <div className="number-stepper-wrapper">
                      <input
                        id="input-discount-amt"
                        className="form-input number-stepper-input"
                        type="number"
                        min="0"
                        step="1"
                        value={formData.discount || 0}
                        onChange={(e) => handleInputChange('discount', parseFloat(e.target.value) || 0)}
                      />
                      <div className="number-stepper-btns">
                        <button
                          type="button"
                          className="number-stepper-btn up"
                          onClick={() => handleStepDiscount(100)}
                          title="Increase Discount (+100)"
                        >
                          <ChevronUp size={12} strokeWidth={2.6} />
                        </button>
                        <button
                          type="button"
                          className="number-stepper-btn down"
                          onClick={() => handleStepDiscount(-100)}
                          title="Decrease Discount (-100)"
                        >
                          <ChevronDown size={12} strokeWidth={2.6} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="input-tax-rate">
                      Bill Tax Rate (%)
                    </label>
                    <div className="number-stepper-wrapper">
                      <input
                        id="input-tax-rate"
                        className="form-input number-stepper-input"
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={formData.taxRate || 0}
                        onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value) || 0)}
                      />
                      <div className="number-stepper-btns">
                        <button
                          type="button"
                          className="number-stepper-btn up"
                          onClick={() => handleStepTaxRate(1)}
                          title="Increase Tax Rate (+1%)"
                        >
                          <ChevronUp size={12} strokeWidth={2.6} />
                        </button>
                        <button
                          type="button"
                          className="number-stepper-btn down"
                          onClick={() => handleStepTaxRate(-1)}
                          title="Decrease Tax Rate (-1%)"
                        >
                          <ChevronDown size={12} strokeWidth={2.6} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="input-add-charges">
                      Additional Charges ({currencySymbol})
                    </label>
                    <div className="number-stepper-wrapper">
                      <input
                        id="input-add-charges"
                        className="form-input number-stepper-input"
                        type="number"
                        min="0"
                        step="1"
                        value={formData.additionalCharges || 0}
                        onChange={(e) => handleInputChange('additionalCharges', parseFloat(e.target.value) || 0)}
                        placeholder="Shipping, handling, etc."
                      />
                      <div className="number-stepper-btns">
                        <button
                          type="button"
                          className="number-stepper-btn up"
                          onClick={() => handleStepAdditionalCharges(50)}
                          title="Increase (+50)"
                        >
                          <ChevronUp size={12} strokeWidth={2.6} />
                        </button>
                        <button
                          type="button"
                          className="number-stepper-btn down"
                          onClick={() => handleStepAdditionalCharges(-50)}
                          title="Decrease (-50)"
                        >
                          <ChevronDown size={12} strokeWidth={2.6} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="input-amt-paid">
                      Amount Paid ({currencySymbol})
                    </label>
                    <div className="number-stepper-wrapper">
                      <input
                        id="input-amt-paid"
                        className={`form-input number-stepper-input ${validationErrors.amountPaid ? 'input-error' : ''}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.amountPaid || 0}
                        onChange={(e) => handleInputChange('amountPaid', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                      <div className="number-stepper-btns">
                        <button
                          type="button"
                          className="number-stepper-btn up"
                          onClick={() => handleStepAmountPaid(100)}
                          title="Increase Amount Paid (+100)"
                        >
                          <ChevronUp size={12} strokeWidth={2.6} />
                        </button>
                        <button
                          type="button"
                          className="number-stepper-btn down"
                          onClick={() => handleStepAmountPaid(-100)}
                          title="Decrease Amount Paid (-100)"
                        >
                          <ChevronDown size={12} strokeWidth={2.6} />
                        </button>
                      </div>
                    </div>
                    {validationErrors.amountPaid && (
                      <span className="field-error-text">{validationErrors.amountPaid}</span>
                    )}
                  </div>
                </div>

                {/* Real-time Calculation Summary Card inside Step 5 */}
                <div style={{ padding: '14px', background: 'var(--glass-bg-subtle, #f1f5f9)', borderRadius: '10px', marginTop: '6px', border: '1px solid var(--glass-border-subtle, #e2e8f0)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-muted, #64748b)' }}>Subtotal:</span>
                    <span style={{ fontWeight: 600 }}>{currencySymbol}{formatAmount(calc.subtotal)}</span>
                  </div>
                  {calc.discountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#10b981', marginBottom: 4 }}>
                      <span>Discount:</span>
                      <span>-{currencySymbol}{formatAmount(calc.discountAmount)}</span>
                    </div>
                  )}
                  {calc.taxAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 4 }}>
                      <span style={{ color: 'var(--text-muted, #64748b)' }}>Tax / GST:</span>
                      <span style={{ fontWeight: 600 }}>+{currencySymbol}{formatAmount(calc.taxAmount)}</span>
                    </div>
                  )}
                  {calc.additionalCharges > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 4 }}>
                      <span style={{ color: 'var(--text-muted, #64748b)' }}>Additional Charges:</span>
                      <span style={{ fontWeight: 600 }}>+{currencySymbol}{formatAmount(calc.additionalCharges)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', fontWeight: 700, borderTop: '1px solid var(--glass-border-subtle, #cbd5e1)', paddingTop: 6, marginTop: 4 }}>
                    <span>Grand Total:</span>
                    <span>{currencySymbol}{formatAmount(calc.grandTotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#059669', marginTop: 4 }}>
                    <span>Amount Paid:</span>
                    <span style={{ fontWeight: 700 }}>{currencySymbol}{formatAmount(calc.amountPaid)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 800, color: 'var(--builder-accent, #1e40af)', borderTop: '1px solid var(--glass-border-subtle, #cbd5e1)', paddingTop: 6, marginTop: 6 }}>
                    <span>BALANCE DUE:</span>
                    <span>{currencySymbol}{formatAmount(calc.balanceDue)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Template & Finalize */}
          {currentStep === 6 && (
            <div className="form-step-content">
              <div className="form-step-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h2>6. Choose Template &amp; Finalize</h2>
                    <p>Select your bill layout, fine-tune notes and terms, and export your 1-page document.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        localStorage.setItem('billease_bill_draft', JSON.stringify(formData));
                        localStorage.setItem('billease_active_template', normalizeTemplateId(formData.template, 'bill'));
                      } catch (_) {}
                      onNavigate('templates');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      padding: '6px 12px',
                      borderRadius: '8px',
                      background: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      color: '#1d4ed8',
                      cursor: 'pointer',
                    }}
                  >
                    <Layers size={14} />
                    <span>Open Templates Gallery</span>
                  </button>
                </div>
              </div>

              <div className="form-fields-stack">
                {/* Visual Bill Template Cards Grid */}
                <div className="bill-step-template-selection">
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '10px',
                    }}
                  >
                    <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Palette size={15} color="#2563eb" />
                      <span>Available Bill Templates ({BILL_TEMPLATES.length})</span>
                    </div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      Click any template to switch instantly
                    </span>
                  </div>

                  <div
                    className="bill-template-cards-grid"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                      gap: '12px',
                      marginBottom: '1.5rem',
                    }}
                  >
                    {BILL_TEMPLATES.map((tpl) => {
                      const isSelected = normalizeTemplateId(formData.template, 'bill') === tpl.id;
                      return (
                        <div
                          key={tpl.id}
                          className={`bill-tpl-picker-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => {
                            handleInputChange('template', tpl.id);
                            try {
                              localStorage.setItem('billease_active_template', tpl.id);
                            } catch (_) {}
                            onNotify(`Applied ${tpl.name}!`);
                          }}
                          style={{
                            border: isSelected ? '2px solid var(--builder-accent, #2563eb)' : '1px solid var(--glass-border-subtle, #e2e8f0)',
                            borderRadius: '12px',
                            padding: '14px',
                            background: isSelected ? 'rgba(37, 99, 235, 0.15)' : 'var(--glass-bg, #ffffff)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            position: 'relative',
                            boxShadow: isSelected
                              ? '0 4px 14px rgba(37,99,235,0.15)'
                              : '0 1px 3px rgba(0,0,0,0.04)',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginBottom: '8px',
                            }}
                          >
                            <span
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                padding: '2px 8px',
                                borderRadius: '9999px',
                                background: isSelected ? 'rgba(37, 99, 235, 0.25)' : 'var(--glass-bg-subtle, #f1f5f9)',
                                color: isSelected ? '#3b82f6' : 'var(--text-secondary, #475569)',
                              }}
                            >
                              {tpl.badge}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span
                                style={{
                                  width: '12px',
                                  height: '12px',
                                  borderRadius: '50%',
                                  background: tpl.accentColor,
                                }}
                              />
                              {isSelected && (
                                <span
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '50%',
                                    background: '#2563eb',
                                    color: '#ffffff',
                                  }}
                                >
                                  <Check size={11} strokeWidth={3} />
                                </span>
                              )}
                            </div>
                          </div>

                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: '0.92rem',
                              color: isSelected ? 'var(--builder-accent, #2563eb)' : 'var(--text-primary, #0f172a)',
                              marginBottom: '4px',
                            }}
                          >
                            {tpl.name}
                          </div>

                          <div
                            style={{
                              fontSize: '0.75rem',
                              color: 'var(--text-muted, #64748b)',
                              lineHeight: '1.35',
                              marginBottom: '8px',
                            }}
                          >
                            {tpl.description}
                          </div>

                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {tpl.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                style={{
                                  fontSize: '0.68rem',
                                  color: 'var(--text-muted, #64748b)',
                                  background: 'var(--glass-bg-subtle, #f8fafc)',
                                  border: '1px solid var(--glass-border-subtle, #e2e8f0)',
                                  borderRadius: '4px',
                                  padding: '1px 6px',
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="input-bill-notes">
                    Customer Notes
                  </label>
                  <textarea
                    id="input-bill-notes"
                    className="form-input form-textarea"
                    rows={2}
                    value={formData.notes || ''}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="e.g. Thank you for your business."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="input-payment-notes">
                    Payment Instructions
                  </label>
                  <textarea
                    id="input-payment-notes"
                    className="form-input form-textarea"
                    rows={2}
                    value={formData.paymentNotes || ''}
                    onChange={(e) => handleInputChange('paymentNotes', e.target.value)}
                    placeholder="e.g. Payment is due within the agreed period..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="input-terms-cond">
                    Terms &amp; Conditions
                  </label>
                  <textarea
                    id="input-terms-cond"
                    className="form-input form-textarea"
                    rows={3}
                    value={formData.termsAndConditions || ''}
                    onChange={(e) => handleInputChange('termsAndConditions', e.target.value)}
                    placeholder="e.g. Goods/services are subject to the agreed terms."
                  />
                </div>

                {/* Review & Finalize Card */}
                <div className="summary-review-card" style={{ padding: '18px', background: 'var(--glass-bg-subtle, #eff6ff)', borderRadius: '12px', border: '1px solid var(--glass-border-subtle, #bfdbfe)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-primary, #1e40af)', marginBottom: '2px' }}>
                    Document Summary
                  </div>
                  <div className="summary-review-row summary-review-row-line">
                    <span style={{ color: 'var(--text-secondary)' }}>Items Subtotal</span>
                    <span style={{ fontWeight: 600 }}>{currencySymbol}{formatAmount(calc.subtotal)}</span>
                  </div>
                  {calc.discountAmount > 0 && (
                    <div className="summary-review-row summary-review-row-line">
                      <span style={{ color: 'var(--text-secondary)' }}>Discount</span>
                      <span style={{ color: '#10b981', fontWeight: 600 }}>-{currencySymbol}{formatAmount(calc.discountAmount)}</span>
                    </div>
                  )}
                  {calc.taxAmount > 0 && (
                    <div className="summary-review-row summary-review-row-line">
                      <span style={{ color: 'var(--text-secondary)' }}>Tax / GST ({formData.taxRate}%)</span>
                      <span style={{ fontWeight: 600 }}>+{currencySymbol}{formatAmount(calc.taxAmount)}</span>
                    </div>
                  )}
                  {calc.additionalCharges > 0 && (
                    <div className="summary-review-row summary-review-row-line">
                      <span style={{ color: 'var(--text-secondary)' }}>Additional Charges</span>
                      <span style={{ fontWeight: 600 }}>+{currencySymbol}{formatAmount(calc.additionalCharges)}</span>
                    </div>
                  )}
                  <div className="summary-review-row summary-review-row-subtotal" style={{ borderTop: '1px solid var(--glass-border-subtle, #cbd5e1)', paddingTop: '0.65rem', marginTop: '0.4rem' }}>
                    <span style={{ fontWeight: 700 }}>Grand Total</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary, #0f2b6a)' }}>
                      {currencySymbol}{formatAmount(calc.grandTotal)}
                    </span>
                  </div>
                  <div className="summary-review-row summary-review-row-line" style={{ color: '#059669' }}>
                    <span style={{ fontWeight: 600 }}>Amount Paid</span>
                    <span style={{ fontWeight: 700 }}>{currencySymbol}{formatAmount(calc.amountPaid)}</span>
                  </div>
                  <div className="summary-review-row summary-review-row-balance" style={{ borderTop: '1px solid var(--glass-border-subtle, #cbd5e1)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                    <span style={{ fontWeight: 700, color: 'var(--builder-accent, #1e40af)' }}>BALANCE DUE</span>
                    <span className="summary-total-large" style={{ color: 'var(--builder-accent, #1e40af)', fontWeight: 800 }}>
                      {currencySymbol}{formatAmount(calc.balanceDue)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stepper Footer Controls */}
          <div className="wizard-footer-nav" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid #eef2f6' }}>
            <button
              type="button"
              className="btn-wizard-prev"
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: currentStep === 1 ? 0.4 : 1 }}
            >
              <ArrowLeft size={16} />
              <span>Previous</span>
            </button>

            {currentStep < 6 ? (
              <button
                type="button"
                className="btn-wizard-next"
                onClick={handleNextStep}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <span>Next Step</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn-wizard-next"
                  onClick={handleGeneratePdf}
                  disabled={isGeneratingPdf}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--builder-accent, #2563eb)' }}
                >
                  <Download size={16} />
                  <span>Download PDF</span>
                </button>
                <button
                  type="button"
                  className="btn-wizard-next"
                  onClick={() => handleCreateBillAndFinish('my-documents')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: '#059669',
                    boxShadow: '0 2px 8px rgba(5,150,105,0.25)',
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>Finish &amp; View</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Layout Architecture */}
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
                  value={normalizeTemplateId(formData.template, 'bill')}
                  onChange={(e) => {
                    const chosen = e.target.value as TemplateId;
                    handleInputChange('template', chosen);
                    try {
                      localStorage.setItem('billease_active_template', chosen);
                    } catch (_) {}
                    onNotify(`Applied ${chosen} layout!`);
                  }}
                  title="Choose Document Template"
                >
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
                title="Browse Templates Gallery"
                aria-label="Open Template Gallery"
              >
                <LayoutGrid size={15} />
                <span>Gallery</span>
              </button>
            </div>
          </div>

          {/* Sample Data Preview Banner — only shown while previewing, never persisted */}
          {showSampleData && (
            <div
              role="status"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
                background: '#fffbeb',
                border: '1px solid #fde68a',
                color: '#92400e',
                borderRadius: 10,
                padding: '8px 14px',
                marginBottom: 14,
                fontSize: '0.78rem',
                fontWeight: 600,
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={14} />
                Previewing with sample content — nothing shown here is saved
              </span>
              <button
                type="button"
                onClick={handleToggleSampleData}
                style={{
                  background: 'none',
                  border: '1px solid #fcd34d',
                  color: '#92400e',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  padding: '3px 10px',
                  borderRadius: 6,
                  flexShrink: 0,
                }}
              >
                Clear
              </button>
            </div>
          )}

          {/* The A4 Canvas Rendered Live */}
          <div className="live-arch-paper-container">
            <DocumentRenderer document={previewDocument} />
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
                onClick={handleToggleSampleData}
                style={{
                  background: showSampleData ? '#fffbeb' : 'none',
                  border: showSampleData ? '1px solid #fde68a' : 'none',
                  color: showSampleData ? '#92400e' : activeAccentHex,
                  fontWeight: 700,
                  fontSize: '0.76rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  borderRadius: '6px',
                }}
                title={showSampleData ? 'Stop previewing sample content' : 'Preview the document filled with example content — your real data is never touched or saved'}
              >
                <Sparkles size={13} />
                <span>{showSampleData ? 'Clear Sample Preview' : 'Sample Data'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Reset the form to blank? This clears everything you\'ve entered on this bill.')) {
                    handleResetForm();
                  }
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontWeight: 700,
                  fontSize: '0.76rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  borderRadius: '6px',
                }}
                title="Clear this form and start with a blank bill"
              >
                <RotateCcw size={13} />
                <span>Reset Form</span>
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

      {/* Gallery Modal / Drawer */}
      {showGallery && (
        <div
          className="gallery-modal-overlay"
          style={{ '--builder-accent': activeAccentHex } as React.CSSProperties}
          onClick={() => setShowGallery(false)}
        >
          <div className="gallery-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="gallery-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <LayoutGrid size={18} style={{ color: activeAccentHex }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Choose Template Layout</h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      localStorage.setItem('billease_bill_draft', JSON.stringify(formData));
                      localStorage.setItem('billease_active_template', normalizeTemplateId(formData.template, 'bill'));
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
                    color: activeAccentHex,
                    background: `${activeAccentHex}15`,
                    border: `1px solid ${activeAccentHex}40`,
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
              {BILL_TEMPLATES.map((tpl) => {
                const isSelected = normalizeTemplateId(formData.template, 'bill') === tpl.id;
                return (
                  <div
                    key={tpl.id}
                    className={`gallery-card-item ${isSelected ? 'active' : ''}`}
                    style={{
                      borderColor: isSelected ? activeAccentHex : undefined,
                      background: isSelected ? `${activeAccentHex}0f` : undefined,
                    }}
                    onClick={() => {
                      handleInputChange('template', tpl.id);
                      try {
                        localStorage.setItem('billease_active_template', tpl.id);
                        localStorage.setItem('billease_bill_draft', JSON.stringify({ ...formData, template: tpl.id }));
                      } catch (_) {}
                      setShowGallery(false);
                      onNotify(`Applied ${tpl.name} layout!`);
                    }}
                  >
                    <div className="gallery-card-meta">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: activeAccentHex, textTransform: 'uppercase' }}>
                          {tpl.categoryTag}
                        </span>
                        {isSelected && (
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: activeAccentHex, background: `${activeAccentHex}20`, padding: '1px 6px', borderRadius: 4 }}>
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
