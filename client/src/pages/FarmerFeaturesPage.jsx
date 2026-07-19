import React from 'react';
import { Sprout, LayoutGrid, Image, Sparkles, TrendingUp, Gavel, Landmark, BarChart3, Wallet, Award, Brain, CloudRain, ShieldCheck, Truck, LogIn, UserPlus } from 'lucide-react';

export default function FarmerFeaturesPage({ onChangeTab }) {
  const features = [
    { title: 'Farmer Registration', desc: 'Secure verification portal to list crop inventories.', icon: Sprout },
    { title: 'List & Manage Crops', desc: 'Easily list active crop inventories, set minimum prices, and edit details.', icon: LayoutGrid },
    { title: 'Upload Produce Photos', desc: 'Attach high-quality photos of harvested products to attract buyers.', icon: Image },
    { title: 'AI Pricing Advice', desc: 'Evaluate recommended pricing based on grade, volume, and mandi trends.', icon: Sparkles },
    { title: 'Mandi Trend Prediction', desc: 'Analyze 6-month projected price trends using seasonal history data.', icon: TrendingUp },
    { title: 'Manage Auction Rooms', desc: 'Set starting bids, set timers, and accept bids from retailers.', icon: Gavel },
    { title: 'Order & Payment Tracker', desc: 'Accept direct orders, track earnings, and see pending log requests.', icon: Landmark },
    { title: 'Sales Analytics Dashboard', desc: 'Check profit summaries, revenue, and historic transaction grids.', icon: BarChart3 },
    { title: 'Digital Wallet', desc: 'Receive instant payments, manage bank payouts, and verify transaction states.', icon: Wallet },
    { title: 'Reputation Badge Scores', desc: 'Accumulate high buyer review scores to unlock Trusted badges.', icon: Award },
    { title: 'AI Disease Diagnostic', desc: 'Scan leaf photos to diagnose crop diseases and read treatment guides.', icon: Brain },
    { title: 'Meteorological Advice', desc: 'Receive smart recommendations based on soil types and rainfall indices.', icon: CloudRain },
    { title: 'Inventory Management', desc: 'Keep stock counts up to date and toggle listing status.', icon: ShieldCheck },
    { title: 'Logistics Coordination', desc: 'Choose between farm-pickup and direct delivery shipping.', icon: Truck }
  ];

  return (
    <div className="fade-in" style={styles.container}>
      <div className="glass-card" style={styles.header}>
        <h2 style={{ fontSize: '24px', margin: 0, fontFamily: 'var(--header-font)', color: 'var(--amber-gold)' }}>
          Farmer Features Dashboard
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '6px 0 0 0' }}>
          Explore digital crop listings, AI recommendations, live bidding rooms, and carbon footprint diagnostics.
        </p>
      </div>

      <div style={styles.grid}>
        {features.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <div key={idx} className="glass-card feature-3d-card" style={styles.card}>
              <div style={styles.iconBox}>
                <Icon size={20} color="var(--amber-gold)" />
              </div>
              <h4 style={styles.cardTitle}>{feat.title}</h4>
              <p style={styles.cardDesc}>{feat.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Auth Action Footer Cards */}
      <div className="glass-card" style={styles.footerPanel}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Ready to reach thousands of buyers?</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 20px 0' }}>
          Sign in or create a farmer account to publish listings and access AI-driven dynamic pricing tools.
        </p>
        <div style={styles.btnRow}>
          <button 
            onClick={() => onChangeTab('login', { tab: 'login', role: 'farmer' })}
            className="btn btn-3d-gold"
            style={styles.actionBtn}
          >
            <LogIn size={16} style={{ marginRight: '6px' }} />
            <span>Proceed to Farmer Login</span>
          </button>
          <button 
            onClick={() => onChangeTab('login', { tab: 'register', role: 'farmer' })}
            className="btn btn-3d-outline"
            style={{ ...styles.actionBtn, color: 'var(--amber-gold)', borderColor: 'var(--amber-gold)', boxShadow: '0 4px 0 var(--border-color)' }}
          >
            <UserPlus size={16} style={{ marginRight: '6px' }} />
            <span>Register as Farmer</span>
          </button>
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px'
  },
  card: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  iconBox: {
    width: '38px',
    height: '38px',
    borderRadius: '8px',
    backgroundColor: 'var(--gold-glow)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '4px'
  },
  cardTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: 0
  },
  cardDesc: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    margin: 0
  },
  footerPanel: {
    padding: '30px',
    textAlign: 'center',
    marginTop: '15px'
  },
  btnRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
    flexWrap: 'wrap'
  },
  actionBtn: {
    padding: '12px 24px',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '220px'
  }
};
