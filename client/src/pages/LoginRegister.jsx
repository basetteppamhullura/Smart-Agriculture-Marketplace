import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import { Sprout, LogIn, UserPlus, Info } from 'lucide-react';

export default function LoginRegister({ onAuthSuccess, initialTab = 'login', initialRole = 'buyer' }) {
  const { login, register, error } = useAuth();
  const { t } = useThemeLanguage();

  const [activeTab, setActiveTab] = useState(initialTab); // 'login' | 'register'
  const [role, setRole] = useState(initialRole); // 'farmer' | 'buyer'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('Mandya, Karnataka');
  const [loading, setLoading] = useState(false);

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
    } else {
      success = await register(name, email, password, role, location);
    }

    setLoading(false);
    if (success && onAuthSuccess) {
      onAuthSuccess();
    }
  };

  return (
    <div className="fade-in" style={styles.wrapper}>
      <div className="glass-card" style={styles.card}>
        <div style={styles.logoHeader}>
          <Sprout size={36} color="var(--forest-green)" />
          <h2 style={{ fontSize: '24px', fontFamily: 'var(--header-font)' }}>{t('title')}</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Secure Farmer-Buyer Direct Portal</p>
        </div>

        {/* Tab Headers */}
        <div style={styles.tabs}>
          <button 
            type="button" 
            onClick={() => setActiveTab('login')}
            style={{
              ...styles.tabBtn,
              borderBottom: activeTab === 'login' ? '3px solid var(--forest-green)' : '3px solid transparent',
              color: activeTab === 'login' ? 'var(--text-primary)' : 'var(--text-secondary)'
            }}
          >
            <LogIn size={16} />
            <span>{t('login')}</span>
          </button>
          <button 
            type="button" 
            onClick={() => setActiveTab('register')}
            style={{
              ...styles.tabBtn,
              borderBottom: activeTab === 'register' ? '3px solid var(--forest-green)' : '3px solid transparent',
              color: activeTab === 'register' ? 'var(--text-primary)' : 'var(--text-secondary)'
            }}
          >
            <UserPlus size={16} />
            <span>{t('register')}</span>
          </button>
        </div>

        {/* Info or Auth errors */}
        {error && (
          <div style={styles.errorAlert}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          {activeTab === 'register' && (
            <>
              {/* Role Toggle */}
              <div style={styles.roleSelection}>
                <button
                  type="button"
                  onClick={() => setRole('buyer')}
                  style={{
                    ...styles.roleBtn,
                    backgroundColor: role === 'buyer' ? 'var(--green-glow)' : 'transparent',
                    borderColor: role === 'buyer' ? 'var(--forest-green)' : 'var(--border-color)',
                    color: role === 'buyer' ? 'var(--forest-green)' : 'var(--text-secondary)'
                  }}
                >
                  {t('roleBuyer')}
                </button>
                <button
                  type="button"
                  onClick={() => setRole('farmer')}
                  style={{
                    ...styles.roleBtn,
                    backgroundColor: role === 'farmer' ? 'var(--green-glow)' : 'transparent',
                    borderColor: role === 'farmer' ? 'var(--forest-green)' : 'var(--border-color)',
                    color: role === 'farmer' ? 'var(--forest-green)' : 'var(--text-secondary)'
                  }}
                >
                  {t('roleFarmer')}
                </button>
              </div>

              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Location / District</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Mandya, Karnataka"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="name@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {activeTab === 'register' && role === 'farmer' && (
            <div style={styles.note}>
              <Info size={14} style={{ flexShrink: 0 }} />
              <span>Farmers undergo manual admin verification before crops can be sold. You will start with a default verification check.</span>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ padding: '12px', marginTop: '10px' }} disabled={loading}>
            {loading ? 'Processing...' : activeTab === 'login' ? t('login') : t('register')}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 0',
    width: '100%'
  },
  card: {
    width: '100%',
    maxWidth: '450px',
    boxShadow: 'var(--shadow-lg)'
  },
  logoHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    textAlign: 'center',
    marginBottom: '20px'
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid var(--border-color)',
    marginBottom: '20px'
  },
  tabBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '12px',
    border: 'none',
    background: 'none',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  roleSelection: {
    display: 'flex',
    gap: '12px',
    marginBottom: '5px'
  },
  roleBtn: {
    flex: 1,
    padding: '10px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  errorAlert: {
    padding: '12px',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: 'var(--error)',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: '15px'
  },
  note: {
    display: 'flex',
    gap: '8px',
    padding: '10px 12px',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    border: '1px solid rgba(16, 185, 129, 0.1)',
    borderRadius: '6px',
    color: 'var(--text-secondary)',
    fontSize: '11px',
    lineHeight: '1.4'
  }
};
