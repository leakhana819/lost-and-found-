// pages/Dashboard.jsx — CampusConnect
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiPlusCircle,
  FiTrendingUp, FiAlertCircle, FiCheckCircle, FiStar,
  FiSearch, FiSliders, FiMapPin, FiEye, FiBookmark,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import { useItems } from '../context/ItemContext.jsx';
import ItemCard from '../components/ItemCard.jsx';
import { formatRelativeTime, getCategoryInfo } from '../utils/helpers.js';
import './Dashboard.css';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { items } = useItems();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    navigate('/browse', { state: { query: searchQuery } });
  };

  const handleFilterClick = () => {
    navigate('/browse', { state: { query: searchQuery } });
  };

  const stats = useMemo(() => {
    const lost     = items.filter(i => i.type === 'lost' && !i.resolved);
    const found    = items.filter(i => i.type === 'found' && !i.resolved);
    const resolved = items.filter(i => i.resolved);
    const mine     = items.filter(i => i.reportedBy === currentUser?.id);
    return { lost: lost.length, found: found.length, resolved: resolved.length, mine: mine.length };
  }, [items, currentUser]);

  const recentItems = useMemo(() =>
    items.slice(0, 8),
  [items]);

  const myRecentItems = useMemo(() =>
    items.filter(i => i.reportedBy === currentUser?.id).slice(0, 4),
  [items, currentUser]);

  const STAT_CARDS = [
    { label: 'Lost Items',  value: stats.lost,     icon: <FiAlertCircle />, to: '/browse',    state: { type: 'lost', hideResolved: true }, accent: '#E8604C' },
    { label: 'Found Items', value: stats.found,    icon: <FiCheckCircle />, to: '/browse',    state: { type: 'found', hideResolved: true }, accent: '#2E9B6E' },
    { label: 'Resolved',    value: stats.resolved, icon: <FiStar />,        to: '/browse',    state: { resolved: true },                   accent: '#7C6EE6' },
    { label: 'My Reports',  value: stats.mine,     icon: <FiTrendingUp />,  to: '/my-posts',  state: null,                                 accent: '#3A8FC7' },
  ];

  const QUICK_ACTIONS = [
    { to: '/report?type=lost',  icon: <FiAlertCircle />, label: 'Report Lost',   accent: '#E8604C' },
    { to: '/report?type=found', icon: <FiCheckCircle />, label: 'Report Found',  accent: '#2E9B6E' },
    { to: '/browse',            icon: <FiEye />,         label: 'Browse Items',  accent: '#3A8FC7' },
    { to: '/my-posts',          icon: <FiBookmark />,    label: 'My Posts',      accent: '#7C6EE6' },
  ];

  return (
    <div className="page-wrapper dashboard-page">
      <div className="container">
        {/* ─── HERO ─── */}
        <div className="dashboard-hero animate-fadeInDown">
          <p className="hero-greeting">Good {getGreeting()}, {currentUser?.name?.split(' ')[0]} 👋</p>
          <h1 className="hero-title">Welcome back.</h1>
          <p className="hero-sub">Manage all lost and found activities from one place.</p>
          <div className="hero-actions">
            <Link to="/report" className="btn btn-primary hero-cta">
              <FiPlusCircle size={16} /> Report Item
            </Link>
          </div>
        </div>

        {/* ─── SEARCH BAR ─── */}
        <div className="dashboard-search-wrap animate-fadeInDown">
          <form className="dashboard-search-form" onSubmit={handleSearch}>
            <div className="dashboard-search-bar">
              <FiSearch className="ds-search-icon" size={20} />
              <input
                type="search"
                className="ds-search-input"
                placeholder="Search lost or found items..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                aria-label="Search items"
              />
              <button
                type="button"
                className="ds-filter-btn"
                onClick={handleFilterClick}
                aria-label="Open filters"
                title="Filter items"
              >
                <FiSliders size={18} />
              </button>
            </div>
          </form>
        </div>

        {/* ─── STATS ─── */}
        <div className="stats-grid animate-fadeInUp">
          {STAT_CARDS.map((s, i) => (
            <Link
              key={s.label}
              to={s.to}
              state={s.state}
              className="stat-card"
              style={{ animationDelay: `${i * 0.08}s`, textDecoration: 'none', '--card-accent': s.accent }}
            >
              <div className="stat-icon">
                {s.icon}
              </div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </Link>
          ))}
        </div>

        {/* ─── QUICK ACTIONS ─── */}
        <section className="dashboard-section animate-fadeInUp">
          <div className="section-label">⚡ Quick Actions</div>
          <div className="quick-actions-grid">
            {QUICK_ACTIONS.map((a, i) => (
              <Link
                key={a.to}
                to={a.to}
                className="quick-action-card"
                style={{ animationDelay: `${i * 0.08}s`, '--qa-accent': a.accent }}
              >
                <div className="qa-icon">{a.icon}</div>
                <span className="qa-label">{a.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ─── MAIN CONTENT ─── */}
        <div className="dashboard-main">
          {/* Recent Items */}
          <section className="dashboard-section">
            <div className="section-row">
              <div className="section-label">🕐 Recent Items</div>
              <Link to="/browse" className="btn btn-ghost btn-sm">View all →</Link>
            </div>
            <div className="dashboard-items-grid">
              {recentItems.map(item => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </section>

          {/* My Recent Posts (Moved here) */}
          <section className="dashboard-section">
            <div className="section-row">
              <div className="section-label">📌 My Recent Posts</div>
              <Link to="/my-posts" className="btn btn-ghost btn-sm">Manage →</Link>
            </div>
            
            {myRecentItems.length === 0 ? (
              <div className="empty-compact">You haven't posted anything yet. <Link to="/report">Post now</Link></div>
            ) : (
              <div className="compact-activity-list">
                {myRecentItems.map(item => (
                  <Link key={item.id} to={`/item/${item.id}`} className="compact-activity-item">
                    <span className="ca-title">{item.title}</span>
                    <div className="ca-right">
                      <span className={`ca-status ca-${item.type}`}>{item.type}</span>
                      <span className="ca-time">{formatRelativeTime(item.createdAt)}</span>
                      {item.resolved ? (
                        <span className="ca-icon ca-resolved" title="Resolved">✓</span>
                      ) : (
                        <span className="ca-icon ca-pending" title="Active">●</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

        {/* Sidebar */}
        <aside className="dashboard-sidebar">
            {/* Tips */}
            <div className="card sidebar-card tips-card">
              <h3 className="sidebar-title">💡 Tips</h3>
              <ul className="tips-list">
                <li>Add a photo for 3× more responses</li>
                <li>Include location details to narrow results</li>
                <li>Check notifications for claim requests</li>
                <li>Mark items as resolved once found</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}
