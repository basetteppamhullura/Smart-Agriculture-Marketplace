import React, { useState, useEffect } from 'react';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import { useAuth } from '../context/AuthContext';
import { 
  Info, Layers, ShoppingBag, Sprout, Trophy, 
  Landmark, TrendingUp, Headphones, FileQuestion, Mail, 
  Star, ShieldCheck, CheckCircle, MapPin, ArrowRight, 
  Phone, ChevronDown, ChevronUp, Sparkles, Truck, DollarSign, Award, Clock
} from 'lucide-react';
import Footer from '../components/Footer';
import LoginRegister from './LoginRegister';

export default function Home({ onChangeTab }) {
  const { t, language } = useThemeLanguage();
  const { apiUrl } = useAuth();
  
  // Parallax Scroll state
  const [scrollY, setScrollY] = useState(0);

  // FAQ Accordion active state
  const [openFaq, setOpenFaq] = useState(null);

  // Leaderboard data states
  const [allCrops, setAllCrops] = useState([]);
  const [loading, setLoading] = useState(true);

  // Contact Form states
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactRole, setContactRole] = useState('farmer');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);

  // Initial Auth Tab for the portal
  const [authRole, setAuthRole] = useState('buyer');

  // Parallax Scroll Listener
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Custom Event Listener for switching auth role from Navbar
  useEffect(() => {
    const handleRoleSwitch = (e) => {
      if (e.detail && e.detail.role) {
        setAuthRole(e.detail.role);
      }
    };
    window.addEventListener('sam-switch-auth-role', handleRoleSwitch);
    return () => window.removeEventListener('sam-switch-auth-role', handleRoleSwitch);
  }, []);

  // Fetch crops for leaderboard data
  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const res = await fetch(`${apiUrl}/crops`);
        if (res.ok) {
          const data = await res.json();
          setAllCrops(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCrops();
  }, [apiUrl]);

  // Smooth scroll helper
  const scrollToSection = (id, role = null) => {
    if (role) {
      setAuthRole(role);
    }
    const element = document.getElementById(id);
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

  // Contact Form Submission
  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSent(true);
    setTimeout(() => {
      setContactName('');
      setContactEmail('');
      setContactMessage('');
      setContactSent(false);
    }, 4000);
  };

  // Market Prices Benchmark Data
  const marketPriceData = [
    { crop: 'Basmati Rice (Long Grain)', category: 'Grains', mandi: 'Mysuru Mandi', price: '₹95 / kg', trend: 'up', change: '+₹3.50' },
    { crop: 'Red Rice (Matta)', category: 'Grains', mandi: 'Shivamogga Mandi', price: '₹68 / kg', trend: 'stable', change: '0.00' },
    { crop: 'Organic Turmeric Rhizomes', category: 'Commercial', mandi: 'Chikkamagaluru', price: '₹140 / kg', trend: 'up', change: '+₹6.00' },
    { crop: 'Sugarcane Stalks (Juice Quality)', category: 'Commercial', mandi: 'Mandya Mandi', price: '₹3,200 / Ton', trend: 'up', change: '+₹120' },
    { crop: 'BT Cotton Bolls', category: 'Commercial', mandi: 'Dharwad Mandi', price: '₹68 / kg', trend: 'down', change: '-₹1.20' },
    { crop: 'Green Gram (Hesaru Bele)', category: 'Pulses', mandi: 'Hubli Mandi', price: '₹105 / kg', trend: 'up', change: '+₹4.00' }
  ];

  // Government Schemes Data
  const govSchemesData = [
    {
      title: 'PM-Kisan Samman Nidhi',
      benefit: '₹6,000 / year direct income support',
      desc: 'Financial support transferred directly into bank accounts of eligible landholding farmer families.',
      badge: 'National Scheme',
      link: 'https://pmkisan.gov.in/'
    },
    {
      title: 'Karnataka Raitha Vidya Nidhi',
      benefit: 'Scholarships up to ₹11,000',
      desc: 'Educational financial assistance for children of Karnataka farmers pursuing higher education.',
      badge: 'State Govt Scheme',
      link: 'https://raitamitra.karnataka.gov.in/'
    },
    {
      title: 'Minimum Support Price (MSP) Guarantee',
      benefit: 'Assured Floor Trading Price',
      desc: 'Government floor benchmark ensuring fair price payouts for grains, pulses, and commercial crops.',
      badge: 'MSP Benchmark',
      link: 'https://agricoop.nic.in/'
    },
    {
      title: 'Soil Health Card Scheme',
      benefit: 'Free Soil Testing & Fertilizer Guide',
      desc: 'Customized nutrient recommendations to improve crop yield and lower soil degradation.',
      badge: 'Free Service',
      link: 'https://soilhealth.dac.gov.in/'
    }
  ];

  // FAQ Accordion Questions
  const faqsList = [
    {
      q: 'How does the Price Bargaining Hub work?',
      a: 'Logged-in buyers and farmers can initiate real-time counter-offers. Farmers set target rates while buyers propose quotes. Once both accept, an instant invoice order is generated.'
    },
    {
      q: 'Is registration free for farmers and buyers?',
      a: 'Yes! Registration is 100% free for both farmers and agricultural buyers. You can set up your profile and wallet within minutes.'
    },
    {
      q: 'How are digital payments and escrows protected?',
      a: 'All payments are held in secured digital wallets until delivery receipt is confirmed by the buyer, ensuring 0% payment default risk for farmers.'
    },
    {
      q: 'What is the AI Price Recommendation tool?',
      a: 'Our AI model analyzes seasonal harvest volumes, quality grades, regional mandi rates, and demand indices to provide transparent fair price estimates for crops.'
    },
    {
      q: 'How does logistics and delivery tracking function?',
      a: 'Farmers can choose between direct farm-pickup or logistics delivery. Buyers can monitor order progress with real-time status updates.'
    }
  ];

  return (
    <div className="home-full-wrapper" style={styles.homeWrapper}>
      {/* 1. FULL-SCREEN 100VH HERO COVER SECTION */}
      <section id="hero" style={styles.heroCover}>
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
            Smart Agriculture Marketplace
          </h1>

          <p style={styles.heroSubtitleCover} className="hero-animate-2">
            "Empowering Farmers. Connecting Buyers."
          </p>

          <p style={styles.heroDescriptionCover} className="hero-animate-3">
            Direct mandi trade, AI fair valuation, & 0% middleman commission. Experience seamless trading directly with verified farmers with real-time price bargaining, transparent quality scoring, and secured digital payouts.
          </p>

          <div style={styles.heroActionsRow} className="hero-animate-4">
            <button onClick={() => onChangeTab('buyer-auth')} className="btn btn-3d-primary" style={styles.heroBtn}>
              <ShoppingBag size={18} /> Enter Buyer Portal
            </button>
            <button onClick={() => onChangeTab('farmer-auth')} className="btn btn-3d-gold" style={styles.heroBtn}>
              <Sprout size={18} /> Enter Farmer Portal
            </button>
          </div>
        </div>

        {/* Bouncing Scroll Down Indicator */}
        <div 
          style={styles.scrollIndicator} 
          className="scroll-indicator-bounce" 
          onClick={() => scrollToSection('about-us')}
          title="Scroll to explore sections"
        >
          <ChevronDown size={28} color="#34d399" />
        </div>
      </section>

      {/* 2. ABOUT US SECTION */}
      <section id="about-us" style={styles.sectionContainer}>
        <div style={styles.sectionHeader}>
          <div style={styles.iconTag}><Info size={18} color="var(--forest-green)" /></div>
          <div>
            <h2 style={styles.sectionTitle}>About Smart Agriculture Marketplace</h2>
            <p style={styles.sectionSubtitle}>Transforming agricultural trade with transparent technology and direct fair pricing.</p>
          </div>
        </div>

        <div style={styles.grid3Col}>
          <div className="glass-card feature-3d-card" style={styles.infoCard}>
            <Sprout size={28} color="var(--forest-green)" />
            <h3 style={styles.cardHeading}>Direct Farmer Empowerment</h3>
            <p style={styles.cardText}>
              We eliminate exploitative middlemen, enabling farmers to list harvested crops directly to commercial buyers and consumers at fair mandi values.
            </p>
          </div>

          <div className="glass-card feature-3d-card" style={styles.infoCard}>
            <Sparkles size={28} color="var(--amber-gold)" />
            <h3 style={styles.cardHeading}>AI Dynamic Valuation</h3>
            <p style={styles.cardText}>
              Our machine learning pricing engine analyzes regional harvest trends, quality indexes, and mandi demand to recommend fair benchmark prices.
            </p>
          </div>

          <div className="glass-card feature-3d-card" style={styles.infoCard}>
            <ShieldCheck size={28} color="var(--emerald)" />
            <h3 style={styles.cardHeading}>Secured Escrow & Delivery</h3>
            <p style={styles.cardText}>
              Every transaction is backed by digital wallet escrows and verified logistics tracking to ensure guaranteed payouts upon delivery verification.
            </p>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section id="how-it-works" style={styles.sectionContainer}>
        <div style={styles.sectionHeader}>
          <div style={styles.iconTag}><Layers size={18} color="var(--forest-green)" /></div>
          <div>
            <h2 style={styles.sectionTitle}>How It Works</h2>
            <p style={styles.sectionSubtitle}>Simple 3-step trading process designed for seamless farmer and buyer interactions.</p>
          </div>
        </div>

        <div style={styles.grid2Col}>
          {/* Buyer Workflow */}
          <div className="glass-card" style={styles.workflowBox}>
            <h3 style={{ ...styles.workflowHeader, color: 'var(--forest-green)' }}>
              <ShoppingBag size={20} /> For Agricultural Buyers
            </h3>
            <div style={styles.stepList}>
              <div style={styles.stepItem}>
                <div style={styles.stepNum}>1</div>
                <div>
                  <strong style={styles.stepTitle}>Log In & Browse Produce</strong>
                  <p style={styles.stepDesc}>Explore verified listings sorted by crop type, quality grade, and location.</p>
                </div>
              </div>
              <div style={styles.stepItem}>
                <div style={styles.stepNum}>2</div>
                <div>
                  <strong style={styles.stepTitle}>Negotiate or Place Auction Bids</strong>
                  <p style={styles.stepDesc}>Propose counter-offers via Bargaining Hub or join live grain auctions.</p>
                </div>
              </div>
              <div style={styles.stepItem}>
                <div style={styles.stepNum}>3</div>
                <div>
                  <strong style={styles.stepTitle}>Secure Checkout & Delivery</strong>
                  <p style={styles.stepDesc}>Pay via digital escrow and track your shipment straight to your warehouse.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Farmer Workflow */}
          <div className="glass-card" style={styles.workflowBox}>
            <h3 style={{ ...styles.workflowHeader, color: 'var(--amber-gold)' }}>
              <Sprout size={20} /> For Verified Farmers
            </h3>
            <div style={styles.stepList}>
              <div style={styles.stepItem}>
                <div style={{ ...styles.stepNum, backgroundColor: 'var(--amber-gold)' }}>1</div>
                <div>
                  <strong style={styles.stepTitle}>Log In & List Harvested Crop</strong>
                  <p style={styles.stepDesc}>Upload produce photos, quantity, minimum price, and quality grade.</p>
                </div>
              </div>
              <div style={styles.stepItem}>
                <div style={{ ...styles.stepNum, backgroundColor: 'var(--amber-gold)' }}>2</div>
                <div>
                  <strong style={styles.stepTitle}>Receive Bids & AI Valuation</strong>
                  <p style={styles.stepDesc}>Review buyer offers with live AI pricing guidance to maximize profits.</p>
                </div>
              </div>
              <div style={styles.stepItem}>
                <div style={{ ...styles.stepNum, backgroundColor: 'var(--amber-gold)' }}>3</div>
                <div>
                  <strong style={styles.stepTitle}>Dispatch Produce & Get Instant Payment</strong>
                  <p style={styles.stepDesc}>Hand over crop to logistics or farm pickup and receive instant wallet credit.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* 6. FARMER REPUTATION & LEADERBOARD SECTION */}
      <section id="leaderboard" style={styles.sectionContainer}>
        <div style={styles.sectionHeader}>
          <div style={styles.iconTag}><Trophy size={18} color="var(--amber-gold)" /></div>
          <div>
            <h2 style={styles.sectionTitle}>Farmer Reputation & Leaderboard</h2>
            <p style={styles.sectionSubtitle}>Recognizing top-rated agricultural producers, organic certified sellers, and delivery performance metrics.</p>
          </div>
        </div>

        <div style={styles.grid4Col}>
          {(() => {
            const farmersMap = {};
            allCrops.forEach(crop => {
              if (crop.farmer && crop.farmer._id && !farmersMap[crop.farmer._id]) {
                const rating = crop.farmer.smartFarmingScore?.overallScore || 4.8;
                let rankBadge = 'Trusted Farmer';
                if (rating >= 4.7) rankBadge = 'Top Seller';
                else if (rating >= 4.5) rankBadge = 'Premium Seller';

                farmersMap[crop.farmer._id] = {
                  ...crop.farmer,
                  location: crop.location || 'Karnataka, India',
                  rankBadge,
                  products: new Set()
                };
              }
              if (crop.farmer && crop.farmer._id) {
                farmersMap[crop.farmer._id].products.add(crop.name);
              }
            });

            const topFarmers = Object.values(farmersMap)
              .sort((a, b) => (b.smartFarmingScore?.overallScore || 0) - (a.smartFarmingScore?.overallScore || 0))
              .slice(0, 4);

            if (topFarmers.length === 0) {
              return <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Loading top seller ratings...</div>;
            }

            return topFarmers.map((f, idx) => (
              <div key={f._id || idx} className="glass-card feature-3d-card" style={styles.farmerCard}>
                <div style={styles.farmerCardHeader}>
                  <div style={{ position: 'relative' }}>
                    <img 
                      src={f.avatarUrl || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=120&q=80"} 
                      alt={f.name} 
                      style={styles.farmerAvatar} 
                    />
                    <span style={styles.rankPill}>#{idx + 1}</span>
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 2px 0', fontSize: '15px' }}>{f.name}</h4>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{f.location}</span>
                  </div>
                </div>
                
                <div style={styles.farmerStats}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Star size={13} fill="var(--amber-gold)" color="var(--amber-gold)" />
                    <span style={{ fontWeight: '700', fontSize: '12px' }}>{f.smartFarmingScore?.overallScore || '4.8'}</span>
                  </div>
                  <span className="badge badge-trusted" style={{ fontSize: '9px', padding: '2px 6px' }}>{f.rankBadge}</span>
                  {f.hasTrustedBadge && (
                    <span className="badge badge-verified" style={{ fontSize: '9px', padding: '2px 6px' }}>Verified</span>
                  )}
                </div>

                <div style={styles.metricsRow}>
                  <div style={styles.metricBox}>
                    <span style={{ fontSize: '9px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Quality Score</span>
                    <strong style={{ fontSize: '11px', color: 'var(--emerald)' }}>{f.smartFarmingScore?.quality || '4.8'}/5.0</strong>
                  </div>
                  <div style={styles.metricBox}>
                    <span style={{ fontSize: '9px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Delivery Perf.</span>
                    <strong style={{ fontSize: '11px', color: 'var(--forest-green)' }}>{f.smartFarmingScore?.deliveryReliability || '4.9'}/5.0</strong>
                  </div>
                </div>
              </div>
            ));
          })()}
        </div>
      </section>

      {/* 7. GOVERNMENT SCHEMES SECTION */}
      <section id="gov-schemes" style={styles.sectionContainer}>
        <div style={styles.sectionHeader}>
          <div style={styles.iconTag}><Landmark size={18} color="var(--forest-green)" /></div>
          <div>
            <h2 style={styles.sectionTitle}>Government Agricultural Schemes</h2>
            <p style={styles.sectionSubtitle}>Explore national & state financial aid, subsidy grants, and MSP floor prices.</p>
          </div>
        </div>

        <div style={styles.grid2Col}>
          {govSchemesData.map((scheme, idx) => (
            <div key={idx} className="glass-card feature-3d-card" style={styles.schemeCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="badge badge-trusted" style={{ fontSize: '10px' }}>{scheme.badge}</span>
                <Landmark size={18} color="var(--forest-green)" />
              </div>
              <h3 style={{ fontSize: '16px', margin: '8px 0 4px 0', fontFamily: 'var(--header-font)' }}>{scheme.title}</h3>
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--emerald)', marginBottom: '8px' }}>
                {scheme.benefit}
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                {scheme.desc}
              </p>
              <a 
                href={scheme.link} 
                target="_blank" 
                rel="noreferrer" 
                style={styles.schemeLink}
              >
                Apply & Learn More <ArrowRight size={13} />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* 8. MARKET PRICES SECTION */}
      <section id="market-prices" style={styles.sectionContainer}>
        <div style={styles.sectionHeader}>
          <div style={styles.iconTag}><TrendingUp size={18} color="var(--amber-gold)" /></div>
          <div>
            <h2 style={styles.sectionTitle}>Live Mandi Market Price Benchmark</h2>
            <p style={styles.sectionSubtitle}>Daily spot commodity benchmark rates updated from regional Karnataka Mandis.</p>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', overflowX: 'auto' }}>
          <table style={styles.priceTable}>
            <thead>
              <tr style={styles.tableHeadRow}>
                <th style={styles.th}>Crop Produce</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Regional Mandi</th>
                <th style={styles.th}>Spot Benchmark Price</th>
                <th style={styles.th}>24h Trend</th>
              </tr>
            </thead>
            <tbody>
              {marketPriceData.map((row, idx) => (
                <tr key={idx} style={styles.tableRow}>
                  <td style={{ ...styles.td, fontWeight: '700' }}>{row.crop}</td>
                  <td style={styles.td}><span className="badge" style={{ fontSize: '10px' }}>{row.category}</span></td>
                  <td style={styles.td}>{row.mandi}</td>
                  <td style={{ ...styles.td, fontWeight: '700', color: 'var(--forest-green)' }}>{row.price}</td>
                  <td style={styles.td}>
                    <span style={{ 
                      color: row.trend === 'up' ? 'var(--emerald)' : row.trend === 'down' ? '#ef4444' : 'var(--text-secondary)',
                      fontWeight: '700',
                      fontSize: '12px' 
                    }}>
                      {row.trend === 'up' ? '▲ ' : row.trend === 'down' ? '▼ ' : '• '} {row.change}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 9. HELP & SUPPORT SECTION */}
      <section id="help-support" style={styles.sectionContainer}>
        <div style={styles.sectionHeader}>
          <div style={styles.iconTag}><Headphones size={18} color="var(--forest-green)" /></div>
          <div>
            <h2 style={styles.sectionTitle}>Help & Support Desk</h2>
            <p style={styles.sectionSubtitle}>Dedicated support assistance for trading, wallet payouts, and dispute resolutions.</p>
          </div>
        </div>

        <div style={styles.grid3Col}>
          <div className="glass-card feature-3d-card" style={styles.supportBox}>
            <Headphones size={32} color="var(--forest-green)" />
            <h3 style={styles.cardHeading}>24/7 Farmer & Buyer Care</h3>
            <p style={styles.cardText}>Call our toll-free support center at 1800-425-AGRI for quick assistance in Kannada & English.</p>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--forest-green)' }}>1800-425-2474</span>
          </div>

          <div className="glass-card feature-3d-card" style={styles.supportBox}>
            <Mail size={32} color="var(--amber-gold)" />
            <h3 style={styles.cardHeading}>Instant WhatsApp Assistance</h3>
            <p style={styles.cardText}>Send produce photos or ask pricing questions directly to our automated agri assistant.</p>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--amber-gold)' }}>+91 98765 43210</span>
          </div>

          <div className="glass-card feature-3d-card" style={styles.supportBox}>
            <ShieldCheck size={32} color="var(--emerald)" />
            <h3 style={styles.cardHeading}>Dispute & Refund Protection</h3>
            <p style={styles.cardText}>Dedicated trade resolution panel resolving delivery claims within 24 hours.</p>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--emerald)' }}>0% Dispute Fee</span>
          </div>
        </div>
      </section>

      {/* 10. FAQs SECTION */}
      <section id="faqs" style={styles.sectionContainer}>
        <div style={styles.sectionHeader}>
          <div style={styles.iconTag}><FileQuestion size={18} color="var(--forest-green)" /></div>
          <div>
            <h2 style={styles.sectionTitle}>Frequently Asked Questions</h2>
            <p style={styles.sectionSubtitle}>Answers to common questions about trading, pricing, and account verification.</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {faqsList.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx} 
                className="glass-card" 
                style={styles.faqItem}
                onClick={() => setOpenFaq(isOpen ? null : idx)}
              >
                <div style={styles.faqQuestionRow}>
                  <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{faq.q}</strong>
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
                {isOpen && (
                  <p style={styles.faqAnswer}>
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 11. CONTACT US SECTION */}
      <section id="contact-us" style={styles.sectionContainer}>
        <div style={styles.sectionHeader}>
          <div style={styles.iconTag}><Mail size={18} color="var(--forest-green)" /></div>
          <div>
            <h2 style={styles.sectionTitle}>Contact Us</h2>
            <p style={styles.sectionSubtitle}>Have questions or partnership inquiries? Send us a message.</p>
          </div>
        </div>

        <div style={styles.grid2Col}>
          {/* Contact Form */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '16px', fontFamily: 'var(--header-font)' }}>Send an Inquiry</h3>
            {contactSent ? (
              <div style={styles.successMsg}>
                <CheckCircle size={20} />
                <span>Thank you! Your message has been sent successfully. Our team will contact you shortly.</span>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} style={styles.contactForm}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Your Full Name</label>
                  <input 
                    type="text" 
                    required 
                    className="form-input"
                    placeholder="Enter your name" 
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Email Address</label>
                  <input 
                    type="email" 
                    required 
                    className="form-input"
                    placeholder="Enter email address" 
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>I am a...</label>
                  <select 
                    className="form-input"
                    value={contactRole}
                    onChange={(e) => setContactRole(e.target.value)}
                  >
                    <option value="farmer">Farmer / Producer</option>
                    <option value="buyer">Agricultural Buyer / Trader</option>
                    <option value="partner">Logistics / Institution Partner</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Message</label>
                  <textarea 
                    required 
                    rows="4" 
                    className="form-input"
                    placeholder="Write your inquiry or question..."
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn btn-3d-primary" style={{ width: '100%', padding: '12px' }}>
                  Send Message
                </button>
              </form>
            )}
          </div>

          {/* Office Info */}
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '16px', margin: 0, fontFamily: 'var(--header-font)' }}>Agricultural Trading Hub</h3>
            
            <div style={styles.infoRow}>
              <MapPin size={20} color="var(--forest-green)" />
              <div>
                <strong>Mandya Hub Office</strong>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                  Plot 42, Mandi Circle, Sugar Town, Mandya, Karnataka - 571401
                </p>
              </div>
            </div>

            <div style={styles.infoRow}>
              <Phone size={20} color="var(--amber-gold)" />
              <div>
                <strong>Phone Support</strong>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                  +91 80 2345 6789 (Mon - Sat, 8:00 AM - 8:00 PM)
                </p>
              </div>
            </div>

            <div style={styles.infoRow}>
              <Mail size={20} color="var(--emerald)" />
              <div>
                <strong>Email Inquiries</strong>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                  support@smartagrimarket.in
                </p>
              </div>
            </div>

            <div style={styles.infoRow}>
              <Clock size={20} color="var(--forest-green)" />
              <div>
                <strong>Mandi Operating Hours</strong>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                  Live Online Bidding & Auctions: 24/7 Active
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer onChangeTab={onChangeTab} />
    </div>
  );
}

const styles = {
  homeWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '50px',
    width: '100%',
    margin: 0,
    padding: 0
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
  heroBadgePill: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 14px',
    borderRadius: '20px',
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    color: '#34d399',
    fontSize: '11px',
    fontWeight: '700',
    border: '1px solid rgba(16, 185, 129, 0.4)'
  },
  heroTitleCover: {
    fontSize: '42px',
    fontWeight: '800',
    fontFamily: 'var(--header-font)',
    color: '#ffffff',
    textShadow: '0 3px 10px rgba(0,0,0,0.8)',
    margin: 0,
    lineHeight: 1.15
  },
  heroSubtitleCover: {
    fontSize: '20px',
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
  sectionContainer: {
    scrollMarginTop: '90px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    textAlign: 'left'
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '12px'
  },
  iconTag: {
    width: '38px',
    height: '38px',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  sectionTitle: {
    fontSize: '22px',
    fontWeight: '700',
    fontFamily: 'var(--header-font)',
    margin: 0
  },
  sectionSubtitle: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    margin: '2px 0 0 0'
  },
  grid3Col: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px'
  },
  grid2Col: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px'
  },
  grid4Col: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px'
  },
  infoCard: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  cardHeading: {
    fontSize: '16px',
    fontWeight: '700',
    margin: 0,
    fontFamily: 'var(--header-font)'
  },
  cardText: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    margin: 0
  },
  workflowBox: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  workflowHeader: {
    fontSize: '16px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    margin: 0,
    paddingBottom: '10px',
    borderBottom: '1px solid var(--border-color)'
  },
  stepList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  stepItem: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start'
  },
  stepNum: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    backgroundColor: 'var(--forest-green)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '12px',
    flexShrink: 0
  },
  stepTitle: {
    fontSize: '13px',
    color: 'var(--text-primary)'
  },
  stepDesc: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    margin: '2px 0 0 0'
  },
  farmerCard: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  farmerCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  farmerAvatar: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid var(--forest-green)'
  },
  rankPill: {
    position: 'absolute',
    bottom: '-2px',
    right: '-2px',
    backgroundColor: 'var(--amber-gold)',
    color: 'white',
    fontSize: '9px',
    fontWeight: '800',
    padding: '1px 5px',
    borderRadius: '10px'
  },
  farmerStats: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderBottom: '1px solid var(--border-color)',
    borderTop: '1px solid var(--border-color)',
    padding: '8px 0',
    flexWrap: 'wrap'
  },
  metricsRow: {
    display: 'flex',
    gap: '10px'
  },
  metricBox: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--bg-primary)',
    padding: '6px 8px',
    borderRadius: '6px',
    border: '1px solid var(--border-color)'
  },
  schemeCard: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  schemeLink: {
    marginTop: '8px',
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--forest-green)',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px'
  },
  priceTable: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '13px'
  },
  tableHeadRow: {
    borderBottom: '2px solid var(--border-color)',
    backgroundColor: 'var(--bg-secondary)'
  },
  th: {
    padding: '12px 14px',
    fontWeight: '700',
    color: 'var(--text-secondary)'
  },
  tableRow: {
    borderBottom: '1px solid var(--border-color)'
  },
  td: {
    padding: '12px 14px'
  },
  supportBox: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '10px'
  },
  faqItem: {
    padding: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  faqQuestionRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  faqAnswer: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
    marginTop: '10px',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '10px'
  },
  contactForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  formLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-secondary)'
  },
  successMsg: {
    padding: '16px',
    backgroundColor: '#d1fae5',
    color: '#065f46',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '13px'
  },
  infoRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px'
  }
};
