import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import { Leaf, Sun, Moon, Wallet, User as UserIcon, LogOut, LogIn } from 'lucide-react';

export default function Navbar({ onOpenWallet, currentTab, onChangeTab }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, language, changeLanguage, t } = useThemeLanguage();

  return (
    <nav className="navbar-container" style={styles.navbar}>
      <div style={styles.brand} onClick={() => onChangeTab('home')}>
        <Leaf size={28} color="#10b981" />
        <span style={styles.brandName}>{t('title')}</span>
      </div>

      <div style={styles.controls}>
        {/* Language Selection */}
        <select 
          value={language} 
          onChange={(e) => changeLanguage(e.target.value)} 
          style={styles.select}
          className="lang-selector"
        >
          <option value="en">English</option>
          <option value="kn">ಕನ್ನಡ (Kannada)</option>
          <option value="hi">हिन्दी (Hindi)</option>
          <option value="te">తెలుగు (Telugu)</option>
          <option value="ta">தமிழ் (Tamil)</option>
        </select>

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme} 
          style={styles.iconButton}
          className="theme-toggle"
          title="Toggle Theme"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Wallet Connection */}
        {user && (
          <button onClick={onOpenWallet} style={styles.walletBtn}>
            <Wallet size={16} />
            <span>Rs {user.walletBalance.toLocaleString()}</span>
          </button>
        )}

        {/* Auth profile or Logins */}
        {user ? (
          <div style={styles.profileArea}>
            <div style={styles.avatar}>
              <UserIcon size={14} color="#115e3b" />
            </div>
            <div style={styles.userInfo}>
              <div style={styles.userName}>{user.name}</div>
              <div style={styles.userRole}>
                {user.role === 'farmer' ? t('roleFarmer') : user.role === 'buyer' ? t('roleBuyer') : t('roleAdmin')}
              </div>
            </div>
            <button onClick={logout} style={styles.logoutBtn} title="Log Out">
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button onClick={() => onChangeTab('login')} style={styles.loginBtn}>
            <LogIn size={16} />
            <span>{t('login')}</span>
          </button>
        )}
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '70px',
    backgroundColor: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 30px',
    zIndex: 100,
    backdropFilter: 'blur(12px)',
    transition: 'background-color 0.3s'
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer'
  },
  brandName: {
    fontSize: '20px',
    fontFamily: 'var(--header-font)',
    fontWeight: '700',
    background: 'linear-gradient(135deg, var(--forest-green), var(--emerald))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  select: {
    padding: '6px 10px',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  iconButton: {
    padding: '8px',
    borderRadius: '50px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  walletBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    borderRadius: '20px',
    border: '1px solid #10b981',
    background: 'rgba(16, 185, 129, 0.08)',
    color: 'var(--emerald)',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'transform 0.2s'
  },
  profileArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    paddingLeft: '10px',
    borderLeft: '1px solid var(--border-color)'
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50px',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column'
  },
  userName: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    lineHeight: '1.2'
  },
  userRole: {
    fontSize: '11px',
    color: 'var(--text-secondary)'
  },
  logoutBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    padding: '4px',
    marginLeft: '5px',
    transition: 'color 0.2s'
  },
  loginBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '20px',
    backgroundColor: 'var(--forest-green)',
    color: 'white',
    border: 'none',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer'
  }
};
