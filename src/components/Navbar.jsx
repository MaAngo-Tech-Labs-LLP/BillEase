import React from 'react';
import { Sparkles, Sun, Moon, User, FileSpreadsheet } from 'lucide-react';

/**
 * Navbar Component
 * Floating liquid-glass navigation with brand logo, links, theme switch, and profile button.
 */
export default function Navbar({ currentTab, onSelectTab, isDark, onToggleTheme }) {
  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'documents', label: 'My Documents' },
    { id: 'templates', label: 'Templates' },
  ];

  return (
    <header className="navbar-container">
      <nav className="navbar-glass">
        {/* Brand Logo */}
        <div className="navbar-brand" onClick={() => onSelectTab('home')}>
          <div className="logo-icon-glass">
            <FileSpreadsheet className="logo-icon" size={20} />
            <span className="logo-sparkle"></span>
          </div>
          <div className="brand-text-wrap">
            <span className="brand-name">BillWise</span>
            <span className="brand-badge">PRO</span>
          </div>
        </div>

        {/* Center Nav Links */}
        <ul className="nav-links">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <li key={item.id}>
                <button
                  className={`nav-link-btn ${isActive ? 'active' : ''}`}
                  onClick={() => onSelectTab(item.id)}
                  type="button"
                >
                  {item.label}
                  {isActive && <span className="nav-active-indicator" />}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Right Actions: Theme Toggle & Profile */}
        <div className="navbar-actions">
          <button
            className="glass-action-btn"
            onClick={onToggleTheme}
            aria-label="Toggle Theme"
            title={isDark ? 'Switch to Warm Ivory mode' : 'Switch to Dark Glass mode'}
            type="button"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            className="glass-action-btn profile-btn"
            aria-label="User Profile"
            title="Profile & Settings"
            type="button"
          >
            <div className="avatar-ring">
              <User size={17} />
            </div>
          </button>
        </div>
      </nav>
    </header>
  );
}
