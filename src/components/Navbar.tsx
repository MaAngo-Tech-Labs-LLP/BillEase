import { FileText, Moon, User } from 'lucide-react'

// Simple inline SVG icon for the logo mark
const LogoMark = () => (
  <div className="navbar-logo-icon">
    <FileText size={18} color="#ffffff" strokeWidth={2.5} />
  </div>
)

const Navbar = () => {
  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      {/* Logo */}
      <div className="navbar-logo" role="button" tabIndex={0} aria-label="BillEase home">
        <LogoMark />
        <span className="navbar-logo-text">
          Bill<span>Ease</span>
        </span>
      </div>

      {/* Nav links */}
      <ul className="navbar-links" role="list">
        <li>
          <span className="navbar-link active" role="button" tabIndex={0} aria-current="page">
            Home
          </span>
        </li>
        <li>
          <span className="navbar-link" role="button" tabIndex={0}>
            My Documents
          </span>
        </li>
        <li>
          <span className="navbar-link" role="button" tabIndex={0}>
            Templates
          </span>
        </li>
      </ul>

      {/* Action buttons */}
      <div className="navbar-actions">
        <button
          className="icon-btn"
          id="theme-toggle-btn"
          aria-label="Toggle theme"
          title="Toggle theme"
        >
          <Moon size={17} strokeWidth={2} />
        </button>
        <button
          className="icon-btn"
          id="profile-btn"
          aria-label="Profile"
          title="Profile"
        >
          <User size={17} strokeWidth={2} />
        </button>
      </div>
    </nav>
  )
}

export default Navbar
