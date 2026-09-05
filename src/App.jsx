import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ActionCards from './components/ActionCards';
import RecentDocuments from './components/RecentDocuments';
import './App.css';

/**
 * BillWise Home Application
 * Minimal liquid-glass document generator UI.
 */
export default function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [isDark, setIsDark] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Sync theme attribute on document body
  useEffect(() => {
    if (isDark) {
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.body.removeAttribute('data-theme');
    }
  }, [isDark]);

  // Show a gentle liquid feedback toast when interacting
  const triggerToast = (message) => {
    setToastMessage(message);
    // Auto-clear after 3.5 seconds
    setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 3500);
  };

  const handleCardClick = (card) => {
    triggerToast(`${card.title} selected! Form builder will be added next.`);
  };

  const handleSelectDocument = (doc) => {
    triggerToast(`Viewing document: ${doc.code} (${doc.client})`);
  };

  const handleSelectTab = (tabId) => {
    setCurrentTab(tabId);
    if (tabId !== 'home') {
      triggerToast(`Navigating to ${tabId === 'documents' ? 'My Documents' : 'Templates'} (Coming soon)`);
    }
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

      {/* Main Content Area */}
      <main className="main-content">
        {/* Main Heading & Subtitle */}
        <HeroSection />

        {/* Two Clickable Action Cards: Create Bill & Create Invoice */}
        <ActionCards onCardClick={handleCardClick} />

        {/* Recently Created Section with Sample Documents */}
        <RecentDocuments onSelectDocument={handleSelectDocument} />
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
