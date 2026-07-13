// pages/Signup.jsx — CampusConnect
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff, FiArrowRight, FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

import { DEPARTMENTS } from '../utils/helpers.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import './Auth.css';

const PERKS = [
  { icon: '🎓', text: 'Exclusively for campus students' },
  { icon: '🚀', text: 'Set up your account in under 2 minutes' },
  { icon: '🔒', text: 'Your data stays private and secure' },
  { icon: '💡', text: 'Get smart item match suggestions' },
];

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'PG 1st Year', 'PG 2nd Year'];

export default function Signup() {
  const { signup } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    department: '', year: '', phone: '',
  });
  const [errors, setErrors] = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Minimum 6 characters';
    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!form.department) e.department = 'Please select your department';
    if (!form.year) e.year = 'Please select your year';
    if (form.phone.trim() && !/^\d{10}$/.test(form.phone.trim())) e.phone = 'Phone must be exactly 10 digits';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    const result = await signup({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      department: form.department,
      year: form.year,
      phone: form.phone.trim(),
    });

    setLoading(false);

    if (result.success) {
      // Send welcome notification — can't use context result directly since user is just created
      // We'll trigger from AuthContext's user id which is now set in LS
      toast.success('Account created! Welcome to CampusConnect 🎉');
      navigate('/dashboard', { replace: true });
    } else {
      setServerError(result.error);
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
          <div className="auth-illustration">🎓</div>
          <h2>Join Your Campus</h2>
          <p>Create a free account and start finding lost items or helping others today.</p>
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
            <h1>Create Account</h1>
            <p>Fill in the details below to join CampusConnect.</p>
          </div>

          {serverError && (
            <div className="auth-error-box" style={{ marginBottom: 20 }}>
              ⚠️ {serverError}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {/* Full name */}
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="e.g. Arjun Sharma"
                value={form.name}
                onChange={set('name')}
                autoComplete="name"
              />
              {errors.name && <span className="form-error">⚠ {errors.name}</span>}
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="you@campus.edu"
                value={form.email}
                onChange={set('email')}
                autoComplete="email"
              />
              {errors.email && <span className="form-error">⚠ {errors.email}</span>}
            </div>

            {/* Department & Year */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Department</label>
                <select
                  className={`form-input form-select ${errors.department ? 'error' : ''}`}
                  value={form.department}
                  onChange={set('department')}
                >
                  <option value="">Select dept.</option>
                  {DEPARTMENTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                {errors.department && <span className="form-error">⚠ {errors.department}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Year</label>
                <select
                  className={`form-input form-select ${errors.year ? 'error' : ''}`}
                  value={form.year}
                  onChange={set('year')}
                >
                  <option value="">Select year</option>
                  {YEARS.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                {errors.year && <span className="form-error">⚠ {errors.year}</span>}
              </div>
            </div>

            {/* Phone (optional) */}
            <div className="form-group">
              <label className="form-label">Phone Number <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
              <input
                type="tel"
                className="form-input"
                placeholder="e.g. 9876543210"
                value={form.phone}
                onChange={set('phone')}
                autoComplete="tel"
              />
              {errors.phone && <span className="form-error">⚠ {errors.phone}</span>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="password-wrap">
                <input
                  type={showPwd ? 'text' : 'password'}
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="Minimum 6 characters"
                  value={form.password}
                  onChange={set('password')}
                  autoComplete="new-password"
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

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={set('confirmPassword')}
                autoComplete="new-password"
              />
              {errors.confirmPassword && <span className="form-error">⚠ {errors.confirmPassword}</span>}
            </div>

            {/* Submit */}
            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? <LoadingSpinner size="sm" /> : (
                <><FiUser /> Create Account</>
              )}
            </button>
          </form>

          <p className="auth-alt" style={{ marginTop: 20 }}>
            Already have an account? <Link to="/login">Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
