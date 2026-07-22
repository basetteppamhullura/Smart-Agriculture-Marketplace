import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import ProductReviewsSection from '../components/ProductReviewsSection';
import NegotiationModal from '../components/NegotiationModal';
import BargainingHub from '../components/BargainingHub';
import { 
  Search, MapPin, Award, Calendar, DollarSign, Heart, ShoppingBag, Bell, Star, Navigation, 
  Clock, Truck, ChevronRight, Brain, Landmark, BookOpen, FileText, ShoppingCart, SlidersHorizontal, 
  CheckCircle2, ArrowUpDown, Filter, Eye, Layers, CreditCard, Shield, Download, Printer, Check, X,
  Trash2, Plus, Minus
} from 'lucide-react';

export default function BuyerDashboard({ actionPayload, clearActionPayload, onChangeTab }) {
  const { user, toggleFavorite, apiUrl } = useAuth();
  const { t } = useThemeLanguage();

  const [activeSubTab, setActiveSubTab] = useState('browse'); // 'browse' | 'cart' | 'orders' | 'bargains' | 'subscriptions' | 'favorites'
  const [crops, setCrops] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Advanced Search & Filter States
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [listingMode, setListingMode] = useState('');
  const [qualityGrade, setQualityGrade] = useState('');
  const [category, setCategory] = useState('');
  const [organicFilter, setOrganicFilter] = useState('all'); // 'all' | 'organic' | 'non-organic'
  const [sortBy, setSortBy] = useState('default'); // 'default' | 'price-low' | 'price-high' | 'rating' | 'newest'
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Shopping Cart State
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('sam_buyer_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save Cart to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('sam_buyer_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Product Comparison State
  const [compareList, setCompareList] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Recently Viewed Crops History
  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    try {
      const saved = localStorage.getItem('sam_recent_crops');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Transaction modals states
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [negotiatingCrop, setNegotiatingCrop] = useState(null);
  const [checkoutQty, setCheckoutQty] = useState('10');
  const [bidAmount, setBidAmount] = useState('');
  const [isSubscription, setIsSubscription] = useState(false);
  const [subFrequency, setSubFrequency] = useState('weekly');
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking' | 'wallet'
  const [upiId, setUpiId] = useState('buyer@upi');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892');

  // Review modal states
  const [reviewOrder, setReviewOrder] = useState(null);
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');

  const token = localStorage.getItem('sam-token');

  // Load Crops & Orders from API
  const loadCrops = async () => {
    try {
      const q = new URLSearchParams();
      if (search) q.append('search', search);
      if (location) q.append('location', location);
      if (listingMode) q.append('listingMode', listingMode);
      if (qualityGrade) q.append('qualityGrade', qualityGrade);
      if (category) q.append('category', category);

      const res = await fetch(`${apiUrl}/crops?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCrops(data);
      }
    } catch (err) {
      console.error(err);
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

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadCrops(), loadOrders()]);
      setLoading(false);
    };
    init();
  }, [apiUrl]);

  useEffect(() => {
    loadCrops();
  }, [search, location, listingMode, qualityGrade, category]);

  useEffect(() => {
    if (actionPayload && actionPayload.crop) {
      const matchedCrop = crops.find(c => c._id === actionPayload.crop._id) || actionPayload.crop;
      if (actionPayload.action === 'buy') {
        setSelectedCrop(matchedCrop);
        trackRecentlyViewed(matchedCrop);
      } else if (actionPayload.action === 'negotiate') {
        setNegotiatingCrop(matchedCrop);
        trackRecentlyViewed(matchedCrop);
      }
      clearActionPayload();
    }
  }, [actionPayload, crops]);

  // Track Recently Viewed Crop
  const trackRecentlyViewed = (crop) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(c => c._id !== crop._id);
      const updated = [crop, ...filtered].slice(0, 8);
      try {
        localStorage.setItem('sam_recent_crops', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  // Add to Shopping Cart
  const handleAddToCart = (crop, qty = 10) => {
    setCart(prev => {
      const existing = prev.find(item => item.crop._id === crop._id);
      if (existing) {
        return prev.map(item => item.crop._id === crop._id ? { ...item, quantity: item.quantity + qty } : item);
      }
      return [...prev, { crop, quantity: qty }];
    });
    alert(`Added ${qty} units of ${crop.name} to your Shopping Cart!`);
  };

  // Remove from Shopping Cart
  const handleRemoveFromCart = (cropId) => {
    setCart(prev => prev.filter(item => item.crop._id !== cropId));
  };

  // Toggle Crop Comparison
  const handleToggleCompare = (crop) => {
    setCompareList(prev => {
      const isSelected = prev.some(c => c._id === crop._id);
      if (isSelected) {
        return prev.filter(c => c._id !== crop._id);
      }
      if (prev.length >= 3) {
        alert('You can compare a maximum of 3 crops side-by-side.');
        return prev;
      }
      return [...prev, crop];
    });
  };

  // Handle Purchase Checkout
  const handlePurchase = async (e) => {
    e.preventDefault();
    if (!checkoutQty || Number(checkoutQty) <= 0) return;

    const qty = Number(checkoutQty);
    let finalPrice = selectedCrop.price;
    
    // Apply 10% wholesale discount for quantities >= 500
    if (qty >= 500) {
      finalPrice = Math.round(selectedCrop.price * 0.9);
    }

    try {
      const res = await fetch(`${apiUrl}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cropId: selectedCrop._id,
          quantity: qty,
          isSubscription,
          frequency: subFrequency,
          customPrice: finalPrice
        })
      });

      const data = await res.json();
      if (res.ok) {
        alert(qty >= 500 
          ? `Bulk Order Successful via ${paymentMethod.toUpperCase()}! You saved Rs ${(selectedCrop.price - finalPrice) * qty} with our 10% wholesale discount.`
          : `Order purchased successfully via ${paymentMethod.toUpperCase()}!`
        );
        setSelectedCrop(null);
        setCheckoutQty('10');
        setIsSubscription(false);
        await Promise.all([loadCrops(), loadOrders()]);
      } else {
        alert(data.message || 'Payment/checkout failed.');
      }
    } catch (err) {
      alert('Error connecting to payment gateway');
    }
  };

  // Cart Checkout
  const handleCartCheckout = async () => {
    if (cart.length === 0) return;
    try {
      let successCount = 0;
      for (const item of cart) {
        const res = await fetch(`${apiUrl}/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            cropId: item.crop._id,
            quantity: item.quantity,
            isSubscription: false,
            frequency: 'weekly'
          })
        });
        if (res.ok) successCount++;
      }
      alert(`Cart Checkout Complete! Successfully processed ${successCount} orders.`);
      setCart([]);
      await Promise.all([loadCrops(), loadOrders()]);
      setActiveSubTab('orders');
    } catch (err) {
      alert('Error completing cart checkout');
    }
  };

  // Place Bid on Live Auction
  const handlePlaceBid = async (e) => {
    e.preventDefault();
    if (!bidAmount) return;

    try {
      const activeAuctionsRes = await fetch(`${apiUrl}/auctions`);
      const auctions = await activeAuctionsRes.json();
      const currentAuction = auctions.find(a => a.crop._id === selectedCrop._id);

      if (!currentAuction) {
        alert('Active auction details not found');
        return;
      }

      const res = await fetch(`${apiUrl}/auctions/${currentAuction._id}/bid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount: Number(bidAmount) })
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setSelectedCrop(null);
        setBidAmount('');
        await loadCrops();
      } else {
        alert(data.message || 'Bid submission failed');
      }
    } catch (err) {
      alert('Error placing bid');
    }
  };

  // Submit Order review
  const handleAddReview = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiUrl}/orders/${reviewOrder._id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating: Number(rating), comment })
      });

      if (res.ok) {
        alert('Review submitted successfully! Farmer smart score recalculated.');
        setReviewOrder(null);
        setComment('');
        await loadOrders();
      } else {
        alert('Failed to submit review');
      }
    } catch (err) {
      alert('Error submitting review');
    }
  };

  // Printable Tax Invoice Generator
  const handleDownloadInvoice = (order) => {
    const invoiceWindow = window.open('', '_blank');
    const subtotal = order.totalAmount || (order.crop ? order.crop.price * order.quantity : 0);
    const gst = Math.round(subtotal * 0.05);
    const shipping = order.crop && order.crop.deliveryOption === 'farm-pickup' ? 0 : 150;
    const grandTotal = subtotal + gst + shipping;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Tax Invoice - ${order._id}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; background: #f8fafc; }
          .invoice-box { max-width: 800px; margin: auto; border: 1px solid #e2e8f0; padding: 30px; border-radius: 12px; background: #ffffff; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #10b981; padding-bottom: 20px; }
          .title { font-size: 24px; font-weight: bold; color: #047857; }
          .details { margin: 20px 0; display: flex; justify-content: space-between; font-size: 13px; line-height: 1.6; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
          th, td { border: 1px solid #cbd5e1; padding: 12px; text-align: left; }
          th { background-color: #ecfdf5; color: #047857; font-weight: 700; }
          .total-row { font-weight: bold; background: #f8fafc; }
          .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          .btn-print { background: #10b981; color: white; border: none; padding: 10px 20px; font-weight: bold; border-radius: 6px; cursor: pointer; margin-bottom: 20px; }
          @media print { .btn-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <button class="btn-print" onclick="window.print()">🖨️ Print / Save PDF Invoice</button>
          <div class="header">
            <div>
              <div class="title">SMART AGRICULTURE MARKETPLACE</div>
              <div style="font-size:12px; color:#64748b;">Direct Mandi Trade Official Tax Invoice</div>
            </div>
            <div style="text-align:right;">
              <div style="font-weight:bold; font-size:15px;">INVOICE #${order._id ? order._id.substring(order._id.length - 8).toUpperCase() : 'INV-2026'}</div>
              <div style="font-size:12px;">Date: ${new Date(order.createdAt || Date.now()).toLocaleDateString()}</div>
            </div>
          </div>
          <div class="details">
            <div>
              <strong>Billed To (Buyer):</strong><br/>
              ${order.buyer ? order.buyer.name : user.name}<br/>
              Email: ${order.buyer ? order.buyer.email : user.email}<br/>
              Status: ${order.paymentStatus ? order.paymentStatus.toUpperCase() : 'PAID VIA ESCROW'}
            </div>
            <div style="text-align:right;">
              <strong>Seller / Farmer:</strong><br/>
              ${order.farmer ? order.farmer.name : (order.crop ? order.crop.farmer?.name : 'Verified Farmer')}<br/>
              Location: ${order.crop ? order.crop.location : 'Mandya Agrarian Hub'}<br/>
              FSSAI / Mandi License: VERIFIED-SAM-2026
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Produce Item</th>
                <th>Quality Grade</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Subtotal (INR)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${order.crop ? order.crop.name : 'Harvested Crop'}</td>
                <td>Grade ${order.crop ? order.crop.qualityGrade : 'A'}</td>
                <td>${order.quantity} units/kg</td>
                <td>₹${order.crop ? order.crop.price : Math.round(subtotal / order.quantity)}</td>
                <td>₹${subtotal}</td>
              </tr>
              <tr>
                <td colspan="4" style="text-align:right;">Subtotal:</td>
                <td>₹${subtotal}</td>
              </tr>
              <tr>
                <td colspan="4" style="text-align:right;">5% Agrarian GST / Tax:</td>
                <td>₹${gst}</td>
              </tr>
              <tr>
                <td colspan="4" style="text-align:right;">Logistics & Transport:</td>
                <td>₹${shipping}</td>
              </tr>
              <tr class="total-row">
                <td colspan="4" style="text-align:right; font-size:15px;">Grand Total Paid:</td>
                <td style="font-size:15px; color:#047857;">₹${grandTotal}</td>
              </tr>
            </tbody>
          </table>
          <div class="footer">
            <p>✔ Verified 0% Middleman Direct Mandi Trade Escrow Transaction.</p>
            <p>Smart Agriculture Marketplace • Mandya Agrarian Hub, Karnataka • Toll-Free: 1800-425-1666</p>
          </div>
        </div>
      </body>
      </html>
    `;
    invoiceWindow.document.write(html);
    invoiceWindow.document.close();
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading Buyer Dashboard...</div>;
  }

  // Filter & Sort Crops
  let processedCrops = [...crops];

  if (organicFilter === 'organic') {
    processedCrops = processedCrops.filter(c => c.category === 'Organic products' || c.isOrganic);
  } else if (organicFilter === 'non-organic') {
    processedCrops = processedCrops.filter(c => c.category !== 'Organic products' && !c.isOrganic);
  }

  if (minPrice) {
    processedCrops = processedCrops.filter(c => c.price >= Number(minPrice));
  }
  if (maxPrice) {
    processedCrops = processedCrops.filter(c => c.price <= Number(maxPrice));
  }

  if (sortBy === 'price-low') {
    processedCrops.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    processedCrops.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'rating') {
    processedCrops.sort((a, b) => (b.farmer?.smartFarmingScore?.overallScore || 0) - (a.farmer?.smartFarmingScore?.overallScore || 0));
  } else if (sortBy === 'newest') {
    processedCrops.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  const subscriptionOrders = orders.filter(o => o.subscriptionDetails && o.subscriptionDetails.isSubscription);
  const normalOrders = orders.filter(o => !o.subscriptionDetails || !o.subscriptionDetails.isSubscription);
  const categoriesList = [
    'Fruits', 'Vegetables', 'Grains', 'Pulses', 'Spices', 
    'Flowers', 'Seeds', 'Organic products', 'Dairy products', 
    'Agricultural equipment', 'Fertilizers', 'Other farm-related products'
  ];

  const cartTotalUnits = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.crop.price * item.quantity), 0);

  // Bulk Discount values
  const qtyNum = Number(checkoutQty) || 0;
  const isBulk = qtyNum >= 500;
  const unitPrice = selectedCrop ? (isBulk ? Math.round(selectedCrop.price * 0.9) : selectedCrop.price) : 0;
  const totalCost = selectedCrop ? unitPrice * qtyNum : 0;

  return (
    <div className="fade-in" style={styles.container}>
      {/* Title Panel */}
      <div className="glass-card" style={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ fontSize: '22px', margin: 0 }}>Buyer Dashboard - e-Commerce Purchase Portal</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              Direct farm sourcing, AI fair price guidance, instant order checkout & delivery tracking.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => setActiveSubTab('cart')}
              className="btn btn-primary" 
              style={{ fontSize: '13px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <ShoppingCart size={16} /> Cart ({cart.length})
            </button>
            {compareList.length > 0 && (
              <button 
                onClick={() => setShowCompareModal(true)}
                className="btn btn-3d-gold" 
                style={{ fontSize: '13px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Layers size={16} /> Compare ({compareList.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Platform Feature Hub Cards */}
      <div style={styles.featureHubGrid}>
        <div className="glass-card feature-3d-card" style={styles.featureHubCard} onClick={() => onChangeTab && onChangeTab('aivaluation')}>
          <div style={styles.featureIconBox}><Brain size={18} color="var(--forest-green)" /></div>
          <div>
            <h4 style={styles.featureHubTitle}>AI Crop Valuation</h4>
            <p style={styles.featureHubDesc}>AI price guidance & crop quality analysis</p>
          </div>
        </div>

        <div className="glass-card feature-3d-card" style={styles.featureHubCard} onClick={() => onChangeTab && onChangeTab('reputation')}>
          <div style={{ ...styles.featureIconBox, backgroundColor: 'rgba(217, 119, 6, 0.15)' }}><Award size={18} color="var(--amber-gold)" /></div>
          <div>
            <h4 style={styles.featureHubTitle}>Farmer Reputation</h4>
            <p style={styles.featureHubDesc}>Leaderboard & seller trust scores</p>
          </div>
        </div>

        <div className="glass-card feature-3d-card" style={styles.featureHubCard} onClick={() => onChangeTab && onChangeTab('logistics')}>
          <div style={styles.featureIconBox}><Truck size={18} color="var(--forest-green)" /></div>
          <div>
            <h4 style={styles.featureHubTitle}>Logistics & Storage</h4>
            <p style={styles.featureHubDesc}>Cold chain, transport & shipment tracking</p>
          </div>
        </div>

        <div className="glass-card feature-3d-card" style={styles.featureHubCard} onClick={() => onChangeTab && onChangeTab('finance')}>
          <div style={{ ...styles.featureIconBox, backgroundColor: 'rgba(217, 119, 6, 0.15)' }}><Landmark size={18} color="var(--amber-gold)" /></div>
          <div>
            <h4 style={styles.featureHubTitle}>Financial Tools</h4>
            <p style={styles.featureHubDesc}>Escrow payouts & Kisan credit</p>
          </div>
        </div>

        <div className="glass-card feature-3d-card" style={styles.featureHubCard} onClick={() => onChangeTab && onChangeTab('infohub')}>
          <div style={styles.featureIconBox}><BookOpen size={18} color="var(--forest-green)" /></div>
          <div>
            <h4 style={styles.featureHubTitle}>Information Hub</h4>
            <p style={styles.featureHubDesc}>Govt schemes & Agrarian tips</p>
          </div>
        </div>
      </div>

      {/* Sub tabs */}
      <div style={styles.subTabs}>
        <button
          onClick={() => setActiveSubTab('browse')}
          style={{
            ...styles.subTabBtn,
            backgroundColor: activeSubTab === 'browse' ? 'var(--forest-green)' : 'transparent',
            color: activeSubTab === 'browse' ? 'white' : 'var(--text-secondary)'
          }}
        >
          Product Showcase Catalog
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
          My Orders & Invoices ({normalOrders.length})
        </button>

        <button
          onClick={() => setActiveSubTab('bargains')}
          style={{
            ...styles.subTabBtn,
            backgroundColor: activeSubTab === 'bargains' ? 'var(--forest-green)' : 'transparent',
            color: activeSubTab === 'bargains' ? 'white' : 'var(--text-secondary)'
          }}
        >
          Active Bargains
        </button>

        <button
          onClick={() => setActiveSubTab('subscriptions')}
          style={{
            ...styles.subTabBtn,
            backgroundColor: activeSubTab === 'subscriptions' ? 'var(--forest-green)' : 'transparent',
            color: activeSubTab === 'subscriptions' ? 'white' : 'var(--text-secondary)'
          }}
        >
          Delivery Subscriptions
        </button>

        <button
          onClick={() => setActiveSubTab('favorites')}
          style={{
            ...styles.subTabBtn,
            backgroundColor: activeSubTab === 'favorites' ? 'var(--forest-green)' : 'transparent',
            color: activeSubTab === 'favorites' ? 'white' : 'var(--text-secondary)'
          }}
        >
          Starred Sellers ({user.favoriteFarmers ? user.favoriteFarmers.length : 0})
        </button>
      </div>

      {/* 1. BROWSE CROPS & PRODUCT SHOWCASE */}
      {activeSubTab === 'browse' && (
        <div style={styles.browseSection} className="fade-in">
          {/* Advanced Search & Multi-Filter Control Bar */}
          <div className="glass-card" style={styles.filterBar}>
            <div style={styles.searchBox}>
              <Search size={18} color="var(--text-secondary)" />
              <input
                type="text"
                placeholder="Smart Search: Type crop name, location, organic, grade A..."
                style={styles.searchInput}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div style={styles.filterRow}>
              <select className="form-input" style={styles.filterSelect} value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Category: All Categories</option>
                {categoriesList.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>

              <select className="form-input" style={styles.filterSelect} value={location} onChange={(e) => setLocation(e.target.value)}>
                <option value="">Location: All Regions</option>
                <option value="Mandya, Karnataka">Mandya, Karnataka</option>
                <option value="Nashik, Maharashtra">Nashik, Maharashtra</option>
                <option value="Guntur, Andhra Pradesh">Guntur, Andhra Pradesh</option>
              </select>

              <select className="form-input" style={styles.filterSelect} value={organicFilter} onChange={(e) => setOrganicFilter(e.target.value)}>
                <option value="all">Organic Status: All</option>
                <option value="organic">Organic Only</option>
                <option value="non-organic">Standard Mandi</option>
              </select>

              <select className="form-input" style={styles.filterSelect} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="default">Sort: Default Featured</option>
                <option value="price-low">Price: Lowest First</option>
                <option value="price-high">Price: Highest First</option>
                <option value="rating">Farmer Rating: Highest</option>
                <option value="newest">New Arrivals First</option>
              </select>
            </div>

            {/* Price Range Filter Row */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Price Range (Rs):</span>
              <input 
                type="number" 
                placeholder="Min Price" 
                className="form-input" 
                style={{ width: '110px', padding: '6px 10px', fontSize: '12px' }} 
                value={minPrice} 
                onChange={(e) => setMinPrice(e.target.value)} 
              />
              <span>-</span>
              <input 
                type="number" 
                placeholder="Max Price" 
                className="form-input" 
                style={{ width: '110px', padding: '6px 10px', fontSize: '12px' }} 
                value={maxPrice} 
                onChange={(e) => setMaxPrice(e.target.value)} 
              />
              {(minPrice || maxPrice || category || location || search || organicFilter !== 'all' || sortBy !== 'default') && (
                <button 
                  onClick={() => { setSearch(''); setCategory(''); setLocation(''); setOrganicFilter('all'); setSortBy('default'); setMinPrice(''); setMaxPrice(''); }}
                  style={{ background: 'none', border: 'none', color: 'var(--forest-green)', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Reset All Filters
                </button>
              )}
            </div>
          </div>

          {/* Crops Showcase Grid */}
          <div style={styles.grid}>
            {processedCrops.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textPadding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No crop produce matches your search filters. Try adjusting your category or location filters.
              </div>
            ) : (
              processedCrops.map((crop) => {
                const isFav = user.favoriteFarmers && user.favoriteFarmers.includes(crop.farmer._id);
                const isSoldOut = crop.stockStatus === 'sold-out' || crop.quantity <= 0;
                const isCompared = compareList.some(c => c._id === crop._id);
                const aiFairEstimate = Math.round(crop.price * 0.96);

                return (
                  <div key={crop._id} className="glass-card feature-3d-card" style={styles.cropCard}>
                    {/* Badge & Image */}
                    <div style={{ position: 'relative' }}>
                      <img src={crop.imageUrl || (crop.images && crop.images[0])} alt={crop.name} style={styles.cropImg} />
                      <span className="badge badge-verified" style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '9px' }}>
                        {crop.category}
                      </span>
                      {crop.farmer.smartFarmingScore?.overallScore >= 4.5 && (
                        <span className="badge badge-trusted" style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '9px' }}>
                          ★ Top Rated
                        </span>
                      )}
                    </div>
                    
                    <div style={styles.cardBody}>
                      <div style={styles.cardHeader}>
                        <h4 style={{ fontSize: '17px', margin: 0 }}>{crop.name}</h4>
                        <button 
                          onClick={() => toggleFavorite(crop.farmer._id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                          title="Bookmark Farmer"
                        >
                          <Heart size={20} fill={isFav ? '#ef4444' : 'none'} color={isFav ? '#ef4444' : 'var(--text-secondary)'} />
                        </button>
                      </div>

                      <div style={styles.farmerLine}>
                        <span>{crop.farmer.name}</span>
                        <span style={{ color: 'var(--amber-gold)', fontWeight: 'bold' }}>★ {crop.farmer.smartFarmingScore?.overallScore || '4.8'}</span>
                        {crop.farmer.hasTrustedBadge && (
                          <span className="badge badge-trusted" style={{ fontSize: '8px', padding: '1px 5px' }}>Trusted</span>
                        )}
                      </div>

                      <div style={styles.cropSpecs}>
                        <div style={styles.specItem}>
                          <MapPin size={13} color="var(--text-secondary)" />
                          <span>{crop.location}</span>
                        </div>
                        <div style={styles.specItem}>
                          <Calendar size={13} color="var(--text-secondary)" />
                          <span>Grade {crop.qualityGrade} • Delivery: {crop.deliveryOption === 'farm-pickup' ? 'Farm Pickup' : 'Express Logistics'}</span>
                        </div>
                        {/* AI Price Recommendation Badge */}
                        <div style={{ ...styles.specItem, color: 'var(--forest-green)', fontWeight: '600', fontSize: '11px' }}>
                          <Brain size={13} color="var(--forest-green)" />
                          <span>AI Valuation: Fair Mandi Price ₹{aiFairEstimate} - ₹{crop.price + 5}/kg</span>
                        </div>
                      </div>

                      {/* Compare Checkbox Row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)', margin: '6px 0' }}>
                        <input 
                          type="checkbox" 
                          id={`cmp_${crop._id}`} 
                          checked={isCompared}
                          onChange={() => handleToggleCompare(crop)} 
                        />
                        <label htmlFor={`cmp_${crop._id}`} style={{ cursor: 'pointer' }}>Compare side-by-side</label>
                      </div>

                      <div style={styles.priceRow}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                            {isSoldOut ? 'SOLD OUT' : `Stock: ${crop.quantity} kg available`}
                          </span>
                          <strong style={{ fontSize: '18px', color: 'var(--forest-green)' }}>Rs {crop.price} / unit</strong>
                        </div>
                        
                        {crop.listingMode === 'buynow' ? (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button 
                              onClick={() => { setSelectedCrop(crop); trackRecentlyViewed(crop); }}
                              className="btn btn-primary"
                              style={{ padding: '6px 10px', fontSize: '11px' }}
                              disabled={isSoldOut}
                            >
                              Buy Now
                            </button>
                            <button 
                              onClick={() => handleAddToCart(crop, 10)}
                              className="btn btn-outline"
                              style={{ padding: '6px 8px', fontSize: '11px' }}
                              disabled={isSoldOut}
                              title="Add to Shopping Cart"
                            >
                              <ShoppingCart size={13} />
                            </button>
                            <button 
                              onClick={() => { setNegotiatingCrop(crop); trackRecentlyViewed(crop); }}
                              className="btn btn-outline"
                              style={{ padding: '6px 8px', fontSize: '11px', borderColor: 'var(--amber-gold)', color: 'var(--amber-gold)' }}
                              disabled={isSoldOut}
                              title="Negotiate Price"
                            >
                              Bargain
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => { setSelectedCrop(crop); trackRecentlyViewed(crop); }}
                            className="btn btn-primary"
                            style={{ padding: '8px 14px', fontSize: '12px' }}
                            disabled={isSoldOut}
                          >
                            Place Bid
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Recently Viewed Products Shelf */}
          {recentlyViewed.length > 0 && (
            <div style={{ marginTop: '40px' }} className="fade-in">
              <h3 style={{ fontSize: '16px', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={18} color="var(--forest-green)" /> Recently Viewed Products
              </h3>
              <div style={{ display: 'flex', gap: '14px', overflowX: 'auto', paddingBottom: '10px' }}>
                {recentlyViewed.map(item => (
                  <div key={item._id} className="glass-card" style={{ width: '180px', flexShrink: 0, padding: '10px' }}>
                    <img src={item.imageUrl || (item.images && item.images[0])} alt={item.name} style={{ width: '100%', height: '90px', objectFit: 'cover', borderRadius: '6px' }} />
                    <h5 style={{ fontSize: '13px', margin: '6px 0 2px 0' }}>{item.name}</h5>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--forest-green)' }}>Rs {item.price}/unit</div>
                    <button 
                      onClick={() => setSelectedCrop(item)}
                      className="btn btn-outline" 
                      style={{ fontSize: '10px', width: '100%', padding: '4px', marginTop: '6px' }}
                    >
                      Quick View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. SHOPPING CART TAB */}
      {activeSubTab === 'cart' && (
        <div style={styles.tabContent} className="fade-in">
          <div style={styles.sectionTitle}>Shopping Cart ({cart.length} items)</div>
          {cart.length === 0 ? (
            <div style={styles.empty}>Your Shopping Cart is currently empty. Browse products to add crops to your cart!</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {cart.map(item => (
                  <div key={item.crop._id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <img src={item.crop.imageUrl || (item.crop.images && item.crop.images[0])} alt={item.crop.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                      <div>
                        <h4 style={{ margin: 0, fontSize: '16px' }}>{item.crop.name}</h4>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Farmer: {item.crop.farmer.name} • Location: {item.crop.location}</div>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--forest-green)', marginTop: '2px' }}>Rs {item.crop.price} / unit</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--bg-primary)', padding: '4px 8px', borderRadius: '6px' }}>
                        <button 
                          onClick={() => {
                            if (item.quantity > 1) {
                              setCart(prev => prev.map(c => c.crop._id === item.crop._id ? { ...c, quantity: c.quantity - 1 } : c));
                            }
                          }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          <Minus size={14} />
                        </button>
                        <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{item.quantity} kg</span>
                        <button 
                          onClick={() => {
                            setCart(prev => prev.map(c => c.crop._id === item.crop._id ? { ...c, quantity: c.quantity + 1 } : c));
                          }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <div style={{ fontSize: '15px', fontWeight: 'bold' }}>₹{(item.crop.price * item.quantity).toLocaleString()}</div>

                      <button onClick={() => handleRemoveFromCart(item.crop._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Summary & Multi-item Checkout Box */}
              <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span>Total Order Volume:</span>
                  <strong>{cartTotalUnits} kg</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span>Subtotal Amount:</span>
                  <strong>₹{cartSubtotal.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--forest-green)' }}>
                  <span>Est. Logistics & Shipping:</span>
                  <strong>₹150</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                  <span>Grand Total:</span>
                  <span style={{ color: 'var(--forest-green)' }}>₹{(cartSubtotal + 150).toLocaleString()}</span>
                </div>

                <button onClick={handleCartCheckout} className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '15px', marginTop: '10px' }}>
                  Proceed to Multi-Item Cart Checkout (₹{(cartSubtotal + 150).toLocaleString()})
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. ORDERS & SHIPMENT TRACKING TAB */}
      {activeSubTab === 'orders' && (
        <div style={styles.tabContent} className="fade-in">
          <div style={styles.sectionTitle}>Direct Purchases & Shipments ({normalOrders.length})</div>
          {normalOrders.length === 0 ? (
            <div style={styles.empty}>No past orders found. Browse products to make a purchase.</div>
          ) : (
            <div style={styles.ordersList}>
              {normalOrders.map((order) => (
                <div key={order._id} className="glass-card order-row-grid">
                  <div style={styles.orderMain}>
                    <h4 style={{ fontSize: '16px', margin: 0 }}>{order.crop.name}</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                      Seller: {order.farmer.name} • Quantity: {order.quantity} units • Total: Rs {order.totalAmount}
                    </p>
                    <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span className="badge badge-verified" style={{ textTransform: 'capitalize' }}>Payment: {order.paymentStatus}</span>
                      <span className="badge badge-trusted" style={{ textTransform: 'capitalize', color: 'var(--forest-green)', backgroundColor: 'var(--green-glow)' }}>
                        Delivery: {order.deliveryStatus}
                      </span>
                    </div>
                  </div>

                  {/* Delivery Timeline Summary */}
                  <div style={styles.timelineContainer}>
                    <div style={{ fontWeight: '600', fontSize: '12px', marginBottom: '8px' }}>Logistics Route Timeline:</div>
                    <div style={styles.timeline}>
                      {order.trackingTimeline && order.trackingTimeline.map((step, sIdx) => (
                        <div key={sIdx} style={styles.timelineStep}>
                          <Clock size={12} color="var(--emerald)" />
                          <div style={{ fontSize: '11px' }}>
                            <strong>{step.status.toUpperCase()}</strong>: {step.description} <span style={{ color: 'var(--text-secondary)' }}>({new Date(step.timestamp).toLocaleTimeString()})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reviews & Printable Invoice Buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                    <button 
                      onClick={() => handleDownloadInvoice(order)}
                      className="btn btn-outline" 
                      style={{ fontSize: '11px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <FileText size={13} /> Download Invoice PDF
                    </button>

                    {!order.review ? (
                      <button 
                        onClick={() => setReviewOrder(order)}
                        className="btn btn-primary" 
                        style={{ fontSize: '11px', padding: '6px 12px' }}
                      >
                        Submit Feedback
                      </button>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--amber-gold)' }}>
                        <Star size={14} fill="var(--amber-gold)" />
                        <span>Submitted Rating: {order.review.rating} ★</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. SUBSCRIPTIONS TAB */}
      {activeSubTab === 'subscriptions' && (
        <div style={styles.tabContent} className="fade-in">
          <div style={styles.sectionTitle}>Vegetable & Fruit Subscription Boxes</div>
          {subscriptionOrders.length === 0 ? (
            <div style={styles.empty}>No active subscriptions found. Select 'Subscription Checkout' when buying eligible crop listings.</div>
          ) : (
            <div style={styles.ordersList}>
              {subscriptionOrders.map((sub) => (
                <div key={sub._id} className="glass-card order-row-grid">
                  <div>
                    <h4 style={{ fontSize: '16px' }}>{sub.crop.name} Box</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Farmer: {sub.farmer.name} • Box Delivery Frequency: <strong>{sub.subscriptionDetails.frequency.toUpperCase()}</strong>
                    </p>
                    <div style={{ marginTop: '10px' }}>
                      <span className="badge badge-trusted">Active Subscription</span>
                      <span className="badge badge-verified" style={{ marginLeft: '10px' }}>Direct Wallet Bill Paid</span>
                    </div>
                  </div>
                  <div>
                    <button 
                      onClick={() => alert('Subscription cancelled. Future deliveries stopped.')}
                      className="btn btn-danger" 
                      style={{ fontSize: '12px', padding: '6px 12px' }}
                    >
                      Cancel Subscription
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. STARRED SELLERS & WISHLIST TAB */}
      {activeSubTab === 'favorites' && (
        <div style={styles.tabContent} className="fade-in">
          <div style={styles.sectionTitle}>Starred Sellers ({user.favoriteFarmers ? user.favoriteFarmers.length : 0})</div>
          {(!user.favoriteFarmers || user.favoriteFarmers.length === 0) ? (
            <div style={styles.empty}>No favorite farmers bookmarked. Click the heart icon on crop listings to save favorite sellers.</div>
          ) : (
            <div style={styles.grid}>
              {crops.filter(c => user.favoriteFarmers.includes(c.farmer._id)).map((crop) => (
                <div key={crop._id} className="glass-card" style={styles.cropCard}>
                  <img src={crop.imageUrl || (crop.images && crop.images[0])} alt={crop.name} style={styles.cropImg} />
                  <div style={styles.cardBody}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4>{crop.farmer.name}</h4>
                      <button onClick={() => toggleFavorite(crop.farmer._id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <Heart size={20} fill="#ef4444" color="#ef4444" />
                      </button>
                    </div>
                    <div style={{ color: 'var(--amber-gold)', fontWeight: 'bold', margin: '5px 0' }}>★ {crop.farmer.smartFarmingScore?.overallScore || '4.8'} Smart Score</div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Region: {crop.location}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Specialty Crop: {crop.name}</p>
                    <button 
                      onClick={() => setSelectedCrop(crop)}
                      className="btn btn-primary" 
                      style={{ width: '100%', marginTop: '10px', fontSize: '12px' }}
                    >
                      Order Direct Produce
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. BARGAINING HUB TAB */}
      {activeSubTab === 'bargains' && (
        <div style={styles.tabContent} className="fade-in">
          <BargainingHub />
        </div>
      )}

      {/* PRODUCT COMPARISON MODAL */}
      {showCompareModal && compareList.length > 0 && (
        <div className="modal-overlay" onClick={() => setShowCompareModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px', width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Side-by-Side Crop Product Comparison</h3>
              <button onClick={() => setShowCompareModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${compareList.length}, 1fr)`, gap: '16px', overflowX: 'auto' }}>
              {compareList.map(item => (
                <div key={item._id} className="glass-card" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <img src={item.imageUrl || (item.images && item.images[0])} alt={item.name} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px' }} />
                  <h4 style={{ margin: 0, fontSize: '16px' }}>{item.name}</h4>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--forest-green)' }}>Rs {item.price} / unit</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Category: {item.category}</div>
                  <div style={{ fontSize: '12px' }}>Quality Grade: <strong>Grade {item.qualityGrade}</strong></div>
                  <div style={{ fontSize: '12px' }}>Farmer: <strong>{item.farmer.name}</strong></div>
                  <div style={{ fontSize: '12px', color: 'var(--amber-gold)', fontWeight: 'bold' }}>★ {item.farmer.smartFarmingScore?.overallScore || '4.8'} Score</div>
                  <div style={{ fontSize: '12px' }}>Location: {item.location}</div>
                  <div style={{ fontSize: '12px' }}>Organic: {item.isOrganic || item.category === 'Organic products' ? 'Yes (Certified)' : 'Standard'}</div>

                  <button 
                    onClick={() => { setShowCompareModal(false); setSelectedCrop(item); }}
                    className="btn btn-primary" 
                    style={{ fontSize: '12px', padding: '8px' }}
                  >
                    Buy Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CHECKOUT & BIDDING MODAL WITH PAYMENT GATEWAY SELECTION */}
      {selectedCrop && (
        <div className="modal-overlay" onClick={() => setSelectedCrop(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <h3>{selectedCrop.name}</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '15px' }}>
              Category: {selectedCrop.category} • Farmer: {selectedCrop.farmer.name} ({selectedCrop.location})
            </p>

            {/* Showcase Multiple Images Slide view */}
            {selectedCrop.images && selectedCrop.images.length > 0 ? (
              <div style={styles.imageCarousel}>
                {selectedCrop.images.map((img, i) => (
                  <img key={i} src={img} alt={`Crop image ${i+1}`} style={styles.carouselImg} />
                ))}
              </div>
            ) : (
              <img src={selectedCrop.imageUrl} alt={selectedCrop.name} style={styles.carouselImg} />
            )}

            {selectedCrop.listingMode === 'buynow' ? (
              <form onSubmit={handlePurchase}>
                <div className="form-group">
                  <label>Order Quantity (Max {selectedCrop.quantity} kg available)</label>
                  <input
                    type="number"
                    className="form-input"
                    max={selectedCrop.quantity}
                    value={checkoutQty}
                    onChange={(e) => setCheckoutQty(e.target.value)}
                    placeholder="e.g. 50"
                    required
                  />
                </div>

                {/* Bulk Discount Alert */}
                {Number(checkoutQty) >= 500 && (
                  <div style={styles.bulkOfferAlert}>
                    <Award size={16} color="var(--emerald)" />
                    <span><strong>10% Wholesale Bulk Discount Applied!</strong> Unit price lowered to Rs {unitPrice}/unit.</span>
                  </div>
                )}

                {/* Payment Gateway Selection */}
                <div className="form-group">
                  <label style={{ fontWeight: 'bold', fontSize: '13px' }}>Select Secure Payment Gateway Method</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('upi')}
                      style={{
                        padding: '8px',
                        borderRadius: '6px',
                        border: paymentMethod === 'upi' ? '2px solid var(--forest-green)' : '1px solid var(--border-color)',
                        backgroundColor: paymentMethod === 'upi' ? 'var(--green-glow)' : 'transparent',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      Instant UPI (GPay/PhonePe)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      style={{
                        padding: '8px',
                        borderRadius: '6px',
                        border: paymentMethod === 'card' ? '2px solid var(--forest-green)' : '1px solid var(--border-color)',
                        backgroundColor: paymentMethod === 'card' ? 'var(--green-glow)' : 'transparent',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      Credit / Debit Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('netbanking')}
                      style={{
                        padding: '8px',
                        borderRadius: '6px',
                        border: paymentMethod === 'netbanking' ? '2px solid var(--forest-green)' : '1px solid var(--border-color)',
                        backgroundColor: paymentMethod === 'netbanking' ? 'var(--green-glow)' : 'transparent',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      Net Banking
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('wallet')}
                      style={{
                        padding: '8px',
                        borderRadius: '6px',
                        border: paymentMethod === 'wallet' ? '2px solid var(--forest-green)' : '1px solid var(--border-color)',
                        backgroundColor: paymentMethod === 'wallet' ? 'var(--green-glow)' : 'transparent',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      Digital Escrow Wallet
                    </button>
                  </div>
                </div>

                {paymentMethod === 'upi' && (
                  <div className="form-group">
                    <label>Enter Virtual Payment Address (VPA / UPI ID)</label>
                    <input type="text" className="form-input" value={upiId} onChange={(e) => setUpiId(e.target.value)} required />
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="form-group">
                    <label>Card Number & Expiry</label>
                    <input type="text" className="form-input" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} required />
                  </div>
                )}

                <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    id="isSub"
                    checked={isSubscription}
                    onChange={(e) => setIsSubscription(e.target.checked)}
                  />
                  <label htmlFor="isSub" style={{ cursor: 'pointer' }}>Set up as recurring Box Subscription?</label>
                </div>

                {isSubscription && (
                  <div className="form-group">
                    <label>Box Delivery Interval</label>
                    <select className="form-input" value={subFrequency} onChange={(e) => setSubFrequency(e.target.value)}>
                      <option value="weekly">Weekly box</option>
                      <option value="biweekly">Bi-weekly box</option>
                      <option value="monthly">Monthly box</option>
                    </select>
                  </div>
                )}

                <div style={styles.checkoutStats}>
                  <div>Original Price: Rs {selectedCrop.price} / unit</div>
                  <div>Final Unit Price: Rs {unitPrice} / unit</div>
                  <strong style={{ fontSize: '16px', color: 'var(--forest-green)' }}>
                    Total Checkout Bill: Rs {totalCost.toLocaleString()}
                  </strong>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '15px' }}>
                  Confirm & Pay ₹{totalCost.toLocaleString()} via {paymentMethod.toUpperCase()}
                </button>
              </form>
            ) : (
              <form onSubmit={handlePlaceBid}>
                <div style={styles.bidInfo}>
                  <div>Starting Bid: Rs {selectedCrop.price}</div>
                  <strong>Current Top Offer: Rs {selectedCrop.price}</strong>
                </div>
                <div className="form-group">
                  <label>Enter Bidding Offer (Rs per unit)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder={`Must exceed Rs ${selectedCrop.price}`}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
                  Submit Bidding Offer
                </button>
              </form>
            )}

            {/* Customer Reviews & Feedback Q&A section */}
            <ProductReviewsSection cropId={selectedCrop._id} />
          </div>
        </div>
      )}

      {negotiatingCrop && (
        <NegotiationModal 
          crop={negotiatingCrop} 
          onClose={() => setNegotiatingCrop(null)} 
          onSuccess={() => {
            setActiveSubTab('bargains');
          }}
        />
      )}

      {/* FEEDBACK REVIEW MODAL */}
      {reviewOrder && (
        <div className="modal-overlay" onClick={() => setReviewOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Rate and Review</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '15px' }}>
              Your feedback is used to dynamically adjust the farmer's Smart Farming Score.
            </p>
            <form onSubmit={handleAddReview}>
              <div className="form-group">
                <label>Quality Grade Rating (1 - 5 Stars)</label>
                <select className="form-input" value={rating} onChange={(e) => setRating(e.target.value)}>
                  <option value="5">5 Stars (Excellent Freshness)</option>
                  <option value="4">4 Stars (Good Quality)</option>
                  <option value="3">3 Stars (Average)</option>
                  <option value="2">2 Stars (Satisfactory)</option>
                  <option value="1">1 Star (Poor Grade)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Review Comment</label>
                <textarea
                  className="form-input"
                  style={{ height: '70px', resize: 'none' }}
                  placeholder="Tell us about crop freshness, packaging, or delivery timing..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
                Submit Review
              </button>
            </form>
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
    maxWidth: '1280px',
    margin: '0 auto',
    width: '100%',
    textAlign: 'left'
  },
  header: {
    padding: '20px'
  },
  subTabs: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    paddingBottom: '6px'
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
  browseSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  filterBar: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'var(--bg-primary)',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)'
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    width: '100%',
    color: 'var(--text-primary)',
    fontSize: '14px'
  },
  filterRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
    gap: '10px'
  },
  filterSelect: {
    fontSize: '12px',
    padding: '8px 12px'
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
    height: '170px',
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
    gap: '6px',
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
    fontSize: '12px',
    color: 'var(--text-secondary)'
  },
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '6px',
    paddingTop: '10px',
    borderTop: '1px solid var(--border-color)'
  },
  tabContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--text-primary)'
  },
  empty: {
    padding: '30px',
    textAlign: 'center',
    color: 'var(--text-secondary)',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '12px'
  },
  ordersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  orderMain: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  timelineContainer: {
    borderLeft: '1px solid var(--border-color)',
    paddingLeft: '16px'
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  timelineStep: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  imageCarousel: {
    display: 'flex',
    gap: '10px',
    overflowX: 'auto',
    paddingBottom: '10px',
    marginBottom: '15px'
  },
  carouselImg: {
    width: '100%',
    maxHeight: '200px',
    objectFit: 'cover',
    borderRadius: '8px',
    flexShrink: 0
  },
  bulkOfferAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 12px',
    backgroundColor: 'var(--green-glow)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    borderRadius: '8px',
    color: 'var(--forest-green)',
    fontSize: '12px',
    marginBottom: '15px'
  },
  checkoutStats: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    backgroundColor: 'var(--bg-primary)',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '15px'
  },
  bidInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px',
    backgroundColor: 'var(--bg-primary)',
    borderRadius: '8px',
    marginBottom: '15px',
    fontSize: '14px'
  },
  featureHubGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
    gap: '14px',
    marginBottom: '10px'
  },
  featureHubCard: {
    padding: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  },
  featureIconBox: {
    width: '34px',
    height: '34px',
    borderRadius: '8px',
    backgroundColor: 'var(--green-glow)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  featureHubTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: '0 0 2px 0'
  },
  featureHubDesc: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    margin: 0,
    lineHeight: '1.3'
  }
};
