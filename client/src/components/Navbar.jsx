import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import { 
  Leaf, Sun, Moon, Wallet, User as UserIcon, LogOut, LogIn, Menu, X,
  Home as HomeIcon, Info, Layers, ShoppingBag, Sprout, Trophy,
  Landmark, TrendingUp, Headphones, FileQuestion, Mail
} from 'lucide-react';

export default function Navbar({ onOpenWallet, currentTab, onChangeTab }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, language, changeLanguage, t } = useThemeLanguage();

  const [activeSection, setActiveSection] = useState('hero');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 9 Navigation Items (Auth portals removed from Header Navbar)
  const navItems = [
    { id: 'hero', label: 'Home', icon: HomeIcon, targetId: 'hero' },
    { id: 'about-us', label: 'About Us', icon: Info, targetId: 'about-us' },
    { id: 'how-it-works', label: 'How It Works', icon: Layers, targetId: 'how-it-works' },
    { id: 'leaderboard', label: 'Farmer Leaderboard', icon: Trophy, targetId: 'leaderboard' },
    { id: 'gov-schemes', label: 'Government Schemes', icon: Landmark, targetId: 'gov-schemes' },
    { id: 'market-prices', label: 'Market Prices', icon: TrendingUp, targetId: 'market-prices' },
    { id: 'help-support', label: 'Help & Support', icon: Headphones, targetId: 'help-support' },
    { id: 'faqs', label: 'FAQs', icon: FileQuestion, targetId: 'faqs' },
    { id: 'contact-us', label: 'Contact Us', icon: Mail, targetId: 'contact-us' }
  ];

  // Active section scrollspy listener for Home page
  useEffect(() => {
    if (currentTab !== 'home') return;

    const handleScroll = () => {
      const scrollPos = window.scrollY + 150;
      for (let i = navItems.length - 1; i >= 0; i--) {
        const targetId = navItems[i].targetId || navItems[i].id;
        const el = document.getElementById(targetId);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(navItems[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentTab]);

  // Click handler to smooth scroll to section
  const handleNavClick = (item) => {
    setMobileMenuOpen(false);
    
    if (currentTab !== 'home') {
      onChangeTab('home');
      setTimeout(() => scrollToTarget(item), 100);
    } else {
      scrollToTarget(item);
    }
  };

  const scrollToTarget = (item) => {
    setActiveSection(item.id);
    const targetId = item.targetId || item.id;
    
    // Dispatch custom role event if portal tab requested
    if (item.role) {
      window.dispatchEvent(new CustomEvent('sam-switch-auth-role', { detail: { role: item.role } }));
    }

    const element = document.getElementById(targetId);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <header style={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 110 }}>
      <nav className="navbar-container" style={styles.navbar}>
        {/* Brand Logo */}
        <div 
          style={styles.brand} 
          onClick={() => { onChangeTab('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          title="Smart Agriculture Marketplace - Return to Home"
        >
          <img 
            src="/logo.jpg" 
            alt="Smart Agriculture Marketplace Logo" 
            style={styles.brandLogo} 
          />
        </div>

        {/* Horizontal Navigation Menu (Only on Home tab or full view) */}
        {currentTab === 'home' && (
          <div style={styles.horizontalNavWrapper} className="header-horizontal-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  style={{
                    ...styles.navPill,
                    backgroundColor: isActive ? 'var(--forest-green)' : 'transparent',
                    color: isActive ? '#ffffff' : 'var(--text-primary)',
                    fontWeight: isActive ? '700' : '500',
                    boxShadow: isActive ? '0 2px 8px rgba(16, 185, 129, 0.3)' : 'none'
                  }}
                  className="header-nav-pill"
                >
                  <Icon size={14} style={{ color: isActive ? '#ffffff' : 'var(--forest-green)', flexShrink: 0 }} />
                  <span style={styles.pillText}>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Right Controls */}
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
            <option value="hi">ಹಿನ್ದೀ (Hindi)</option>
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

          {/* Mobile Hamburger Menu Button */}
          {currentTab === 'home' && (
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              style={styles.mobileHamburgerBtn}
              aria-label="Toggle Navigation"
              className="mobile-hamburger-btn"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Collapsible Navigation Dropdown Drawer */}
      {currentTab === 'home' && mobileMenuOpen && (
        <div style={styles.mobileDropdown} className="mobile-dropdown-drawer fade-in">
          <div style={styles.mobileGrid}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  style={{
                    ...styles.mobileNavPill,
                    backgroundColor: isActive ? 'var(--forest-green)' : 'var(--bg-secondary)',
                    color: isActive ? '#ffffff' : 'var(--text-primary)',
                    fontWeight: isActive ? '700' : '500'
                  }}
                >
                  <Icon size={15} style={{ color: isActive ? '#ffffff' : 'var(--forest-green)' }} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}

const styles = {
  navbar: {
    width: '100%',
    height: '70px',
    backgroundColor: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    backdropFilter: 'blur(12px)',
    transition: 'background-color 0.3s'
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    padding: '2px 0'
  },
  brandLogo: {
    height: '52px',
    width: 'auto',
    maxHeight: '100%',
    objectFit: 'contain',
    borderRadius: '6px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  },
  horizontalNavWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    overflowX: 'auto',
    padding: '4px',
    maxWidth: 'calc(100vw - 420px)',
    scrollbarWidth: 'none'
  },
  navPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '20px',
    border: 'none',
    fontSize: '12px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s ease'
  },
  pillText: {
    fontSize: '12px'
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexShrink: 0
  },
  select: {
    padding: '6px 8px',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  iconButton: {
    padding: '7px',
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
    gap: '5px',
    padding: '6px 10px',
    borderRadius: '20px',
    border: '1px solid #10b981',
    background: 'rgba(16, 185, 129, 0.08)',
    color: 'var(--emerald)',
    fontWeight: '600',
    fontSize: '12px',
    cursor: 'pointer'
  },
  profileArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    paddingLeft: '8px',
    borderLeft: '1px solid var(--border-color)'
  },
  avatar: {
    width: '30px',
    height: '30px',
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
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    lineHeight: '1.2'
  },
  userRole: {
    fontSize: '10px',
    color: 'var(--text-secondary)'
  },
  logoutBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    padding: '4px'
  },
  loginBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 14px',
    borderRadius: '20px',
    backgroundColor: 'var(--forest-green)',
    color: 'white',
    border: 'none',
    fontWeight: '600',
    fontSize: '12px',
    cursor: 'pointer'
  },
  mobileHamburgerBtn: {
    display: 'none',
    background: 'none',
    border: 'none',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    padding: '6px'
  },
  mobileDropdown: {
    width: '100%',
    backgroundColor: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border-color)',
    padding: '12px 16px',
    boxShadow: 'var(--shadow-lg)'
  },
  mobileGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '8px'
  },
  mobileNavPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    fontSize: '12px',
    cursor: 'pointer',
    textAlign: 'left'
  }
};
