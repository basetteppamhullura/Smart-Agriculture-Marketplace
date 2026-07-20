import React, { useState, useEffect } from 'react';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import { useAuth } from '../context/AuthContext';
import { MapPin, Award, Star, ShieldCheck, Sprout, ShoppingBag, Sparkles, CheckCircle, Truck, Trophy } from 'lucide-react';
import Footer from '../components/Footer';

export default function Home({ onChangeTab }) {
  const { t, language } = useThemeLanguage();
  const { apiUrl } = useAuth();
  
  // Data states
  const [allCrops, setAllCrops] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Filtering states
  const [visibleCount, setVisibleCount] = useState(8);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [scrollY, setScrollY] = useState(0);

  // Parallax Scroll Listener
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load all showcase products
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

  // Reset pagination on filters change
  useEffect(() => {
    setVisibleCount(8);
  }, [search, category, sortBy]);

  // Category tags
  const indiaCategories = [
    'Fruits', 'Vegetables', 'Grains', 'Pulses', 'Spices', 
    'Flowers', 'Seeds', 'Organic products', 'Dairy products', 
    'Agricultural equipment', 'Fertilizers', 'Other farm-related products'
  ];

  // Filtering & Sorting calculations
  const filteredCrops = allCrops
    .filter(crop => {
      // 1. Name, Kannada Name & Farmer Search
      const text = search.toLowerCase();
      const matchesSearch = !search || 
        crop.name.toLowerCase().includes(text) || 
        (crop.localName && crop.localName.toLowerCase().includes(text)) ||
        crop.farmer.name.toLowerCase().includes(text);
      if (!matchesSearch) return false;
      
      // 2. Category filter
      if (category && crop.category !== category) return false;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'popular') return (b.analytics?.views || 0) - (a.analytics?.views || 0);
      if (sortBy === 'organic') {
        const aOrg = a.category === 'Organic products' ? 1 : 0;
        const bOrg = b.category === 'Organic products' ? 1 : 0;
        return bOrg - aOrg;
      }
      return 0;
    });

  // Display subset of items
  const displayedCrops = filteredCrops.slice(0, visibleCount);

  return (
    <div className="fade-in" style={styles.container}>
      {/* Full-width Agriculture Cover Header Hero Section with Parallax */}
      <section style={{ ...styles.heroCover, backgroundPositionY: `${scrollY * 0.35}px` }}>
        <div style={styles.heroOverlayCover}></div>
        <div style={styles.heroContentCover}>
          <h1 style={styles.heroTitleCover}>Smart Agriculture Marketplace</h1>
          <p style={styles.heroSubtitleCover}>"Empowering Farmers, Connecting Buyers."</p>
          <p style={styles.heroDescriptionCover}>
            Experience direct trading with verified farmers. Real-time bargaining, transparent AI price estimation, and secured transactions.
          </p>
        </div>
      </section>

      {/* Two Separate Visually Attractive Entrance Cards */}
      <section style={styles.authPortalGrid}>
        {/* Buyer Section Card */}
        <div 
          className="glass-card portal-entrance-card" 
          style={{ ...styles.portalCard, borderLeft: '5px solid var(--forest-green)' }}
          onClick={() => onChangeTab('buyer-auth')}
        >
          <div style={styles.portalCardIconWrapper}>
            <ShoppingBag size={24} color="var(--forest-green)" />
          </div>
          <h3 style={styles.portalCardTitle}>Buyer Gateway</h3>
          <p style={styles.portalCardDesc}>
            Access crop marketplace catalogs, place auction bids, track orders, manage bulk purchase plans, and make secure digital checkouts.
          </p>
          <div style={styles.portalActionRow}>
            <button 
              className="btn btn-3d-primary"
              style={{ ...styles.portalBtn, width: '100%' }}
            >
              Enter Buyer Portal
            </button>
          </div>
        </div>

        {/* Farmer Section Card */}
        <div 
          className="glass-card portal-entrance-card" 
          style={{ ...styles.portalCard, borderLeft: '5px solid var(--amber-gold)' }}
          onClick={() => onChangeTab('farmer-auth')}
        >
          <div style={styles.portalCardIconWrapper}>
            <Sprout size={24} color="var(--amber-gold)" />
          </div>
          <h3 style={styles.portalCardTitle}>Farmer (Seller) Gateway</h3>
          <p style={styles.portalCardDesc}>
            Upload produce images, consult AI pricing models, forecast trends, check plant health, and track digital wallet earnings.
          </p>
          <div style={styles.portalActionRow}>
            <button 
              className="btn btn-3d-gold"
              style={{ ...styles.portalBtn, width: '100%' }}
            >
              Enter Farmer Portal
            </button>
          </div>
        </div>
      </section>

      {/* Section 4: Farmer Reputation & Leaderboard */}
      <section style={styles.featuredFarmersSection}>
        <div style={styles.sectionHeaderRow}>
          <div>
            <h2 style={styles.sectionTitle}>Farmer Reputation & Leaderboard</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Recognizing top-rated agricultural producers, organic certified sellers, and delivery performance metrics to build buyer trust.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span className="badge badge-trusted" style={{ padding: '6px 14px' }}>
              <Trophy size={12} style={{ marginRight: '4px' }} /> Top Sellers
            </span>
          </div>
        </div>

        <div style={styles.farmersGrid}>
          {(() => {
            // Group unique farmers from allCrops
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

                <div style={styles.farmerProducts}>
                  <strong style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Top Produce:</strong>
                  <div style={styles.productsTags}>
                    {Array.from(f.products).slice(0, 3).map((prod, pIdx) => (
                      <span key={pIdx} style={styles.productTag}>{prod}</span>
                    ))}
                  </div>
                </div>
              </div>
            ));
          })()}
        </div>
      </section>

      {/* Section 5: Footer Section */}
      <Footer onChangeTab={onChangeTab} />
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
    paddingBottom: '50px'
  },
  hero: {
    padding: '60px 40px',
    textAlign: 'center',
    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(217, 119, 6, 0.05) 100%)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px'
  },
  heroTitle: {
    fontSize: '42px',
    fontWeight: '800',
    fontFamily: 'var(--header-font)',
    color: 'var(--text-primary)',
    lineHeight: '1.1'
  },
  heroSubtitle: {
    fontSize: '18px',
    color: 'var(--text-secondary)',
    maxWidth: '600px'
  },
  heroBtns: {
    display: 'flex',
    gap: '15px',
    marginTop: '10px'
  },
  scopeContainer: {
    display: 'flex',
    gap: '24px',
    borderBottom: '2px solid var(--border-color)',
    paddingBottom: '2px'
  },
  scopeTab: {
    padding: '12px 6px',
    fontSize: '16px',
    fontWeight: '700',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    outline: 'none'
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px'
  },
  featureCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  karnatakaPromoCard: {
    background: 'var(--glass-bg)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-md)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid rgba(217, 119, 6, 0.2)'
  },
  karnatakaFlagStrip: {
    height: '6px',
    background: 'linear-gradient(to right, #eab308 50%, #ef4444 50%)'
  },
  catalogSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: '700',
    fontFamily: 'var(--header-font)'
  },
  categoryPillsWrapper: {
    display: 'flex',
    gap: '10px',
    overflowX: 'auto',
    paddingBottom: '10px',
    scrollbarWidth: 'thin'
  },
  pillBtn: {
    padding: '8px 16px',
    borderRadius: '20px',
    border: '1px solid var(--border-color)',
    fontWeight: '600',
    fontSize: '12px',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'all 0.2s'
  },
  filterControlBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
    flexWrap: 'wrap',
    padding: '16px'
  },
  searchBox: {
    flex: 2,
    minWidth: '280px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)'
  },
  searchInput: {
    flex: 1,
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--text-primary)',
    fontSize: '13px',
    outline: 'none'
  },
  filtersGroup: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    flex: 1.5,
    justifyContent: 'flex-end'
  },
  sortBox: {
    minWidth: '170px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '4px 10px',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    flex: '1 1 auto'
  },
  sortSelect: {
    border: 'none',
    backgroundColor: 'transparent',
    padding: 0,
    fontSize: '13px',
    fontWeight: '600',
    outline: 'none',
    cursor: 'pointer',
    width: '100%'
  },
  emptyCatalog: {
    padding: '40px',
    textAlign: 'center',
    color: 'var(--text-secondary)',
    border: '1px dashed var(--border-color)',
    borderRadius: '12px',
    backgroundColor: 'var(--bg-secondary)',
    fontSize: '14px'
  },
  cropsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '20px'
  },
  cropCard: {
    padding: 0,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    transition: 'all 0.2s ease'
  },
  imagePanel: {
    position: 'relative',
    width: '100%',
    height: '160px',
    overflow: 'hidden'
  },
  cropImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  modeBadge: {
    position: 'absolute',
    bottom: '10px',
    left: '10px',
    fontSize: '9px',
    padding: '3px 8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
  },
  badgeAuction: {
    backgroundColor: 'var(--amber-gold)',
    color: 'white'
  },
  badgeBuyNow: {
    backgroundColor: 'var(--forest-green)',
    color: 'white'
  },
  districtBadge: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    backgroundColor: 'rgba(217, 119, 6, 0.95)',
    color: 'white',
    fontSize: '9px',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '4px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
  },
  cropBody: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    flex: 1
  },
  categoryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  categoryLabel: {
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    color: 'var(--text-secondary)'
  },
  cropTitle: {
    fontSize: '16px',
    fontWeight: '700',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    margin: 0
  },
  localNameText: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    marginTop: '-6px'
  },
  farmerLine: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: 'var(--text-secondary)'
  },
  trustedBadge: {
    fontSize: '8px',
    padding: '1px 5px',
    textTransform: 'uppercase'
  },
  specsList: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    color: 'var(--text-secondary)',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '8px',
    alignItems: 'center'
  },
  specItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  pricingPanel: {
    display: 'flex',
    justifyContent: 'space-between',
    backgroundColor: 'var(--bg-primary)',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)'
  },
  priceCol: {
    display: 'flex',
    flexDirection: 'column'
  },
  priceLabel: {
    fontSize: '9px',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase'
  },
  sellingPrice: {
    fontSize: '15px',
    color: 'var(--text-primary)',
    fontWeight: '700'
  },
  aiPrice: {
    fontSize: '13px',
    color: 'var(--emerald)',
    fontWeight: '600'
  },
  availabilityRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto'
  },
  viewBtn: {
    width: '100%',
    marginTop: '5px',
    fontSize: '12px',
    padding: '10px'
  },
  paginationArea: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '30px'
  },
  featuredFarmersSection: {
    margin: '35px 0',
    textAlign: 'left'
  },
  sectionHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '15px'
  },
  farmersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '20px'
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
    gap: '15px'
  },
  farmerAvatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid var(--forest-green)'
  },
  farmerStats: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    borderBottom: '1px solid var(--border-color)',
    borderTop: '1px solid var(--border-color)',
    padding: '8px 0',
    flexWrap: 'wrap'
  },
  farmerProducts: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  productsTags: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
    alignItems: 'center'
  },
  productTag: {
    fontSize: '11px',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    padding: '3px 8px',
    borderRadius: '4px',
    border: '1px solid var(--border-color)'
  },
  heroCover: {
    width: '100%',
    height: '350px',
    borderRadius: '16px',
    backgroundImage: 'url("/hero_bg.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: '35px',
    boxShadow: 'var(--shadow-lg)',
    border: '1px solid var(--glass-border)'
  },
  heroOverlayCover: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)', // Dark overlay for high readability
    backdropFilter: 'blur(2px)', // Blurred overlay
    zIndex: 1
  },
  heroContentCover: {
    zIndex: 2,
    color: 'white',
    padding: '20px',
    maxWidth: '750px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  heroTitleCover: {
    fontSize: '36px',
    fontWeight: '800',
    fontFamily: 'var(--header-font)',
    color: '#ffffff',
    textShadow: '0 2px 4px rgba(0,0,0,0.6)',
    margin: 0
  },
  heroSubtitleCover: {
    fontSize: '20px',
    fontWeight: '600',
    color: 'var(--amber-gold)',
    textShadow: '0 2px 4px rgba(0,0,0,0.6)',
    fontStyle: 'italic',
    margin: 0
  },
  heroDescriptionCover: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.95)',
    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
    lineHeight: '1.6',
    margin: 0
  },
  authPortalGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
    marginBottom: '35px'
  },
  portalCard: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    textAlign: 'left',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  portalCardIconWrapper: {
    width: '45px',
    height: '45px',
    borderRadius: '10px',
    backgroundColor: 'var(--bg-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  portalCardTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: 0
  },
  portalCardDesc: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    margin: 0,
    minHeight: '60px'
  },
  portalActionRow: {
    display: 'flex',
    gap: '12px',
    marginTop: 'auto'
  },
  portalBtn: {
    flex: 1,
    padding: '10px 16px',
    fontSize: '13px',
    fontWeight: '700'
  }
};
