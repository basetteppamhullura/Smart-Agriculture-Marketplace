import React from 'react';
import LoginRegister from './LoginRegister';
import { ShoppingBag, DollarSign, Gavel, Heart, Search, MapPin, History, Star, Calendar, Landmark, ShieldCheck, Lock } from 'lucide-react';

export default function BuyerAuthPage({ onChangeTab, onAuthSuccess }) {
  const features = [
    { title: 'Browse Products', desc: 'Explore fresh, direct farm-listed grains, pulses, and organic vegetables.', icon: ShoppingBag },
    { title: 'Buy Now Option', desc: 'Secure instant buyouts of active inventories at listed mandi direct rates.', icon: DollarSign },
    { title: 'Price Negotiation & Bidding', desc: 'Interact directly with sellers using our real-time bargaining hub to negotiate rates.', icon: SparklesIcon },
    { title: 'Auction Bidding System', desc: 'Join competitive bidding rooms to buy bulk grain stocks at best wholesale prices.', icon: Gavel },
    { title: 'Add to Favorites List', desc: 'Save preferred local crop listings to track price drops and updates.', icon: Heart },
    { title: 'Product Search & Filters', desc: 'Sort and filter listings by category, price, organic status, and ratings.', icon: Search },
    { title: 'Delivery Tracking', desc: 'Track deliveries, carrier info, and warehouse storage updates.', icon: MapPin },
    { title: 'Order History', desc: 'Review invoices, completed transactions, and purchase logs.', icon: History },
    { title: 'Customer Reviews & Ratings', desc: 'Grade quality indexes, write text reviews, and upload photos of produce.', icon: Star },
    { title: 'Subscription Orders', desc: 'Configure recurring automatic shipping for daily household or business crops.', icon: Calendar },
    { title: 'Bulk Orders for Business', desc: 'Access B2B pricing, wholesale trade volumes, and credit limits.', icon: Landmark },
    { title: 'Secure Digital Payments', desc: 'Pay safely using integrated wallets, secured escrow deposits, and UPI.', icon: ShieldCheck }
  ];

  return (
    <div className="fade-in" style={styles.container}>
      {/* Header */}
      <div className="glass-card" style={styles.header}>
        <h2 style={{ fontSize: '24px', margin: 0, fontFamily: 'var(--header-font)', color: 'var(--forest-green)' }}>
          Buyer Authentication Gateway
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '6px 0 0 0' }}>
          Please log in or register below to access product listings, auctions, and direct trade bargaining.
        </p>
      </div>

      <div style={styles.contentLayout}>
        {/* Left Column: Feature Highlights */}
        <div style={styles.leftCol}>
          <h3 style={{ fontSize: '18px', margin: '0 0 16px 0', fontFamily: 'var(--header-font)' }}>Buyer Platform Capabilities</h3>
          <div style={styles.grid}>
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="glass-card feature-3d-card" style={styles.card}>
                  <div style={styles.iconBox}>
                    <Icon size={16} color="var(--forest-green)" />
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

        {/* Right Column: Buyer Authentication Form (Login | Register | Forgot Password) */}
        <div style={styles.rightCol}>
          <div style={styles.lockNotice}>
            <Lock size={16} color="var(--forest-green)" />
            <span>Product browsing is exclusive to logged-in buyers.</span>
          </div>
          <LoginRegister 
            initialTab="login" 
            initialRole="buyer" 
            lockRole={true}
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
    backgroundColor: 'var(--green-glow)',
    borderRadius: '8px',
    border: '1px solid var(--forest-green)',
    color: 'var(--forest-green)',
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
    backgroundColor: 'var(--green-glow)',
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
