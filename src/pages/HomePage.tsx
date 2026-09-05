import { ArrowRight, Receipt, FileText, Clock, ChevronRight } from 'lucide-react'
import Navbar from '../components/Navbar'

// ---------- Types ----------
interface DocCard {
  id: string
  type: 'bill' | 'invoice'
  title: string
  badge: string
  description: string
  icon: React.ReactNode
}

interface RecentDoc {
  id: string
  type: 'bill' | 'invoice'
  name: string
  customer: string
  date: string
  amount: string
  status: 'draft' | 'paid' | 'pending'
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
  },
  {
    id: 'create-invoice',
    type: 'invoice',
    title: 'Create Invoice',
    badge: 'Professional',
    description: 'Create a detailed invoice with items, tax, and payment details.',
    icon: <FileText size={22} strokeWidth={2} />,
  },
]

const recentDocs: RecentDoc[] = [
  {
    id: 'rec-1',
    type: 'invoice',
    name: 'Invoice #INV-0042',
    customer: 'Arjun Mehta Design Studio',
    date: '2 Sep 2026',
    amount: '₹12,500',
    status: 'paid',
  },
  {
    id: 'rec-2',
    type: 'bill',
    name: 'Bill #BIL-0019',
    customer: 'Priya Retail Co.',
    date: '1 Sep 2026',
    amount: '₹4,800',
    status: 'pending',
  },
  {
    id: 'rec-3',
    type: 'invoice',
    name: 'Invoice #INV-0041',
    customer: 'Nexus Tech Solutions',
    date: '29 Aug 2026',
    amount: '₹28,000',
    status: 'draft',
  },
]

// ---------- Sub-components ----------

/** Single create-document card (Bill / Invoice) */
const DocCard = ({ card }: { card: DocCard }) => (
  <div
    className={`doc-card ${card.type}`}
    id={card.id}
    role="button"
    tabIndex={0}
    aria-label={`${card.title} – ${card.badge}`}
    onKeyDown={(e) => e.key === 'Enter' && console.log(`Navigate to ${card.title}`)}
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
  </div>
)

/** A single row in the "Recently Created" list */
const RecentItem = ({ doc }: { doc: RecentDoc }) => (
  <div
    className="recent-item"
    id={`recent-${doc.id}`}
    role="button"
    tabIndex={0}
    aria-label={`Open ${doc.name}`}
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
  </div>
)

// ---------- Page ----------
const HomePage = () => {
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
              <DocCard key={card.id} card={card} />
            ))}
          </div>
        </section>

        {/* Recently Created */}
        <section aria-labelledby="recent-label">
          <p className="section-label" id="recent-label">
            <Clock size={11} style={{ verticalAlign: 'middle', marginRight: 5 }} aria-hidden="true" />
            Recently Created
          </p>
          <div className="recent-list">
            {recentDocs.map((doc) => (
              <RecentItem key={doc.id} doc={doc} />
            ))}
          </div>
        </section>
      </main>
    </>
  )
}

export default HomePage
