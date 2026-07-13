import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiUser } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import Modal from '../components/Modal.jsx';
import { getUsers, getDeviceSocialAccounts, addDeviceSocialAccount } from '../utils/localStorage.js';
import { getInitials } from '../utils/helpers.js';
import './Auth.css';

const PERKS = [
  { icon: '🔍', text: 'Search through all campus lost & found items' },
  { icon: '📢', text: 'Post lost or found items in 60 seconds' },
  { icon: '🔔', text: 'Get notified when someone finds your item' },
  { icon: '🤝', text: 'Securely claim and return items' },
];

export default function Login() {
  const { login, signup } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  
  // Social Modal State
  const [socialModalOpen, setSocialModalOpen] = useState(false);
  const [socialProvider, setSocialProvider] = useState('');
  const [savedUsers, setSavedUsers] = useState([]);

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    // Simulate async
    await new Promise(r => setTimeout(r, 600));

    const result = login(form.email, form.password);
    setLoading(false);

    if (result.success) {
      toast.success('Welcome back! 🎉');
      navigate(from, { replace: true });
    } else {
      setServerError(result.error);
    }
  };

  const openSocialModal = (provider) => {
    setSocialProvider(provider);
    
    // Get emails that have logged in with this provider on this device
    const deviceEmails = getDeviceSocialAccounts(provider);
    
    // Find the full user objects for these emails
    const allUsers = getUsers();
    const deviceUsers = allUsers.filter(u => deviceEmails.includes(u.email));
    
    setSavedUsers(deviceUsers);
    setSocialModalOpen(true);
  };

  const executeSocialLogin = async (email, name) => {
    setSocialModalOpen(false);
    setServerError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 600)); // Simulate delay
    
    // Try to login first
    let result = login(email, 'social123');
    if (!result.success) {
      // If user doesn't exist, create one via signup
      result = signup({
        name,
        email,
        password: 'social123',
        department: 'General',
        year: 'N/A',
        phone: ''
      });
    }

    setLoading(false);
    if (result.success) {
      addDeviceSocialAccount(socialProvider, email);
      toast.success(`Successfully logged in with ${socialProvider} 🎉`);
      navigate(from, { replace: true });
    } else {
      setServerError(`Failed to login with ${socialProvider}`);
    }
  };

  const handleSocialLoginNewAccount = () => {
    const inputEmail = window.prompt(`${socialProvider} Sign-In\n\nEnter your Email Address:`);
    if (!inputEmail) return;
    const name = window.prompt("Enter your Name:") || inputEmail.split('@')[0];
    executeSocialLogin(inputEmail, name);
  };

  const handleDemoLogin = async () => {
    setForm({ email: 'arjun@campus.edu', password: 'demo123' });
    setServerError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const result = login('arjun@campus.edu', 'demo123');
    setLoading(false);
    if (result.success) {
      toast.success('Logged in as demo user 🎉');
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div className="auth-page">
      {/* Left Panel */}
      <div className="auth-left">
        <div className="auth-left-blob auth-blob-1" />
        <div className="auth-left-blob auth-blob-2" />
        <div className="auth-left-content animate-fadeInUp">
          <div className="auth-left-logo">
            <div className="logo-icon"><span>C</span></div>
            <div className="logo-text">
              <span className="logo-name">CampusConnect</span>
              <span className="logo-sub">Lost & Found</span>
            </div>
          </div>
          <div className="auth-illustration">🔍</div>
          <h2>Welcome Back!</h2>
          <p>Sign in to manage your lost & found items and connect with your campus community.</p>
          <div className="auth-perks">
            {PERKS.map(p => (
              <div key={p.text} className="auth-perk">
                <div className="auth-perk-icon">{p.icon}</div>
                <span>{p.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-right">
        <div className="auth-form-wrap animate-fadeInUp">
          <div className="auth-form-header">
            <h1>Sign In</h1>
            <p>Enter your credentials to access your account.</p>
          </div>

          {serverError && (
            <div className="auth-error-box" style={{ marginBottom: 20 }}>
              ⚠️ {serverError}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="you@campus.edu"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                autoComplete="email"
              />
              {errors.email && <span className="form-error">⚠ {errors.email}</span>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="password-wrap">
                <input
                  type={showPwd ? 'text' : 'password'}
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPwd(p => !p)}
                  aria-label="Toggle password visibility"
                >
                  {showPwd ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                </button>
              </div>
              {errors.password && <span className="form-error">⚠ {errors.password}</span>}
            </div>

            {/* Submit */}
            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? <LoadingSpinner size="sm" /> : (
                <><FiArrowRight /> Sign In</>
              )}
            </button>
          </form>

          <div className="divider-text" style={{ margin: '20px 0' }}>or</div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <button type="button" onClick={() => openSocialModal('Google')} className="btn btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} disabled={loading}>
              <FcGoogle size={20} /> Google
            </button>
            <button type="button" onClick={() => openSocialModal('Facebook')} className="btn btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#1877F2' }} disabled={loading}>
              <FaFacebook size={20} /> Facebook
            </button>
          </div>

          {/* Demo Login */}
          <button className="btn btn-secondary" style={{ width: '100%' }} onClick={handleDemoLogin} disabled={loading}>
            🎭 Try Demo Account
          </button>

          <p className="auth-alt">
            Don't have an account? <Link to="/signup">Create one free →</Link>
          </p>
        </div>
      </div>

      {/* Social Login Account Picker Modal */}
      <Modal isOpen={socialModalOpen} onClose={() => setSocialModalOpen(false)} title={`Sign in with ${socialProvider}`}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h3>Choose an account</h3>
          <p style={{ color: 'var(--text-muted)' }}>to continue to CampusConnect</p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {savedUsers.map(u => (
            <button 
              key={u.id} 
              onClick={() => executeSocialLogin(u.email, u.name)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
                border: '1px solid var(--border)', borderRadius: '8px', background: 'transparent',
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div className="avatar avatar-sm" style={{ overflow: 'hidden' }}>
                {u.profilePhoto ? (
                  <img src={u.profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  getInitials(u.name)
                )}
              </div>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{u.email}</div>
              </div>
            </button>
          ))}
          
          <button 
            onClick={handleSocialLoginNewAccount}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
              border: '1px solid var(--border)', borderRadius: '8px', background: 'transparent',
              cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <div className="avatar avatar-sm" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
              <FiUser size={16} />
            </div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              Use another account
            </div>
          </button>
        </div>
      </Modal>
    </div>
  );
}
