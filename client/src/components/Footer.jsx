import React from 'react';
import { Mail, Phone, MapPin, Globe, Shield, ExternalLink } from 'lucide-react';

export default function Footer({ onChangeTab }) {
  return (
    <footer style={styles.footerContainer}>
      <div style={styles.footerGrid}>
        {/* Column 1: Help & Support */}
        <div style={styles.column}>
          <h4 style={styles.colTitle}>Help & Support</h4>
          <ul style={styles.linkList}>
            <li><button style={styles.linkBtn} onClick={() => onChangeTab('infohub')}>How this website works</button></li>
            <li><button style={styles.linkBtn} onClick={() => onChangeTab('buyer-features')}>How to buy products</button></li>
            <li><button style={styles.linkBtn} onClick={() => onChangeTab('farmer-features')}>How farmers can sell products</button></li>
            <li><button style={styles.linkBtn} onClick={() => onChangeTab('infohub')}>Frequently Asked Questions (FAQs)</button></li>
            <li><button style={styles.linkBtn} onClick={() => onChangeTab('infohub')}>Contact Support</button></li>
            <li><button style={styles.linkBtn} onClick={() => onChangeTab('infohub')}>Customer Care</button></li>
          </ul>
        </div>

        {/* Column 2: Agriculture Information */}
        <div style={styles.column}>
          <h4 style={styles.colTitle}>Agriculture Information</h4>
          <ul style={styles.linkList}>
            <li><button style={styles.linkBtn} onClick={() => onChangeTab('infohub')}>Government Schemes (PM-KISAN)</button></li>
            <li><button style={styles.linkBtn} onClick={() => onChangeTab('infohub')}>Agricultural News & Updates</button></li>
            <li><button style={styles.linkBtn} onClick={() => onChangeTab('infohub')}>Farming & Soil Health Tips</button></li>
            <li><button style={styles.linkBtn} onClick={() => onChangeTab('infohub')}>Daily Mandi Price Updates</button></li>
            <li><button style={styles.linkBtn} onClick={() => onChangeTab('infohub')}>Weather & Irrigation Forecasts</button></li>
            <li><button style={styles.linkBtn} onClick={() => onChangeTab('logistics')}>Sustainable Farming Practices</button></li>
          </ul>
        </div>

        {/* Column 3: Contact Information */}
        <div style={styles.column}>
          <h4 style={styles.colTitle}>Contact Information</h4>
          <ul style={styles.linkList}>
            <li style={styles.contactItem}>
              <Mail size={14} color="var(--forest-green)" />
              <a href="mailto:hullurabasetteppam16@gmail.com" style={styles.linkText}>hullurabasetteppam16@gmail.com</a>
            </li>
            <li style={styles.contactItem}>
              <Phone size={14} color="var(--forest-green)" />
              <span style={styles.linkText}>Toll Free: +91 1800-425-1666</span>
            </li>
            <li style={styles.contactItem}>
              <MapPin size={14} color="var(--forest-green)" />
              <span style={styles.linkText}>Mandya Agrarian Hub, Karnataka</span>
            </li>
            <li style={styles.contactItem}>
              <Globe size={14} color="var(--forest-green)" />
              <a href="https://github.com/basetteppamhullura/Smart-Agriculture-Marketplace" target="_blank" rel="noreferrer" style={styles.linkText}>
                GitHub Repository
              </a>
            </li>
          </ul>
        </div>

        {/* Column 4: Additional Services */}
        <div style={styles.column}>
          <h4 style={styles.colTitle}>Additional Services</h4>
          <ul style={styles.linkList}>
            <li><button style={styles.linkBtn} onClick={() => onChangeTab('finance')}>PM Fasal Bima Crop Insurance</button></li>
            <li><button style={styles.linkBtn} onClick={() => onChangeTab('logistics')}>Transportation & Cold Chain</button></li>
            <li><button style={styles.linkBtn} onClick={() => onChangeTab('logistics')}>Warehouse Logistics Support</button></li>
            <li><button style={styles.linkBtn} onClick={() => onChangeTab('finance')}>Kisan Credit Card & Subsidies</button></li>
            <li><button style={styles.linkBtn} onClick={() => onChangeTab('infohub')}>Organic Farming Certification</button></li>
          </ul>
        </div>
      </div>

      {/* Sub-footer Copyright */}
      <div style={styles.copyrightRow}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/logo.jpg" alt="SAM Logo" style={{ height: '28px', width: 'auto', borderRadius: '4px' }} />
          <span>© 2026 Smart Agriculture Marketplace (SAM). All Rights Reserved.</span>
        </div>
        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Direct Farmer-to-Buyer Trade Portal</span>
      </div>
    </footer>
  );
}

const styles = {
  footerContainer: {
    backgroundColor: 'var(--bg-secondary)',
    borderTop: '1px solid var(--border-color)',
    padding: '40px 24px 20px 24px',
    marginTop: '50px',
    borderRadius: '16px 16px 0 0',
    textAlign: 'left'
  },
  footerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '30px',
    paddingBottom: '30px',
    borderBottom: '1px solid var(--border-color)'
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  colTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: 0,
    fontFamily: 'var(--header-font)'
  },
  linkList: {
    listStyleType: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  linkBtn: {
    background: 'none',
    border: 'none',
    padding: 0,
    fontSize: '12px',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'color 0.2s'
  },
  contactItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: 'var(--text-secondary)'
  },
  linkText: {
    color: 'var(--text-secondary)',
    textDecoration: 'none'
  },
  copyrightRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '20px',
    fontSize: '12px',
    color: 'var(--text-secondary)',
    flexWrap: 'wrap',
    gap: '10px'
  }
};
