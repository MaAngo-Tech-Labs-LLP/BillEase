import React from 'react';
import { Sparkles } from 'lucide-react';

/**
 * HeroSection Component
 * Elegant, minimalist introductory section with gentle liquid-glass pill and typography.
 */
export default function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-badge">
        <Sparkles size={14} className="hero-badge-icon" />
        <span>Document Studio</span>
      </div>

      <h1 className="hero-title">
        What will you <span className="hero-title-gradient">create?</span>
      </h1>

      <p className="hero-subtitle">
        Create professional documents in a few simple steps.
      </p>
    </section>
  );
}
