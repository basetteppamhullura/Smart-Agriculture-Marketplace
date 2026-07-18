import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import { Home, LayoutDashboard, MessageSquare, Truck, Landmark, BookOpen, ChevronRight, Award } from 'lucide-react';

export default function Sidebar({ currentTab, onChangeTab }) {
  const { user } = useAuth();
  const { t } = useThemeLanguage();

  const menuItems = [
    { id: 'home', label: t('navHome'), icon: Home },
    { id: 'dashboard', label: t('navDashboard'), icon: LayoutDashboard, requiresAuth: true },
    { id: 'forum', label: t('navForum'), icon: MessageSquare },
    { id: 'logistics', label: t('navLogistics'), icon: Truck },
    { id: 'finance', label: t('navFinance'), icon: Landmark },
    { id: 'infohub', label: t('navInfoHub'), icon: BookOpen }
  ];

  return (
    <aside style={styles.sidebar}>
      {/* Mini Profile Summary */}
      {user && (
        <div style={styles.profileSummary}>
          <div style={styles.headerScore}>
            <span style={styles.scoreNum}>★ {user.role === 'farmer' ? user.smartFarmingScore.overallScore : 'Buyer'}</span>
            {user.hasTrustedBadge && (
              <span className="badge badge-trusted" style={{ fontSize: '9px', padding: '2px 6px' }}>
                <Award size={10} style={{ marginRight: '2px' }} />
                Trusted
              </span>
            )}
          </div>
          <div style={styles.locationSummary}>{user.location}</div>
        </div>
      )}

      {/* Nav Menu */}
      <ul style={styles.menuList}>
        {menuItems.map((item) => {
          if (item.requiresAuth && !user) return null;
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <li key={item.id} style={{ marginBottom: '8px' }}>
              <button
                onClick={() => onChangeTab(item.id)}
                style={{
                  ...styles.menuBtn,
                  backgroundColor: isActive ? 'var(--green-glow)' : 'transparent',
                  color: isActive ? 'var(--forest-green)' : 'var(--text-primary)',
                  fontWeight: isActive ? '700' : '500',
                  borderColor: isActive ? 'rgba(16, 185, 129, 0.15)' : 'transparent'
                }}
              >
                <div style={styles.btnContent}>
                  <Icon size={18} style={{ color: isActive ? 'var(--forest-green)' : 'var(--text-secondary)' }} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight size={14} color="var(--forest-green)" />}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Footer Branding */}
      <div style={styles.footer}>
        <div style={styles.footerText}>SAM v1.0.0</div>
        <div style={styles.footerDot}></div>
        <div style={styles.footerStatus}>AI Fair Trade Active</div>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    position: 'fixed',
    top: '70px',
    left: 0,
    width: '260px',
    height: 'calc(100vh - 70px)',
    backgroundColor: 'var(--bg-secondary)',
    borderRight: '1px solid var(--border-color)',
    padding: '24px 16px',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 90,
    transition: 'background-color 0.3s'
  },
  profileSummary: {
    padding: '16px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--bg-primary)',
    marginBottom: '24px',
    border: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  headerScore: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  scoreNum: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--amber-gold)'
  },
  locationSummary: {
    fontSize: '11px',
    color: 'var(--text-secondary)'
  },
  menuList: {
    listStyleType: 'none',
    flex: 1
  },
  menuBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid transparent',
    fontSize: '14px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s'
  },
  btnContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  footer: {
    marginTop: 'auto',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  footerText: {
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--text-secondary)'
  },
  footerDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: 'var(--emerald)'
  },
  footerStatus: {
    fontSize: '11px',
    color: 'var(--emerald)',
    fontWeight: '600'
  }
};
