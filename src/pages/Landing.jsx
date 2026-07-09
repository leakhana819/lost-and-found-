// pages/Landing.jsx — CampusConnect
import { Link } from 'react-router-dom';
import { FiArrowRight, FiSearch, FiPlus, FiBell, FiMapPin } from 'react-icons/fi';
import './Landing.css';

const FEATURES = [
  {
    icon: '🔍',
    title: 'Smart Search',
    desc: 'Find lost items quickly with powerful keyword search, category filters, and location-based browsing.',
    bg: 'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.15))',
  },
  {
    icon: '📢',
    title: 'Easy Reporting',
    desc: 'Post lost or found items in under 60 seconds. Add photos, description, location and contact details.',
    bg: 'linear-gradient(135deg,rgba(6,182,212,0.15),rgba(99,102,241,0.15))',
  },
  {
    icon: '🔔',
    title: 'Instant Alerts',
    desc: 'Receive real-time notifications when someone claims your item or a match is found.',
    bg: 'linear-gradient(135deg,rgba(16,185,129,0.15),rgba(6,182,212,0.15))',
  },
  {
    icon: '🤝',
    title: 'Claim System',
    desc: 'Securely send claim requests to item reporters. Items are marked resolved once returned.',
    bg: 'linear-gradient(135deg,rgba(245,158,11,0.15),rgba(239,68,68,0.15))',
  },
  {
    icon: '🏫',
    title: 'Campus-Wide',
    desc: 'Covers all campus zones — library, labs, cafeteria, hostels, sports ground and more.',
    bg: 'linear-gradient(135deg,rgba(139,92,246,0.15),rgba(236,72,153,0.15))',
  },
  {
    icon: '🔒',
    title: 'Secure & Private',
    desc: 'Your contact details stay hidden. Only verified campus members can post and claim items.',
    bg: 'linear-gradient(135deg,rgba(20,184,166,0.15),rgba(99,102,241,0.15))',
  },
];

const STEPS = [
  { n: '01', title: 'Create Account', desc: 'Sign up with your college email in seconds.' },
  { n: '02', title: 'Post Your Item', desc: 'Report lost or found items with details & photo.' },
  { n: '03', title: 'Search & Browse', desc: 'Find your item using search, filters, and location.' },
  { n: '04', title: 'Connect & Resolve', desc: 'Send a claim request and get your item back!' },
];

export default function Landing() {
  return (
    <div className="landing">
      {/* ─── HERO ─── */}
      <section className="hero">
        <div className="hero-bg-blobs">
          <div className="hero-blob blob-1" />
          <div className="hero-blob blob-2" />
          <div className="hero-blob blob-3" />
          <div className="hero-grid" />
        </div>

        <div className="container hero-content">
          {/* Left: Text */}
          <div className="hero-text">
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              Smart Lost &amp; Found for Your Campus
            </div>

            <h1 className="hero-title">
              Never Lose <br />
              <span className="hero-title-gradient">Track of Things</span>{' '}
              Again
            </h1>

            <p className="hero-desc">
              CampusConnect is the modern Lost & Found portal built for college students.
              Post, search, and claim items — all in one place, all on your campus.
            </p>

            <div className="hero-cta">
              <Link to="/signup" className="btn btn-primary btn-hero">
                Get Started Free <FiArrowRight />
              </Link>
              <Link to="/browse" className="btn-hero-outline btn">
                <FiSearch size={16} /> Browse Items
              </Link>
            </div>

            <div className="hero-stats">
              <div className="hero-stat">
                <div className="hero-stat-num">500+</div>
                <div className="hero-stat-label">Items Posted</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-num">350+</div>
                <div className="hero-stat-label">Returned</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-num">1200+</div>
                <div className="hero-stat-label">Students</div>
              </div>
            </div>
          </div>

          {/* Right: Card Stack Visual */}
          <div className="hero-visual">
            <div className="hero-card-stack">
              <div className="hero-card hero-card-back2">
                <div className="hero-card-thumb" style={{ background: 'linear-gradient(135deg,#10b981,#06b6d4)' }}>
                  📚
                </div>
                <div className="hero-card-type" style={{ background: 'rgba(16,185,129,0.8)' }}>✅ Found</div>
                <div className="hero-card-title">Data Structures Book</div>
              </div>

              <div className="hero-card hero-card-back1">
                <div className="hero-card-thumb" style={{ background: 'linear-gradient(135deg,#f59e0b,#ef4444)' }}>
                  🔑
                </div>
                <div className="hero-card-type">🔍 Lost</div>
                <div className="hero-card-title">Set of Keys</div>
              </div>

              <div className="hero-card hero-card-main animate-float">
                <div className="hero-card-thumb">📱</div>
                <div className="hero-card-type">🔍 Lost</div>
                <div className="hero-card-title">Apple AirPods Pro</div>
                <div className="hero-card-loc">
                  <FiMapPin size={11} /> Library — 2 days ago
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="features">
        <div className="container">
          <div className="section-header animate-fadeInUp">
            <div className="tag">Why CampusConnect</div>
            <h2>Everything You Need</h2>
            <p>A complete solution designed for campus life — fast, simple, and effective.</p>
          </div>

          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="feature-card animate-fadeInUp"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="feature-icon" style={{ background: f.bg }}>
                  {f.icon}
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header animate-fadeInUp">
            <div className="tag">Simple Process</div>
            <h2>How It Works</h2>
            <p>From signup to item recovery in just 4 simple steps.</p>
          </div>

          <div className="steps-grid">
            {STEPS.map((s, i) => (
              <div
                key={s.n}
                className="step-card animate-fadeInUp"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className="step-number">{s.n}</div>
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="cta-section">
        <div className="hero-bg-blobs">
          <div className="hero-blob blob-1" />
          <div className="hero-blob blob-2" />
        </div>
        <div className="container cta-content">
          <h2 className="cta-title">
            Lost Something? <br /> We'll Help You Find It.
          </h2>
          <p className="cta-desc">
            Join thousands of students already using CampusConnect to recover their lost items.
          </p>
          <div className="cta-btns">
            <Link to="/signup" className="btn btn-primary btn-hero">
              <FiPlus /> Report Lost Item
            </Link>
            <Link to="/browse" className="btn-hero-outline btn">
              <FiSearch /> Search Found Items
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
