import React from 'react';
import { Sun, Moon, User, FileText, Eye } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tabId: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenProfile?: () => void;
}

export default function Navbar({
  currentTab,
  onSelectTab,
  isDark,
  onToggleTheme,
  onOpenProfile,
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'create-bill', label: 'Create Bill' },
    { id: 'create-invoice', label: 'Create Invoice' },
    { id: 'templates', label: 'Templates' },
    { id: 'my-documents', label: 'My Documents' },
  ];

  return (
    <header className={`navbar-container ${isScrolled ? 'is-scrolled' : ''}`}>
      <nav className="navbar-glass">
        {/* Brand Logo matching screenshot */}
        <div
          className="navbar-brand"
          onClick={() => onSelectTab('home')}
          style={{ cursor: 'pointer' }}
        >
          <div className="navbar-brand-icon-box">
            <FileText size={18} className="navbar-brand-icon" />
          </div>
          <span className="brand-name">BillEase</span>
        </div>

        {/* Center Nav Links */}
        <ul className="nav-links">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <li key={item.id}>
                <button
                  className={`nav-link-btn ${item.id} ${isActive ? 'active' : ''}`}
                  onClick={() => onSelectTab(item.id)}
                  type="button"
                >
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Right Actions: Eye, Theme Toggle & Profile */}
        <div className="navbar-actions">
          <button
            className="glass-action-btn"
            onClick={() => onSelectTab('preview')}
            aria-label="Preview Document"
            title="Preview Active Document"
            type="button"
          >
            <Eye size={17} />
          </button>

          <button
            className="glass-action-btn"
            onClick={onToggleTheme}
            aria-label="Toggle Theme"
            title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
            type="button"
          >
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          <button
            className="glass-action-btn profile-btn"
            onClick={onOpenProfile}
            aria-label="User Profile & Settings"
            title="Profile & Settings"
            type="button"
          >
            <div className="avatar-ring">
              <User size={16} />
            </div>
          </button>
        </div>
      </nav>
    </header>
  );
}
