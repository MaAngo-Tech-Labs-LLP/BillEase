import React from 'react';
import { HelpCircle, Shield, FileCheck, Mail } from 'lucide-react';

interface FooterProps {
  onOpenHelp: () => void;
  onNotify: (msg: string) => void;
}

export default function Footer({ onOpenHelp, onNotify }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="app-footer-inner">
        <span className="app-footer-copyright">
          &copy; {year} BillEase. All rights reserved.
        </span>

        <nav className="app-footer-links" aria-label="Footer">
          <button type="button" className="app-footer-link-btn" onClick={onOpenHelp}>
            <HelpCircle size={14} />
            <span>Help</span>
          </button>
          <button
            type="button"
            className="app-footer-link-btn"
            onClick={() => onNotify('Privacy Policy: your bills & invoices are stored only on this device.')}
          >
            <Shield size={14} />
            <span>Privacy</span>
          </button>
          <button
            type="button"
            className="app-footer-link-btn"
            onClick={() => onNotify('Terms of Use: BillEase is provided as-is for creating your own documents.')}
          >
            <FileCheck size={14} />
            <span>Terms</span>
          </button>
          <a
            className="app-footer-link-btn"
            href="mailto:support@billease.app"
          >
            <Mail size={14} />
            <span>Contact</span>
          </a>
        </nav>
      </div>
    </footer>
  );
}
