import React, { useState, useEffect } from 'react';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import { useAuth } from '../context/AuthContext';
import { Search, MapPin, Award, Calendar, ChevronRight, Eye, Star, Landmark, TrendingUp, ShieldCheck, Filter, Sprout } from 'lucide-react';

export default function Home({ onChangeTab }) {
  const { t, language } = useThemeLanguage();
  const { apiUrl } = useAuth();
  
  // Data states
  const [allCrops, setAllCrops] = useState([]);
  const [loading, setLoading] = useState(true);

  // Scope states: 'all' | 'karnataka'
  const [scope, setScope] = useState('all');

  // Pagination & Filtering states
  const [visibleCount, setVisibleCount] = useState(8);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedDistrict, setSelectedDistrict] = useState('');

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
  }, [scope, search, category, sortBy, selectedDistrict]);

  // Category tags
  const indiaCategories = [
    'Fruits', 'Vegetables', 'Grains', 'Pulses', 'Spices', 
    'Flowers', 'Seeds', 'Organic products', 'Dairy products', 
    'Agricultural equipment', 'Fertilizers', 'Other farm-related products'
  ];

  const karnatakaCategories = [
    'Rice', 'Millets', 'Pulses', 'Oil Seeds', 'Commercial Crops'
  ];

  const karnatakaDistricts = [
    'Mandya', 'Mysuru', 'Hassan', 'Belagavi', 'Dharwad', 
    'Shivamogga', 'Tumakuru', 'Vijayapura', 'Ballari', 'Chikkamagaluru'
  ];

  // Filtering & Sorting calculations
  const filteredCrops = allCrops
    .filter(crop => {
      // 1. Regional Scope filter
      if (scope === 'karnataka') {
        // Must belong to Karnataka districts
        const inKarnataka = karnatakaDistricts.some(dist => crop.district && crop.district.toLowerCase() === dist.toLowerCase()) || crop.location.includes('Karnataka');
        if (!inKarnataka) return false;
      }

      // 2. District filter
      if (selectedDistrict && crop.district !== selectedDistrict) return false;

      // 3. Name, Kannada Name & Farmer Search
      const text = search.toLowerCase();
      const matchesSearch = !search || 
        crop.name.toLowerCase().includes(text) || 
        (crop.localName && crop.localName.toLowerCase().includes(text)) ||
        crop.farmer.name.toLowerCase().includes(text);
      if (!matchesSearch) return false;
      
      // 4. Category filter
      if (category) {
        if (scope === 'karnataka') {
          // Custom mapping for Karnataka local category selections
          if (category === 'Rice') {
            // Sona Masuri, Basmati, Red Rice, Brown Rice, Paddy Rice (categorized under Grains in DB or names matching Rice/Paddy)
            const isRiceItem = crop.name.toLowerCase().includes('rice') || crop.name.toLowerCase().includes('paddy') || (crop.localName && (crop.localName.includes('ಅಕ್ಕಿ') || crop.localName.includes('ಭತ್ತ')));
            if (!isRiceItem) return false;
          } else if (category === 'Millets') {
            if (crop.category !== 'Millets') return false;
          } else if (category === 'Pulses') {
            if (crop.category !== 'Pulses') return false;
          } else if (category === 'Oil Seeds') {
            if (crop.category !== 'Oil Seeds') return false;
          } else if (category === 'Commercial Crops') {
            if (crop.category !== 'Commercial Crops') return false;
          }
        } else {
          if (crop.category !== category) return false;
        }
      }

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
      if (sortBy === 'nearby') {
        const aNear = a.location.includes('Mandya') ? 1 : 0;
        const bNear = b.location.includes('Mandya') ? 1 : 0;
        return bNear - aNear;
      }
      return 0;
    });

  // Display subset of items
  const displayedCrops = filteredCrops.slice(0, visibleCount);

  return (
    <div className="fade-in" style={styles.container}>
      {/* Hero Section */}
      <section style={styles.hero} className="glass-card">
        <h1 style={styles.heroTitle}>{t('title')}</h1>
        <p style={styles.heroSubtitle}>{t('slogan')}</p>
        <div style={styles.heroBtns}>
          <button onClick={() => onChangeTab('dashboard')} className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '15px' }}>
            Get Started
          </button>
          <button onClick={() => onChangeTab('infohub')} className="btn btn-secondary" style={{ padding: '12px 28px', fontSize: '15px' }}>
            Check Mandi Rates
          </button>
        </div>
      </section>

      {/* Scope Toggles */}
      <div style={styles.scopeContainer}>
        <button 
          onClick={() => { setScope('all'); setCategory(''); setSelectedDistrict(''); }}
          style={{
            ...styles.scopeTab,
            borderBottom: scope === 'all' ? '3px solid var(--forest-green)' : 'none',
            color: scope === 'all' ? 'var(--text-primary)' : 'var(--text-secondary)'
          }}
        >
          All India Marketplace
        </button>
        <button 
          onClick={() => { setScope('karnataka'); setCategory(''); setSelectedDistrict(''); }}
          style={{
            ...styles.scopeTab,
            borderBottom: scope === 'karnataka' ? '3px solid var(--amber-gold)' : 'none',
            color: scope === 'karnataka' ? 'var(--text-primary)' : 'var(--text-secondary)'
          }}
        >
          {language === 'kn' ? 'ಕರ್ನಾಟಕ ಧಾನ್ಯಗಳು ಮತ್ತು ಸಿರಿಧಾನ್ಯಗಳು' : 'Karnataka Grains & Millets Showcase'}
        </button>
      </div>

      {/* Trust Factors */}
      {scope === 'all' ? (
        <div style={styles.featuresGrid}>
          <div className="glass-card" style={styles.featureCard}>
            <Landmark size={36} color="var(--forest-green)" />
            <h3>Direct Trade Platform</h3>
            <p>Bypass middlemen. Trade directly with verified local farmers and receive the best crop valuations without commissions.</p>
          </div>
          <div className="glass-card" style={styles.featureCard}>
            <TrendingUp size={36} color="var(--forest-green)" />
            <h3>AI Valuation Models</h3>
            <p>Instantly estimate crop prices by parsing historic mandi rates and local crop metrics to support fair trade policies.</p>
          </div>
          <div className="glass-card" style={styles.featureCard}>
            <ShieldCheck size={36} color="var(--forest-green)" />
            <h3>Reputation Badge Score</h3>
            <p>Farmers accumulate rating feedback to unlock reputation tiers, securing the verified "Trusted Farmer" badge.</p>
          </div>
        </div>
      ) : (
        <div style={styles.karnatakaPromoCard}>
          <div style={styles.karnatakaFlagStrip}></div>
          <div style={{ padding: '20px' }}>
            <h3 style={{ color: 'var(--text-primary)', fontSize: '18px', marginBottom: '8px' }}>
              {language === 'kn' ? 'ಸಿರಿಧಾನ್ಯ ಮತ್ತು ಧಾನ್ಯಗಳ ಕರ್ನಾಟಕ ಪ್ರದರ್ಶನ' : 'Traditional Grains & Millets (Shree Anna) Hub'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
              Showcasing Mandya Sona Masuri, Tumakuru Ragi, Vijayapura Jowar, Dharwad Bengal Gram, and coastal spices directly from Karnataka farmers.
            </p>
          </div>
        </div>
      )}

      {/* Dynamic Catalog Section */}
      <section style={styles.catalogSection}>
        <h2 style={styles.sectionTitle}>
          {scope === 'karnataka' 
            ? (t('karnatakaMarketplace'))
            : (category === 'Grains' ? 'Active Grain Showcase Hub' : 'Active Crop & Product Showcase')
          }
        </h2>

        {/* Category Pills Slider */}
        <div style={styles.categoryPillsWrapper}>
          <button 
            onClick={() => setCategory('')}
            style={{
              ...styles.pillBtn,
              backgroundColor: category === '' ? 'var(--forest-green)' : 'var(--bg-secondary)',
              color: category === '' ? 'white' : 'var(--text-secondary)'
            }}
          >
            All Products
          </button>
          {(scope === 'karnataka' ? karnatakaCategories : indiaCategories).map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setCategory(cat)}
              style={{
                ...styles.pillBtn,
                backgroundColor: category === cat ? 'var(--forest-green)' : 'var(--bg-secondary)',
                color: category === cat ? 'white' : 'var(--text-secondary)'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Filter & Search Bar Controls */}
        <div className="glass-card" style={styles.filterControlBar}>
          <div style={styles.searchBox}>
            <Search size={18} color="var(--text-secondary)" />
            <input
              type="text"
              placeholder={language === 'kn' ? 'ಕನ್ನಡ ಅಥವಾ ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಬೆಳೆಗಳನ್ನು ಹುಡುಕಿ...' : 'Search by English or Kannada name...'}
              style={styles.searchInput}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={styles.filtersGroup}>
            {scope === 'karnataka' && (
              <div style={styles.sortBox}>
                <Filter size={16} color="var(--text-secondary)" />
                <select 
                  className="form-input" 
                  style={styles.sortSelect} 
                  value={selectedDistrict} 
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                >
                  <option value="">{t('searchDistPlaceholder')}</option>
                  {karnatakaDistricts.map((dist, idx) => (
                    <option key={idx} value={dist}>{dist}</option>
                  ))}
                </select>
              </div>
            )}

            <div style={styles.sortBox}>
              <Filter size={16} color="var(--text-secondary)" />
              <select 
                className="form-input" 
                style={styles.sortSelect} 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Sort: New Arrivals</option>
                <option value="popular">Sort: Most Popular</option>
                <option value="price-asc">Sort: Price (Low to High)</option>
                <option value="price-desc">Sort: Price (High to Low)</option>
                <option value="organic">Sort: Organic Products</option>
                <option value="nearby">Sort: Nearest to Mandya</option>
              </select>
            </div>
          </div>
        </div>

        {/* Crop Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading catalog...</div>
        ) : displayedCrops.length === 0 ? (
          <div style={styles.emptyCatalog}>No matching products found in the showcase. Try adjusting filters or search text.</div>
        ) : (
          <div>
            <div style={styles.cropsGrid}>
              {displayedCrops.map((crop) => {
                const isSoldOut = crop.stockStatus === 'sold-out' || crop.quantity <= 0;
                return (
                  <div 
                    key={crop._id} 
                    className="glass-card" 
                    style={{
                      ...styles.cropCard,
                      border: scope === 'karnataka' ? '1px solid rgba(217, 119, 6, 0.3)' : '1px solid var(--glass-border)',
                      boxShadow: scope === 'karnataka' ? '0 8px 30px rgba(217, 119, 6, 0.05)' : 'var(--shadow-md)'
                    }}
                  >
                    {/* Image Panel with Overlays */}
                    <div style={styles.imagePanel}>
                      <img src={crop.imageUrl} alt={crop.name} style={styles.cropImg} />
                      <span className={`badge ${crop.listingMode === 'auction' ? 'badge-auction' : 'badge-buynow'}`} style={styles.modeBadge}>
                        {crop.listingMode === 'auction' ? 'Auction' : 'Buy Now'}
                      </span>
                      {crop.district && (
                        <span style={styles.districtBadge}>{crop.district}</span>
                      )}
                    </div>

                    {/* Card Content details */}
                    <div style={styles.cropBody}>
                      <div style={styles.categoryHeader}>
                        <span style={styles.categoryLabel}>{crop.category}</span>
                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: crop.qualityGrade === 'Premium' ? 'var(--amber-gold)' : 'var(--emerald)' }}>
                          Grade {crop.qualityGrade}
                        </span>
                      </div>

                      {/* Multilingual Crop Name */}
                      <h4 style={styles.cropTitle} title={crop.name}>{crop.name}</h4>
                      {crop.localName && (
                        <div style={styles.localNameText}>{crop.localName}</div>
                      )}

                      {/* Farmer rating line */}
                      <div style={styles.farmerLine}>
                        <span style={{ fontWeight: '500' }}>{crop.farmer.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Star size={12} fill="var(--amber-gold)" color="var(--amber-gold)" />
                          <span style={{ fontWeight: '700', fontSize: '12px' }}>{crop.farmer.smartFarmingScore?.overallScore || '5.0'}</span>
                        </div>
                        {crop.farmer.hasTrustedBadge && (
                          <span className="badge badge-trusted" style={styles.trustedBadge}>Trusted</span>
                        )}
                      </div>

                      <div style={styles.specsList}>
                        <div style={styles.specItem}>
                          <MapPin size={12} color="var(--text-secondary)" />
                          <span style={{ fontSize: '11px' }}>
                            {crop.district ? `${crop.district} (${crop.village || 'Village'})` : crop.location}
                          </span>
                        </div>
                        <div style={styles.specItem}>
                          <Eye size={12} color="var(--text-secondary)" />
                          <span>{crop.analytics ? crop.analytics.views : 0} Views</span>
                        </div>
                      </div>

                      {/* Pricing Comparison panel */}
                      <div style={styles.pricingPanel}>
                        <div style={styles.priceCol}>
                          <span style={styles.priceLabel}>Selling Price</span>
                          <strong style={styles.sellingPrice}>Rs {crop.price} / unit</strong>
                        </div>
                        <div style={styles.priceCol}>
                          <span style={styles.priceLabel}>AI Recommended</span>
                          <span style={styles.aiPrice}>Rs {crop.aiPriceRecommended}</span>
                        </div>
                      </div>

                      {/* Stock availability details */}
                      <div style={styles.availabilityRow}>
                        <span className={`badge ${isSoldOut ? 'badge-pending' : 'badge-verified'}`} style={{ fontSize: '9px', padding: '2px 8px' }}>
                          {isSoldOut ? 'SOLD OUT' : 'IN STOCK'}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                          {crop.quantity} kg/units • {crop.deliveryOption === 'farm-pickup' ? 'Pickup' : 'Delivery'}
                        </span>
                      </div>

                      <button 
                        onClick={() => onChangeTab('dashboard')} 
                        className="btn btn-outline" 
                        style={styles.viewBtn}
                        disabled={isSoldOut}
                      >
                        {isSoldOut ? 'Out of Stock' : 'View Listing / Buy'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* View More Pagination */}
            {filteredCrops.length > visibleCount && (
              <div style={styles.paginationArea}>
                <button 
                  onClick={() => setVisibleCount(prev => prev + 8)}
                  className="btn btn-primary"
                  style={{ padding: '12px 35px' }}
                >
                  View More Products
                </button>
              </div>
            )}
          </div>
        )}
      </section>
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
  }
};
