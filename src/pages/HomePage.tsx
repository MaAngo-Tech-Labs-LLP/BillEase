import { Link } from 'react-router-dom'
import { ArrowRight, Receipt, FileText, Clock, ChevronRight } from 'lucide-react'
import Navbar from '../components/Navbar'
import { useDocuments, formatAmount, formatDisplayDate } from '../hooks/useDocuments'
import type { DocStatus } from '../types/document'

// ---------- Types ----------
interface DocCard {
  id: string
  type: 'bill' | 'invoice'
  title: string
  badge: string
  description: string
  icon: React.ReactNode
  route: string
}

interface RecentDocItem {
  id: string
  type: 'bill' | 'invoice'
  name: string
  customer: string
  date: string
  amount: string
  status: DocStatus
}

// ---------- Data ----------
const docCards: DocCard[] = [
  {
    id: 'create-bill',
    type: 'bill',
    title: 'Create Bill',
    badge: 'Quick & Simple',
    description: 'Create a simple bill for your customer in just a few clicks.',
    icon: <Receipt size={22} strokeWidth={2} />,
    route: '/create-bill',
  },
  {
    id: 'create-invoice',
    type: 'invoice',
    title: 'Create Invoice',
    badge: 'Professional',
    description: 'Create a detailed invoice with items, tax, and payment details.',
    icon: <FileText size={22} strokeWidth={2} />,
    route: '/create-invoice',
  },
]



// ---------- Sub-components ----------

/** Single create-document card (Bill / Invoice) wired to React Router */
const DocCardComponent = ({ card }: { card: DocCard }) => (
  <Link
    to={card.route}
    className={`doc-card ${card.type}`}
    id={card.id}
    aria-label={`${card.title} – ${card.badge}`}
    style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
  >
    {/* Top row: icon + arrow */}
    <div className="doc-card-header">
      <div className="doc-card-icon" aria-hidden="true">
        {card.icon}
      </div>
      <div className="doc-card-arrow" aria-hidden="true">
        <ArrowRight size={15} strokeWidth={2.5} />
      </div>
    </div>

    {/* Badge */}
    <span className="doc-card-badge">{card.badge}</span>

    {/* Title + description */}
    <h2 className="doc-card-title">{card.title}</h2>
    <p className="doc-card-desc">{card.description}</p>
  </Link>
)

/** A single row in the "Recently Created" list */
const RecentItemComponent = ({ doc }: { doc: RecentDocItem }) => (
  <Link
    to={`/preview?id=${doc.id}`}
    className="recent-item"
    id={`recent-${doc.id}`}
    aria-label={`Open ${doc.name}`}
    style={{ textDecoration: 'none', color: 'inherit' }}
  >
    {/* Type icon */}
    <div className={`recent-icon ${doc.type}`} aria-hidden="true">
      {doc.type === 'bill'
        ? <Receipt size={17} strokeWidth={2} />
        : <FileText size={17} strokeWidth={2} />}
    </div>

    {/* Info */}
    <div className="recent-info">
      <div className="recent-name">{doc.name}</div>
      <div className="recent-meta">{doc.customer} · {doc.date}</div>
    </div>

    {/* Amount */}
    <div className="recent-amount">{doc.amount}</div>

    {/* Status badge */}
    <span className={`recent-status ${doc.status}`}>
      {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
    </span>

    {/* Chevron */}
    <ChevronRight size={15} strokeWidth={2} color="var(--charcoal-soft)" aria-hidden="true" />
  </Link>
)

// ---------- Page ----------
const HomePage = () => {
  const { documents } = useDocuments()

  // Display only real saved documents created by the user
  const displayDocs: RecentDocItem[] = documents.slice(0, 5).map(d => ({
    id: d.id,
    type: d.type,
    name: `${d.type === 'bill' ? 'Bill' : 'Invoice'} #${d.invoiceNumber || d.id}`,
    customer: d.billTo?.name || 'Walk-in Customer',
    date: d.date || formatDisplayDate(d.createdAt),
    amount: formatAmount(d.total),
    status: d.status,
  }))

  return (
    <>
      <Navbar />

      <main className="main">
        {/* Hero */}
        <section className="hero" aria-labelledby="hero-title">
          <h1 className="hero-title" id="hero-title">
            What will you create?
          </h1>
          <p className="hero-subtitle">
            Create professional documents in a few simple steps.
          </p>
        </section>

        {/* Create document cards */}
        <section aria-label="Document types">
          <div className="doc-cards">
            {docCards.map((card) => (
              <DocCardComponent key={card.id} card={card} />
            ))}
          </div>
        </section>

        {/* Recently Created */}
        <section aria-labelledby="recent-label">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <p className="section-label" id="recent-label" style={{ margin: 0 }}>
              <Clock size={11} style={{ verticalAlign: 'middle', marginRight: 5 }} aria-hidden="true" />
              Recently Created
            </p>
            {documents.length > 0 && (
              <Link
                to="/documents"
                style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--charcoal-soft)', textDecoration: 'none' }}
              >
                View all ({documents.length}) &rarr;
              </Link>
            )}
          </div>

          {documents.length === 0 ? (
            <div style={{
              padding: '2.5rem 1.5rem', textAlign: 'center',
              background: 'rgba(255,255,255,0.45)', borderRadius: '16px',
              border: '1.5px dashed rgba(0,0,0,0.1)', backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: 'rgba(91,158,134,0.15)', color: '#5B9E86',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 0.75rem',
              }}>
                <FileText size={20} />
              </div>
              <p style={{ margin: '0 0 0.35rem', fontWeight: 700, fontSize: '0.9rem', color: 'var(--charcoal)' }}>
                No documents created yet
              </p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--charcoal-soft)' }}>
                Your recent bills and invoices will appear here once created.
              </p>
            </div>
          ) : (
            <div className="recent-list">
              {displayDocs.map((doc) => (
                <RecentItemComponent key={doc.id} doc={doc} />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  )
}

export default HomePage

