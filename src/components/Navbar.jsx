// components/Navbar.jsx — CampusConnect
import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  FiSun, FiMoon, FiBell, FiMenu, FiX, FiUser,
  FiLogOut, FiPlusCircle, FiGrid, FiFileText,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { getNotifications } from '../utils/localStorage.js';
import { getInitials } from '../utils/helpers.js';

export default function Navbar() {
  const { currentUser, logout, isLoggedIn } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropOpen, setUserDropOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const dropRef = useRef(null);

  // Scroll detection
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Notification badge
  useEffect(() => {
    if (!currentUser) return;
    const refresh = () => {
      const all = getNotifications();
      setUnreadCount(all.filter(n => n.toUser === currentUser.id && !n.read).length);
    };
    refresh();
    const timer = setInterval(refresh, 5000);
    return () => clearInterval(timer);
  }, [currentUser]);

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
    navigate('/');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: <FiGrid size={15} /> },
    { to: '/browse',    label: 'Browse Items', icon: <FiFileText size={15} /> },
    { to: '/report',    label: 'Report Item', icon: <FiPlusCircle size={15} /> },
    { to: '/my-posts',  label: 'My Posts', icon: <FiUser size={15} /> },
  ];

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-inner container">
        {/* Logo */}
        <Link to={isLoggedIn ? '/dashboard' : '/'} className="navbar-logo">
          <div className="logo-icon">
            <span>C</span>
          </div>
          <div className="logo-text">
            <span className="logo-name">CampusConnect</span>
            <span className="logo-sub">Lost & Found</span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div className="navbar-links" style={{ display: 'flex', gap: '10px' }}>
          {navLinks.filter(l => isLoggedIn || l.to !== '/my-posts').map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => `btn btn-secondary btn-sm ${isActive ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {l.icon}
              {l.label}
            </NavLink>
          ))}
        </div>

        {/* Right actions */}
        <div className="navbar-actions">
          {/* Theme toggle */}
          <button
            className="btn btn-ghost btn-icon nav-icon-btn"
            onClick={toggleTheme}
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>

          {isLoggedIn ? (
            <>
              {/* Notifications */}
              <Link
                to="/notifications"
                className="btn btn-ghost btn-icon nav-icon-btn notif-btn"
                aria-label="Notifications"
              >
                <FiBell size={18} />
                {unreadCount > 0 && (
                  <span className="notif-badge animate-bounceIn">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* User Avatar / Dropdown */}
              <div className="user-drop-wrap" ref={dropRef}>
                <button
                  className="user-avatar-btn"
                  onClick={() => setUserDropOpen(prev => !prev)}
                  aria-expanded={userDropOpen}
                  aria-label="User menu"
                >
                  <div className="avatar avatar-sm">
                    {getInitials(currentUser?.name)}
                  </div>
                  <span className="user-name-short">{currentUser?.name?.split(' ')[0]}</span>
                </button>

                {userDropOpen && (
                  <div className="user-dropdown animate-fadeInDown">
                    <div className="drop-header">
                      <div className="avatar">{getInitials(currentUser?.name)}</div>
                      <div>
                        <p className="drop-name">{currentUser?.name}</p>
                        <p className="drop-email">{currentUser?.email}</p>
                      </div>
                    </div>
                    <div className="drop-divider" />
                    <Link to="/profile" className="drop-item" onClick={() => setUserDropOpen(false)}>
                      <FiUser size={15} /> Profile
                    </Link>
                    <Link to="/notifications" className="drop-item" onClick={() => setUserDropOpen(false)}>
                      <FiBell size={15} /> Notifications
                      {unreadCount > 0 && <span className="drop-badge">{unreadCount}</span>}
                    </Link>
                    <div className="drop-divider" />
                    <button className="drop-item drop-logout" onClick={handleLogout}>
                      <FiLogOut size={15} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="auth-btns">
              <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="btn btn-ghost btn-icon hamburger"
            onClick={() => setMenuOpen(prev => !prev)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu animate-fadeInDown">
          {navLinks.filter(l => isLoggedIn || l.to !== '/my-posts').map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {l.icon} {l.label}
            </NavLink>
          ))}
          
          {isLoggedIn ? (
            <>
              <div className="mobile-menu-divider" />
              <NavLink to="/profile" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
                <FiUser size={15} /> Profile
              </NavLink>
              <button className="mobile-nav-link mobile-logout" onClick={() => { handleLogout(); setMenuOpen(false); }}>
                <FiLogOut size={15} /> Sign Out
              </button>
            </>
          ) : (
            <>
              <div className="mobile-menu-divider" />
              <NavLink to="/login" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
                Login
              </NavLink>
              <NavLink to="/signup" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
                Sign Up
              </NavLink>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
