// pages/ForgotPassword.jsx — CampusConnect
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import './Auth.css';

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleNextStep = (e) => {
    e.preventDefault();
    setServerError('');
    const errs = {};
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email';
    
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    // Move to next step (enter new password)
    setStep(2);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setServerError('');
    const errs = {};
    if (!password) errs.password = 'Password is required';
    else if (password.length < 8) errs.password = 'Minimum 8 characters';
    
    if (!confirmPassword) errs.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';

    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setLoading(true);

    const result = await resetPassword(email, password);
    setLoading(false);

    if (result.success) {
      toast.success('Password reset successfully! You can now login.');
      navigate('/login', { replace: true });
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
          <div className="auth-illustration">🔑</div>
          <h2>Reset Password</h2>
          <p>Create a new password to regain access to your account.</p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-right">
        <div className="auth-form-wrap animate-fadeInUp">
          <div className="auth-form-header">
            <h1>Forgot Password</h1>
            <p>{step === 1 ? 'Enter your email address to reset your password.' : 'Create a new password for your account.'}</p>
          </div>

          {serverError && (
            <div className="auth-error-box" style={{ marginBottom: 20 }}>
              ⚠️ {serverError}
            </div>
          )}

          {step === 1 ? (
            <form className="auth-form" onSubmit={handleNextStep} noValidate>
              {/* Email */}
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="you@campus.edu"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                />
                {errors.email && <span className="form-error">⚠ {errors.email}</span>}
              </div>

              <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                Continue <FiArrowRight style={{ marginLeft: 8 }} />
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleResetPassword} noValidate>
              {/* Email readonly display */}
              <div className="form-group" style={{ opacity: 0.7 }}>
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  disabled
                />
              </div>

              {/* New Password */}
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div className="password-wrap">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    className={`form-input ${errors.password ? 'error' : ''}`}
                    placeholder="Minimum 8 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
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
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
                {errors.confirmPassword && <span className="form-error">⚠ {errors.confirmPassword}</span>}
              </div>

              <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                {loading ? <LoadingSpinner size="sm" /> : (
                  <><FiCheckCircle style={{ marginRight: 8 }} /> Reset Password</>
                )}
              </button>
            </form>
          )}

          <p className="auth-alt" style={{ marginTop: 20 }}>
            Remembered your password? <Link to="/login">Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
