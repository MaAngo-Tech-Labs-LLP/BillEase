import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import CreateBillPage from './pages/CreateBillPage';
import CreateInvoicePage from './pages/CreateInvoicePage';
import MyDocumentsPage from './pages/MyDocumentsPage';
import TemplatesPage from './pages/TemplatesPage';
import PreviewPage from './pages/PreviewPage';
import BusinessProfileModal from './components/BusinessProfileModal';
import { useDocuments } from './hooks/useDocuments';
import { BillDocument, TemplateId, BusinessProfile } from './types';
import { applyBusinessProfileToDoc } from './utils/profileSync';
import { DEFAULT_BILL, DEFAULT_INVOICE } from './data/templates';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam) return tabParam;
      const hash = window.location.hash.replace('#', '');
      if (hash) return hash;
    } catch (_) {}
    return 'home';
  });
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('billease_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (_) {
      return false;
    }
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const {
    documents,
    draft,
    setDraft,
    saveDocument,
    deleteDocument,
    clearAllDocuments,
    createNewDraft,
  } = useDocuments();

  // Document selected for dedicated PreviewPage
  const [previewDoc, setPreviewDoc] = useState<BillDocument | null>(null);

  const [lastEditorTab, setLastEditorTab] = useState<'create-bill' | 'create-invoice'>('create-bill');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Whether the currently open editor (Create Bill / Create Invoice) has
  // changes that haven't been committed via Save Draft / Create / Download
  // PDF. Used to warn before navigating away, like Word/Office does.
  const [isEditorDirty, setIsEditorDirty] = useState(false);

  const handleSaveProfile = (profile: BusinessProfile) => {
    setDraft((prev) => applyBusinessProfileToDoc(prev, profile, true));
    triggerToast('Business Profile connected! Automatically applied to your bills & invoices.');
  };

  // Sync theme attribute on document body and html, and persist to localStorage
  useEffect(() => {
    try {
      if (isDark) {
        document.body.setAttribute('data-theme', 'dark');
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('billease_theme', 'dark');
      } else {
        document.body.removeAttribute('data-theme');
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('billease_theme', 'light');
      }
    } catch (_) {}
  }, [isDark]);

  // Warn before closing/refreshing the tab with unsaved editor changes —
  // browsers show their own native prompt here (text is ignored by most).
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isEditorDirty) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isEditorDirty]);

  // Toast feedback trigger
  const triggerToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 3500);
  };

  const handleSelectTab = (tabId: string) => {
    // Warn before leaving a dirty editor for anywhere else — including
    // switching from Bill to Invoice or vice versa — same as Word/Office
    // asking to save unsaved changes before closing/switching documents.
    const leavingDirtyEditor =
      (currentTab === 'create-bill' || currentTab === 'create-invoice') &&
      tabId !== currentTab &&
      isEditorDirty;
    if (leavingDirtyEditor) {
      const confirmed = window.confirm(
        'You have unsaved changes. Leave without saving?\n\nTip: use "Save Draft" first to keep your changes.'
      );
      if (!confirmed) return;
      setIsEditorDirty(false);
    }

    if (tabId === 'create-bill' || tabId === 'create-invoice') {
      setLastEditorTab(tabId);
    }
    if (tabId === 'preview') {
      const activeType = currentTab === 'create-invoice' || lastEditorTab === 'create-invoice' ? 'invoice' : 'bill';
      if (activeType === 'invoice') {
        const savedInv = localStorage.getItem('billease_invoice_draft');
        if (savedInv) {
          try {
            setPreviewDoc(JSON.parse(savedInv));
          } catch (_) {}
        } else if (draft.type === 'invoice') {
          setPreviewDoc(draft);
        } else {
          setPreviewDoc(DEFAULT_INVOICE);
        }
      } else {
        const savedBill = localStorage.getItem('billease_bill_draft');
        if (savedBill) {
          try {
            setPreviewDoc(JSON.parse(savedBill));
          } catch (_) {}
        } else if (draft.type === 'bill') {
          setPreviewDoc(draft);
        } else {
          setPreviewDoc(DEFAULT_BILL);
        }
      }
    }
    setCurrentTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // When clicking "Open" on any doc from home or my-documents
  const handleSelectDocument = (doc: BillDocument) => {
    setPreviewDoc(doc);
    setCurrentTab('preview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // When clicking "Edit" on a document in My Documents
  const handleEditDocument = (doc: BillDocument) => {
    setDraft(doc);
    const targetTab = doc.type === 'invoice' ? 'create-invoice' : 'create-bill';
    setLastEditorTab(targetTab);
    setCurrentTab(targetTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // When user clicks "Use this template" in TemplatesPage
  const handleSelectTemplate = (templateId: TemplateId, docType?: 'bill' | 'invoice') => {
    try {
      localStorage.setItem('billease_active_template', templateId);
    } catch (_) {}
    const targetType = docType || (lastEditorTab === 'create-invoice' ? 'invoice' : 'bill');
    const targetTab = targetType === 'invoice' ? 'create-invoice' : 'create-bill';

    if (targetType === 'bill') {
      const savedBill = localStorage.getItem('billease_bill_draft');
      let baseDoc: BillDocument = draft.type === 'bill' ? { ...draft } : createNewDraft('bill');
      if (savedBill) {
        try {
          const parsed = JSON.parse(savedBill);
          baseDoc = { ...baseDoc, ...parsed };
        } catch (_) {}
      }
      baseDoc.template = templateId;
      baseDoc.type = 'bill';
      setDraft(baseDoc);
      try {
        localStorage.setItem('billease_bill_draft', JSON.stringify(baseDoc));
      } catch (_) {}
    } else {
      const savedInv = localStorage.getItem('billease_invoice_draft');
      let baseDoc: BillDocument = draft.type === 'invoice' ? { ...draft } : createNewDraft('invoice');
      if (savedInv) {
        try {
          const parsed = JSON.parse(savedInv);
          baseDoc = { ...baseDoc, ...parsed };
        } catch (_) {}
      }
      baseDoc.template = templateId;
      baseDoc.type = 'invoice';
      setDraft(baseDoc);
      try {
        localStorage.setItem('billease_invoice_draft', JSON.stringify(baseDoc));
      } catch (_) {}
    }

    setCurrentTab(targetTab);
    triggerToast(`Applied template to your ${targetType === 'invoice' ? 'invoice' : 'bill'}!`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveDocument = (doc: BillDocument) => {
    const saved = saveDocument(doc);
    setPreviewDoc(saved);
    return saved;
  };

  const handlePreviewDocument = (doc: BillDocument) => {
    const saved = saveDocument(doc);
    setPreviewDoc(saved);
    setCurrentTab('preview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-wrapper">
      {/* Background ambient orbs providing organic liquid refractions through glass */}
      <div className="ambient-liquid-background" aria-hidden="true">
        <div className="liquid-orb orb-mint" />
        <div className="liquid-orb orb-lavender" />
        <div className="liquid-orb orb-ivory-glow" />
      </div>

      {/* Floating Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        isDark={isDark}
        onToggleTheme={() => setIsDark((prev) => !prev)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* Main Content View Switcher */}
      <main className="main-content">
        {currentTab === 'home' && (
          <HomePage
            documents={documents}
            onNavigate={handleSelectTab}
            onSelectDocument={handleSelectDocument}
          />
        )}

        {currentTab === 'create-bill' && (
          <CreateBillPage
            initialDocument={draft.type === 'bill' ? draft : undefined}
            onSave={handleSaveDocument}
            onPreview={handlePreviewDocument}
            onNavigate={handleSelectTab}
            onNotify={triggerToast}
            onDirtyChange={setIsEditorDirty}
          />
        )}

        {currentTab === 'create-invoice' && (
          <CreateInvoicePage
            initialDocument={draft.type === 'invoice' ? draft : undefined}
            onSave={handleSaveDocument}
            onPreview={handlePreviewDocument}
            onNavigate={handleSelectTab}
            onNotify={triggerToast}
            onDirtyChange={setIsEditorDirty}
          />
        )}

        {currentTab === 'templates' && (
          <TemplatesPage
            onSelectTemplate={handleSelectTemplate}
            activeDocType={lastEditorTab === 'create-invoice' ? 'invoice' : 'bill'}
          />
        )}

        {currentTab === 'my-documents' && (
          <MyDocumentsPage
            documents={documents}
            onSelectDocument={handleSelectDocument}
            onEditDocument={handleEditDocument}
            onDeleteDocument={(id) => {
              deleteDocument(id);
              triggerToast('Document deleted.');
            }}
            onClearAllDocuments={() => {
              clearAllDocuments();
              triggerToast('All documents cleared.');
            }}
            onNavigate={handleSelectTab}
          />
        )}

        {currentTab === 'preview' && (
          <PreviewPage
            document={previewDoc || draft}
            onBack={() => {
              // Return to whichever editor (Bill or Invoice) the user was
              // actually in before opening Preview. `draft.type` is a single
              // shared value that can go stale across the two editors, so it
              // must never be used to decide this — always defer to the
              // document actually being previewed, then to the last editor
              // tab the user was on.
              const target = previewDoc?.type === 'invoice' || (!previewDoc && lastEditorTab === 'create-invoice')
                ? 'create-invoice'
                : 'create-bill';
              handleSelectTab(target);
            }}
            onNotify={triggerToast}
          />
        )}
      </main>

      {/* Business Profile Defaults Modal */}
      <BusinessProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={handleSaveProfile}
      />

      {/* Interactive feedback toast */}
      {toastMessage && (
        <aside className="feedback-toast-glass" role="status">
          <span className="toast-dot" />
          <span>{toastMessage}</span>
          <button
            type="button"
            className="toast-close-btn"
            onClick={() => setToastMessage(null)}
            aria-label="Dismiss message"
          >
            Dismiss
          </button>
        </aside>
      )}
    </div>
  );
}
