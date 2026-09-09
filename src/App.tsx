import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import CreateBillPage from './pages/CreateBillPage';
import CreateInvoicePage from './pages/CreateInvoicePage';
import MyDocumentsPage from './pages/MyDocumentsPage';
import TemplatesPage from './pages/TemplatesPage';
import PreviewPage from './pages/PreviewPage';
import { useDocuments } from './hooks/useDocuments';
import { BillDocument, TemplateId } from './types';

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
    createNewDraft,
  } = useDocuments();

  // Document selected for dedicated PreviewPage
  const [previewDoc, setPreviewDoc] = useState<BillDocument | null>(null);

  const [lastEditorTab, setLastEditorTab] = useState<'create-bill' | 'create-invoice'>('create-bill');

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

  // Toast feedback trigger
  const triggerToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 3500);
  };

  const handleSelectTab = (tabId: string) => {
    if (tabId === 'create-bill' || tabId === 'create-invoice') {
      setLastEditorTab(tabId);
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
            onSave={saveDocument}
            onNavigate={handleSelectTab}
            onNotify={triggerToast}
          />
        )}

        {currentTab === 'create-invoice' && (
          <CreateInvoicePage
            initialDocument={draft.type === 'invoice' ? draft : undefined}
            onSave={saveDocument}
            onNavigate={handleSelectTab}
            onNotify={triggerToast}
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
            onDeleteDocument={(id) => {
              deleteDocument(id);
              triggerToast('Document deleted.');
            }}
            onNavigate={handleSelectTab}
          />
        )}

        {currentTab === 'preview' && (
          <PreviewPage
            document={previewDoc || draft}
            onBack={() => handleSelectTab(previewDoc?.type === 'invoice' ? 'create-invoice' : 'create-bill')}
            onNotify={triggerToast}
          />
        )}
      </main>

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
