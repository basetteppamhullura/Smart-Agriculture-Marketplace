import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import { useSocket } from '../context/SocketContext';
import b2bDemoCrops from '../data/b2bDemoCrops';
import ProductReviewsSection from '../components/ProductReviewsSection';
import NegotiationModal from '../components/NegotiationModal';
import BargainingHub from '../components/BargainingHub';
import ChatRooms from '../components/ChatRooms';
import { 
  Search, MapPin, Award, Calendar, DollarSign, Heart, ShoppingBag, Bell, Star, Navigation, 
  Clock, Truck, ChevronRight, Brain, Landmark, BookOpen, FileText, ShoppingCart, SlidersHorizontal, 
  CheckCircle2, ArrowUpDown, Filter, Eye, Layers, CreditCard, Shield, Download, Printer, Check, X,
  Trash2, Plus, Minus, Mic, Image, Share2, Flame, Zap, CheckCircle, Lock, User, RefreshCw, ChevronDown,
  Building, Phone, Mail, Sparkles, Tag, ArrowRight, ShieldCheck, Box, AlertCircle, MessageSquare,
  MessageCircle, Send, PhoneCall, HelpCircle
} from 'lucide-react';

export default function BuyerDashboard({ actionPayload, clearActionPayload, onChangeTab }) {
  const { user, toggleFavorite, apiUrl, updateWallet } = useAuth();
  const { t } = useThemeLanguage();

  // Active Sub-Tab Navigation ('browse' | 'cart' | 'orders' | 'bargains' | 'subscriptions' | 'favorites' | 'account')
  const [activeSubTab, setActiveSubTab] = useState('browse');
  
  // Pre-populate with b2bDemoCrops so page is NEVER empty on initial render!
  const [crops, setCrops] = useState(b2bDemoCrops);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Flipkart / IndiaMART Style Advanced Search & Filter States
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [organicFilter, setOrganicFilter] = useState('all'); // 'all' | 'organic' | 'standard'
  const [qualityGrade, setQualityGrade] = useState('');
  const [trustedOnly, setTrustedOnly] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minQty, setMinQty] = useState('');
  const [sortBy, setSortBy] = useState('default');

  // Search Suggestions & Overlays
  const [recentSearches, setRecentSearches] = useState(['Sona Masuri Rice Mandya', 'Organic Turmeric Grade A', 'Byadgi Chilli 50 Quintals', 'Nagpur Orange Badami']);
  const [trendingSearches] = useState(['🔥 Paddy Bulk 100 Quintals', '⚡ Hassan Potato Grade A', '💥 BT Cotton Long Staple', '🌾 Basmati Rice Export']);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);

  const [showVoiceSearchModal, setShowVoiceSearchModal] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showImageSearchModal, setShowImageSearchModal] = useState(false);

  // Contact Farmer Communication Modal State
  const [contactFarmerCrop, setContactFarmerCrop] = useState(null);
  const [contactTab, setContactTab] = useState('chat'); // 'chat' | 'callback' | 'negotiate' | 'bulk'
  const [chatMessage, setChatMessage] = useState('');
  const [chatLog, setChatLog] = useState([
    { sender: 'farmer', text: 'Namaste! I am the verified producer of this crop. How many quintals do you require?', time: '10:15 AM' }
  ]);
  const [callbackTime, setCallbackTime] = useState('Morning (9 AM - 12 PM)');
  const [callbackPhone, setCallbackPhone] = useState(user?.phone || '9845012345');
  const [proposedPrice, setProposedPrice] = useState('');
  const [proposedQty, setProposedQty] = useState('50');
  const [deliveryLocation, setDeliveryLocation] = useState('Mandya APMC Warehouse #4');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('50% Advance Escrow, 50% on Delivery');

  // Shopping Cart State (All Quantities in QUINTALS)
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('sam_b2b_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save Cart to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('sam_b2b_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Product Comparison & Recently Viewed
  const [compareList, setCompareList] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    try {
      const saved = localStorage.getItem('sam_recent_b2b_crops');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Detail Modal & Stepped Checkout Modal States
  const [detailCrop, setDetailCrop] = useState(null);
  const [selectedCropForCheckout, setSelectedCropForCheckout] = useState(null);
  const [negotiatingCrop, setNegotiatingCrop] = useState(null);
  const [checkoutQtyQuintals, setCheckoutQtyQuintals] = useState(20);

  // Stepped Checkout Progress (1: Address -> 2: Logistics -> 3: Payment -> 4: OTP -> 5: Confirmed)
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [deliveryAddress, setDeliveryAddress] = useState({
    name: user?.name || 'Authorized B2B Purchasing Manager',
    phone: '9845012345',
    address: 'APMC Market Yard Warehouse No. 4, Mandya Agrarian Hub',
    district: 'Mandya',
    state: 'Karnataka',
    pincode: '571401'
  });
  const [logisticsSpeed, setLogisticsSpeed] = useState('express');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [upiId, setUpiId] = useState('b2bmanager@upi');
  const [otpCode, setOtpCode] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  // Review modal states
  const [reviewOrder, setReviewOrder] = useState(null);
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');

  const { notifications, unreadCount, subscribe, sendChatMessage } = useSocket();
  const [showNotificationsDrawer, setShowNotificationsDrawer] = useState(false);
  
  // Active auctions list state
  const [auctions, setAuctions] = useState([]);
  const [biddingAmount, setBiddingAmount] = useState('');
  const [selectedAuctionId, setSelectedAuctionId] = useState(null);

  const token = localStorage.getItem('sam-token');

  // Load Crops from API & Merge with Demo Fallback Data
  const loadCrops = async () => {
    try {
      const q = new URLSearchParams();
      if (search) q.append('search', search);
      if (stateFilter) q.append('location', stateFilter);
      if (qualityGrade) q.append('qualityGrade', qualityGrade);
      if (category) q.append('category', category);

      const res = await fetch(`${apiUrl}/crops?${q.toString()}`);
      if (res.ok) {
        const apiData = await res.json();
        if (Array.isArray(apiData) && apiData.length > 0) {
          const apiIds = new Set(apiData.map(c => c._id));
          const uniqueDemos = b2bDemoCrops.filter(d => !apiIds.has(d._id));
          setCrops([...apiData, ...uniqueDemos]);
        } else {
          setCrops(b2bDemoCrops);
        }
      } else {
        setCrops(b2bDemoCrops);
      }
    } catch (err) {
      setCrops(b2bDemoCrops);
    }
  };

  const loadOrders = async () => {
    try {
      const res = await fetch(`${apiUrl}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch active auctions
  const fetchAuctions = async () => {
    try {
      const res = await fetch(`${apiUrl}/auctions`);
      if (res.ok) {
        const data = await res.json();
        setAuctions(data);
      }
    } catch (err) {
      console.error('Failed to fetch auctions:', err);
    }
  };

  useEffect(() => {
    loadCrops();
    loadOrders();
    fetchAuctions();
  }, [apiUrl]);

  // Subscribe to real-time new crops ('mandi' channel)
  useEffect(() => {
    const unsubscribe = subscribe('mandi', (event) => {
      console.log('WS Mandi Event Received:', event);
      if (event.type === 'new_crop') {
        setCrops(prev => {
          if (prev.some(c => c._id === event.crop._id)) return prev;
          return [event.crop, ...prev];
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to WebSocket auction updates
  useEffect(() => {
    if (activeSubTab !== 'auctions' || auctions.length === 0) return;

    const unsubscribes = auctions.map(auc => 
      subscribe(`auction:${auc._id}`, (event) => {
        console.log('WS Auction Event Received:', event);
        if (event.type === 'new_bid') {
          setAuctions(prev => prev.map(a => a._id === auc._id ? {
            ...a,
            highestBid: event.highestBid,
            highestBidder: { name: event.highestBidderName },
            bidsCount: event.bidsCount
          } : a));
        } else if (event.type === 'resolved') {
          setAuctions(prev => prev.map(a => a._id === auc._id ? {
            ...a,
            status: 'completed'
          } : a));
          loadOrders();
        }
      })
    );

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [activeSubTab, auctions.length]);

  useEffect(() => {
    loadCrops();
  }, [search, category, stateFilter, districtFilter, qualityGrade]);

  useEffect(() => {
    if (actionPayload && actionPayload.crop) {
      const matchedCrop = crops.find(c => c._id === actionPayload.crop._id) || actionPayload.crop;
      if (actionPayload.action === 'buy') {
        setSelectedCropForCheckout(matchedCrop);
        trackRecentlyViewed(matchedCrop);
      } else if (actionPayload.action === 'negotiate') {
        setNegotiatingCrop(matchedCrop);
        trackRecentlyViewed(matchedCrop);
      }
      clearActionPayload();
    }
  }, [actionPayload, crops]);

  // Track Recently Viewed Products
  const trackRecentlyViewed = (crop) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(c => c._id !== crop._id);
      const updated = [crop, ...filtered].slice(0, 8);
      try {
        localStorage.setItem('sam_recent_b2b_crops', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  // Handle Search Submission
  const handleExecuteSearch = (queryStr) => {
    const term = queryStr || search;
    if (!term) return;
    setSearch(term);
    if (!recentSearches.includes(term)) {
      setRecentSearches(prev => [term, ...prev].slice(0, 6));
    }
    setShowSearchSuggestions(false);
  };

  // Voice Search Handler Simulation
  const handleTriggerVoiceSearch = () => {
    setShowVoiceSearchModal(true);
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      const recognizedText = 'Sona Masuri Paddy Mandya';
      setSearch(recognizedText);
      handleExecuteSearch(recognizedText);
      setShowVoiceSearchModal(false);
    }, 2500);
  };

  // In-App Chat Message Submission
  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    const newMsg = { sender: 'buyer', text: chatMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setChatLog(prev => [...prev, newMsg]);
    setChatMessage('');
    setTimeout(() => {
      setChatLog(prev => [...prev, {
        sender: 'farmer',
        text: 'Thank you for your message! I can offer 50 Quintals at ₹' + Math.round(contactFarmerCrop.price * 0.95) + '/Quintal.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1500);
  };

  // Add Item to B2B Cart (in Quintals)
  const handleAddToCart = (crop, qtyQuintals = 20) => {
    setCart(prev => {
      const existing = prev.find(item => item.crop._id === crop._id);
      if (existing) {
        return prev.map(item => item.crop._id === crop._id ? { ...item, quantityQuintals: item.quantityQuintals + qtyQuintals } : item);
      }
      return [...prev, { crop, quantityQuintals: qtyQuintals }];
    });
    alert(`Added ${qtyQuintals} Quintals of ${crop.name} to B2B Shopping Cart!`);
  };

  // Remove Item from Cart
  const handleRemoveFromCart = (cropId) => {
    setCart(prev => prev.filter(item => item.crop._id !== cropId));
  };

  // Toggle Crop Comparison
  const handleToggleCompare = (crop) => {
    setCompareList(prev => {
      const isSelected = prev.some(c => c._id === crop._id);
      if (isSelected) return prev.filter(c => c._id !== crop._id);
      if (prev.length >= 3) {
        alert('You can compare a maximum of 3 crops side-by-side.');
        return prev;
      }
      return [...prev, crop];
    });
  };

  // Share Product Link Generator
  const handleShareProduct = (crop) => {
    if (navigator.share) {
      navigator.share({
        title: `B2B Crop Listing: ${crop.name}`,
        text: `Check out ${crop.name} by ${crop.farmer.name} at ₹${crop.price}/Quintal on Smart Agriculture Marketplace!`,
        url: window.location.href
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert(`Product share link copied to clipboard for ${crop.name}!`);
    }
  };

  // Multi-Filter Logic for Crops
  let processedCrops = [...crops];

  if (search) {
    const q = search.toLowerCase().trim();
    processedCrops = processedCrops.filter(item => 
      item.name.toLowerCase().includes(q) ||
      (item.category && item.category.toLowerCase().includes(q)) ||
      (item.location && item.location.toLowerCase().includes(q)) ||
      (item.farmer && item.farmer.name && item.farmer.name.toLowerCase().includes(q))
    );
  }

  if (organicFilter === 'organic') {
    processedCrops = processedCrops.filter(c => c.category === 'Organic products' || c.isOrganic);
  } else if (organicFilter === 'standard') {
    processedCrops = processedCrops.filter(c => c.category !== 'Organic products' && !c.isOrganic);
  }

  if (stateFilter) {
    processedCrops = processedCrops.filter(c => c.location && c.location.toLowerCase().includes(stateFilter.toLowerCase()));
  }

  if (districtFilter) {
    processedCrops = processedCrops.filter(c => c.location && c.location.toLowerCase().includes(districtFilter.toLowerCase()));
  }

  if (trustedOnly) {
    processedCrops = processedCrops.filter(c => c.farmer && c.farmer.hasTrustedBadge);
  }

  if (minPrice) {
    processedCrops = processedCrops.filter(c => c.price >= Number(minPrice));
  }
  if (maxPrice) {
    processedCrops = processedCrops.filter(c => c.price <= Number(maxPrice));
  }

  if (minQty) {
    processedCrops = processedCrops.filter(c => (c.quantity || 100) >= Number(minQty));
  }

  // Sorting
  if (sortBy === 'price-low') {
    processedCrops.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    processedCrops.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'demand') {
    processedCrops.sort((a, b) => (b.quantity || 0) - (a.quantity || 0));
  } else if (sortBy === 'rating') {
    processedCrops.sort((a, b) => (b.farmer?.smartFarmingScore?.overallScore || 0) - (a.farmer?.smartFarmingScore?.overallScore || 0));
  } else if (sortBy === 'newest') {
    processedCrops.sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now()));
  }

  const cartTotalQuintals = cart.reduce((sum, item) => sum + item.quantityQuintals, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.crop.price * item.quantityQuintals), 0);
  const cartGst = Math.round(cartSubtotal * 0.05);
  const cartShipping = cart.length > 0 ? 350 : 0;
  const cartGrandTotal = Math.max(0, cartSubtotal + cartGst + cartShipping - discountAmount);

  return (
    <div className="fade-in" style={styles.container}>
      {/* 1. TOP STICKY B2B NAVBAR & GLOBAL HERO SEARCH */}
      <div style={styles.stickyHeader}>
        <div style={styles.headerTopRow}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={styles.b2bTitle}>Smart Agriculture Marketplace <span style={styles.b2bBadge}>B2B WHOLESALE PORTAL</span></h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Notifications Button */}
            <button onClick={() => setShowNotificationsDrawer(prev => !prev)} style={styles.headerIconBtn} title="Notifications">
              <Bell size={18} color="var(--forest-green)" />
              {notifications.length > 0 && <span style={styles.notifBadgeCount}>{notifications.length}</span>}
            </button>

            {/* Shopping Cart Button */}
            <button onClick={() => setActiveSubTab('cart')} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingCart size={16} /> Cart ({cart.length} items • {cartTotalQuintals} Qtnl)
            </button>

            {/* Buyer Account Button */}
            <button onClick={() => setActiveSubTab('account')} className="btn btn-outline" style={{ padding: '8px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={16} /> {user?.name || 'Buyer Account'}
            </button>
          </div>
        </div>

        {/* Global Search Bar */}
        <div style={{ position: 'relative', marginTop: '10px' }}>
          <div style={styles.searchContainer}>
            <Search size={20} color="var(--forest-green)" />
            <input 
              type="text"
              placeholder="Search B2B crops by Crop name, Farmer, APMC Mandi, District, State, Grade A..."
              style={styles.heroSearchInput}
              value={search}
              onFocus={() => setShowSearchSuggestions(true)}
              onChange={(e) => { setSearch(e.target.value); setShowSearchSuggestions(true); }}
              onKeyDown={(e) => e.key === 'Enter' && handleExecuteSearch()}
            />
            {search && <button onClick={() => setSearch('')} style={styles.clearSearchBtn}><X size={18} /></button>}

            <button onClick={handleTriggerVoiceSearch} style={styles.searchMediaBtn} title="Voice Search">
              <Mic size={18} color="var(--forest-green)" />
            </button>

            <button onClick={() => setShowImageSearchModal(true)} style={styles.searchMediaBtn} title="Search by Crop Image Upload">
              <Image size={18} color="var(--forest-green)" />
            </button>

            <button onClick={() => handleExecuteSearch()} className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '13px', borderRadius: '6px' }}>
              Search Marketplace
            </button>
          </div>

          {/* Suggestions Dropdown Overlay */}
          {showSearchSuggestions && (
            <div style={styles.suggestionsDropdown} className="fade-in">
              <div style={styles.suggestionSection}>
                <span style={styles.suggestionTitle}>Recent Searches:</span>
                <div style={styles.pillRow}>
                  {recentSearches.map((item, idx) => (
                    <span key={idx} style={styles.pill} onClick={() => handleExecuteSearch(item)}>
                      <Clock size={12} /> {item}
                    </span>
                  ))}
                </div>
              </div>

              <div style={styles.suggestionSection}>
                <span style={styles.suggestionTitle}>Trending B2B Searches:</span>
                <div style={styles.pillRow}>
                  {trendingSearches.map((item, idx) => (
                    <span key={idx} style={styles.trendingPill} onClick={() => handleExecuteSearch(item.replace(/[🔥⚡💥🌾]\s*/g, ''))}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SUB-TABS NAVIGATION BAR */}
      <div style={styles.subTabs}>
        <button
          onClick={() => setActiveSubTab('browse')}
          style={{
            ...styles.subTabBtn,
            backgroundColor: activeSubTab === 'browse' ? 'var(--forest-green)' : 'transparent',
            color: activeSubTab === 'browse' ? 'white' : 'var(--text-secondary)'
          }}
        >
          All Farmers' Wholesale Produce ({crops.length})
        </button>

        <button
          onClick={() => setActiveSubTab('cart')}
          style={{
            ...styles.subTabBtn,
            backgroundColor: activeSubTab === 'cart' ? 'var(--forest-green)' : 'transparent',
            color: activeSubTab === 'cart' ? 'white' : 'var(--text-secondary)'
          }}
        >
          Shopping Cart ({cart.length})
        </button>

        <button
          onClick={() => setActiveSubTab('orders')}
          style={{
            ...styles.subTabBtn,
            backgroundColor: activeSubTab === 'orders' ? 'var(--forest-green)' : 'transparent',
            color: activeSubTab === 'orders' ? 'white' : 'var(--text-secondary)'
          }}
        >
          My Orders & Tracking ({orders.length})
        </button>

        <button
          onClick={() => setActiveSubTab('bargains')}
          style={{
            ...styles.subTabBtn,
            backgroundColor: activeSubTab === 'bargains' ? 'var(--forest-green)' : 'transparent',
            color: activeSubTab === 'bargains' ? 'white' : 'var(--text-secondary)'
          }}
        >
          AI Price Bargaining Hub
        </button>

        <button
          onClick={() => setActiveSubTab('auctions')}
          style={{
            ...styles.subTabBtn,
            backgroundColor: activeSubTab === 'auctions' ? 'var(--forest-green)' : 'transparent',
            color: activeSubTab === 'auctions' ? 'white' : 'var(--text-secondary)'
          }}
        >
          Live Price Auctions ({auctions.filter(a => a.status === 'active').length})
        </button>

        <button
          onClick={() => setActiveSubTab('chats')}
          style={{
            ...styles.subTabBtn,
            backgroundColor: activeSubTab === 'chats' ? 'var(--forest-green)' : 'transparent',
            color: activeSubTab === 'chats' ? 'white' : 'var(--text-secondary)'
          }}
        >
          B2B Chat Rooms
        </button>
      </div>

      {/* 2. MAIN B2B MARKETPLACE SHOWCASE */}
      {activeSubTab === 'browse' && (
        <div style={styles.b2bLayoutWrapper} className="fade-in">
          {/* LEFT SIDEBAR FILTER PANEL */}
          <aside className="glass-card" style={styles.filterSidebar}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Filter size={16} color="var(--forest-green)" /> Filter Produce
              </h3>
              <button 
                onClick={() => { setSearch(''); setCategory(''); setStateFilter(''); setDistrictFilter(''); setOrganicFilter('all'); setMinPrice(''); setMaxPrice(''); setMinQty(''); setTrustedOnly(false); setSortBy('default'); }}
                style={{ background: 'none', border: 'none', fontSize: '11px', color: 'var(--forest-green)', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Reset All
              </button>
            </div>

            {/* Category Filter */}
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Category</label>
              <select className="form-input" style={styles.filterSelect} value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">All Categories</option>
                <option value="Grains">Grains & Rice</option>
                <option value="Pulses">Pulses & Dals</option>
                <option value="Fruits">Fruits & Orchards</option>
                <option value="Vegetables">Fresh Vegetables</option>
                <option value="Commercial">Spices & Commercial Crops</option>
                <option value="Organic products">Certified Organic</option>
              </select>
            </div>

            {/* Location Filters */}
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>State / Region</label>
              <select className="form-input" style={styles.filterSelect} value={stateFilter} onChange={(e) => setStateFilter(e.target.value)}>
                <option value="">All States</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
              </select>
            </div>

            {/* Trusted Seller Toggle */}
            <div style={{ ...styles.filterGroup, flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" id="trustedOnly" checked={trustedOnly} onChange={(e) => setTrustedOnly(e.target.checked)} />
              <label htmlFor="trustedOnly" style={{ fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
                Verified & Trusted Farmers Only
              </label>
            </div>

            {/* Price Range Filter (₹/Quintal) */}
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Price Range (₹ / Quintal)</label>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <input type="number" placeholder="Min ₹" className="form-input" style={{ fontSize: '11px', padding: '6px' }} value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                <span>-</span>
                <input type="number" placeholder="Max ₹" className="form-input" style={{ fontSize: '11px', padding: '6px' }} value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
              </div>
            </div>

            {/* Sort By Dropdown */}
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Sort Listings By</label>
              <select className="form-input" style={styles.filterSelect} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="default">Default Featured</option>
                <option value="price-low">Price: Lowest First (₹/Quintal)</option>
                <option value="price-high">Price: Highest First (₹/Quintal)</option>
                <option value="demand">🔥 High Market Stock</option>
                <option value="rating">★ Farmer Rating: Highest</option>
                <option value="newest">New Arrivals</option>
              </select>
            </div>
          </aside>

          {/* MAIN PRODUCT GRID AREA */}
          <main style={styles.mainGridArea}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>
                Active Wholesale Farmers' Produce (<strong>{processedCrops.length}</strong> items) • Rates strictly in <strong>₹ per Quintal (₹/Quintal)</strong>
              </h3>
            </div>

            {/* Product Cards Grid */}
            <div style={styles.grid}>
              {processedCrops.map((crop) => {
                const isFav = user?.favoriteFarmers && user.favoriteFarmers.includes(crop.farmer?._id);
                const aiFairEstimate = Math.round(crop.price * 0.96);
                const stockInTons = (crop.quantity / 10).toFixed(1);

                return (
                  <div key={crop._id} className="glass-card feature-3d-card" style={styles.cropCard}>
                    {/* Image & Header Badges */}
                    <div style={{ position: 'relative' }}>
                      <img src={crop.imageUrl || (crop.images && crop.images[0])} alt={crop.name} style={styles.cropImg} />
                      <span className="badge badge-verified" style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '9px' }}>
                        {crop.category || 'Agrarian Produce'}
                      </span>
                      {crop.farmer?.hasTrustedBadge && (
                        <span className="badge badge-trusted" style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '9px' }}>
                          ✔ Trusted Farmer
                        </span>
                      )}
                    </div>

                    {/* Card Body */}
                    <div style={styles.cardBody}>
                      <div style={styles.cardHeader}>
                        <h4 style={{ fontSize: '16px', margin: 0, fontWeight: '800' }}>{crop.name}</h4>
                        <button onClick={() => handleShareProduct(crop)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} title="Share Product">
                          <Share2 size={16} />
                        </button>
                      </div>

                      {/* Farmer Profile Line */}
                      <div style={styles.farmerLine}>
                        <img 
                          src={crop.farmer?.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80'} 
                          alt={crop.farmer?.name || 'Farmer'} 
                          style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }} 
                        />
                        <span>Farmer: <strong>{crop.farmer?.name || 'Producer Farmer'}</strong></span>
                        <span style={{ color: 'var(--amber-gold)', fontWeight: 'bold', marginLeft: 'auto' }}>★ {crop.farmer?.smartFarmingScore?.overallScore || '4.9'}</span>
                      </div>

                      <div style={styles.cropSpecs}>
                        <div style={styles.specItem}>
                          <MapPin size={12} color="var(--text-secondary)" />
                          <span>Location: <strong>{crop.location || 'Karnataka APMC'}</strong></span>
                        </div>
                        <div style={styles.specItem}>
                          <Calendar size={12} color="var(--text-secondary)" />
                          <span>Grade: <strong>Grade {crop.qualityGrade || 'A+'}</strong> • Fresh Harvest</span>
                        </div>

                        {/* AI Price Tag */}
                        <div style={{ ...styles.specItem, color: 'var(--forest-green)', fontWeight: '600', fontSize: '11px', backgroundColor: 'var(--green-glow)', padding: '4px 6px', borderRadius: '4px' }}>
                          <Brain size={12} color="var(--forest-green)" />
                          <span>AI Valuation: ₹{aiFairEstimate}/Quintal</span>
                        </div>
                      </div>

                      {/* Price & Stock Display */}
                      <div style={styles.priceRow}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                            Stock: <strong>{crop.quantity} Quintals ({stockInTons} Tons)</strong>
                          </span>
                          <strong style={{ fontSize: '18px', color: 'var(--forest-green)' }}>₹{crop.price.toLocaleString()} / Quintal</strong>
                        </div>
                      </div>

                      {/* Working Action Buttons */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button 
                            onClick={() => { setSelectedCropForCheckout(crop); setCheckoutStep(1); trackRecentlyViewed(crop); }}
                            className="btn btn-primary"
                            style={{ flex: 1, padding: '7px', fontSize: '11px' }}
                          >
                            Buy Now
                          </button>

                          <button 
                            onClick={() => handleAddToCart(crop, 20)}
                            className="btn btn-outline"
                            style={{ padding: '7px 10px', fontSize: '11px' }}
                            title="Add to B2B Cart"
                          >
                            <ShoppingCart size={14} />
                          </button>

                          <button 
                            onClick={async () => {
                              // Automatically open or create B2B Chat Room
                              try {
                                const res = await fetch(`${apiUrl}/chats/message`, {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                  },
                                  body: JSON.stringify({
                                    recipientId: crop.farmer._id || crop.farmer,
                                    text: `Hello! I am interested in your wholesale listing: ${crop.name} at ₹${crop.price}/Quintal.`
                                  })
                                });
                                if (res.ok) {
                                  setActiveSubTab('chats');
                                } else {
                                  alert('Failed to connect to farmer chat.');
                                }
                              } catch (err) {
                                console.error(err);
                              }
                            }}
                            className="btn btn-outline"
                            style={{ padding: '7px 10px', fontSize: '11px', borderColor: 'var(--forest-green)', color: 'var(--forest-green)' }}
                            title="Contact Farmer & Negotiate"
                          >
                            Contact
                          </button>
                        </div>

                        <button 
                          onClick={() => { setDetailCrop(crop); trackRecentlyViewed(crop); }}
                          className="btn btn-outline"
                          style={{ width: '100%', padding: '6px', fontSize: '11px' }}
                        >
                          View Product & Farm Details →
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </main>
        </div>
      )}

      {/* RENDER SHOPPING CART TAB */}
      {activeSubTab === 'cart' && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3>Shopping Cart (Bulk Agricultural Commodities)</h3>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              Your B2B cart is empty. Browse farmer listings to add crops.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', alignItems: 'start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {cart.map((item, idx) => (
                  <div key={idx} className="glass-card" style={{ display: 'flex', gap: '15px', alignItems: 'center', justifyContent: 'space-between', padding: '12px' }}>
                    <img src={item.crop.imageUrl} alt={item.crop.name} style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />
                    <div style={{ flex: 1, paddingLeft: '10px' }}>
                      <h4 style={{ margin: 0 }}>{item.crop.name}</h4>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        Farmer: <strong>{item.crop.farmer?.name || 'Producer'}</strong>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--forest-green)', marginTop: '4px' }}>
                        ₹{item.crop.price} / Quintal
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button 
                        onClick={() => {
                          const newQty = Math.max(item.crop.minOrder || 1, item.quantityQuintals - 5);
                          setCart(prev => prev.map(c => c.crop._id === item.crop._id ? { ...c, quantityQuintals: newQty } : c));
                        }} 
                        style={{ padding: '4px', border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer', borderRadius: '4px' }}
                      >
                        <Minus size={14} />
                      </button>
                      <span style={{ fontSize: '14px', fontWeight: 'bold', width: '40px', textAlign: 'center' }}>
                        {item.quantityQuintals} Q
                      </span>
                      <button 
                        onClick={() => {
                          const newQty = item.quantityQuintals + 5;
                          setCart(prev => prev.map(c => c.crop._id === item.crop._id ? { ...c, quantityQuintals: newQty } : c));
                        }} 
                        style={{ padding: '4px', border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer', borderRadius: '4px' }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--forest-green)', minWidth: '90px', textAlign: 'right' }}>
                      ₹{(item.crop.price * item.quantityQuintals).toLocaleString()}
                    </div>
                    <button onClick={() => handleRemoveFromCart(item.crop._id)} className="btn btn-outline" style={{ padding: '6px 8px', color: '#ef4444', borderColor: '#ef4444' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Summary Block */}
              <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={{ margin: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Order Summary</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span>Total Quantity:</span>
                  <strong>{cartTotalQuintals} Quintals</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span>Subtotal:</span>
                  <strong>₹{cartSubtotal.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span>Mandi GST (5%):</span>
                  <strong>₹{cartGst.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span>Transport Booking:</span>
                  <strong>₹{cartShipping.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 'bold', borderTop: '1px solid var(--border-color)', paddingTop: '10px', color: 'var(--forest-green)' }}>
                  <span>Grand Total:</span>
                  <span>₹{cartGrandTotal.toLocaleString()}</span>
                </div>
                <button 
                  onClick={() => {
                    const firstItem = cart[0];
                    setSelectedCropForCheckout(firstItem.crop);
                    setCheckoutQtyQuintals(firstItem.quantityQuintals);
                    setCheckoutStep(1);
                  }} 
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '12px', marginTop: '10px' }}
                >
                  Proceed to Secure Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RENDER MY ORDERS TAB */}
      {activeSubTab === 'orders' && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3>My Purchase Orders & Tracking</h3>
          {orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              No orders found. Proceed to cart and buy crops to populate this panel.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {orders.map((ord) => {
                const step = ord.deliveryStatus === 'delivered' ? 4 : ord.deliveryStatus === 'in-transit' ? 3 : ord.deliveryStatus === 'dispatched' ? 2 : 1;
                return (
                  <div key={ord._id} className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                      <div>
                        <strong>Order ID: {ord._id}</strong>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          Placed on: {new Date(ord.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <span className="badge badge-verified" style={{ textTransform: 'capitalize' }}>
                        {ord.deliveryStatus}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '13px' }}>
                      <div>Crop Name: <strong>{ord.crop?.name || 'Crop'}</strong></div>
                      <div>Quantity: <strong>{ord.quantity} Quintals</strong></div>
                      <div>Total Settlement: <strong style={{ color: 'var(--forest-green)' }}>₹{ord.totalAmount.toLocaleString()}</strong></div>
                      <div>Payment Status: <strong>{ord.paymentStatus}</strong></div>
                    </div>

                    {/* Logistics Card details */}
                    {ord.logistics && (
                      <div style={{ display: 'flex', gap: '10px', backgroundColor: 'var(--bg-secondary)', padding: '10px', borderRadius: '8px', fontSize: '12px', alignItems: 'center' }}>
                        <Truck size={18} color="var(--forest-green)" />
                        <div>
                          Logistics: <strong>{ord.logistics.partnerName} ({ord.logistics.vehicleNumber})</strong> • Driver: {ord.logistics.driverName} ({ord.logistics.driverPhone})
                        </div>
                      </div>
                    )}

                    {/* Tracker timeline progress bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '15px 0', position: 'relative', width: '100%', maxWidth: '500px', alignSelf: 'center' }}>
                      <div style={{ position: 'absolute', top: '10px', left: '10%', right: '10%', height: '3px', background: 'var(--border-color)', zIndex: 1 }}>
                        <div style={{ width: `${(step - 1) * 33.3}%`, height: '100%', background: 'var(--forest-green)' }}></div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', zIndex: 2 }}>
                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: step >= 1 ? 'var(--forest-green)' : 'var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px', fontWeight: 'bold' }}>1</div>
                        <span style={{ fontSize: '10px', fontWeight: '600' }}>Confirmed</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', zIndex: 2 }}>
                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: step >= 2 ? 'var(--forest-green)' : 'var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px', fontWeight: 'bold' }}>2</div>
                        <span style={{ fontSize: '10px', fontWeight: '600' }}>Dispatched</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', zIndex: 2 }}>
                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: step >= 3 ? 'var(--forest-green)' : 'var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px', fontWeight: 'bold' }}>3</div>
                        <span style={{ fontSize: '10px', fontWeight: '600' }}>In-Transit</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', zIndex: 2 }}>
                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: step >= 4 ? 'var(--forest-green)' : 'var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px', fontWeight: 'bold' }}>4</div>
                        <span style={{ fontSize: '10px', fontWeight: '600' }}>Delivered</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* RENDER BARGAINS TAB */}
      {activeSubTab === 'bargains' && (
        <div className="fade-in" style={{ padding: '10px 0' }}>
          <BargainingHub />
        </div>
      )}

      {/* RENDER CHATS TAB */}
      {activeSubTab === 'chats' && (
        <div className="fade-in" style={{ padding: '10px 0' }}>
          <ChatRooms />
        </div>
      )}

      {/* RENDER LIVE AUCTIONS TAB */}
      {activeSubTab === 'auctions' && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Live Price Auctions (Participate & Bid in Real Time)</h3>
            <button onClick={fetchAuctions} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
              <RefreshCw size={14} /> Refresh Bids
            </button>
          </div>

          {auctions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              No active auctions available right now.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {auctions.map((auc) => {
                const endsInMs = new Date(auc.endTime) - new Date();
                const minutesLeft = Math.max(0, Math.floor(endsInMs / 60000));
                const hoursLeft = Math.floor(minutesLeft / 60);
                const showMins = minutesLeft % 60;
                const isWinner = auc.highestBidder && user && (auc.highestBidder._id === user._id || auc.highestBidder === user._id);

                return (
                  <div key={auc._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: 0, fontSize: '16px' }}>{auc.crop?.name}</h4>
                      <span className={`badge ${auc.status === 'active' ? 'badge-verified' : 'badge-trusted'}`} style={{ textTransform: 'capitalize' }}>
                        {auc.status === 'active' ? '🔴 Live' : 'Closed'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <span>Wholesale Quantity:</span>
                      <strong>{auc.crop?.quantity} Quintals</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <span>Initial Start Rate:</span>
                      <strong>₹{auc.crop?.price}/Quintal</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '6px 0', margin: '4px 0' }}>
                      <span>Current Highest Bid:</span>
                      <strong style={{ color: 'var(--forest-green)', fontSize: '15px' }}>₹{auc.highestBid}/Quintal</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <span>Highest Bidder:</span>
                      <strong>{isWinner ? 'You (Leading)' : auc.highestBidder?.name || 'No bids yet'}</strong>
                    </div>

                    {/* Auction Countdown Timer */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#ef4444', backgroundColor: 'rgba(239,68,68,0.05)', padding: '6px 10px', borderRadius: '6px', fontWeight: 'bold' }}>
                      <Clock size={14} />
                      <span>
                        {auc.status === 'active' ? `Remaining: ${hoursLeft}h ${showMins}m` : 'Resolved'}
                      </span>
                    </div>

                    {/* Place bid input form */}
                    {auc.status === 'active' && (
                      <form 
                        onSubmit={async (e) => {
                          e.preventDefault();
                          const amt = Number(biddingAmount);
                          if (!amt || amt <= auc.highestBid) {
                            alert(`Bid must be greater than current highest bid of ₹${auc.highestBid}`);
                            return;
                          }
                          try {
                            const res = await fetch(`${apiUrl}/auctions/${auc._id}/bid`, {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                              },
                              body: JSON.stringify({ amount: amt })
                            });
                            if (res.ok) {
                              alert('Bid placed successfully!');
                              setBiddingAmount('');
                              fetchAuctions();
                              // Refresh user wallet
                              updateWallet(0, 'refresh');
                            } else {
                              const errData = await res.json();
                              alert(errData.message || 'Failed to place bid');
                            }
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                        style={{ display: 'flex', gap: '6px', marginTop: '6px' }}
                      >
                        <input 
                          type="number"
                          className="form-input"
                          style={{ fontSize: '12px', padding: '6px', flex: 1 }}
                          placeholder={`Min ₹${auc.highestBid + 10}`}
                          value={selectedAuctionId === auc._id ? biddingAmount : ''}
                          onFocus={() => setSelectedAuctionId(auc._id)}
                          onChange={(e) => setBiddingAmount(e.target.value)}
                          required
                        />
                        <button type="submit" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '12px' }}>
                          Bid ₹/Quintal
                        </button>
                      </form>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECURE STEPPED ESCROW CHECKOUT MODAL */}
      {selectedCropForCheckout && (
        <div className="modal-overlay" onClick={() => setSelectedCropForCheckout(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', width: '92%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>
                Escrow Checkout: {selectedCropForCheckout.name} (Step {checkoutStep}/5)
              </h3>
              <button onClick={() => setSelectedCropForCheckout(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* STEP 1: Address */}
            {checkoutStep === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label>Consignee Full Name</label>
                  <input type="text" className="form-input" value={deliveryAddress.name} onChange={(e) => setDeliveryAddress(prev => ({ ...prev, name: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>Wholesale Delivery Address</label>
                  <input type="text" className="form-input" value={deliveryAddress.address} onChange={(e) => setDeliveryAddress(prev => ({ ...prev, address: e.target.value }))} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label>District</label>
                    <input type="text" className="form-input" value={deliveryAddress.district} onChange={(e) => setDeliveryAddress(prev => ({ ...prev, district: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label>Pincode</label>
                    <input type="text" className="form-input" value={deliveryAddress.pincode} onChange={(e) => setDeliveryAddress(prev => ({ ...prev, pincode: e.target.value }))} required />
                  </div>
                </div>
                <button onClick={() => setCheckoutStep(2)} className="btn btn-primary" style={{ padding: '12px', marginTop: '10px' }}>
                  Proceed to Shipping Method
                </button>
              </div>
            )}

            {/* STEP 2: Logistics */}
            {checkoutStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4>Choose Delivery Transportation</h4>
                <div 
                  onClick={() => setLogisticsSpeed('express')}
                  style={{ padding: '12px', border: `2px solid ${logisticsSpeed === 'express' ? 'var(--forest-green)' : 'var(--border-color)'}`, borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div>
                    <strong>Express Mandi Freight Delivery</strong>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>ETA: 1-2 Days • Insured Cold Carriage</div>
                  </div>
                  <strong>₹1,200</strong>
                </div>
                <div 
                  onClick={() => setLogisticsSpeed('standard')}
                  style={{ padding: '12px', border: `2px solid ${logisticsSpeed === 'standard' ? 'var(--forest-green)' : 'var(--border-color)'}`, borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div>
                    <strong>Standard APMC Freight Transport</strong>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>ETA: 3-5 Days • Open Bed Tata Lorry</div>
                  </div>
                  <strong>₹500</strong>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button onClick={() => setCheckoutStep(1)} className="btn btn-secondary" style={{ flex: 1 }}>Back</button>
                  <button onClick={() => setCheckoutStep(3)} className="btn btn-primary" style={{ flex: 1 }}>Proceed to Payment</button>
                </div>
              </div>
            )}

            {/* STEP 3: Payment */}
            {checkoutStep === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4>Escrow Wallet Payment</h4>
                <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>
                  <div>Crop Price: <strong>₹{selectedCropForCheckout.price} / Quintal</strong></div>
                  <div>Quantity: <strong>{checkoutQtyQuintals} Quintals</strong></div>
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '6px', marginTop: '6px', fontWeight: 'bold', fontSize: '14px', color: 'var(--forest-green)' }}>
                    Total Deductible: ₹{(selectedCropForCheckout.price * checkoutQtyQuintals).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Available Wallet Balance: ₹{user?.walletBalance.toLocaleString()}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button onClick={() => setCheckoutStep(2)} className="btn btn-secondary" style={{ flex: 1 }}>Back</button>
                  <button 
                    onClick={() => {
                      if (user?.walletBalance < (selectedCropForCheckout.price * checkoutQtyQuintals)) {
                        alert('Insufficient wallet balance. Please top up your wallet first.');
                        return;
                      }
                      setCheckoutStep(4);
                    }} 
                    className="btn btn-primary" 
                    style={{ flex: 1 }}
                  >
                    Pay From Wallet
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: OTP Verification */}
            {checkoutStep === 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4>Security Escrow OTP</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>We've sent a mock verification code. Type **1234** to verify the B2B purchase contract.</p>
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '18px', fontWeight: 'bold' }} 
                  placeholder="e.g. 1234"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                />
                <button 
                  onClick={async () => {
                    if (otpCode !== '1234') {
                      alert('Invalid verification code. Please enter 1234.');
                      return;
                    }
                    // Place order
                    try {
                      const res = await fetch(`${apiUrl}/payments/charge`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                          cropId: selectedCropForCheckout._id,
                          quantity: checkoutQtyQuintals
                        })
                      });
                      if (res.ok) {
                        setCheckoutStep(5);
                        loadOrders();
                        updateWallet(0, 'refresh'); // Reload profile wallet
                      } else {
                        const err = await res.json();
                        alert(err.message || 'Order failed');
                      }
                    } catch (err) {
                      console.error(err);
                    }
                  }} 
                  className="btn btn-primary" 
                  style={{ padding: '12px', marginTop: '10px' }}
                >
                  Verify & Settle Escrow Contract
                </button>
              </div>
            )}

            {/* STEP 5: Success */}
            {checkoutStep === 5 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '10px 0', textAlign: 'center' }}>
                <CheckCircle2 size={48} color="var(--emerald)" />
                <h4 style={{ margin: 0 }}>Wholesale Transaction Complete!</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Escrow settlement initialized. Farmers will dispatch produce within 24 hours. Track delivery in the "My Orders" tab.
                </p>
                <button 
                  onClick={() => {
                    setSelectedCropForCheckout(null);
                    setCheckoutStep(1);
                    setCart([]);
                    setActiveSubTab('orders');
                  }} 
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '12px', marginTop: '10px' }}
                >
                  Close & View Order Tracker
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONTACT FARMER & COMMUNICATION MODAL */}
      {contactFarmerCrop && (
        <div className="modal-overlay" onClick={() => setContactFarmerCrop(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px', width: '92%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img 
                  src={contactFarmerCrop.farmer?.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80'} 
                  alt={contactFarmerCrop.farmer?.name} 
                  style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }} 
                />
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px' }}>Contact {contactFarmerCrop.farmer?.name || 'Producer Farmer'}</h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Crop: <strong>{contactFarmerCrop.name}</strong> • Rate: ₹{contactFarmerCrop.price}/Quintal
                  </span>
                </div>
              </div>
              <button onClick={() => setContactFarmerCrop(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            {/* Quick Contact Buttons Row */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {/* WhatsApp Button */}
              <a 
                href={`https://wa.me/${(contactFarmerCrop.farmer?.whatsapp || '919845012345').replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(contactFarmerCrop.farmer?.name || 'Farmer')},%20I%20am%20interested%20in%20purchasing%20bulk%20${encodeURIComponent(contactFarmerCrop.name)}%20at%20₹${contactFarmerCrop.price}/Quintal.`}
                target="_blank"
                rel="noreferrer"
                className="btn"
                style={{ backgroundColor: '#25D366', color: '#ffffff', fontSize: '12px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', fontWeight: 'bold' }}
              >
                <MessageCircle size={16} /> WhatsApp Chat Direct
              </a>

              {/* Mobile Phone Call */}
              <a 
                href={`tel:${contactFarmerCrop.farmer?.phone || '+919845012345'}`}
                className="btn btn-outline"
                style={{ fontSize: '12px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
              >
                <PhoneCall size={16} /> Call {contactFarmerCrop.farmer?.phone || '+91 9845012345'}
              </a>

              {/* Direct Email */}
              <a 
                href={`mailto:${contactFarmerCrop.farmer?.email || 'farmer@kisanmail.in'}?subject=B2B%20Order%20Inquiry%20for%20${encodeURIComponent(contactFarmerCrop.name)}`}
                className="btn btn-outline"
                style={{ fontSize: '12px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
              >
                <Mail size={16} /> Send Email
              </a>
            </div>

            {/* Communication Tabs (In-App Chat | Request Callback | Price Bargain | Bulk Order Inquiry) */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '14px' }}>
              <button 
                onClick={() => setContactTab('chat')}
                style={{ padding: '6px 12px', borderRadius: '14px', fontSize: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer', backgroundColor: contactTab === 'chat' ? 'var(--forest-green)' : 'transparent', color: contactTab === 'chat' ? '#fff' : 'var(--text-secondary)' }}
              >
                In-App Chat
              </button>
              <button 
                onClick={() => setContactTab('negotiate')}
                style={{ padding: '6px 12px', borderRadius: '14px', fontSize: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer', backgroundColor: contactTab === 'negotiate' ? 'var(--forest-green)' : 'transparent', color: contactTab === 'negotiate' ? '#fff' : 'var(--text-secondary)' }}
              >
                Price Bargain Request
              </button>
              <button 
                onClick={() => setContactTab('bulk')}
                style={{ padding: '6px 12px', borderRadius: '14px', fontSize: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer', backgroundColor: contactTab === 'bulk' ? 'var(--forest-green)' : 'transparent', color: contactTab === 'bulk' ? '#fff' : 'var(--text-secondary)' }}
              >
                Bulk Order Inquiry
              </button>
              <button 
                onClick={() => setContactTab('callback')}
                style={{ padding: '6px 12px', borderRadius: '14px', fontSize: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer', backgroundColor: contactTab === 'callback' ? 'var(--forest-green)' : 'transparent', color: contactTab === 'callback' ? '#fff' : 'var(--text-secondary)' }}
              >
                Request Callback
              </button>
            </div>

            {/* TAB 1: IN-APP CHAT */}
            {contactTab === 'chat' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ height: '180px', overflowY: 'auto', backgroundColor: 'var(--bg-primary)', padding: '12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {chatLog.map((msg, i) => (
                    <div key={i} style={{ alignSelf: msg.sender === 'buyer' ? 'flex-end' : 'flex-start', backgroundColor: msg.sender === 'buyer' ? 'var(--forest-green)' : 'var(--bg-secondary)', color: msg.sender === 'buyer' ? '#ffffff' : 'var(--text-primary)', padding: '8px 12px', borderRadius: '12px', maxWidth: '80%', fontSize: '12px' }}>
                      <div>{msg.text}</div>
                      <div style={{ fontSize: '9px', opacity: 0.8, textAlign: 'right', marginTop: '2px' }}>{msg.time}</div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendChatMessage} style={{ display: 'flex', gap: '6px' }}>
                  <input type="text" placeholder="Type message to farmer..." className="form-input" style={{ fontSize: '12px' }} value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} required />
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 14px' }}><Send size={14} /></button>
                </form>
              </div>
            )}

            {/* TAB 2: PRICE BARGAIN REQUEST */}
            {contactTab === 'negotiate' && (
              <form onSubmit={(e) => { e.preventDefault(); alert(`Price Bargain proposal of ₹${proposedPrice}/Quintal sent to ${contactFarmerCrop.farmer?.name}!`); setContactFarmerCrop(null); }} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="form-group">
                  <label>Proposed Counter Rate (Current Listed: ₹{contactFarmerCrop.price}/Quintal)</label>
                  <input type="number" className="form-input" placeholder="e.g. ₹3600" value={proposedPrice} onChange={(e) => setProposedPrice(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Quantity Required (Quintals)</label>
                  <input type="number" className="form-input" value={proposedQty} onChange={(e) => setProposedQty(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Payment Terms Preference</label>
                  <input type="text" className="form-input" value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ padding: '10px' }}>Send Price Bargain Request</button>
              </form>
            )}

            {/* TAB 3: BULK ORDER INQUIRY */}
            {contactTab === 'bulk' && (
              <form onSubmit={(e) => { e.preventDefault(); alert(`Bulk Order inquiry for ${proposedQty} Quintals sent to farmer!`); setContactFarmerCrop(null); }} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="form-group">
                  <label>Bulk Order Quantity (Quintals)</label>
                  <input type="number" className="form-input" value={proposedQty} onChange={(e) => setProposedQty(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Delivery Warehouse Location</label>
                  <input type="text" className="form-input" value={deliveryLocation} onChange={(e) => setDeliveryLocation(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Expected Delivery Date</label>
                  <input type="date" className="form-input" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary" style={{ padding: '10px' }}>Submit Bulk Order Request</button>
              </form>
            )}

            {/* TAB 4: REQUEST CALLBACK */}
            {contactTab === 'callback' && (
              <form onSubmit={(e) => { e.preventDefault(); alert(`Callback request scheduled with ${contactFarmerCrop.farmer?.name} for ${callbackTime}!`); setContactFarmerCrop(null); }} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="form-group">
                  <label>Your Phone Number for Call</label>
                  <input type="text" className="form-input" value={callbackPhone} onChange={(e) => setCallbackPhone(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Preferred Time Window</label>
                  <select className="form-input" value={callbackTime} onChange={(e) => setCallbackTime(e.target.value)}>
                    <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
                    <option value="Afternoon (12 PM - 4 PM)">Afternoon (12 PM - 4 PM)</option>
                    <option value="Evening (4 PM - 8 PM)">Evening (4 PM - 8 PM)</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary" style={{ padding: '10px' }}>Request Immediate Callback</button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    padding: '20px 20px 50px 20px',
    maxWidth: '1380px',
    margin: '0 auto',
    width: '100%',
    textAlign: 'left'
  },
  stickyHeader: {
    position: 'sticky',
    top: '70px',
    zIndex: 90,
    backgroundColor: 'var(--bg-secondary)',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
    boxShadow: 'var(--shadow-md)',
    backdropFilter: 'blur(10px)'
  },
  headerTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px'
  },
  b2bTitle: {
    fontSize: '20px',
    fontWeight: '800',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontFamily: 'var(--header-font)'
  },
  b2bBadge: {
    fontSize: '10px',
    fontWeight: 'bold',
    backgroundColor: 'var(--forest-green)',
    color: '#ffffff',
    padding: '2px 8px',
    borderRadius: '6px'
  },
  headerIconBtn: {
    position: 'relative',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    padding: '8px 12px',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  notifBadgeCount: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    fontSize: '9px',
    fontWeight: 'bold',
    borderRadius: '50%',
    width: '16px',
    height: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'var(--bg-primary)',
    padding: '8px 14px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)'
  },
  heroSearchInput: {
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    width: '100%',
    color: 'var(--text-primary)',
    fontSize: '14px'
  },
  clearSearchBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-secondary)'
  },
  searchMediaBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  suggestionsDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '16px',
    marginTop: '6px',
    zIndex: 100,
    boxShadow: 'var(--shadow-lg)'
  },
  suggestionSection: {
    marginBottom: '10px'
  },
  suggestionTitle: {
    fontSize: '11px',
    fontWeight: 'bold',
    color: 'var(--text-secondary)',
    marginBottom: '6px',
    display: 'block'
  },
  pillRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  pill: {
    fontSize: '11px',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    padding: '4px 10px',
    borderRadius: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  trendingPill: {
    fontSize: '11px',
    backgroundColor: 'var(--green-glow)',
    border: '1px solid rgba(16,185,129,0.3)',
    color: 'var(--forest-green)',
    fontWeight: 'bold',
    padding: '4px 10px',
    borderRadius: '14px',
    cursor: 'pointer'
  },
  subTabs: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    paddingBottom: '4px'
  },
  subTabBtn: {
    padding: '8px 16px',
    borderRadius: '20px',
    border: '1px solid var(--border-color)',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s ease'
  },
  b2bLayoutWrapper: {
    display: 'grid',
    gridTemplateColumns: '270px 1fr',
    gap: '20px',
    alignItems: 'start'
  },
  filterSidebar: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    position: 'sticky',
    top: '210px'
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  filterLabel: {
    fontSize: '11px',
    fontWeight: 'bold',
    color: 'var(--text-secondary)'
  },
  filterSelect: {
    fontSize: '12px',
    padding: '6px 10px'
  },
  mainGridArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '20px'
  },
  cropCard: {
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  cropImg: {
    width: '100%',
    height: '160px',
    objectFit: 'cover'
  },
  cardBody: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    flexGrow: 1
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  farmerLine: {
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'var(--text-secondary)'
  },
  cropSpecs: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  specItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    color: 'var(--text-secondary)'
  },
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '4px',
    paddingTop: '8px',
    borderTop: '1px solid var(--border-color)'
  }
};
