import React from 'react';
import { ArrowRight, Receipt, FileText, Zap, ShieldCheck } from 'lucide-react';

/**
 * ActionCards Component
 * Two clickable liquid-glass cards:
 * 1. Create Bill (Mint accent, "Quick & simple")
 * 2. Create Invoice (Lavender accent, "Professional")
 */
export default function ActionCards({ onCardClick }) {
  const cards = [
    {
      id: 'bill',
      type: 'bill',
      subtitle: 'Quick & simple',
      title: 'Create Bill',
      description: 'Create a simple bill for your customer.',
      icon: Receipt,
      featureBadge: '1-minute setup',
      accentColor: 'mint',
    },
    {
      id: 'invoice',
      type: 'invoice',
      subtitle: 'Professional',
      title: 'Create Invoice',
      description: 'Create a detailed invoice with items, tax and payment details.',
      icon: FileText,
      featureBadge: 'Tax & payment terms',
      accentColor: 'lavender',
    },
  ];

  return (
    <section className="action-cards-section" aria-label="Creation Options">
      <div className="action-cards-grid">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              className={`liquid-glass-card card-${card.accentColor}`}
              onClick={() => onCardClick(card)}
              type="button"
              aria-label={`${card.title} - ${card.subtitle}`}
            >
              {/* Inner ambient glow layer for liquid glass refraction */}
              <div className="card-liquid-glow" />

              <div className="card-content">
                {/* Top row: Pill badge & Icon */}
                <div className="card-top-row">
                  <div className={`card-subtitle-badge badge-${card.accentColor}`}>
                    {card.accentColor === 'mint' ? (
                      <Zap size={13} className="badge-icon" />
                    ) : (
                      <ShieldCheck size={13} className="badge-icon" />
                    )}
                    <span>{card.subtitle}</span>
                  </div>

                  <div className={`card-icon-bubble bubble-${card.accentColor}`}>
                    <Icon size={22} />
                  </div>
                </div>

                {/* Card Title & Description */}
                <div className="card-body">
                  <h2 className="card-title">{card.title}</h2>
                  <p className="card-description">{card.description}</p>
                </div>

                {/* Bottom row: Feature tag & Arrow */}
                <div className="card-bottom-row">
                  <span className="card-feature-tag">{card.featureBadge}</span>
                  <div className={`card-arrow-bubble arrow-${card.accentColor}`}>
                    <ArrowRight size={18} className="arrow-icon" />
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
