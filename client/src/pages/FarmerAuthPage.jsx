import React from 'react';
import LoginRegister from './LoginRegister';
import Footer from '../components/Footer';
import { Sprout, DollarSign, Award, ShieldCheck, MapPin, TrendingUp, Sparkles, Phone, Package, Landmark, Brain, Lock, ChevronDown } from 'lucide-react';

export default function FarmerAuthPage({ onChangeTab, onAuthSuccess }) {
  const features = [
    { title: 'Free Harvest Crop Listing', desc: 'List active produce with high-res photos, crop type, quantity, and minimum price.', icon: Sprout },
    { title: 'AI Price Guidance', desc: 'Access real-time Mandi valuation AI recommendations to price crops for max profit.', icon: Brain },
    { title: 'Real-time Buyer Bargaining', desc: 'Receive instant counter-offers and negotiate rates directly with verified buyers.', icon: DollarSign },
    { title: 'Live Crop Auctions', desc: 'Host competitive auction rooms for bulk grain stocks to fetch highest market rates.', icon: TrendingUp },
    { title: 'Reputation & Smart Score', desc: 'Build your farmer trust score with verified delivery records and buyer ratings.', icon: Award },
    { title: '0% Middleman Commission', desc: 'Keep 100% of your earnings with zero hidden broker charges.', icon: ShieldCheck },
    { title: 'Instant Digital Wallet Payouts', desc: 'Receive funds instantly into your digital escrow wallet upon buyer confirmation.', icon: Sparkles },
    { title: 'Farm-Pickup Logistics Support', desc: 'Coordinate transport drivers or arrange direct buyer farm-gate pickup.', icon: MapPin },
    { title: 'Order & Shipping Tracking', desc: 'Monitor dispatch progress, delivery status, and buyer receipts live.', icon: Package },
    { title: 'Government Schemes & Subsidies', desc: 'Access direct updates for PM-KISAN, crop insurance, and soil health cards.', icon: Landmark },
    { title: 'Kisan Helpline & Call Support', desc: 'Reach 24/7 dedicated agrarian support advisors and voice assistance.', icon: Phone }
  ];

  const scrollToAuth = () => {
    const el = document.getElementById('farmer-auth-container');
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
            Farmer Authentication Portal
          </h1>

          <p style={styles.heroSubtitleCover} className="hero-animate-2">
            "Direct Mandi Trade, AI Price Valuation & 0% Broker Commission"
          </p>

          <p style={styles.heroDescriptionCover} className="hero-animate-3">
            List harvested produce directly to commercial buyers, receive real-time counter-offers, access AI pricing suggestions, and receive instant digital wallet payouts.
          </p>

          <div style={styles.heroActionsRow} className="hero-animate-4">
            <button onClick={scrollToAuth} className="btn btn-3d-gold" style={styles.heroBtn}>
              <Sprout size={18} /> Access Farmer Portal Login
            </button>
            <button onClick={() => onChangeTab('home')} className="btn btn-3d-primary" style={styles.heroBtn}>
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
          <ChevronDown size={28} color="#f59e0b" />
        </div>
      </section>

      {/* 2. AUTHENTICATION & FEATURES SECTION */}
      <div id="farmer-auth-container" style={styles.mainContentWrapper}>
        <div style={styles.contentLayout}>
          {/* Left Column: Feature Highlights */}
          <div style={styles.leftCol}>
            <h3 style={{ fontSize: '18px', margin: '0 0 16px 0', fontFamily: 'var(--header-font)' }}>Farmer Platform Capabilities</h3>
            <div style={styles.grid}>
              {features.map((feat, idx) => {
                const Icon = feat.icon;
                return (
                  <div key={idx} className="glass-card feature-3d-card" style={styles.card}>
                    <div style={{ ...styles.iconBox, backgroundColor: 'rgba(217, 119, 6, 0.15)' }}>
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
    backgroundColor: 'rgba(217, 119, 6, 0.15)',
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
