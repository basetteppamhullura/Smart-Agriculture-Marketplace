import React from 'react';
import LoginRegister from './LoginRegister';
import { Sprout, LayoutGrid, Image, Sparkles, TrendingUp, Gavel, Landmark, BarChart3, Wallet, Award, Brain, CloudRain, ShieldCheck, Truck, Lock } from 'lucide-react';

export default function FarmerAuthPage({ onChangeTab, onAuthSuccess }) {
  const features = [
    { title: 'Farmer Registration & Login', desc: 'Secure verification portal to access listing dashboards.', icon: Sprout },
    { title: 'Add & Manage Products', desc: 'Easily list active crop inventories, set minimum prices, and edit details.', icon: LayoutGrid },
    { title: 'Upload Product Images', desc: 'Attach high-quality photos of harvested products to attract buyers.', icon: Image },
    { title: 'AI Price Recommendations', desc: 'Evaluate recommended pricing based on grade, volume, and mandi trends.', icon: Sparkles },
    { title: 'Crop Price Prediction', desc: 'Analyze 6-month projected price trends using seasonal history data.', icon: TrendingUp },
    { title: 'Manage Auctions & Bids', desc: 'Set starting bids, set timers, and accept bids from retailers.', icon: Gavel },
    { title: 'Track Orders & Payments', desc: 'Accept direct orders, track earnings, and see pending log requests.', icon: Landmark },
    { title: 'Sales Analytics Dashboard', desc: 'Check profit summaries, revenue, and historic transaction grids.', icon: BarChart3 },
    { title: 'Digital Wallet', desc: 'Receive instant payments, manage bank payouts, and verify transaction states.', icon: Wallet },
    { title: 'Reputation Badge Score', desc: 'Accumulate high buyer review scores to unlock Trusted badges.', icon: Award },
    { title: 'Plant Disease Detection', desc: 'Scan leaf photos to diagnose crop diseases and read treatment guides.', icon: Brain },
    { title: 'Weather Farming Suggestions', desc: 'Receive smart recommendations based on soil types and rainfall indices.', icon: CloudRain },
    { title: 'Inventory Management', desc: 'Keep stock counts up to date and toggle listing status.', icon: ShieldCheck },
    { title: 'Transportation & Logistics', desc: 'Choose between farm-pickup and direct delivery shipping.', icon: Truck }
  ];

  return (
    <div className="fade-in" style={styles.container}>
      {/* Header */}
      <div className="glass-card" style={styles.header}>
        <h2 style={{ fontSize: '24px', margin: 0, fontFamily: 'var(--header-font)', color: 'var(--amber-gold)' }}>
          Farmer Authentication Gateway
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '6px 0 0 0' }}>
          Please log in or register below to publish listings, consult AI price models, and check digital wallet earnings.
        </p>
      </div>

      <div style={styles.contentLayout}>
        {/* Left Column: Feature Highlights */}
        <div style={styles.leftCol}>
          <h3 style={{ fontSize: '18px', margin: '0 0 16px 0', fontFamily: 'var(--header-font)' }}>Farmer Platform Capabilities</h3>
          <div style={styles.grid}>
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="glass-card feature-3d-card" style={styles.card}>
                  <div style={styles.iconBox}>
                    <Icon size={16} color="var(--amber-gold)" />
                  </div>
                  <div>
                    <h4 style={styles.cardTitle}>{feat.title}</h4>
                    <p style={styles.cardDesc}>{feat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Farmer Authentication Form (Login | Register | Forgot Password) */}
        <div style={styles.rightCol}>
          <div style={styles.lockNotice}>
            <Lock size={16} color="var(--amber-gold)" />
            <span>Listing management is exclusive to logged-in farmers.</span>
          </div>
          <LoginRegister 
            initialTab="login" 
            initialRole="farmer" 
            onAuthSuccess={() => {
              if (onAuthSuccess) onAuthSuccess();
              else onChangeTab('dashboard');
            }} 
          />
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    paddingBottom: '50px',
    textAlign: 'left'
  },
  header: {
    padding: '24px'
  },
  contentLayout: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '30px',
    alignItems: 'start'
  },
  leftCol: {
    display: 'flex',
    flexDirection: 'column'
  },
  rightCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  lockNotice: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    backgroundColor: 'var(--gold-glow)',
    borderRadius: '8px',
    border: '1px solid var(--amber-gold)',
    color: 'var(--amber-gold)',
    fontSize: '12px',
    fontWeight: '600'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '14px'
  },
  card: {
    padding: '14px',
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start'
  },
  iconBox: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    backgroundColor: 'var(--gold-glow)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  cardTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: '0 0 2px 0'
  },
  cardDesc: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
    margin: 0
  }
};
