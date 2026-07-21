import React from 'react';
import LoginRegister from './LoginRegister';
import Footer from '../components/Footer';
import { ShoppingBag, DollarSign, Gavel, Heart, Search, MapPin, History, Star, Calendar, Landmark, ShieldCheck, Lock, ChevronDown } from 'lucide-react';

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

  const scrollToAuth = () => {
    const el = document.getElementById('buyer-auth-container');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="fade-in" style={styles.container}>
      {/* 1. FULL-SCREEN 100VH HERO COVER SECTION */}
      <section style={styles.heroCover}>
        {/* Full-width Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          controls={false}
          poster="/hero_bg.jpg"
          style={styles.heroVideo}
        >
          <source src="/hero_video.mp4" type="video/mp4" />
          Your browser does not support HTML5 background video.
        </video>

        {/* Dark Readability Overlay */}
        <div style={styles.heroOverlayCover}></div>

        {/* Centered Hero Content Box */}
        <div style={styles.heroContentCover}>
          <img 
            src="/logo.jpg" 
            alt="Smart Agriculture Marketplace Logo" 
            style={styles.heroLogoImg}
            className="hero-animate-1"
          />

          <h1 style={styles.heroTitleCover} className="hero-animate-2">
            Buyer Authentication Portal
          </h1>

          <p style={styles.heroSubtitleCover} className="hero-animate-2">
            "Direct Farm Sourcing, Live Bargaining & Secured Escrow Payouts"
          </p>

          <p style={styles.heroDescriptionCover} className="hero-animate-3">
            Access verified farm produce, compare live mandi market rates, request sample grades, and participate in competitive crop auction rooms.
          </p>

          <div style={styles.heroActionsRow} className="hero-animate-4">
            <button onClick={scrollToAuth} className="btn btn-3d-primary" style={styles.heroBtn}>
              <ShoppingBag size={18} /> Access Buyer Portal Login
            </button>
            <button onClick={() => onChangeTab('home')} className="btn btn-3d-gold" style={styles.heroBtn}>
              Return to Home Page
            </button>
          </div>
        </div>

        {/* Bouncing Scroll Down Indicator */}
        <div 
          style={styles.scrollIndicator} 
          className="scroll-indicator-bounce" 
          onClick={scrollToAuth}
          title="Scroll to login & features"
        >
          <ChevronDown size={28} color="#34d399" />
        </div>
      </section>

      {/* 2. AUTHENTICATION & FEATURES SECTION */}
      <div id="buyer-auth-container" style={styles.mainContentWrapper}>
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

      <Footer onChangeTab={onChangeTab} />
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
    gap: '40px',
    width: '100%',
    textAlign: 'left'
  },
  heroCover: {
    width: '100vw',
    height: '100vh',
    minHeight: '100vh',
    marginLeft: 'calc(-50vw + 50%)',
    marginRight: 'calc(-50vw + 50%)',
    backgroundColor: '#051d10',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    marginTop: '-70px',
    paddingTop: '70px',
    boxShadow: 'var(--shadow-lg)'
  },
  heroVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    zIndex: 0,
    pointerEvents: 'none'
  },
  heroOverlayCover: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.58)',
    backdropFilter: 'blur(2px)',
    zIndex: 1
  },
  heroContentCover: {
    zIndex: 2,
    color: 'white',
    padding: '40px 20px',
    maxWidth: '850px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px'
  },
  heroLogoImg: {
    height: '84px',
    width: 'auto',
    maxHeight: '20vh',
    objectFit: 'contain',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
    border: '1px solid rgba(255,255,255,0.15)',
    marginBottom: '2px'
  },
  heroTitleCover: {
    fontSize: '40px',
    fontWeight: '800',
    fontFamily: 'var(--header-font)',
    color: '#ffffff',
    textShadow: '0 3px 10px rgba(0,0,0,0.8)',
    margin: 0,
    lineHeight: 1.15
  },
  heroSubtitleCover: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--amber-gold)',
    textShadow: '0 2px 8px rgba(0,0,0,0.8)',
    fontStyle: 'italic',
    margin: 0
  },
  heroDescriptionCover: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.95)',
    textShadow: '0 1px 4px rgba(0,0,0,0.7)',
    lineHeight: '1.6',
    maxWidth: '720px',
    margin: 0
  },
  heroActionsRow: {
    display: 'flex',
    gap: '14px',
    marginTop: '10px',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  heroBtn: {
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  scrollIndicator: {
    position: 'absolute',
    bottom: '24px',
    zIndex: 2,
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  mainContentWrapper: {
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    padding: '0 20px 40px 20px'
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
