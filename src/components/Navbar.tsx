import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FileText, Moon, Sun, User, Eye, X, Check, Building2 } from 'lucide-react'
import { getBusinessProfile, saveBusinessProfile, type BusinessProfile } from '../hooks/useDocuments'

// Logo icon
const LogoMark = () => (
  <div className="navbar-logo-icon">
    <FileText size={18} color="#ffffff" strokeWidth={2.5} />
  </div>
)

// Nav links config
const navLinks = [
  { label: 'Home',           path: '/' },
  { label: 'Create Bill',    path: '/create-bill' },
  { label: 'Create Invoice', path: '/create-invoice' },
  { label: 'Templates',      path: '/templates' },
  { label: 'My Documents',   path: '/documents' },
]

const Navbar = () => {
  const location = useLocation()

  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('billease_theme') as 'light' | 'dark') || 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('billease_theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  // Profile modal state
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [profile, setProfile] = useState<BusinessProfile>(() => getBusinessProfile())
  const [savedSuccess, setSavedSuccess] = useState(false)

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    saveBusinessProfile(profile)
    setSavedSuccess(true)
    setTimeout(() => {
      setSavedSuccess(false)
      setIsProfileOpen(false)
    }, 1200)
  }

  return (
    <>
      <nav className="navbar" role="navigation" aria-label="Main navigation">
        {/* Logo */}
        <Link to="/" className="navbar-logo" aria-label="BillEase home" style={{ textDecoration: 'none' }}>
          <LogoMark />
          <span className="navbar-logo-text">
            Bill<span>Ease</span>
          </span>
        </Link>

        {/* Nav links */}
        <ul className="navbar-links" role="list">
          {navLinks.map(({ label, path }) => {
            const isActive = location.pathname === path
            return (
              <li key={path}>
                <Link
                  to={path}
                  className={`navbar-link ${isActive ? 'active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                  style={{ textDecoration: 'none' }}
                >
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Action buttons */}
        <div className="navbar-actions">
          <Link to="/preview" style={{ textDecoration: 'none' }}>
            <button className="icon-btn" id="preview-btn" aria-label="Preview Documents" title="Preview & Download">
              <Eye size={17} strokeWidth={2} />
            </button>
          </Link>
          <button
            className="icon-btn"
            id="theme-toggle-btn"
            aria-label="Toggle theme"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            onClick={toggleTheme}
          >
            {theme === 'dark' ? <Sun size={17} strokeWidth={2} color="#FBBF24" /> : <Moon size={17} strokeWidth={2} />}
          </button>
          <button
            className="icon-btn"
            id="profile-btn"
            aria-label="Business Profile Settings"
            title="Business Profile Settings"
            onClick={() => setIsProfileOpen(true)}
          >
            <User size={17} strokeWidth={2} />
          </button>
        </div>
      </nav>

      {/* Business Profile Modal */}
      {isProfileOpen && (
        <div
          onClick={() => setIsProfileOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: '480px', background: '#FFFFFF',
              borderRadius: '20px', padding: '2rem',
              boxShadow: '0 20px 60px rgba(0,0,0,0.25)', border: '1px solid rgba(0,0,0,0.08)',
              position: 'relative', color: '#111827',
            }}
          >
            <button
              onClick={() => setIsProfileOpen(false)}
              style={{
                position: 'absolute', top: '16px', right: '16px',
                background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: '50%',
                width: '32px', height: '32px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer', color: '#6B7280'
              }}
              title="Close"
            >
              <X size={16} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(91,158,134,0.15)', color: '#4E8F75', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#111827' }}>Business Profile Defaults</h3>
                <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: '2px 0 0' }}>Auto-fills when creating new bills and invoices</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>Business / Company Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={e => setProfile({ ...profile, name: e.target.value })}
                  placeholder="e.g. Apex Corporate Solutions"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #E5E7EB', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={e => setProfile({ ...profile, email: e.target.value })}
                    placeholder="billing@company.com"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #E5E7EB', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>Phone</label>
                  <input
                    type="text"
                    value={profile.phone}
                    onChange={e => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #E5E7EB', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>Business Address</label>
                <textarea
                  rows={2}
                  value={profile.address}
                  onChange={e => setProfile({ ...profile, address: e.target.value })}
                  placeholder="101 Cyber Towers, Mumbai 400051"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #E5E7EB', fontSize: '0.85rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>GST / PAN Number</label>
                  <input
                    type="text"
                    value={profile.gstNumber || ''}
                    onChange={e => setProfile({ ...profile, gstNumber: e.target.value })}
                    placeholder="27AAAAA0000A1Z5"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #E5E7EB', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>Bank / UPI ID</label>
                  <input
                    type="text"
                    value={profile.bankDetails || ''}
                    onChange={e => setProfile({ ...profile, bankDetails: e.target.value })}
                    placeholder="UPI: company@upi"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #E5E7EB', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(false)}
                  style={{ padding: '9px 16px', borderRadius: '10px', border: '1.5px solid #E5E7EB', background: '#fff', color: '#4B5563', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '9px 18px', borderRadius: '10px', border: 'none',
                    background: savedSuccess ? '#10B981' : 'linear-gradient(135deg, #5B9E86, #7BBFA5)',
                    color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(91,158,134,0.3)', transition: 'all 0.2s'
                  }}
                >
                  {savedSuccess ? <><Check size={15} /> Saved!</> : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar
