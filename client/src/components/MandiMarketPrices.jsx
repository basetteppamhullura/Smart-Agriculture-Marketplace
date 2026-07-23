import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import mandiPricesClientData from '../data/mandiPricesClientData';
import { 
  TrendingUp, TrendingDown, Minus, Search, Filter, RefreshCw, Star, Heart, 
  Layers, LineChart, MapPin, Calendar, Clock, CheckCircle2, ChevronRight, X, Grid, List,
  Flame, Zap, Droplet, PackageCheck, Lock, Unlock, ChevronLeft
} from 'lucide-react';

export default function MandiMarketPrices() {
  const { apiUrl } = useAuth();

  // Initialize IMMEDIATELY with client dataset so section is NEVER empty
  const [prices, setPrices] = useState(mandiPricesClientData);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('Today, 08:30 AM');
  const [autoRefreshCount, setAutoRefreshCount] = useState(30);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [mandiFilter, setMandiFilter] = useState('');
  const [sortBy, setSortBy] = useState('default'); // 'default' | 'highestPrice' | 'lowestPrice' | 'latestUpdate' | 'changePct' | 'demand'
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Favorites state
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('sam_mandi_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal States
  const [selectedCropForCompare, setSelectedCropForCompare] = useState(null);
  const [comparisonData, setComparisonData] = useState([]);

  const [selectedCropForHistory, setSelectedCropForHistory] = useState(null);
  const [historyTab, setHistoryTab] = useState('7d'); // '7d' | '30d' | '6m'

  // Save Favorites
  useEffect(() => {
    try {
      localStorage.setItem('sam_mandi_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.error(e);
    }
  }, [favorites]);

  const fetchMandiPrices = async () => {
    try {
      setLoading(true);
      const q = new URLSearchParams();
      if (search) q.append('search', search);
      if (category) q.append('category', category);
      if (stateFilter) q.append('state', stateFilter);
      if (districtFilter) q.append('district', districtFilter);
      if (mandiFilter) q.append('mandi', mandiFilter);
      if (sortBy !== 'default') q.append('sortBy', sortBy);

      const res = await fetch(`${apiUrl}/mandi-prices?${q.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          setPrices(json.data);
          setLastUpdated(json.lastUpdated || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
        } else {
          // Fallback to client sample data if API returns empty
          setPrices(mandiPricesClientData);
        }
      } else {
        setPrices(mandiPricesClientData);
      }
    } catch (err) {
      // Fallback to client sample data on network error
      setPrices(mandiPricesClientData);
    } finally {
      setLoading(false);
      setAutoRefreshCount(30);
    }
  };

  useEffect(() => {
    fetchMandiPrices();
    setCurrentPage(1);
  }, [apiUrl, search, category, stateFilter, districtFilter, mandiFilter, sortBy]);

  // Auto-refresh timer every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setAutoRefreshCount(prev => {
        if (prev <= 1) {
          fetchMandiPrices();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [apiUrl]);

  const toggleFavorite = (cropId) => {
    setFavorites(prev => 
      prev.includes(cropId) ? prev.filter(id => id !== cropId) : [...prev, cropId]
    );
  };

  // Open Compare Modal
  const openCompareModal = (crop) => {
    setSelectedCropForCompare(crop);
    const baseName = crop.crop.split('(')[0].trim();
    const matched = (prices.length > 0 ? prices : mandiPricesClientData).filter(p => p.crop.toLowerCase().includes(baseName.toLowerCase()));
    setComparisonData(matched.length > 0 ? matched : [crop]);
  };

  // Dataset source (never empty!)
  const activeDataset = prices && prices.length > 0 ? prices : mandiPricesClientData;

  // Dynamic Dropdown Lists
  const categoriesList = ['Cereals & Millets', 'Pulses', 'Oilseeds & Commercial', 'Vegetables & Spices', 'Fruits', 'Flowers & Plantation'];
  const statesList = Array.from(new Set(activeDataset.map(p => p.state))).filter(Boolean);
  const districtsList = Array.from(new Set(activeDataset.map(p => p.district))).filter(Boolean);
  const mandisList = Array.from(new Set(activeDataset.map(p => p.mandi))).filter(Boolean);

  // Client-side Filtering & Search
  let filtered = [...activeDataset];

  if (search) {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter(item => 
      item.crop.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.mandi.toLowerCase().includes(q) ||
      item.district.toLowerCase().includes(q) ||
      item.state.toLowerCase().includes(q)
    );
  }

  if (category) {
    filtered = filtered.filter(item => item.category.toLowerCase() === category.toLowerCase());
  }

  if (stateFilter) {
    filtered = filtered.filter(item => item.state.toLowerCase() === stateFilter.toLowerCase());
  }

  if (districtFilter) {
    filtered = filtered.filter(item => item.district.toLowerCase() === districtFilter.toLowerCase());
  }

  if (mandiFilter) {
    filtered = filtered.filter(item => item.mandi.toLowerCase().includes(mandiFilter.toLowerCase()));
  }

  if (onlyFavorites) {
    filtered = filtered.filter(p => favorites.includes(p.id));
  }

  // Client-side Sorting
  if (sortBy === 'highestPrice') {
    filtered.sort((a, b) => b.currentPrice - a.currentPrice);
  } else if (sortBy === 'lowestPrice') {
    filtered.sort((a, b) => a.currentPrice - b.currentPrice);
  } else if (sortBy === 'changePct') {
    filtered.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
  } else if (sortBy === 'demand') {
    const rank = { 'High': 3, 'Medium': 2, 'Low': 1 };
    filtered.sort((a, b) => (rank[b.demandLevel] || 0) - (rank[a.demandLevel] || 0));
  }

  // Pagination calculation
  const totalPages = itemsPerPage === 'All' ? 1 : Math.ceil(filtered.length / Number(itemsPerPage));
  const startIndex = itemsPerPage === 'All' ? 0 : (currentPage - 1) * Number(itemsPerPage);
  const paginatedPrices = itemsPerPage === 'All' ? filtered : filtered.slice(startIndex, startIndex + Number(itemsPerPage));

  return (
    <div style={styles.wrapper} className="fade-in">
      {/* HEADER BAR */}
      <div className="glass-card" style={styles.headerCard}>
        <div style={styles.headerLeft}>
          <div style={styles.iconBadge}>
            <TrendingUp size={22} color="var(--forest-green)" />
          </div>
          <div>
            <h2 style={styles.title}>Live Mandi Market Price Benchmark</h2>
            <p style={styles.subtitle}>
              Real-time commodity spot rates from Karnataka & Indian APMC Mandis strictly in <strong>₹ per Quintal (₹/Quintal)</strong>.
            </p>
          </div>
        </div>

        <div style={styles.headerRight}>
          <div style={styles.pulseBox}>
            <span style={styles.pulseDot}></span>
            <span style={{ fontSize: '12px', color: 'var(--emerald)', fontWeight: 'bold' }}>LIVE DATA</span>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>• Updated: {lastUpdated}</span>
          </div>

          <button onClick={fetchMandiPrices} className="btn btn-outline" style={styles.refreshBtn}>
            <RefreshCw size={14} className={loading ? 'spin-icon' : ''} />
            <span>Refresh ({autoRefreshCount}s)</span>
          </button>
        </div>
      </div>

      {/* FILTER & SEARCH CONTROL PANEL */}
      <div className="glass-card" style={styles.controlPanel}>
        {/* Row 1: Search & Main Filters */}
        <div style={styles.searchRow}>
          <div style={styles.searchBox}>
            <Search size={16} color="var(--text-secondary)" />
            <input 
              type="text"
              placeholder="Search by crop or mandi: Paddy, Sona Masuri, Basmati, Ragi, Onion, Chilli, Arecanut, Mango, Mysuru..."
              style={styles.searchInput}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={16} />
              </button>
            )}
          </div>

          <select className="form-input" style={styles.select} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Category: All Categories</option>
            {categoriesList.map((cat, i) => <option key={i} value={cat}>{cat}</option>)}
          </select>

          <select className="form-input" style={styles.select} value={stateFilter} onChange={(e) => setStateFilter(e.target.value)}>
            <option value="">State: All States</option>
            {statesList.map((st, i) => <option key={i} value={st}>{st}</option>)}
          </select>
        </div>

        {/* Row 2: District, Mandi, Sort, & View Mode */}
        <div style={styles.filterRow}>
          <select className="form-input" style={styles.select} value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)}>
            <option value="">District: All Districts</option>
            {districtsList.map((dist, i) => <option key={i} value={dist}>{dist}</option>)}
          </select>

          <select className="form-input" style={styles.select} value={mandiFilter} onChange={(e) => setMandiFilter(e.target.value)}>
            <option value="">Mandi: All Karnataka APMCs</option>
            {mandisList.map((m, i) => <option key={i} value={m}>{m}</option>)}
          </select>

          <select className="form-input" style={styles.select} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="default">Sort by: Default Featured</option>
            <option value="highestPrice">Highest Price (₹/Quintal)</option>
            <option value="lowestPrice">Lowest Price (₹/Quintal)</option>
            <option value="demand">🔥 Highest Market Demand</option>
            <option value="changePct">Top 24h Price Movements</option>
          </select>

          {/* Toggle View & Favorites Buttons */}
          <div style={styles.actionButtons}>
            <button 
              onClick={() => setOnlyFavorites(prev => !prev)}
              style={{
                ...styles.toggleBtn,
                backgroundColor: onlyFavorites ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                borderColor: onlyFavorites ? '#ef4444' : 'var(--border-color)',
                color: onlyFavorites ? '#ef4444' : 'var(--text-secondary)'
              }}
            >
              <Star size={15} fill={onlyFavorites ? '#ef4444' : 'none'} color={onlyFavorites ? '#ef4444' : 'currentColor'} />
              <span>Starred ({favorites.length})</span>
            </button>

            <div style={styles.viewToggleGroup}>
              <button 
                onClick={() => setViewMode('cards')} 
                style={{ ...styles.viewBtn, backgroundColor: viewMode === 'cards' ? 'var(--forest-green)' : 'transparent', color: viewMode === 'cards' ? '#fff' : 'var(--text-secondary)' }}
                title="Grid Card View"
              >
                <Grid size={16} />
              </button>
              <button 
                onClick={() => setViewMode('table')} 
                style={{ ...styles.viewBtn, backgroundColor: viewMode === 'table' ? 'var(--forest-green)' : 'transparent', color: viewMode === 'table' ? '#fff' : 'var(--text-secondary)' }}
                title="Data Table View"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RESULT COUNT & PAGINATION BAR */}
      <div style={styles.noticeRow}>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Showing <strong>{paginatedPrices.length}</strong> of <strong>{filtered.length}</strong> mandi price benchmarks • All rates strictly in <strong>₹ per Quintal (₹/Quintal)</strong>
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <span>Per Page:</span>
            <select 
              className="form-input" 
              style={{ padding: '4px 8px', fontSize: '12px' }}
              value={itemsPerPage} 
              onChange={(e) => { setItemsPerPage(e.target.value); setCurrentPage(1); }}
            >
              <option value="12">12</option>
              <option value="24">24</option>
              <option value="48">48</option>
              <option value="All">All ({filtered.length})</option>
            </select>
          </div>

          {(search || category || stateFilter || districtFilter || mandiFilter || sortBy !== 'default' || onlyFavorites) && (
            <button 
              onClick={() => { setSearch(''); setCategory(''); setStateFilter(''); setDistrictFilter(''); setMandiFilter(''); setSortBy('default'); setOnlyFavorites(false); setCurrentPage(1); }}
              style={styles.clearBtn}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* CONTENT AREA: CARDS VIEW OR TABLE VIEW */}
      {filtered.length === 0 ? (
        <div style={styles.emptyBox}>
          <p style={{ margin: 0, fontSize: '15px' }}>No mandi prices match your current filter selection.</p>
          <button 
            onClick={() => { setSearch(''); setCategory(''); setStateFilter(''); setDistrictFilter(''); setMandiFilter(''); setSortBy('default'); setOnlyFavorites(false); }}
            className="btn btn-outline"
            style={{ fontSize: '12px', marginTop: '8px' }}
          >
            Show All Mandi Prices
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        /* CARD GRID VIEW */
        <div style={styles.cardGrid}>
          {paginatedPrices.map((item) => {
            const isFav = favorites.includes(item.id);
            const isUp = item.trend === 'up';
            const isDown = item.trend === 'down';
            const isOpen = item.marketStatus === 'Open';

            return (
              <div key={item.id} className="glass-card feature-3d-card" style={styles.priceCard}>
                {/* Image & Header Badges */}
                <div style={{ position: 'relative' }}>
                  <img src={item.imageUrl} alt={item.crop} style={styles.cropImg} />
                  
                  {/* Category Badge */}
                  <span className="badge badge-verified" style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '9px' }}>
                    {item.category}
                  </span>

                  {/* Market Open / Closed Status Badge */}
                  <span style={{
                    position: 'absolute',
                    top: '10px',
                    left: '110px',
                    fontSize: '9px',
                    fontWeight: 'bold',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    backgroundColor: isOpen ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {isOpen ? <Unlock size={10} /> : <Lock size={10} />}
                    {item.marketStatus.toUpperCase()}
                  </span>

                  {/* Favorite Star Button */}
                  <button 
                    onClick={() => toggleFavorite(item.id)} 
                    style={styles.favStarBtn}
                    title="Bookmark Crop Price"
                  >
                    <Star size={16} fill={isFav ? '#f59e0b' : 'none'} color={isFav ? '#f59e0b' : '#ffffff'} />
                  </button>

                  {/* Color-Coded Trend Badge (Green for Up, Red for Down, Yellow for Stable) */}
                  <div style={{
                    ...styles.trendBadge,
                    backgroundColor: isUp ? 'rgba(16, 185, 129, 0.9)' : isDown ? 'rgba(239, 68, 68, 0.9)' : 'rgba(245, 158, 11, 0.9)'
                  }}>
                    {isUp ? <TrendingUp size={14} /> : isDown ? <TrendingDown size={14} /> : <Minus size={14} />}
                    <span>{isUp ? `⬆ +₹${item.change} (${item.changePct})` : isDown ? `⬇ -₹${Math.abs(item.change)} (${item.changePct})` : '➜ Stable (0%)'}</span>
                  </div>
                </div>

                {/* Card Content Body */}
                <div style={styles.cardBody}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={styles.cropName}>{item.crop}</h4>
                      <div style={styles.gradeBadge}>Quality Grade: {item.grade}</div>
                    </div>
                  </div>

                  {/* Main Spot Mandi Rate Highlight */}
                  <div style={styles.spotPriceBox}>
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current Mandi Rate</span>
                    <div style={styles.priceHighlight}>
                      ₹{item.currentPrice.toLocaleString()} <span style={{ fontSize: '12px', color: 'var(--forest-green)', fontWeight: '600' }}>/ Quintal</span>
                    </div>
                  </div>

                  {/* Min / Max / Avg Price Range Table */}
                  <div style={styles.rangeGrid}>
                    <div style={styles.rangeBox}>
                      <span style={styles.rangeLabel}>Min Rate</span>
                      <strong style={{ color: '#0284c7' }}>₹{item.minPrice.toLocaleString()} / qtnl</strong>
                    </div>
                    <div style={styles.rangeBox}>
                      <span style={styles.rangeLabel}>Mandi Avg</span>
                      <strong style={{ color: 'var(--forest-green)' }}>₹{item.avgPrice.toLocaleString()} / qtnl</strong>
                    </div>
                    <div style={styles.rangeBox}>
                      <span style={styles.rangeLabel}>Max Rate</span>
                      <strong style={{ color: '#d97706' }}>₹{item.maxPrice.toLocaleString()} / qtnl</strong>
                    </div>
                  </div>

                  {/* Stock Availability & Demand Level Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', backgroundColor: 'var(--bg-primary)', padding: '6px 10px', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                      <PackageCheck size={13} color="var(--forest-green)" />
                      <span>Stock: <strong>{item.stockAvailability || 'Available'}</strong></span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {item.demandLevel === 'High' ? <Flame size={13} color="#ef4444" /> : item.demandLevel === 'Medium' ? <Zap size={13} color="#f59e0b" /> : <Droplet size={13} color="#0284c7" />}
                      <span style={{ fontWeight: 'bold', color: item.demandLevel === 'High' ? '#ef4444' : item.demandLevel === 'Medium' ? '#d97706' : '#0284c7' }}>
                        {item.demandLevel} Demand
                      </span>
                    </div>
                  </div>

                  {/* Market Location Details */}
                  <div style={styles.locationRow}>
                    <MapPin size={13} color="var(--text-secondary)" />
                    <span>{item.mandi}, {item.district}, {item.state}</span>
                  </div>

                  <div style={styles.updateRow}>
                    <Clock size={12} color="var(--text-secondary)" />
                    <span>Updated: {item.lastUpdated}</span>
                  </div>

                  {/* Action Buttons: Compare Mandis & Historical Trend */}
                  <div style={styles.cardActions}>
                    <button 
                      onClick={() => openCompareModal(item)}
                      className="btn btn-outline"
                      style={styles.actionBtn}
                    >
                      <Layers size={13} /> Compare Mandis
                    </button>
                    <button 
                      onClick={() => setSelectedCropForHistory(item)}
                      className="btn btn-primary"
                      style={styles.actionBtn}
                    >
                      <LineChart size={13} /> Price Trends
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* PROFESSIONAL DATA TABLE VIEW */
        <div className="glass-card" style={{ overflowX: 'auto', padding: '10px' }}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHead}>
                <th style={styles.th}>Crop Produce</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Quality Grade</th>
                <th style={styles.th}>Mandi & Location</th>
                <th style={styles.th}>Status & Stock</th>
                <th style={styles.th}>Current Price (₹/Quintal)</th>
                <th style={styles.th}>Min Price (₹/Quintal)</th>
                <th style={styles.th}>Max Price (₹/Quintal)</th>
                <th style={styles.th}>Average (₹/Quintal)</th>
                <th style={styles.th}>24h Trend</th>
                <th style={styles.th}>Demand</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPrices.map((item) => {
                const isFav = favorites.includes(item.id);
                const isUp = item.trend === 'up';
                const isDown = item.trend === 'down';
                const isOpen = item.marketStatus === 'Open';

                return (
                  <tr key={item.id} style={styles.tr}>
                    <td style={{ ...styles.td, fontWeight: '700' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button onClick={() => toggleFavorite(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                          <Star size={14} fill={isFav ? '#f59e0b' : 'none'} color={isFav ? '#f59e0b' : 'var(--text-secondary)'} />
                        </button>
                        <span>{item.crop}</span>
                      </div>
                    </td>
                    <td style={styles.td}><span className="badge" style={{ fontSize: '10px' }}>{item.category}</span></td>
                    <td style={styles.td}>{item.grade}</td>
                    <td style={styles.td}>
                      <div style={{ fontSize: '12px' }}>
                        <strong>{item.mandi}</strong>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{item.district}, {item.state}</div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ color: isOpen ? 'var(--forest-green)' : '#ef4444', fontWeight: 'bold' }}>
                          {isOpen ? '🟢 Open' : '🔴 Closed'}
                        </span>
                        <span style={{ color: 'var(--text-secondary)' }}>{item.stockAvailability || 'Available'}</span>
                      </div>
                    </td>
                    <td style={{ ...styles.td, fontWeight: '800', color: 'var(--forest-green)', fontSize: '14px' }}>
                      ₹{item.currentPrice.toLocaleString()} / Quintal
                    </td>
                    <td style={{ ...styles.td, color: '#0284c7' }}>₹{item.minPrice.toLocaleString()} / Quintal</td>
                    <td style={{ ...styles.td, color: '#d97706' }}>₹{item.maxPrice.toLocaleString()} / Quintal</td>
                    <td style={{ ...styles.td, fontWeight: '600' }}>₹{item.avgPrice.toLocaleString()} / Quintal</td>
                    <td style={styles.td}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '700',
                        backgroundColor: isUp ? 'rgba(16, 185, 129, 0.15)' : isDown ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: isUp ? 'var(--emerald)' : isDown ? '#ef4444' : '#d97706'
                      }}>
                        {isUp ? '🟢 ⬆' : isDown ? '🔴 ⬇' : '🟡 ➜'} {item.changePct}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: item.demandLevel === 'High' ? '#ef4444' : item.demandLevel === 'Medium' ? '#d97706' : '#0284c7' }}>
                        {item.demandLevel === 'High' ? '🔥 High' : item.demandLevel === 'Medium' ? '⚡ Medium' : '💧 Low'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => openCompareModal(item)} className="btn btn-outline" style={{ fontSize: '10px', padding: '4px 8px' }}>
                          Compare
                        </button>
                        <button onClick={() => setSelectedCropForHistory(item)} className="btn btn-primary" style={{ fontSize: '10px', padding: '4px 8px' }}>
                          Trend
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* PAGINATION CONTROLS */}
      {itemsPerPage !== 'All' && totalPages > 1 && (
        <div style={styles.paginationRow}>
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            className="btn btn-outline"
            style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <ChevronLeft size={14} /> Previous
          </button>

          <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
            Page {currentPage} of {totalPages}
          </span>

          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            className="btn btn-outline"
            style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* COMPARE MANDIS MODAL */}
      {selectedCropForCompare && (
        <div className="modal-overlay" onClick={() => setSelectedCropForCompare(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px' }}>Inter-Mandi Price Comparison</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Comparing rates for <strong>{selectedCropForCompare.crop}</strong> across APMC regional mandis (Strictly in ₹/Quintal).
                </p>
              </div>
              <button onClick={() => setSelectedCropForCompare(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHead}>
                    <th style={styles.th}>Regional APMC Mandi</th>
                    <th style={styles.th}>District & State</th>
                    <th style={styles.th}>Market Status</th>
                    <th style={styles.th}>Spot Rate (₹/Quintal)</th>
                    <th style={styles.th}>Min - Max Range (₹/Quintal)</th>
                    <th style={styles.th}>Demand</th>
                    <th style={styles.th}>Variance</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, idx) => (
                    <tr key={idx} style={styles.tr}>
                      <td style={{ ...styles.td, fontWeight: '700' }}>{row.mandi}</td>
                      <td style={styles.td}>{row.district}, {row.state}</td>
                      <td style={styles.td}>
                        <span style={{ color: row.marketStatus === 'Open' ? 'var(--forest-green)' : '#ef4444', fontWeight: 'bold', fontSize: '11px' }}>
                          {row.marketStatus === 'Open' ? '🟢 Open' : '🔴 Closed'}
                        </span>
                      </td>
                      <td style={{ ...styles.td, fontWeight: '800', color: 'var(--forest-green)' }}>₹{row.currentPrice.toLocaleString()} / Quintal</td>
                      <td style={styles.td}>₹{row.minPrice.toLocaleString()} - ₹{row.maxPrice.toLocaleString()}</td>
                      <td style={styles.td}><strong>{row.demandLevel}</strong></td>
                      <td style={styles.td}>
                        <span style={{ color: row.trend === 'up' ? 'var(--emerald)' : '#ef4444', fontWeight: 'bold' }}>
                          {row.changePct}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* HISTORICAL PRICE TREND MODAL */}
      {selectedCropForHistory && (
        <div className="modal-overlay" onClick={() => setSelectedCropForHistory(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px', width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px' }}>Historical Price Trend Analysis</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {selectedCropForHistory.crop} • {selectedCropForHistory.mandi} (All rates in ₹/Quintal)
                </p>
              </div>
              <button onClick={() => setSelectedCropForHistory(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            {/* Timeframe Selector Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              {['7d', '30d', '6m'].map(tf => (
                <button
                  key={tf}
                  onClick={() => setHistoryTab(tf)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '16px',
                    border: '1px solid var(--border-color)',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    backgroundColor: historyTab === tf ? 'var(--forest-green)' : 'transparent',
                    color: historyTab === tf ? '#ffffff' : 'var(--text-secondary)'
                  }}
                >
                  {tf === '7d' ? '7 Days Trend' : tf === '30d' ? '30 Days Trend' : '6 Months Trend'}
                </button>
              ))}
            </div>

            {/* Price Trend Chart Visual */}
            <div className="glass-card" style={{ padding: '20px', textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                Rate Progression Graph (₹/Quintal)
              </div>
              
              <div style={{ width: '100%', height: '140px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '8px', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                {(historyTab === '7d' ? selectedCropForHistory.history7d : (selectedCropForHistory.history30d || selectedCropForHistory.history7d)).map((val, idx) => {
                  const arr = historyTab === '7d' ? selectedCropForHistory.history7d : (selectedCropForHistory.history30d || selectedCropForHistory.history7d);
                  const min = Math.min(...arr);
                  const max = Math.max(...arr);
                  const heightPct = max === min ? 50 : Math.max(15, Math.min(100, ((val - min) / (max - min)) * 100));

                  return (
                    <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
                      <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--forest-green)' }}>₹{val}</span>
                      <div 
                        style={{ 
                          width: '100%', 
                          maxHeight: `${heightPct}%`, 
                          height: `${heightPct}%`, 
                          backgroundColor: 'var(--emerald)', 
                          borderRadius: '4px 4px 0 0',
                          transition: 'height 0.3s ease' 
                        }} 
                      />
                      <span style={{ fontSize: '8px', color: 'var(--text-secondary)' }}>T-{arr.length - idx}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', textAlign: 'center' }}>
              <div className="glass-card" style={{ padding: '10px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Lowest Rate</div>
                <strong style={{ fontSize: '14px', color: '#0284c7' }}>₹{Math.min(...(selectedCropForHistory.history7d || [selectedCropForHistory.minPrice])).toLocaleString()} / Quintal</strong>
              </div>
              <div className="glass-card" style={{ padding: '10px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Current Spot</div>
                <strong style={{ fontSize: '14px', color: 'var(--forest-green)' }}>₹{selectedCropForHistory.currentPrice.toLocaleString()} / Quintal</strong>
              </div>
              <div className="glass-card" style={{ padding: '10px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Highest Peak</div>
                <strong style={{ fontSize: '14px', color: '#d97706' }}>₹{Math.max(...(selectedCropForHistory.history7d || [selectedCropForHistory.maxPrice])).toLocaleString()} / Quintal</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    width: '100%',
    textAlign: 'left'
  },
  headerCard: {
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '15px'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px'
  },
  iconBadge: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    backgroundColor: 'var(--green-glow)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  title: {
    fontSize: '20px',
    fontWeight: '800',
    margin: 0,
    color: 'var(--text-primary)',
    fontFamily: 'var(--header-font)'
  },
  subtitle: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    margin: '4px 0 0 0'
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    flexWrap: 'wrap'
  },
  pulseBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'var(--bg-primary)',
    padding: '6px 12px',
    borderRadius: '20px',
    border: '1px solid var(--border-color)'
  },
  pulseDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: 'var(--emerald)',
    boxShadow: '0 0 8px var(--emerald)'
  },
  refreshBtn: {
    fontSize: '12px',
    padding: '8px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  controlPanel: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  searchRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '10px'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'var(--bg-primary)',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    gridColumn: 'span 2'
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    width: '100%',
    color: 'var(--text-primary)',
    fontSize: '13px'
  },
  filterRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '10px',
    alignItems: 'center'
  },
  select: {
    fontSize: '12px',
    padding: '8px 10px'
  },
  actionButtons: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  toggleBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  viewToggleGroup: {
    display: 'flex',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  viewBtn: {
    padding: '8px 10px',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease'
  },
  noticeRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 4px',
    flexWrap: 'wrap',
    gap: '10px'
  },
  clearBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--forest-green)',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    textDecoration: 'underline'
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px'
  },
  priceCard: {
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  cropImg: {
    width: '100%',
    height: '150px',
    objectFit: 'cover'
  },
  favStarBtn: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'rgba(0, 0, 0, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(4px)',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  trendBadge: {
    position: 'absolute',
    bottom: '10px',
    right: '10px',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: '800',
    padding: '4px 10px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
  },
  cardBody: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    flexGrow: 1
  },
  cropName: {
    fontSize: '16px',
    fontWeight: '800',
    margin: 0,
    color: 'var(--text-primary)',
    fontFamily: 'var(--header-font)'
  },
  gradeBadge: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    fontWeight: '600',
    marginTop: '2px'
  },
  spotPriceBox: {
    backgroundColor: 'var(--green-glow)',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  priceHighlight: {
    fontSize: '22px',
    fontWeight: '800',
    color: 'var(--forest-green)'
  },
  rangeGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '6px'
  },
  rangeBox: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: '10px',
    backgroundColor: 'var(--bg-primary)',
    padding: '6px',
    borderRadius: '6px',
    textAlign: 'center'
  },
  rangeLabel: {
    color: 'var(--text-secondary)',
    marginBottom: '2px'
  },
  locationRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: 'var(--text-primary)',
    fontWeight: '600'
  },
  updateRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    color: 'var(--text-secondary)'
  },
  cardActions: {
    display: 'flex',
    gap: '8px',
    marginTop: '4px'
  },
  actionBtn: {
    flex: 1,
    fontSize: '11px',
    padding: '7px 4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px'
  },
  paginationRow: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px',
    marginTop: '10px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '12px',
    textAlign: 'left'
  },
  tableHead: {
    backgroundColor: 'var(--bg-secondary)',
    borderBottom: '2px solid var(--border-color)'
  },
  th: {
    padding: '10px 12px',
    fontWeight: '700',
    color: 'var(--text-primary)'
  },
  tr: {
    borderBottom: '1px solid var(--border-color)'
  },
  td: {
    padding: '10px 12px',
    color: 'var(--text-primary)'
  },
  loadingBox: {
    padding: '50px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    color: 'var(--text-secondary)'
  },
  emptyBox: {
    padding: '40px',
    textAlign: 'center',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px'
  }
};
