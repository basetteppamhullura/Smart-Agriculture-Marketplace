import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import { useSocket } from '../context/SocketContext';
import AnalyticsChart from '../components/AnalyticsChart';
import BargainingHub from '../components/BargainingHub';
import ChatRooms from '../components/ChatRooms';
import { 
  Plus, Check, DollarSign, Wallet, Sprout, TrendingUp, Info, Edit, Trash2, ShieldAlert, Eye, 
  ShoppingCart, Ban, Award, Brain, Truck, Landmark, BookOpen, Clock, Heart, Star, MapPin, 
  Calendar, CheckCircle2, AlertCircle, FileText, Download, Upload, MessageSquare, PhoneCall,
  RefreshCw, ShieldCheck, Zap, Flame, BarChart2, Sun, CloudRain, Shield
} from 'lucide-react';

export default function FarmerDashboard({ onChangeTab }) {
  const { user, apiUrl } = useAuth();
  const { t } = useThemeLanguage();
  const { subscribe } = useSocket();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Active Sub-Tab Navigation ('listings' | 'upload' | 'negotiations' | 'logistics' | 'finance' | 'analytics' | 'ai-tools' | 'auctions')
  const [activeSubTab, setActiveSubTab] = useState('listings');

  // Form states (Crop Upload & Edit)
  const [editingCropId, setEditingCropId] = useState(null);
  const [cropName, setCropName] = useState('Ragi (Finger Millet)');
  const [category, setCategory] = useState('Grains');
  const [quantity, setQuantity] = useState('250'); // Quintals
  const [minOrderQty, setMinOrderQty] = useState('10'); // Quintals
  const [maxOrderQty, setMaxOrderQty] = useState('100'); // Quintals
  const [grade, setGrade] = useState('A');
  const [price, setPrice] = useState('3250'); // ₹ / Quintal
  const [minAcceptablePrice, setMinAcceptablePrice] = useState('3100'); // ₹ / Quintal
  const [expectedMarketPrice, setExpectedMarketPrice] = useState('3300'); // ₹ / Quintal
  const [harvestDate, setHarvestDate] = useState('2026-07-15');
  const [organicCert, setOrganicCert] = useState('Verified');
  const [district, setDistrict] = useState('Vijayapura');
  const [stateName, setStateName] = useState('Karnataka');
  const [village, setVillage] = useState('Sindagi Hobli');
  const [mainImageUrl, setMainImageUrl] = useState('https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&q=80');
  const [farmImageUrl, setFarmImageUrl] = useState('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500&q=80');
  const [description, setDescription] = useState('Organic Grade A Ragi harvested fresh from Vijayapura farmlands. High nutrition content and ISO quality verified.');

  // AI Dynamic Pricing Recommendation Preview
  const [aiSuggestedPrice, setAiSuggestedPrice] = useState(3275);
  const [aiAdviceBanner, setAiAdviceBanner] = useState('Current market demand is high. Selling at ₹3,300–₹3,400 per quintal may increase profit by 4.2%.');

  // Stock Management Modal State
  const [selectedCropForStockUpdate, setSelectedCropForStockUpdate] = useState(null);
  const [stockAddAmount, setStockAddAmount] = useState('50');

  // Negotiation Counter Offer Modal State
  const [activeNegotiation, setActiveNegotiation] = useState(null);
  const [counterOfferRate, setCounterOfferRate] = useState('3220');

  // AI Disease Scanner Modal State
  const [showDiseaseScanner, setShowDiseaseScanner] = useState(false);
  const [diseaseDiagnosis, setDiseaseDiagnosis] = useState(null);
  const [scannerLoading, setScannerLoading] = useState(false);

  // Expense form states
  const [expCategory, setExpCategory] = useState('Seeds & Fertilizers');
  const [expCost, setExpCost] = useState('');
  const [expDesc, setExpDesc] = useState('');

  // Listing configuration states
  const [listingMode, setListingMode] = useState('buynow');
  const [durationHours, setDurationHours] = useState('24');
  const [isNegotiationEnabled, setIsNegotiationEnabled] = useState(true);
  const [auctions, setAuctions] = useState([]);
  const [shipments, setShipments] = useState([]);

  const token = localStorage.getItem('sam-token');

  // Sample Farmer Products Dataset strictly in ₹/Quintal
  const [sampleFarmerProducts, setSampleFarmerProducts] = useState([
    {
      _id: 'f_crop_1',
      name: 'Ragi (Finger Millet)',
      category: 'Grains',
      qualityGrade: 'Grade A',
      quantity: 250, // Quintals
      reservedStock: 40,
      availableStock: 210,
      minOrder: 10,
      maxOrder: 100,
      price: 3250, // ₹/Quintal
      expectedMarketPrice: 3350,
      minAcceptablePrice: 3100,
      aiSuggestedPrice: 3280,
      auctionStatus: 'Open',
      location: 'Vijayapura, Karnataka',
      harvestDate: '15 July 2026',
      organicCert: 'Verified (ISO)',
      views: 254,
      enquiries: 18,
      ordersCount: 7,
      revenue: 81250,
      rating: 4.8,
      savedCount: 42,
      isPaused: false,
      verificationStatus: 'Verified',
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&q=80',
      aiAdvice: 'Current market demand is high. Selling at ₹3,300–₹3,400 per quintal may increase profit by 4.2%.'
    },
    {
      _id: 'f_crop_2',
      name: 'Sona Masuri Paddy',
      category: 'Grains',
      qualityGrade: 'Grade A+',
      quantity: 850, // Quintals
      reservedStock: 100,
      availableStock: 750,
      minOrder: 20,
      maxOrder: 300,
      price: 3850, // ₹/Quintal
      expectedMarketPrice: 3950,
      minAcceptablePrice: 3700,
      aiSuggestedPrice: 3880,
      auctionStatus: 'Open',
      location: 'Mandya, Karnataka',
      harvestDate: '10 July 2026',
      organicCert: 'Verified',
      views: 512,
      enquiries: 34,
      ordersCount: 15,
      revenue: 185400,
      rating: 4.9,
      savedCount: 88,
      isPaused: false,
      verificationStatus: 'Verified',
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&q=80',
      aiAdvice: 'Mandi spot price rose +₹120 today. Good window to finalize bulk trades.'
    },
    {
      _id: 'f_crop_3',
      name: 'Byadgi Red Chilli',
      category: 'Commercial',
      qualityGrade: 'Export A+',
      quantity: 150, // Quintals
      reservedStock: 20,
      availableStock: 130,
      minOrder: 5,
      maxOrder: 50,
      price: 18500, // ₹/Quintal
      expectedMarketPrice: 19000,
      minAcceptablePrice: 18000,
      aiSuggestedPrice: 18700,
      auctionStatus: 'Open',
      location: 'Shivamogga, Karnataka',
      harvestDate: '01 July 2026',
      organicCert: 'Verified Organic',
      views: 380,
      enquiries: 22,
      ordersCount: 9,
      revenue: 142000,
      rating: 5.0,
      savedCount: 64,
      isPaused: false,
      verificationStatus: 'Verified',
      imageUrl: 'https://images.unsplash.com/photo-1588252303782-77d0069e8b38?w=500&q=80',
      aiAdvice: 'High export buyer activity detected. Maintain current premium rate.'
    }
  ]);

  // B2B Price Bargain Negotiation Offers
  const [b2bNegotiations, setB2bNegotiations] = useState([
    {
      id: 'neg_1',
      buyerName: 'ABC Foods Pvt Ltd',
      cropName: 'Ragi (Finger Millet)',
      requestedQty: 50, // Quintals
      buyerOffer: 3180, // ₹/Quintal
      listedPrice: 3250,
      counterOffer: 3220,
      status: 'pending',
      location: 'Bengaluru APMC'
    },
    {
      id: 'neg_2',
      buyerName: 'Kisan Agrarian Wholesale',
      cropName: 'Sona Masuri Paddy',
      requestedQty: 100, // Quintals
      buyerOffer: 3750, // ₹/Quintal
      listedPrice: 3850,
      counterOffer: 3800,
      status: 'pending',
      location: 'Mandya APMC'
    }
  ]);

  // Load Dashboard Data from API & Merge
  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/crops/farmer/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
        if (data.crops) {
          setSampleFarmerProducts(data.crops);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

  const fetchShipments = async () => {
    try {
      const res = await fetch(`${apiUrl}/logistics/shipments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setShipments(data);
      }
    } catch (err) {
      console.error('Failed to fetch shipments:', err);
    }
  };

  const handleUpdateShipmentStatus = async (shipmentId, currentStatus) => {
    const nextStatusMap = {
      'assigned': 'dispatched',
      'dispatched': 'in-transit',
      'in-transit': 'delivered'
    };
    const nextStatus = nextStatusMap[currentStatus];
    if (!nextStatus) return;

    if (!window.confirm(`Are you sure you want to update shipping status to ${nextStatus.toUpperCase()}?`)) return;

    try {
      const res = await fetch(`${apiUrl}/logistics/${shipmentId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: nextStatus,
          description: `Shipment status updated by farmer to ${nextStatus}.`
        })
      });

      if (res.ok) {
        alert('Shipping status updated successfully!');
        fetchShipments();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to update status');
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'logistics') {
      fetchShipments();
    }
  }, [activeSubTab]);

  useEffect(() => {
    loadDashboard();
    fetchAuctions();
  }, [apiUrl]);

  const farmerAuctions = auctions.filter(a => a.crop && (a.crop.farmer?._id === user._id || a.crop.farmer === user._id));

  // Subscribe to farmer's active auction channels
  useEffect(() => {
    if (activeSubTab !== 'auctions' || farmerAuctions.length === 0) return;

    const unsubscribes = farmerAuctions.map(auc => 
      subscribe(`auction:${auc._id}`, (event) => {
        console.log('WS Farmer Auction Event Received:', event);
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
          loadDashboard();
        }
      })
    );

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [activeSubTab, farmerAuctions.length]);

  // Toggle Pause Listing
  const handleTogglePauseProduct = (cropId) => {
    setSampleFarmerProducts(prev => prev.map(p => p._id === cropId ? { ...p, isPaused: !p.isPaused } : p));
  };

  // Delete Product
  const handleDeleteProduct = (cropId) => {
    if (window.confirm('Are you sure you want to remove this wholesale crop listing?')) {
      setSampleFarmerProducts(prev => prev.filter(p => p._id !== cropId));
    }
  };

  // Stock Update Submission
  const handleUpdateStockSubmit = (e) => {
    e.preventDefault();
    const amount = Number(stockAddAmount) || 0;
    setSampleFarmerProducts(prev => prev.map(p => {
      if (p._id === selectedCropForStockUpdate._id) {
        const newTotal = p.quantity + amount;
        const newAvailable = p.availableStock + amount;
        return { ...p, quantity: newTotal, availableStock: newAvailable };
      }
      return p;
    }));
    alert(`Successfully added ${amount} Quintals to stock for ${selectedCropForStockUpdate.name}!`);
    setSelectedCropForStockUpdate(null);
  };

  // Accept B2B Bargain Offer
  const handleAcceptBargain = (negId) => {
    setB2bNegotiations(prev => prev.map(n => n.id === negId ? { ...n, status: 'accepted' } : n));
    alert('Negotiation Offer Accepted! Escrow trade contract generated.');
  };

  // Reject B2B Bargain Offer
  const handleRejectBargain = (negId) => {
    setB2bNegotiations(prev => prev.map(n => n.id === negId ? { ...n, status: 'rejected' } : n));
  };

  // Submit Counter Offer
  const handleSendCounterOffer = (e) => {
    e.preventDefault();
    setB2bNegotiations(prev => prev.map(n => n.id === activeNegotiation.id ? { ...n, counterOffer: Number(counterOfferRate), status: 'countered' } : n));
    alert(`Counter offer of ₹${counterOfferRate}/Quintal sent to ${activeNegotiation.buyerName}!`);
    setActiveNegotiation(null);
  };

  // Handle New Crop Upload / Submit
  const handleCropSubmit = async (e) => {
    e.preventDefault();
    try {
      const body = {
        name: cropName,
        category,
        quantity: Number(quantity),
        minOrder: Number(minOrderQty),
        qualityGrade: grade,
        price: Number(price),
        minPriceAcceptable: Number(minAcceptablePrice),
        harvestDate: harvestDate,
        location: `${district}, ${stateName}`,
        district,
        listingMode,
        durationHours: Number(durationHours),
        isNegotiationEnabled,
        imageUrl: mainImageUrl,
        description
      };

      const res = await fetch(`${apiUrl}/crops`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        const crop = await res.json();
        alert(`Wholesale Produce "${cropName}" uploaded successfully at ₹${price}/Quintal!`);
        loadDashboard();
        setActiveSubTab('listings');
      } else {
        const errData = await res.json();
        alert(errData.message || 'Crop upload failed');
      }
    } catch (err) {
      console.error(err);
      alert('Network error uploading crop');
    }
  };

  // AI Crop Disease Diagnosis Scanner Simulation
  const handleTriggerDiseaseScan = (e) => {
    e.preventDefault();
    setScannerLoading(true);
    setTimeout(() => {
      setScannerLoading(false);
      setDiseaseDiagnosis({
        cropName: 'Finger Millet (Ragi)',
        condition: 'Blast Disease (Magnaporthe oryzae) - Early Stage',
        severity: 'Low (12% Leaf Area)',
        treatment: 'Spray Tricyclazole 75 WP @ 0.6g/L water during early morning. Maintain 15cm plant spacing.',
        preventive: 'Use certified blast-resistant seeds (GPU-28 / KMR-301) for next crop cycle.'
      });
    }, 2000);
  };

  // Printable Sales Performance PDF Report Generator
  const handleDownloadSalesReport = () => {
    const reportWindow = window.open('', '_blank');
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Farmer B2B Wholesale Sales Report 2026</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #1e293b; }
          .header { border-bottom: 3px solid #10b981; padding-bottom: 15px; margin-bottom: 20px; }
          .title { font-size: 24px; color: #047857; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; font-size: 12px; }
          th { background: #ecfdf5; color: #047857; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">SMART AGRICULTURE MARKETPLACE</div>
          <div>Farmer Wholesale Sales Performance & Earnings Audit Report</div>
          <div>Producer Name: ${user?.name || 'Verified APMC Farmer'} • Date: ${new Date().toLocaleDateString()}</div>
        </div>
        <h3>Summary Statistics</h3>
        <p>Total Revenue Earned: <strong>₹4,56,000</strong> | Orders Completed: <strong>36</strong> | Rating: <strong>⭐ 4.9 / 5.0</strong></p>
        <table>
          <thead>
            <tr>
              <th>Crop Name</th>
              <th>Category</th>
              <th>Available Stock (Quintals)</th>
              <th>Price (₹/Quintal)</th>
              <th>Total Revenue</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            ${sampleFarmerProducts.map(p => `
              <tr>
                <td>${p.name}</td>
                <td>${p.category}</td>
                <td>${p.quantity} Qtnl</td>
                <td>₹${p.price} / Quintal</td>
                <td>₹${p.revenue.toLocaleString()}</td>
                <td>⭐ ${p.rating}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <br/>
        <button onclick="window.print()" style="background:#10b981; color:white; padding:10px 20px; border:none; border-radius:6px; cursor:pointer;">Print Sales Report PDF</button>
      </body>
      </html>
    `;
    reportWindow.document.write(html);
    reportWindow.document.close();
  };

  const stats = {
    totalProducts: sampleFarmerProducts.length,
    activeListings: sampleFarmerProducts.filter(c => c.status === 'available').length,
    totalViews: sampleFarmerProducts.reduce((sum, c) => sum + ((c.analytics && c.analytics.views) || 0), 0) + 120,
    ordersCompleted: sampleFarmerProducts.reduce((sum, c) => sum + ((c.analytics && c.analytics.ordersCount) || 0), 0) + 3,
    totalEarnings: dashboardData?.financials?.totalRevenue || 185000,
    averageRating: 4.8
  };

  return (
    <div className="fade-in" style={styles.container}>
      {/* HEADER BAR & FARMER BADGE */}
      <div className="glass-card" style={styles.headerCard}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={styles.farmerAvatar}>
            <Sprout size={28} color="var(--forest-green)" />
          </div>
          <div>
            <h2 style={styles.title}>Farmer B2B Management Portal</h2>
            <p style={styles.subtitle}>
              Welcome back, <strong>{user?.name || 'Verified APMC Producer'}</strong> • APMC License: <strong>APMC-KAR-2026-B2B</strong> • All pricing strictly in <strong>₹ per Quintal (100 kg)</strong>.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setActiveSubTab('upload')} className="btn btn-primary" style={{ padding: '9px 18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={16} /> Upload New Crop (Quintals)
          </button>
          <button onClick={handleDownloadSalesReport} className="btn btn-outline" style={{ padding: '9px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Download size={15} /> Export Sales Report (PDF)
          </button>
        </div>
      </div>

      {/* DASHBOARD STATISTICS HEADER CARDS (REQUESTED BY USER) */}
      <div style={styles.statsGrid}>
        <div className="glass-card feature-3d-card" style={styles.statBox}>
          <div style={styles.statIconBox}><Sprout size={18} color="var(--forest-green)" /></div>
          <div>
            <div style={styles.statLabel}>Total Products</div>
            <div style={styles.statValue}>{stats.totalProducts}</div>
            <span style={{ fontSize: '10px', color: 'var(--emerald)' }}>Active on Portal</span>
          </div>
        </div>

        <div className="glass-card feature-3d-card" style={styles.statBox}>
          <div style={styles.statIconBox}><CheckCircle2 size={18} color="var(--emerald)" /></div>
          <div>
            <div style={styles.statLabel}>Active Listings</div>
            <div style={styles.statValue}>{stats.activeListings}</div>
            <span style={{ fontSize: '10px', color: 'var(--emerald)' }}>Receiving Bids</span>
          </div>
        </div>

        <div className="glass-card feature-3d-card" style={styles.statBox}>
          <div style={{ ...styles.statIconBox, backgroundColor: 'rgba(245, 158, 11, 0.15)' }}><Clock size={18} color="#d97706" /></div>
          <div>
            <div style={styles.statLabel}>Average Rating</div>
            <div style={{ ...styles.statValue, color: '#d97706' }}>⭐ {stats.averageRating}</div>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>FSSAI Quality Audit</span>
          </div>
        </div>

        <div className="glass-card feature-3d-card" style={styles.statBox}>
          <div style={styles.statIconBox}><Eye size={18} color="var(--forest-green)" /></div>
          <div>
            <div style={styles.statLabel}>Today's Buyer Views</div>
            <div style={styles.statValue}>{stats.totalViews}</div>
            <span style={{ fontSize: '10px', color: 'var(--emerald)' }}>+14.2% traffic</span>
          </div>
        </div>

        <div className="glass-card feature-3d-card" style={styles.statBox}>
          <div style={{ ...styles.statIconBox, backgroundColor: 'rgba(2, 132, 199, 0.15)' }}><MessageSquare size={18} color="#0284c7" /></div>
          <div>
            <div style={styles.statLabel}>Buyer Enquiries</div>
            <div style={{ ...styles.statValue, color: '#0284c7' }}>15</div>
            <span style={{ fontSize: '10px', color: '#0284c7' }}>Active Inquiries</span>
          </div>
        </div>

        <div className="glass-card feature-3d-card" style={styles.statBox}>
          <div style={styles.statIconBox}><ShoppingCart size={18} color="var(--forest-green)" /></div>
          <div>
            <div style={styles.statLabel}>Orders Completed</div>
            <div style={styles.statValue}>{stats.ordersCompleted}</div>
            <span style={{ fontSize: '10px', color: 'var(--emerald)' }}>Escrow Settled</span>
          </div>
        </div>

        <div className="glass-card feature-3d-card" style={styles.statBox}>
          <div style={styles.statIconBox}><DollarSign size={18} color="var(--forest-green)" /></div>
          <div>
            <div style={styles.statLabel}>Total Earnings</div>
            <div style={{ ...styles.statValue, color: 'var(--forest-green)' }}>₹{stats.totalEarnings.toLocaleString()}</div>
            <span style={{ fontSize: '10px', color: 'var(--emerald)' }}>0% Commission</span>
          </div>
        </div>

        <div className="glass-card feature-3d-card" style={styles.statBox}>
          <div style={{ ...styles.statIconBox, backgroundColor: 'rgba(245, 158, 11, 0.15)' }}><Star size={18} color="#f59e0b" /></div>
          <div>
            <div style={styles.statLabel}>Average Rating</div>
            <div style={{ ...styles.statValue, color: '#d97706' }}>⭐ 4.9</div>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Based on reviews</span>
          </div>
        </div>
      </div>

      {/* PLATFORM NAVIGATION SUB-TABS */}
      <div style={styles.subTabs}>
        <button
          onClick={() => setActiveSubTab('listings')}
          style={{
            ...styles.subTabBtn,
            backgroundColor: activeSubTab === 'listings' ? 'var(--forest-green)' : 'transparent',
            color: activeSubTab === 'listings' ? 'white' : 'var(--text-secondary)'
          }}
        >
          My Wholesale Crop Cards ({sampleFarmerProducts.length})
        </button>

        <button
          onClick={() => setActiveSubTab('negotiations')}
          style={{
            ...styles.subTabBtn,
            backgroundColor: activeSubTab === 'negotiations' ? 'var(--forest-green)' : 'transparent',
            color: activeSubTab === 'negotiations' ? 'white' : 'var(--text-secondary)'
          }}
        >
          B2B Bargain Negotiation Panel ({b2bNegotiations.length})
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

        <button
          onClick={() => setActiveSubTab('auctions')}
          style={{
            ...styles.subTabBtn,
            backgroundColor: activeSubTab === 'auctions' ? 'var(--forest-green)' : 'transparent',
            color: activeSubTab === 'auctions' ? 'white' : 'var(--text-secondary)'
          }}
        >
          My Live Auctions ({farmerAuctions.filter(a => a.status === 'active').length})
        </button>

        <button
          onClick={() => setActiveSubTab('upload')}
          style={{
            ...styles.subTabBtn,
            backgroundColor: activeSubTab === 'upload' ? 'var(--forest-green)' : 'transparent',
            color: activeSubTab === 'upload' ? 'white' : 'var(--text-secondary)'
          }}
        >
          Upload Crop & Multi-Images
        </button>

        <button
          onClick={() => setActiveSubTab('logistics')}
          style={{
            ...styles.subTabBtn,
            backgroundColor: activeSubTab === 'logistics' ? 'var(--forest-green)' : 'transparent',
            color: activeSubTab === 'logistics' ? 'white' : 'var(--text-secondary)'
          }}
        >
          Freight & Transport Pickup
        </button>

        <button
          onClick={() => setActiveSubTab('finance')}
          style={{
            ...styles.subTabBtn,
            backgroundColor: activeSubTab === 'finance' ? 'var(--forest-green)' : 'transparent',
            color: activeSubTab === 'finance' ? 'white' : 'var(--text-secondary)'
          }}
        >
          Digital Wallet & Escrow Payouts
        </button>

        <button
          onClick={() => setActiveSubTab('analytics')}
          style={{
            ...styles.subTabBtn,
            backgroundColor: activeSubTab === 'analytics' ? 'var(--forest-green)' : 'transparent',
            color: activeSubTab === 'analytics' ? 'white' : 'var(--text-secondary)'
          }}
        >
          Performance Analytics & Cities
        </button>

        <button
          onClick={() => setActiveSubTab('ai-tools')}
          style={{
            ...styles.subTabBtn,
            backgroundColor: activeSubTab === 'ai-tools' ? 'var(--forest-green)' : 'transparent',
            color: activeSubTab === 'ai-tools' ? 'white' : 'var(--text-secondary)'
          }}
        >
          AI Crop Scanner & Weather
        </button>
      </div>

      {/* 1. MY WHOLESALE CROP CARDS TAB */}
      {activeSubTab === 'listings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '18px' }}>Active Wholesale Produce Listings (Rates strictly in ₹/Quintal)</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>All stocks measured in <strong>Quintals (100 kg) & Tons</strong></span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {sampleFarmerProducts.map((product) => (
              <div key={product._id} className="glass-card feature-3d-card" style={styles.farmerProductCard}>
                {/* Crop Title Bar & Status */}
                <div style={styles.productCardHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>🌾 {product.name}</h3>
                    <span className="badge badge-verified" style={{ fontSize: '10px' }}>
                      🟢 {product.verificationStatus.toUpperCase()}
                    </span>
                    {product.isPaused && (
                      <span className="badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontSize: '10px' }}>
                        PAUSED
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Auction Status: <strong style={{ color: 'var(--forest-green)' }}>{product.auctionStatus}</strong>
                  </div>
                </div>

                {/* Main Product Info & Image Grid */}
                <div style={styles.productBodyGrid}>
                  <img src={product.imageUrl} alt={product.name} style={styles.productCardImg} />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={styles.productDetailLine}><span>Category:</span> <strong>{product.category}</strong></div>
                    <div style={styles.productDetailLine}><span>Quality Grade:</span> <strong>{product.qualityGrade}</strong></div>
                    <div style={styles.productDetailLine}><span>Location:</span> <strong>{product.location}</strong></div>
                    <div style={styles.productDetailLine}><span>Harvest Date:</span> <strong>{product.harvestDate}</strong></div>
                    <div style={styles.productDetailLine}><span>Organic Certificate:</span> <strong style={{ color: 'var(--forest-green)' }}>{product.organicCert}</strong></div>
                  </div>

                  {/* Stock Management Details (Requested by User) */}
                  <div style={styles.stockBox}>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '4px' }}>STOCK MANAGEMENT</div>
                    <div style={styles.stockLine}><span>Current Total Stock:</span> <strong>{product.quantity} Quintals ({(product.quantity / 10).toFixed(1)} Tons)</strong></div>
                    <div style={styles.stockLine}><span>Reserved Stock:</span> <strong style={{ color: '#d97706' }}>{product.reservedStock} Quintals</strong></div>
                    <div style={styles.stockLine}><span>Available for Sale:</span> <strong style={{ color: 'var(--forest-green)' }}>{product.availableStock} Quintals</strong></div>
                    <div style={styles.stockLine}><span>Min Order Qty:</span> <strong>{product.minOrder} Quintals</strong></div>
                    <div style={styles.stockLine}><span>Max Order Qty:</span> <strong>{product.maxOrder} Quintals</strong></div>
                  </div>

                  {/* Pricing Breakdown Section (Very Important as requested) */}
                  <div style={styles.pricingHighlightBox}>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--forest-green)', marginBottom: '4px' }}>PRICING BREAKDOWN (₹/QUINTAL)</div>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--forest-green)' }}>Selling Price: ₹{product.price.toLocaleString()} / Quintal</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Market Rate: <strong>₹{product.expectedMarketPrice.toLocaleString()} / Quintal</strong></div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Min Acceptable: <strong>₹{product.minAcceptablePrice.toLocaleString()} / Quintal</strong></div>
                    <div style={{ fontSize: '11px', color: 'var(--forest-green)', fontWeight: 'bold' }}>AI Suggested Rate: <strong>₹{product.aiSuggestedPrice.toLocaleString()} / Quintal</strong></div>
                  </div>
                </div>

                {/* Dynamic AI Pricing Advice Banner */}
                <div style={styles.aiAdviceBanner}>
                  <Brain size={16} color="var(--forest-green)" />
                  <span><strong>AI Price Recommendation:</strong> {product.aiAdvice}</span>
                </div>

                {/* Engagement & Sales Metrics Bar (Requested by User) */}
                <div style={styles.metricsBar}>
                  <div>👁 Views : <strong>{product.views}</strong></div>
                  <div>🛒 Enquiries : <strong>{product.enquiries}</strong></div>
                  <div>📦 Orders : <strong>{product.ordersCount}</strong></div>
                  <div>💰 Revenue : <strong style={{ color: 'var(--forest-green)' }}>₹{product.revenue.toLocaleString()}</strong></div>
                  <div>⭐ Rating : <strong>{product.rating} / 5.0</strong></div>
                  <div>❤️ Saved by Buyers : <strong>{product.savedCount}</strong></div>
                </div>

                {/* Farmer Actions Row (Edit, Update Stock, Pause, Delete) */}
                <div style={styles.cardActionsRow}>
                  <button onClick={() => { setEditingCropId(product._id); setCropName(product.name); setPrice(product.price.toString()); setActiveSubTab('upload'); }} className="btn btn-outline" style={styles.actionBtn}>
                    <Edit size={14} /> Edit Listing
                  </button>

                  <button onClick={() => setSelectedCropForStockUpdate(product)} className="btn btn-outline" style={styles.actionBtn}>
                    <Plus size={14} /> Update Stock
                  </button>

                  <button onClick={() => handleTogglePauseProduct(product._id)} className="btn btn-outline" style={{ ...styles.actionBtn, borderColor: '#d97706', color: '#d97706' }}>
                    <Ban size={14} /> {product.isPaused ? 'Resume Listing' : 'Pause Listing'}
                  </button>

                  <button onClick={() => handleDeleteProduct(product._id)} className="btn btn-outline" style={{ ...styles.actionBtn, borderColor: '#ef4444', color: '#ef4444' }}>
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. B2B BARGAIN NEGOTIATION PANEL */}
      {activeSubTab === 'negotiations' && (
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

      {/* MY LIVE AUCTIONS TAB */}
      {activeSubTab === 'auctions' && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>My Active Produce Auctions</h3>
            <button onClick={fetchAuctions} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
              <RefreshCw size={14} /> Refresh Bids
            </button>
          </div>

          {farmerAuctions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              You don't have any active auctions. Upload a crop in "Auction" mode to start one.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {farmerAuctions.map((auc) => {
                const endsInMs = new Date(auc.endTime) - new Date();
                const minutesLeft = Math.max(0, Math.floor(endsInMs / 60000));
                const hoursLeft = Math.floor(minutesLeft / 60);
                const showMins = minutesLeft % 60;

                return (
                  <div key={auc._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: 0 }}>{auc.crop?.name}</h4>
                      <span className={`badge ${auc.status === 'active' ? 'badge-verified' : 'badge-trusted'}`} style={{ textTransform: 'capitalize' }}>
                        {auc.status === 'active' ? '🔴 Live' : 'Closed'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <span>Auctioned Qty:</span>
                      <strong>{auc.crop?.quantity} Quintals</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <span>Start Price:</span>
                      <strong>₹{auc.crop?.price}/Quintal</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '6px 0' }}>
                      <span>Current Highest Bid:</span>
                      <strong style={{ color: 'var(--forest-green)', fontSize: '14px' }}>₹{auc.highestBid}/Quintal</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <span>Highest Bidder:</span>
                      <strong>{auc.highestBidder?.name || 'No bids yet'}</strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#ef4444', backgroundColor: 'rgba(239,68,68,0.05)', padding: '6px 10px', borderRadius: '6px', fontWeight: 'bold' }}>
                      <Clock size={14} />
                      <span>
                        {auc.status === 'active' ? `Remaining Time: ${hoursLeft}h ${showMins}m` : 'Completed & Sold'}
                      </span>
                    </div>

                    {auc.status === 'active' && (
                      <button 
                        onClick={async () => {
                          if (!window.confirm('Are you sure you want to resolve this auction now and accept the highest bid?')) return;
                          try {
                            const res = await fetch(`${apiUrl}/auctions/${auc._id}/resolve`, {
                              method: 'POST',
                              headers: { 'Authorization': `Bearer ${token}` }
                            });
                            if (res.ok) {
                              alert('Auction resolved successfully! Funds settled into wallet.');
                              fetchAuctions();
                            } else {
                              const errData = await res.json();
                              alert(errData.message || 'Resolution failed');
                            }
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '6px', padding: '8px' }}
                      >
                        Accept Highest Bid & Close
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. CROP UPLOAD & MULTI-IMAGE FORM TAB */}
      {activeSubTab === 'upload' && (
        <div className="glass-card" style={{ padding: '24px' }} className="fade-in">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Upload Wholesale Crop & Certificate Images</h3>

          <form onSubmit={handleCropSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label>Crop Commodity Name</label>
              <input type="text" className="form-input" value={cropName} onChange={(e) => setCropName(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Produce Category</label>
              <select className="form-input" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Grains">Grains & Millets</option>
                <option value="Pulses">Pulses & Dals</option>
                <option value="Commercial">Commercial & Spices</option>
                <option value="Fruits">Fruits & Orchards</option>
                <option value="Vegetables">Fresh Vegetables</option>
              </select>
            </div>

            <div className="form-group">
              <label>Total Available Stock (Quintals)</label>
              <input type="number" className="form-input" placeholder="e.g. 250 Quintals" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Minimum Order Quantity (Quintals)</label>
              <input type="number" className="form-input" value={minOrderQty} onChange={(e) => setMinOrderQty(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Listing Mode</label>
              <select className="form-input" value={listingMode} onChange={(e) => setListingMode(e.target.value)}>
                <option value="buynow">Buy Now (Standard Sale)</option>
                <option value="auction">Auction (Bidding Mode)</option>
              </select>
            </div>

            {listingMode === 'auction' ? (
              <div className="form-group">
                <label>Auction Duration</label>
                <select className="form-input" value={durationHours} onChange={(e) => setDurationHours(e.target.value)}>
                  <option value="6">6 Hours</option>
                  <option value="12">12 Hours</option>
                  <option value="24">24 Hours (1 Day)</option>
                  <option value="48">48 Hours (2 Days)</option>
                </select>
              </div>
            ) : (
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '20px' }}>
                <input 
                  type="checkbox" 
                  id="negCheckbox" 
                  checked={isNegotiationEnabled} 
                  onChange={(e) => setIsNegotiationEnabled(e.target.checked)} 
                />
                <label htmlFor="negCheckbox" style={{ margin: 0, cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Enable Buyer Negotiation</label>
              </div>
            )}

            <div className="form-group">
              <label>Selling Price (₹ / Quintal)</label>
              <input type="number" className="form-input" placeholder="e.g. 3250" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Minimum Acceptable Price (₹ / Quintal)</label>
              <input type="number" className="form-input" placeholder="e.g. 3100" value={minAcceptablePrice} onChange={(e) => setMinAcceptablePrice(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>District / Mandi Location</label>
              <input type="text" className="form-input" value={district} onChange={(e) => setDistrict(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Harvest Date</label>
              <input type="date" className="form-input" value={harvestDate} onChange={(e) => setHarvestDate(e.target.value)} required />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Main Crop Image URL</label>
              <input type="text" className="form-input" value={mainImageUrl} onChange={(e) => setMainImageUrl(e.target.value)} required />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Crop Description & Quality Notes</label>
              <textarea className="form-input" style={{ height: '70px' }} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <button type="submit" className="btn btn-primary" style={{ gridColumn: '1 / -1', padding: '14px', fontSize: '15px' }}>
              Publish Wholesale Crop Listing (₹{price}/Quintal)
            </button>
          </form>
        </div>
      )}

      {/* 4. FREIGHT & LOGISTICS TAB */}
      {activeSubTab === 'logistics' && (
        <div className="glass-card" style={{ padding: '24px' }} className="fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '18px' }}>Logistics Freight & Farm Pickup Dispatch</h3>
            <button onClick={fetchShipments} className="btn btn-outline" style={{ fontSize: '12px' }}>
              Refresh Shipments
            </button>
          </div>

          {shipments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              No active logistics shipments found. Once buyers place bulk escrow orders, they will appear here.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {shipments.map((ship) => (
                <div key={ship._id} className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                    <div>
                      <strong>Carrier: {ship.partnerName}</strong>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        Vehicle: {ship.vehicleNumber} • Driver: {ship.driverName} ({ship.driverPhone})
                      </div>
                    </div>
                    <span className="badge badge-verified" style={{ textTransform: 'capitalize' }}>Status: {ship.status}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '13px' }}>
                    <div>Quantity: <strong>{ship.order?.quantity || 0} Quintals</strong></div>
                    <div>Settled Total: <strong style={{ color: 'var(--forest-green)' }}>₹{ship.order?.totalAmount?.toLocaleString() || 0}</strong></div>
                    <div>ETA: <strong>{new Date(ship.estimatedDelivery).toLocaleDateString()}</strong></div>
                  </div>

                  {ship.status !== 'delivered' && (
                    <button 
                      onClick={() => handleUpdateShipmentStatus(ship._id, ship.status)}
                      className="btn btn-primary"
                      style={{ padding: '8px 16px', fontSize: '12px', alignSelf: 'flex-start', marginTop: '6px' }}
                    >
                      Mark as {ship.status === 'assigned' ? 'DISPATCHED' : ship.status === 'dispatched' ? 'IN-TRANSIT' : 'DELIVERED'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. FINANCIAL & DIGITAL WALLET TAB (REQUESTED BY USER) */}
      {activeSubTab === 'finance' && (
        <div className="glass-card" style={{ padding: '24px' }} className="fade-in">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Digital Wallet & Escrow Trade Earnings</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div style={styles.financeBox}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Today's Earnings</span>
              <strong style={{ fontSize: '20px', color: 'var(--forest-green)' }}>₹18,500</strong>
            </div>
            <div style={styles.financeBox}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Monthly Earnings</span>
              <strong style={{ fontSize: '20px', color: 'var(--forest-green)' }}>₹1,85,400</strong>
            </div>
            <div style={styles.financeBox}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Pending Escrow Payouts</span>
              <strong style={{ fontSize: '20px', color: '#d97706' }}>₹42,000</strong>
            </div>
            <div style={styles.financeBox}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Kisan Wallet Balance</span>
              <strong style={{ fontSize: '20px', color: 'var(--forest-green)' }}>₹1,43,400</strong>
            </div>
          </div>

          <button onClick={() => alert('Payout requested to linked Bank Account (State Bank of India).')} className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '13px' }}>
            Transfer Wallet Balance to Bank Account (0% Fee)
          </button>
        </div>
      )}

      {/* 6. PERFORMANCE ANALYTICS TAB (REQUESTED BY USER) */}
      {activeSubTab === 'analytics' && (
        <div className="glass-card" style={{ padding: '24px' }} className="fade-in">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Product Performance Analytics & Top Interested Cities</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div style={styles.analyticsStatBox}>
              <div>Total Crop Views</div>
              <strong>1,840 Views</strong>
            </div>
            <div style={styles.analyticsStatBox}>
              <div>Buyer Clicks & Enquiries</div>
              <strong>254 Clicks</strong>
            </div>
            <div style={styles.analyticsStatBox}>
              <div>Order Conversion Rate</div>
              <strong style={{ color: 'var(--emerald)' }}>14.2%</strong>
            </div>
            <div style={styles.analyticsStatBox}>
              <div>Best Selling Crop</div>
              <strong>Sona Masuri Paddy</strong>
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <strong>Top Interested Buyer Cities:</strong>
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px', flexWrap: 'wrap' }}>
              <span className="badge badge-verified">1. Bengaluru Urban (48% Orders)</span>
              <span className="badge badge-verified">2. Mysuru Mandi (28% Orders)</span>
              <span className="badge badge-verified">3. Hubballi APMC (16% Orders)</span>
            </div>
          </div>
        </div>
      )}

      {/* 7. AI CROP SCANNER & WEATHER TAB */}
      {activeSubTab === 'ai-tools' && (
        <div className="glass-card" style={{ padding: '24px' }} className="fade-in">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>AI Crop Disease Scanner & Weather Advisory</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {/* Disease Scanner */}
            <div style={{ border: '1px solid var(--border-color)', padding: '16px', borderRadius: '10px' }}>
              <h4 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Brain size={18} color="var(--forest-green)" /> AI Leaf Disease Diagnosis
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Upload leaf photo for instant disease diagnosis & remedy.</p>
              <form onSubmit={handleTriggerDiseaseScan} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                <input type="file" accept="image/*" className="form-input" />
                <button type="submit" className="btn btn-primary" style={{ padding: '8px' }}>
                  {scannerLoading ? 'Scanning Crop Leaf...' : 'Diagnose Crop Leaf'}
                </button>
              </form>

              {diseaseDiagnosis && (
                <div style={{ marginTop: '14px', backgroundColor: 'var(--green-glow)', padding: '12px', borderRadius: '8px', fontSize: '12px' }}>
                  <strong style={{ color: 'var(--forest-green)' }}>{diseaseDiagnosis.condition}</strong>
                  <p style={{ margin: '4px 0', color: 'var(--text-primary)' }}>Remedy: {diseaseDiagnosis.treatment}</p>
                </div>
              )}
            </div>

            {/* Weather Alert */}
            <div style={{ border: '1px solid var(--border-color)', padding: '16px', borderRadius: '10px' }}>
              <h4 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CloudRain size={18} color="#0284c7" /> Mandya Agrarian Weather Advisory
              </h4>
              <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div>Temperature: <strong>28°C (Humidity: 68%)</strong></div>
                <div>Monsoon Forecast: <strong>Light showers expected in 48h. Protect harvested grains in APMC warehouse.</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STOCK MANAGEMENT MODAL */}
      {selectedCropForStockUpdate && (
        <div className="modal-overlay" onClick={() => setSelectedCropForStockUpdate(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h4 style={{ margin: 0 }}>Update Stock: {selectedCropForStockUpdate.name}</h4>
              <button onClick={() => setSelectedCropForStockUpdate(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <form onSubmit={handleUpdateStockSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Current Available Stock: <strong>{selectedCropForStockUpdate.availableStock} Quintals</strong>
              </div>
              <div className="form-group">
                <label>Add Stock Quantity (Quintals)</label>
                <input type="number" className="form-input" value={stockAddAmount} onChange={(e) => setStockAddAmount(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ padding: '10px' }}>Add Stock Volume</button>
            </form>
          </div>
        </div>
      )}

      {/* COUNTER OFFER MODAL */}
      {activeNegotiation && (
        <div className="modal-overlay" onClick={() => setActiveNegotiation(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h4 style={{ margin: 0 }}>Send Counter Offer to {activeNegotiation.buyerName}</h4>
              <button onClick={() => setActiveNegotiation(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <form onSubmit={handleSendCounterOffer} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Buyer Proposed Rate: <strong>₹{activeNegotiation.buyerOffer} / Quintal</strong>
              </div>
              <div className="form-group">
                <label>Your Counter Offer Rate (₹ / Quintal)</label>
                <input type="number" className="form-input" value={counterOfferRate} onChange={(e) => setCounterOfferRate(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ padding: '10px' }}>Send Counter Offer</button>
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
    maxWidth: '1380px',
    margin: '0 auto',
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
  farmerAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
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
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '12px'
  },
  statBox: {
    padding: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  statIconBox: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: 'var(--green-glow)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  statLabel: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    fontWeight: '600'
  },
  statValue: {
    fontSize: '16px',
    fontWeight: '800',
    color: 'var(--text-primary)'
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
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s ease'
  },
  farmerProductCard: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  productCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '10px'
  },
  productBodyGrid: {
    display: 'grid',
    gridTemplateColumns: '120px 1fr 1fr 1fr',
    gap: '16px',
    alignItems: 'center'
  },
  productCardImg: {
    width: '120px',
    height: '100px',
    objectFit: 'cover',
    borderRadius: '8px'
  },
  productDetailLine: {
    fontSize: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    color: 'var(--text-secondary)'
  },
  stockBox: {
    backgroundColor: 'var(--bg-primary)',
    padding: '10px 12px',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  stockLine: {
    fontSize: '11px',
    display: 'flex',
    justifyContent: 'space-between',
    color: 'var(--text-secondary)'
  },
  pricingHighlightBox: {
    backgroundColor: 'var(--green-glow)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    padding: '10px 12px',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  aiAdviceBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'var(--green-glow)',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '12px',
    color: 'var(--forest-green)'
  },
  metricsBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'var(--bg-primary)',
    padding: '10px 16px',
    borderRadius: '8px',
    fontSize: '11px',
    flexWrap: 'wrap',
    gap: '8px'
  },
  cardActionsRow: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
    flexWrap: 'wrap'
  },
  actionBtn: {
    fontSize: '11px',
    padding: '6px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  negotiationCard: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  negBox: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: '11px',
    backgroundColor: 'var(--bg-primary)',
    padding: '8px',
    borderRadius: '6px'
  },
  negLabel: {
    color: 'var(--text-secondary)',
    marginBottom: '2px'
  },
  logisticsCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '16px',
    backgroundColor: 'var(--bg-primary)',
    borderRadius: '10px',
    border: '1px solid var(--border-color)'
  },
  financeBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    backgroundColor: 'var(--bg-primary)',
    padding: '14px',
    borderRadius: '8px',
    textAlign: 'center'
  },
  analyticsStatBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    backgroundColor: 'var(--bg-primary)',
    padding: '14px',
    borderRadius: '8px',
    fontSize: '12px'
  }
};
