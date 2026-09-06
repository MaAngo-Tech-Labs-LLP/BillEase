import { Link, useLocation } from 'react-router-dom'
import { FileText, Moon, User, Eye } from 'lucide-react'

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

  return (
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
        <button className="icon-btn" id="theme-toggle-btn" aria-label="Toggle theme" title="Toggle theme">
          <Moon size={17} strokeWidth={2} />
        </button>
        <button className="icon-btn" id="profile-btn" aria-label="Profile" title="Profile">
          <User size={17} strokeWidth={2} />
        </button>
      </div>
    </nav>
  )
}

export default Navbar
