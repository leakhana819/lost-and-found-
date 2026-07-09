// pages/Dashboard.jsx — CampusConnect
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FiSearch, FiPlusCircle, FiMapPin, FiClock,
  FiTrendingUp, FiAlertCircle, FiCheckCircle, FiStar,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import { useItems } from '../context/ItemContext.jsx';
import ItemCard from '../components/ItemCard.jsx';
import { getInitials, formatRelativeTime, getCategoryInfo } from '../utils/helpers.js';
import './Dashboard.css';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { items } = useItems();

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
    { label: 'Active Lost', value: stats.lost,     icon: <FiAlertCircle />, color: 'var(--danger)',  bg: 'rgba(239,68,68,0.1)', to: '/browse', state: { type: 'lost', hideResolved: true } },
    { label: 'Active Found', value: stats.found,   icon: <FiCheckCircle />, color: 'var(--success)', bg: 'rgba(16,185,129,0.1)', to: '/browse', state: { type: 'found', hideResolved: true } },
    { label: 'Resolved',    value: stats.resolved, icon: <FiStar />,        color: 'var(--primary)', bg: 'rgba(99,102,241,0.1)', to: '/browse', state: { resolved: true } },
    { label: 'My Posts',    value: stats.mine,     icon: <FiTrendingUp />,  color: 'var(--warning)', bg: 'rgba(245,158,11,0.1)', to: '/my-posts', state: null },
  ];

  const QUICK_ACTIONS = [
    { to: '/report?type=lost',  icon: '🔍', label: 'Report Lost Item',  desc: 'Describe your lost item',    color: 'var(--danger)' },
    { to: '/report?type=found', icon: '✅', label: 'Report Found Item', desc: 'Help someone recover it',    color: 'var(--success)' },
    { to: '/browse',            icon: '🗂️', label: 'Browse All Items',  desc: 'Search & filter all posts',  color: 'var(--primary)' },
    { to: '/my-posts',          icon: '📌', label: 'My Posts',          desc: 'Manage your reports',        color: 'var(--secondary)' },
  ];

  return (
    <div className="page-wrapper dashboard-page">
      <div className="container">
        {/* ─── WELCOME HEADER ─── */}
        <div className="dashboard-header animate-fadeInDown">
          <div className="dashboard-greeting">
            <div className="avatar avatar-lg greeting-avatar">
              {getInitials(currentUser?.name)}
            </div>
            <div>
              <h1 className="greeting-title">
                Good {getGreeting()}, {currentUser?.name?.split(' ')[0]}! 👋
              </h1>
              <p className="greeting-sub">
                {currentUser?.department} · {currentUser?.year}
              </p>
            </div>
          </div>
          <div className="dashboard-header-actions">
            <Link to="/browse" className="btn btn-secondary">
              <FiSearch /> Search Items
            </Link>
            <Link to="/report" className="btn btn-primary">
              <FiPlusCircle /> Report Item
            </Link>
          </div>
        </div>

        {/* ─── STATS ─── */}
        <div className="stats-grid animate-fadeInUp">
          {STAT_CARDS.map((s, i) => (
            <Link
              key={s.label}
              to={s.to}
              state={s.state}
              className="stat-card"
              style={{ animationDelay: `${i * 0.08}s`, textDecoration: 'none' }}
            >
              <div className="stat-icon" style={{ background: s.bg, color: s.color }}>
                {s.icon}
              </div>
              <div className="stat-info">
                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
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
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="qa-icon" style={{ background: `${a.color}18` }}>{a.icon}</div>
                <div className="qa-text">
                  <span className="qa-label">{a.label}</span>
                  <span className="qa-desc">{a.desc}</span>
                </div>
                <span className="qa-arrow">→</span>
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

          {/* Sidebar */}
          <aside className="dashboard-sidebar">
            {/* My Activity */}
            <div className="card sidebar-card">
              <h3 className="sidebar-title">📌 My Recent Posts</h3>
              {myRecentItems.length === 0 ? (
                <div className="sidebar-empty">
                  <p>You haven't posted anything yet.</p>
                  <Link to="/report" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>
                    Post Your First Item
                  </Link>
                </div>
              ) : (
                <div className="activity-list">
                  {myRecentItems.map(item => {
                    const cat = getCategoryInfo(item.category);
                    return (
                      <Link key={item.id} to={`/item/${item.id}`} className="activity-item">
                        <div className="activity-icon" style={{ background: `${cat.color}18` }}>
                          {cat.icon}
                        </div>
                        <div className="activity-text">
                          <span className="activity-title">{item.title}</span>
                          <span className="activity-meta">
                            <span className={`badge badge-${item.type}`}>{item.type}</span>
                            &nbsp;·&nbsp;{formatRelativeTime(item.createdAt)}
                          </span>
                        </div>
                        {item.resolved && <span style={{ color: 'var(--success)', fontSize: 12, fontWeight: 700 }}>✓</span>}
                      </Link>
                    );
                  })}
                  <Link to="/my-posts" className="btn btn-secondary btn-sm" style={{ marginTop: 8, width: '100%', justifyContent: 'center' }}>
                    View all my posts
                  </Link>
                </div>
              )}
            </div>

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
