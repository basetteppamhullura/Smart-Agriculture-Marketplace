import React from 'react';
import LoginRegister from './LoginRegister';
import Footer from '../components/Footer';
import { Sprout, Lock } from 'lucide-react';

export default function FarmerAuthPage({ onChangeTab, onAuthSuccess }) {
  return (
    <div className="fade-in" style={styles.container}>
      {/* 1. FULL-SCREEN 100VH HERO COVER & AUTHENTICATION GATEWAY */}
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

        {/* Centered Hero Content & Authentication Portal Form */}
        <div style={styles.heroContentCover}>
          <div style={styles.brandingHeader} className="hero-animate-1">
            <img 
              src="/logo.jpg" 
              alt="Smart Agriculture Marketplace Logo" 
              style={styles.heroLogoImg}
            />
            <h1 style={styles.heroTitleCover}>
              Farmer Authentication Portal
            </h1>
            <p style={styles.heroSubtitleCover}>
              "Authentication required. Log in or register to manage crops and wallet."
            </p>
          </div>

          {/* Authentication Form Card */}
          <div style={styles.authCardWrapper} className="hero-animate-2">
            <div style={styles.lockNotice}>
              <Lock size={15} color="var(--amber-gold)" />
              <span>Mandatory Authentication: Sign in to list crops, view bids & receive payouts.</span>
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

          <div style={styles.homeReturnRow} className="hero-animate-3">
            <button onClick={() => onChangeTab('home')} className="btn btn-3d-outline" style={styles.returnBtn}>
              ← Return to Home Page
            </button>
          </div>
        </div>
      </section>

      <Footer onChangeTab={onChangeTab} />
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    textAlign: 'center'
  },
  heroCover: {
    width: '100vw',
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
    paddingTop: '90px',
    paddingBottom: '50px',
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
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    backdropFilter: 'blur(3px)',
    zIndex: 1
  },
  heroContentCover: {
    zIndex: 2,
    color: 'white',
    padding: '20px',
    width: '100%',
    maxWidth: '520px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px'
  },
  brandingHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px'
  },
  heroLogoImg: {
    height: '70px',
    width: 'auto',
    objectFit: 'contain',
    borderRadius: '10px',
    boxShadow: '0 6px 20px rgba(0,0,0,0.5)',
    border: '1px solid rgba(255,255,255,0.15)',
    marginBottom: '2px'
  },
  heroTitleCover: {
    fontSize: '32px',
    fontWeight: '800',
    fontFamily: 'var(--header-font)',
    color: '#ffffff',
    textShadow: '0 3px 10px rgba(0,0,0,0.8)',
    margin: 0,
    lineHeight: 1.25
  },
  heroSubtitleCover: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--amber-gold)',
    textShadow: '0 2px 6px rgba(0,0,0,0.8)',
    margin: 0
  },
  authCardWrapper: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  lockNotice: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px 14px',
    backgroundColor: 'rgba(217, 119, 6, 0.2)',
    borderRadius: '8px',
    border: '1px solid rgba(217, 119, 6, 0.4)',
    color: '#fbbf24',
    fontSize: '12px',
    fontWeight: '600',
    textAlign: 'center'
  },
  homeReturnRow: {
    marginTop: '6px'
  },
  returnBtn: {
    fontSize: '13px',
    padding: '8px 18px',
    color: '#ffffff',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(0, 0, 0, 0.3)'
  }
};
