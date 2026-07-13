// components/Navbar.jsx — CampusConnect
import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  FiSun, FiMoon, FiBell, FiMenu, FiX, FiUser, FiLogOut,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useItems } from '../context/ItemContext.jsx';
import { getInitials } from '../utils/helpers.js';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/browse',    label: 'Browse Items' },
  { to: '/report',    label: 'Report Item' },
  { to: '/my-posts',  label: 'My Posts' },
];

export default function Navbar() {
  const { currentUser, logout, isLoggedIn } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications } = useItems();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen]       = useState(false);
  const [userDropOpen, setUserDropOpen] = useState(false);
  const [scrolled, setScrolled]       = useState(false);
  const dropRef = useRef(null);

  // Scroll shadow
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Notification badge — derived from context (already fetched from Supabase)
  const unreadCount = currentUser
    ? notifications.filter(n => n.toUser === currentUser.id && !n.read).length
    : 0;

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setUserDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    setUserDropOpen(false);
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-inner container">

        {/* ── Logo (left) ── */}
        <Link to={isLoggedIn ? '/dashboard' : '/'} className="navbar-logo">
          <div className="logo-icon">
            <span>C</span>
          </div>
          <div className="logo-text">
            <span className="logo-name">CampusConnect</span>
            <span className="logo-sub">Lost &amp; Found</span>
          </div>
        </Link>

        {/* ── Center Nav Links ── */}
        {isLoggedIn && (
          <div className="navbar-links">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `nav-link${isActive ? ' nav-link-active' : ''}`}
              >
                {label}
              </NavLink>
            ))}
          </div>
        )}

        {/* ── Right Actions ── */}
        <div className="navbar-actions">
          {/* Theme toggle */}
          <button
            className="nb-icon-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <FiSun size={17} /> : <FiMoon size={17} />}
          </button>

          {isLoggedIn ? (
            <>
              {/* Notifications */}
              <Link
                to="/notifications"
                className="nb-icon-btn notif-btn"
                aria-label="Notifications"
              >
                <FiBell size={17} />
                {unreadCount > 0 && (
                  <span className="notif-badge animate-bounceIn">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* Profile dropdown */}
              <div className="user-drop-wrap" ref={dropRef}>
                <button
                  className="user-avatar-btn"
                  onClick={() => setUserDropOpen(prev => !prev)}
                  aria-expanded={userDropOpen}
                  aria-label="User menu"
                >
                  <div className="avatar avatar-sm" style={{ overflow: 'hidden' }}>
                    {currentUser?.profile_photo ? (
                      <img src={currentUser.profile_photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      getInitials(currentUser?.name)
                    )}
                  </div>
                  <span className="user-name-short">{currentUser?.name?.split(' ')[0]}</span>
                  <svg className="chevron-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {userDropOpen && (
                  <div className="user-dropdown animate-fadeInDown">
                    <div className="drop-header">
                      <div className="avatar" style={{ overflow: 'hidden' }}>
                        {currentUser?.profile_photo ? (
                          <img src={currentUser.profile_photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          getInitials(currentUser?.name)
                        )}
                      </div>
                      <div>
                        <p className="drop-name">{currentUser?.name}</p>
                        <p className="drop-email">{currentUser?.email}</p>
                      </div>
                    </div>
                    <div className="drop-divider" />
                    <Link to="/profile" className="drop-item" onClick={() => setUserDropOpen(false)}>
                      <FiUser size={14} /> Profile
                    </Link>
                    <Link to="/notifications" className="drop-item" onClick={() => setUserDropOpen(false)}>
                      <FiBell size={14} /> Notifications
                      {unreadCount > 0 && <span className="drop-badge">{unreadCount}</span>}
                    </Link>
                    <div className="drop-divider" />
                    <button className="drop-item drop-logout" onClick={handleLogout}>
                      <FiLogOut size={14} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="auth-btns">
              <Link to="/login"  className="btn btn-secondary btn-sm">Login</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="hamburger nb-icon-btn"
            onClick={() => setMenuOpen(prev => !prev)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      {menuOpen && (
        <div className="mobile-menu animate-fadeInDown">
          {NAV_LINKS.filter(l => isLoggedIn || (l.to !== '/my-posts' && l.to !== '/report')).map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </NavLink>
          ))}

          {isLoggedIn ? (
            <>
              <div className="mobile-menu-divider" />
              <NavLink to="/profile" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
                <FiUser size={14} /> Profile
              </NavLink>
              <button className="mobile-nav-link mobile-logout" onClick={handleLogout}>
                <FiLogOut size={14} /> Sign Out
              </button>
            </>
          ) : (
            <>
              <div className="mobile-menu-divider" />
              <NavLink to="/login"  className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Login</NavLink>
              <NavLink to="/signup" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Sign Up</NavLink>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
