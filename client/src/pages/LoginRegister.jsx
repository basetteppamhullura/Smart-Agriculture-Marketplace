import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import { Sprout, LogIn, UserPlus, KeyRound, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function LoginRegister({ onAuthSuccess, initialTab = 'login', initialRole = 'buyer', lockRole = false, cardStyle = {} }) {
  const { login, register, error, apiUrl } = useAuth();
  const { t } = useThemeLanguage();

  const [activeTab, setActiveTab] = useState(initialTab); // 'login' | 'register' | 'forgot'
  const [role, setRole] = useState(initialRole); // 'farmer' | 'buyer'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('Mandya, Karnataka');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  // Forgot Password Flow States
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [receivedOtp, setReceivedOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotMsg, setForgotMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
    if (initialRole) setRole(initialRole);
  }, [initialTab, initialRole]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let success = false;
    if (activeTab === 'login') {
      success = await login(email, password);
    } else if (activeTab === 'register') {
      success = await register(name, email, password, role, location);
    }

    setLoading(false);
    if (success && onAuthSuccess) {
      onAuthSuccess();
    }
  };

  // Forgot Password Handlers
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      setForgotMsg({ type: 'error', text: 'Please enter your registered email address.' });
      return;
    }
    setLoading(true);
    setForgotMsg({ type: '', text: '' });

    try {
      const res = await fetch(`${apiUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setReceivedOtp(data.otp);
        setForgotStep(2);
        setForgotMsg({ type: 'success', text: `OTP sent! (Dev Verification Code: ${data.otp})` });
      } else {
        setForgotMsg({ type: 'error', text: data.message || 'Failed to request OTP' });
      }
    } catch (err) {
      setForgotMsg({ type: 'error', text: 'Network connection failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode) {
      setForgotMsg({ type: 'error', text: 'Please enter the 6-digit OTP code.' });
      return;
    }
    setLoading(true);
    setForgotMsg({ type: '', text: '' });

    try {
      const res = await fetch(`${apiUrl}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, otp: otpCode })
      });
      const data = await res.json();
      if (res.ok) {
        setForgotStep(3);
        setForgotMsg({ type: 'success', text: 'OTP verified! Enter your new password below.' });
      } else {
        setForgotMsg({ type: 'error', text: data.message || 'Invalid OTP code' });
      }
    } catch (err) {
      setForgotMsg({ type: 'error', text: 'Network connection error' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setForgotMsg({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    setLoading(true);
    setForgotMsg({ type: '', text: '' });

    try {
      const res = await fetch(`${apiUrl}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, otp: otpCode, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setForgotMsg({ type: 'success', text: 'Password reset successfully! Redirecting to login...' });
        setTimeout(() => {
          setActiveTab('login');
          setEmail(forgotEmail);
          setForgotStep(1);
          setForgotMsg({ type: '', text: '' });
        }, 1500);
      } else {
        setForgotMsg({ type: 'error', text: data.message || 'Failed to reset password' });
      }
    } catch (err) {
      setForgotMsg({ type: 'error', text: 'Network error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={styles.wrapper}>
      <div className="glass-card" style={{ ...styles.card, ...cardStyle }}>
        {/* Gateway Role Selector Banner (Top Level Tabs: Buyer | Farmer) */}
        {!lockRole && (
          <div style={{ ...styles.gatewayBanner, borderBottom: `2px solid ${role === 'farmer' ? 'var(--amber-gold)' : 'var(--forest-green)'}` }}>
            <button
              type="button"
              onClick={() => setRole('buyer')}
              style={{
                ...styles.gatewayRoleBtn,
                backgroundColor: role === 'buyer' ? 'var(--forest-green)' : 'transparent',
                color: role === 'buyer' ? 'white' : 'var(--text-secondary)'
              }}
            >
              Buyer Tab
            </button>
            <button
              type="button"
              onClick={() => setRole('farmer')}
              style={{
                ...styles.gatewayRoleBtn,
                backgroundColor: role === 'farmer' ? 'var(--amber-gold)' : 'transparent',
                color: role === 'farmer' ? 'white' : 'var(--text-secondary)'
              }}
            >
              Farmer Tab
            </button>
          </div>
        )}

        <div style={styles.logoHeader}>
          <Sprout size={36} color={role === 'farmer' ? 'var(--amber-gold)' : 'var(--forest-green)'} />
          <h2 style={{ fontSize: '22px', margin: '8px 0 2px 0', fontFamily: 'var(--header-font)' }}>
            {role === 'buyer' ? 'Buyer Authentication Portal' : 'Farmer Authentication Portal'}
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
            {role === 'buyer' ? 'Log in to explore fresh crops and place auction bids' : 'Log in to manage crop listings, inventory, and digital wallet earnings'}
          </p>
        </div>

        {/* Tab Switchers */}
        <div style={styles.tabs}>
          <button 
            type="button" 
            onClick={() => { setActiveTab('login'); setForgotMsg({ type: '', text: '' }); }}
            style={{
              ...styles.tabBtn,
              borderBottom: activeTab === 'login' ? `3px solid ${role === 'farmer' ? 'var(--amber-gold)' : 'var(--forest-green)'}` : '3px solid transparent',
              color: activeTab === 'login' ? 'var(--text-primary)' : 'var(--text-secondary)'
            }}
          >
            <LogIn size={14} />
            <span>Login</span>
          </button>
          <button 
            type="button" 
            onClick={() => { setActiveTab('register'); setForgotMsg({ type: '', text: '' }); }}
            style={{
              ...styles.tabBtn,
              borderBottom: activeTab === 'register' ? `3px solid ${role === 'farmer' ? 'var(--amber-gold)' : 'var(--forest-green)'}` : '3px solid transparent',
              color: activeTab === 'register' ? 'var(--text-primary)' : 'var(--text-secondary)'
            }}
          >
            <UserPlus size={14} />
            <span>Register</span>
          </button>
          <button 
            type="button" 
            onClick={() => { setActiveTab('forgot'); setForgotStep(1); setForgotMsg({ type: '', text: '' }); }}
            style={{
              ...styles.tabBtn,
              borderBottom: activeTab === 'forgot' ? `3px solid ${role === 'farmer' ? 'var(--amber-gold)' : 'var(--forest-green)'}` : '3px solid transparent',
              color: activeTab === 'forgot' ? 'var(--text-primary)' : 'var(--text-secondary)'
            }}
          >
            <KeyRound size={14} />
            <span>Forgot Password</span>
          </button>
        </div>

        {error && activeTab !== 'forgot' && (
          <div style={styles.errorAlert}>{error}</div>
        )}

        {forgotMsg.text && (
          <div style={forgotMsg.type === 'error' ? styles.errorAlert : styles.successAlert}>
            {forgotMsg.text}
          </div>
        )}

        {/* LOGIN FORM */}
        {activeTab === 'login' && (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                required
                className="form-input"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                required
                className="form-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div style={styles.optionsRow}>
              <label style={styles.rememberMeLabel}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: 'var(--forest-green)' }}
                />
                <span>Remember Me</span>
              </label>
              <button
                type="button"
                onClick={() => { setActiveTab('forgot'); setForgotStep(1); setForgotEmail(email); }}
                style={styles.forgotLinkBtn}
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`btn ${role === 'farmer' ? 'btn-3d-gold' : 'btn-3d-primary'}`}
              style={styles.submitBtn}
            >
              {loading ? 'Authenticating...' : `Log In as ${role === 'buyer' ? 'Buyer' : 'Farmer'}`}
            </button>
          </form>
        )}

        {/* REGISTER FORM */}
        {activeTab === 'register' && (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Enter full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                required
                className="form-input"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                required
                className="form-input"
                placeholder="Create password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Location / Region</label>
              <input
                type="text"
                className="form-input"
                placeholder="District, State (e.g. Mandya, Karnataka)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`btn ${role === 'farmer' ? 'btn-3d-gold' : 'btn-3d-primary'}`}
              style={styles.submitBtn}
            >
              {loading ? 'Creating Account...' : `Register as ${role === 'buyer' ? 'Buyer' : 'Farmer'}`}
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD FORM (3-STEP OTP WORKFLOW) */}
        {activeTab === 'forgot' && (
          <div style={styles.form}>
            {/* Step Indicators */}
            <div style={styles.stepIndicatorRow}>
              <span style={{ ...styles.stepPill, opacity: forgotStep === 1 ? 1 : 0.6 }}>1. Verification</span>
              <span style={{ ...styles.stepPill, opacity: forgotStep === 2 ? 1 : 0.6 }}>2. Enter OTP</span>
              <span style={{ ...styles.stepPill, opacity: forgotStep === 3 ? 1 : 0.6 }}>3. Reset Password</span>
            </div>

            {forgotStep === 1 && (
              <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Registered Email Address</label>
                  <input
                    type="email"
                    required
                    className="form-input"
                    placeholder="Enter registered email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                  />
                </div>
                <button type="submit" disabled={loading} className="btn btn-3d-primary" style={styles.submitBtn}>
                  {loading ? 'Sending Verification Code...' : 'Send Verification OTP'}
                </button>
              </form>
            )}

            {forgotStep === 2 && (
              <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>6-Digit OTP Code</label>
                  <input
                    type="text"
                    required
                    maxLength="6"
                    className="form-input"
                    placeholder="Enter 6-digit OTP"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}
                  />
                </div>
                <button type="submit" disabled={loading} className="btn btn-3d-primary" style={styles.submitBtn}>
                  {loading ? 'Verifying OTP...' : 'Verify OTP Code'}
                </button>
              </form>
            )}

            {forgotStep === 3 && (
              <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>New Password</label>
                  <input
                    type="password"
                    required
                    minLength="6"
                    className="form-input"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Confirm New Password</label>
                  <input
                    type="password"
                    required
                    minLength="6"
                    className="form-input"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <button type="submit" disabled={loading} className="btn btn-3d-primary" style={styles.submitBtn}>
                  {loading ? 'Resetting Password...' : 'Save & Set New Password'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '70vh',
    padding: '20px'
  },
  card: {
    width: '100%',
    maxWidth: '440px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    textAlign: 'left'
  },
  gatewayBanner: {
    display: 'flex',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-secondary)',
    padding: '4px',
    gap: '4px'
  },
  gatewayRoleBtn: {
    flex: 1,
    padding: '8px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  logoHeader: {
    textAlign: 'center',
    marginBottom: '4px'
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid var(--border-color)',
    gap: '10px'
  },
  tabBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '10px 0',
    background: 'none',
    border: 'none',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-secondary)'
  },
  optionsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12px'
  },
  rememberMeLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: 'var(--text-secondary)',
    cursor: 'pointer'
  },
  forgotLinkBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--forest-green)',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    padding: 0
  },
  submitBtn: {
    width: '100%',
    padding: '12px',
    marginTop: '6px'
  },
  errorAlert: {
    padding: '10px',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    borderRadius: '6px',
    fontSize: '12px'
  },
  successAlert: {
    padding: '10px',
    backgroundColor: '#d1fae5',
    color: '#065f46',
    borderRadius: '6px',
    fontSize: '12px'
  },
  stepIndicatorRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
    gap: '4px'
  },
  stepPill: {
    fontSize: '10px',
    fontWeight: '700',
    padding: '4px 8px',
    borderRadius: '12px',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-secondary)'
  }
};
