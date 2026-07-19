import React from 'react';
import { ShoppingBag, DollarSign, Gavel, Heart, Search, MapPin, History, Star, Calendar, Landmark, ShieldCheck, ChevronRight, LogIn, UserPlus } from 'lucide-react';

export default function BuyerFeaturesPage({ onChangeTab }) {
  const features = [
    { title: 'Browse Products', desc: 'Browse fresh, direct farm-listed grains, pulses, and organic vegetables.', icon: ShoppingBag },
    { title: 'Buy Now', desc: 'Secure instant buyouts of active inventories at listed mandi direct rates.', icon: DollarSign },
    { title: 'Negotiate / Bid Price', desc: 'Interact directly with sellers using our real-time bargaining hub to negotiate rates.', icon: SparklesIcon },
    { title: 'Auction Bidding', desc: 'Join competitive bidding rooms to buy bulk grain stocks at best wholesale prices.', icon: Gavel },
    { title: 'Add to Favorites', desc: 'Save preferred local crop listings to track price drops and updates.', icon: Heart },
    { title: 'Advanced Filters', desc: 'Sort and filter listings by category, price, organic status, and ratings.', icon: Search },
    { title: 'Logistics Tracking', desc: 'Track deliveries, carrier info, and warehouse storage updates.', icon: MapPin },
    { title: 'Order History', desc: 'Review invoices, completed transactions, and purchase logs.', icon: History },
    { title: 'Reviews & Feedback', desc: 'Grade quality indexes, write text reviews, and upload photos of produce.', icon: Star },
    { title: 'Subscription Orders', desc: 'Configure recurring automatic shipping for daily household or business crops.', icon: Calendar },
    { title: 'Business Bulk Orders', desc: 'Access B2B pricing, wholesale trade volumes, and credit limits.', icon: Landmark },
    { title: 'Secure Digital Payments', desc: 'Pay safely using integrated wallets, secured escrow deposits, and UPI.', icon: ShieldCheck }
  ];

  return (
    <div className="fade-in" style={styles.container}>
      <div className="glass-card" style={styles.header}>
        <h2 style={{ fontSize: '24px', margin: 0, fontFamily: 'var(--header-font)', color: 'var(--forest-green)' }}>
          Buyer Features Dashboard
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '6px 0 0 0' }}>
          Explore direct trading, competitive auctions, dynamic bargaining, and end-to-end logistics.
        </p>
      </div>

      <div style={styles.grid}>
        {features.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <div key={idx} className="glass-card feature-3d-card" style={styles.card}>
              <div style={styles.iconBox}>
                <Icon size={20} color="var(--forest-green)" />
              </div>
              <h4 style={styles.cardTitle}>{feat.title}</h4>
              <p style={styles.cardDesc}>{feat.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Auth Action Footer Cards */}
      <div className="glass-card" style={styles.footerPanel}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Ready to start direct trading?</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 20px 0' }}>
          Sign in or create a buyer account to purchase fresh agricultural crops directly from verified local farmers.
        </p>
        <div style={styles.btnRow}>
          <button 
            onClick={() => onChangeTab('login', { tab: 'login', role: 'buyer' })}
            className="btn btn-3d-primary"
            style={styles.actionBtn}
          >
            <LogIn size={16} style={{ marginRight: '6px' }} />
            <span>Proceed to Buyer Login</span>
          </button>
          <button 
            onClick={() => onChangeTab('login', { tab: 'register', role: 'buyer' })}
            className="btn btn-3d-outline"
            style={styles.actionBtn}
          >
            <UserPlus size={16} style={{ marginRight: '6px' }} />
            <span>Register as Buyer</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Sparkles helper for Lucide
function SparklesIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z" />
      <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5Z" />
      <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z" />
    </svg>
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
    backgroundColor: 'var(--green-glow)',
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
