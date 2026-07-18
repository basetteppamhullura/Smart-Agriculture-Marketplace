import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import AnalyticsChart from '../components/AnalyticsChart';
import { Plus, Check, DollarSign, Wallet, Sprout, TrendingUp, Info, Edit, Trash2, ShieldAlert, Eye, ShoppingCart, Ban, Award } from 'lucide-react';

export default function FarmerDashboard() {
  const { user, apiUrl } = useAuth();
  const { t } = useThemeLanguage();

  // State
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states (Crop Upload & Edit)
  const [editingCropId, setEditingCropId] = useState(null);
  const [cropName, setCropName] = useState('');
  const [category, setCategory] = useState('Grains');
  const [quantity, setQuantity] = useState('');
  const [grade, setGrade] = useState('A');
  const [listingMode, setListingMode] = useState('buynow');
  const [durationHours, setDurationHours] = useState('24');
  const [price, setPrice] = useState('');
  const [imagesText, setImagesText] = useState(''); // Comma separated URLs
  const [stockStatus, setStockStatus] = useState('in-stock');
  const [deliveryOption, setDeliveryOption] = useState('logistics-delivery');
  const [description, setDescription] = useState('');
  const [localName, setLocalName] = useState('');
  const [district, setDistrict] = useState('Mandya');
  const [village, setVillage] = useState('');

  // AI Dynamic Pricing Recommendation
  const [aiPriceRange, setAiPriceRange] = useState('');
  const [aiFairPrice, setAiFairPrice] = useState(null);
  const [pricingLoading, setPricingLoading] = useState(false);

  // Expense form states
  const [expCategory, setExpCategory] = useState('Seeds');
  const [expCost, setExpCost] = useState('');
  const [expDesc, setExpDesc] = useState('');

  const [activeSubTab, setActiveSubTab] = useState('listings'); // 'listings' | 'upload' | 'finance'

  const token = localStorage.getItem('sam-token');

  // Load Dashboard Data
  const loadDashboard = async () => {
    try {
      const res = await fetch(`${apiUrl}/crops/farmer/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [apiUrl]);

  // Fetch AI Price Preview
  useEffect(() => {
    if (cropName.trim().length > 2) {
      const delayDebounce = setTimeout(async () => {
        setPricingLoading(true);
        try {
          const res = await fetch(`${apiUrl}/ai/dynamic-pricing`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              cropName,
              grade,
              category,
              quantity: Number(quantity) || 500,
              location: user.location
            })
          });
          if (res.ok) {
            const data = await res.json();
            setAiPriceRange(data.priceRange);
            setAiFairPrice(data.fairPrice);
            if (!price) {
              setPrice(data.fairPrice.toString());
            }
          }
        } catch (err) {
          console.error(err);
        } finally {
          setPricingLoading(false);
        }
      }, 500);

      return () => clearTimeout(delayDebounce);
    } else {
      setAiPriceRange('');
      setAiFairPrice(null);
    }
  }, [cropName, grade, category, quantity]);

  // Submit Crop Listing (Add or Edit)
  const handleUploadCrop = async (e) => {
    e.preventDefault();
    
    // Parse comma separated images into array
    const imageList = imagesText.trim()
      ? imagesText.split(',').map(url => url.trim()).filter(url => url.length > 0)
      : [];

    const payload = {
      name: cropName,
      category,
      quantity: Number(quantity),
      qualityGrade: grade,
      listingMode,
      price: Number(price),
      durationHours: listingMode === 'auction' ? Number(durationHours) : undefined,
      images: imageList,
      imageUrl: imageList[0] || 'https://images.unsplash.com/photo-1592982537447-6f2a6a0c8188?auto=format&fit=crop&w=600&q=80',
      stockStatus,
      deliveryOption,
      description,
      localName,
      district,
      village
    };

    try {
      let res;
      if (editingCropId) {
        // Edit Operation
        res = await fetch(`${apiUrl}/crops/${editingCropId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        // Add Operation
        res = await fetch(`${apiUrl}/crops`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        alert(editingCropId ? 'Product listing updated!' : 'Crop listed successfully!');
        resetForm();
        setActiveSubTab('listings');
        loadDashboard();
      } else {
        const errData = await res.json();
        alert(errData.message || 'Operation failed');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  // Trigger edit mode
  const handleTriggerEdit = (crop) => {
    setEditingCropId(crop._id);
    setCropName(crop.name);
    setCategory(crop.category || 'Grains');
    setQuantity(crop.quantity.toString());
    setGrade(crop.qualityGrade);
    setListingMode(crop.listingMode);
    setPrice(crop.price.toString());
    setImagesText(crop.images ? crop.images.join(', ') : crop.imageUrl);
    setStockStatus(crop.stockStatus || 'in-stock');
    setDeliveryOption(crop.deliveryOption || 'logistics-delivery');
    setDescription(crop.description || '');
    setLocalName(crop.localName || '');
    setDistrict(crop.district || 'Mandya');
    setVillage(crop.village || '');
    
    setActiveSubTab('upload');
  };

  // Reset uploader form
  const resetForm = () => {
    setEditingCropId(null);
    setCropName('');
    setCategory('Grains');
    setQuantity('');
    setGrade('A');
    setListingMode('buynow');
    setPrice('');
    setImagesText('');
    setStockStatus('in-stock');
    setDeliveryOption('logistics-delivery');
    setDescription('');
    setLocalName('');
    setDistrict('Mandya');
    setVillage('');
    setAiPriceRange('');
    setAiFairPrice(null);
  };

  // Delete product
  const handleDeleteCrop = async (cropId) => {
    if (!window.confirm('Are you sure you want to delete this product listing?')) return;

    try {
      const res = await fetch(`${apiUrl}/crops/${cropId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Product deleted successfully.');
        loadDashboard();
      } else {
        alert('Failed to delete product.');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  // Quick Sold Out Toggle
  const handleToggleSoldOut = async (crop) => {
    const nextStatus = crop.stockStatus === 'sold-out' ? 'in-stock' : 'sold-out';
    try {
      const res = await fetch(`${apiUrl}/crops/${crop._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ stockStatus: nextStatus })
      });
      if (res.ok) {
        loadDashboard();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add farming expense
  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!expCost || Number(expCost) <= 0) return;

    const newExp = {
      id: `exp_added_${Date.now()}`,
      category: expCategory,
      cost: Number(expCost),
      date: new Date().toISOString().split('T')[0],
      description: expDesc || `Logged farming inputs for ${expCategory}`
    };

    setDashboardData(prev => {
      const updatedExpenses = [newExp, ...prev.expenses];
      const totalExpenses = updatedExpenses.reduce((sum, ex) => sum + ex.cost, 0);
      const netProfit = prev.financials.totalRevenue - totalExpenses;
      return {
        ...prev,
        expenses: updatedExpenses,
        financials: {
          ...prev.financials,
          totalExpenses,
          netProfit,
          roiPercentage: totalExpenses > 0 ? parseFloat(((netProfit / totalExpenses) * 100).toFixed(1)) : 0
        }
      };
    });

    setExpCost('');
    setExpDesc('');
  };

  // Force close/resolve an auction
  const handleResolveAuction = async (auctionId) => {
    try {
      const res = await fetch(`${apiUrl}/auctions/${auctionId}/resolve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      alert(data.message);
      loadDashboard();
    } catch (err) {
      alert('Error ending auction');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading Farmer Dashboard...</div>;
  }

  const { crops = [], expenses = [], financials = {}, monthlySales = [] } = dashboardData || {};
  const categoriesList = [
    'Fruits', 'Vegetables', 'Grains', 'Pulses', 'Spices', 
    'Flowers', 'Seeds', 'Organic products', 'Dairy products', 
    'Agricultural equipment', 'Fertilizers', 'Other farm-related products',
    'Oil Seeds', 'Commercial Crops'
  ];

  return (
    <div className="fade-in" style={styles.container}>
      {/* Verification Header */}
      <div className="glass-card" style={styles.verifyHeader}>
        <div style={styles.headerTitle}>
          <h2 style={{ fontSize: '22px' }}>Farmer Dashboard - Seller Window</h2>
          <span className={`badge ${user.isVerified ? 'badge-verified' : 'badge-pending'}`}>
            {user.isVerified ? 'Verified Profile' : 'Pending Verification'}
          </span>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Welcome, {user.name}! List new products in the showcase, review active auctions, and check your organic certifications.
        </p>
      </div>

      {/* Sub tabs */}
      <div style={styles.subTabs}>
        <button
          onClick={() => { setActiveSubTab('listings'); resetForm(); }}
          style={{
            ...styles.subTabBtn,
            backgroundColor: activeSubTab === 'listings' ? 'var(--forest-green)' : 'transparent',
            color: activeSubTab === 'listings' ? 'white' : 'var(--text-secondary)'
          }}
        >
          Active Crop Showcase ({crops.length})
        </button>
        <button
          onClick={() => setActiveSubTab('upload')}
          style={{
            ...styles.subTabBtn,
            backgroundColor: activeSubTab === 'upload' ? 'var(--forest-green)' : 'transparent',
            color: activeSubTab === 'upload' ? 'white' : 'var(--text-secondary)'
          }}
        >
          {editingCropId ? 'Edit Listing Details' : 'Add New Product'}
        </button>
        <button
          onClick={() => setActiveSubTab('finance')}
          style={{
            ...styles.subTabBtn,
            backgroundColor: activeSubTab === 'finance' ? 'var(--forest-green)' : 'transparent',
            color: activeSubTab === 'finance' ? 'white' : 'var(--text-secondary)'
          }}
        >
          Financial Planning & Expense Tracker
        </button>
      </div>

      {/* RENDER SHOWCASE LISTINGS WITH EDIT/DELETE/ANALYTICS */}
      {activeSubTab === 'listings' && (
        <div style={styles.tabContent}>
          <div style={styles.sectionTitle}>Active Crop & Product Showcase</div>
          {crops.length === 0 ? (
            <div style={styles.empty}>Your showcase is empty. click "Add New Product" to list vegetables, grains, flowers, seeds, or equipment.</div>
          ) : (
            <div style={styles.listGrid}>
              {crops.map((crop) => (
                <div key={crop._id} className="glass-card" style={styles.listingCard}>
                  <div style={styles.showcaseItemMain}>
                    <img 
                      src={crop.imageUrl || (crop.images && crop.images[0])} 
                      alt={crop.name} 
                      style={styles.showcaseImg} 
                    />
                    
                    <div style={styles.showcaseDetails}>
                      <div style={styles.showcaseRowHeader}>
                        <h4 style={{ fontSize: '18px' }}>{crop.name}</h4>
                        <span className="badge badge-verified" style={{ textTransform: 'none' }}>{crop.category}</span>
                      </div>

                      <div style={styles.metaRow}>
                        <span>Grade: <strong>{crop.qualityGrade}</strong></span>
                        <span>•</span>
                        <span>Stock: <strong>{crop.quantity} kg/units</strong></span>
                        <span>•</span>
                        <span>Delivery: <strong>{crop.deliveryOption === 'farm-pickup' ? 'Farm Pickup' : 'Logistics Route'}</strong></span>
                      </div>

                      {/* Listing-specific Analytics widgets */}
                      <div style={styles.analyticsSection}>
                        <div style={styles.analyticsStat}>
                          <Eye size={13} color="var(--emerald)" />
                          <span>Views: <strong>{crop.analytics ? crop.analytics.views : 0}</strong></span>
                        </div>
                        <div style={styles.analyticsStat}>
                          <ShoppingCart size={13} color="var(--forest-green)" />
                          <span>Orders: <strong>{crop.analytics ? crop.analytics.ordersCount : 0}</strong></span>
                        </div>
                        <div style={styles.analyticsStat}>
                          <DollarSign size={13} color="var(--amber-gold)" />
                          <span>Revenues: <strong>Rs {crop.analytics ? crop.analytics.revenue.toLocaleString() : 0}</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div style={styles.showcaseActions}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={`badge ${crop.stockStatus === 'sold-out' ? 'badge-pending' : 'badge-verified'}`} style={{ textTransform: 'uppercase' }}>
                        {crop.stockStatus}
                      </span>
                      <button 
                        onClick={() => handleToggleSoldOut(crop)}
                        style={styles.toggleStockBtn}
                        title={crop.stockStatus === 'sold-out' ? 'Mark In Stock' : 'Mark Sold Out'}
                      >
                        <Ban size={14} />
                      </button>
                    </div>

                    <div style={styles.btnRow}>
                      <button 
                        onClick={() => handleTriggerEdit(crop)}
                        className="btn btn-secondary" 
                        style={styles.iconActionBtn}
                        title="Edit Product"
                      >
                        <Edit size={14} />
                      </button>
                      <button 
                        onClick={() => handleDeleteCrop(crop._id)}
                        className="btn btn-danger" 
                        style={styles.iconActionBtn}
                        title="Delete Product"
                      >
                        <Trash2 size={14} />
                      </button>
                      
                      {crop.listingMode === 'auction' && crop.status === 'available' && (
                        <button 
                          onClick={() => handleResolveAuction(crop._id)}
                          className="btn btn-outline" 
                          style={{ fontSize: '11px', padding: '6px 12px' }}
                        >
                          Resolve Bid
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* RENDER UPLOAD & EDIT FORM */}
      {activeSubTab === 'upload' && (
        <div style={styles.tabContent} className="glass-card">
          <h3 style={{ marginBottom: '20px', fontSize: '18px' }}>
            {editingCropId ? 'Edit Showcase Listing' : 'List New Agriculture Product'}
          </h3>
          <form onSubmit={handleUploadCrop} style={styles.formGrid}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Product Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Fresh Karnataka Alphonso Mangoes"
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Kannada Local Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. ರಾಗಿ (Ragi) or ಕಬ್ಬು (Sugarcane)"
                value={localName}
                onChange={(e) => setLocalName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>District (Karnataka)</label>
              <select className="form-input" value={district} onChange={(e) => setDistrict(e.target.value)}>
                <option value="Mandya">Mandya</option>
                <option value="Mysuru">Mysuru</option>
                <option value="Hassan">Hassan</option>
                <option value="Belagavi">Belagavi</option>
                <option value="Dharwad">Dharwad</option>
                <option value="Shivamogga">Shivamogga</option>
                <option value="Tumakuru">Tumakuru</option>
                <option value="Vijayapura">Vijayapura</option>
                <option value="Ballari">Ballari</option>
                <option value="Chikkamagaluru">Chikkamagaluru</option>
                <option value="Other">Other District</option>
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Village Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Koppa Village"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Product Category</label>
              <select className="form-input" value={category} onChange={(e) => setCategory(e.target.value)}>
                {categoriesList.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Quantity Available (kg / units)</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 500"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Quality Grade</label>
              <select className="form-input" value={grade} onChange={(e) => setGrade(e.target.value)}>
                <option value="A">Grade A (Premium Freshness/Export)</option>
                <option value="B">Grade B (Standard Grade)</option>
                <option value="C">Grade C (Substandard/Processing Grade)</option>
              </select>
            </div>

            {/* AI Recommendation Alert */}
            {cropName.trim().length > 2 && (
              <div style={styles.aiPricingCard} style={{ gridColumn: 'span 2' }}>
                <TrendingUp size={16} color="var(--emerald)" />
                <span>
                  {pricingLoading ? 'Querying pricing models...' : `AI Suggested Price: ${aiPriceRange}`}
                </span>
                {aiFairPrice && !pricingLoading && (
                  <button 
                    type="button" 
                    onClick={() => setPrice(aiFairPrice.toString())}
                    style={styles.applyAiBtn}
                  >
                    Apply Fair Price
                  </button>
                )}
              </div>
            )}

            <div className="form-group">
              <label>Listing Mode</label>
              <select className="form-input" value={listingMode} onChange={(e) => setListingMode(e.target.value)}>
                <option value="buynow">Buy Now (Fixed Cost)</option>
                <option value="auction">Auction Mode (Time-based Bids)</option>
              </select>
            </div>

            {listingMode === 'auction' ? (
              <div className="form-group">
                <label>Auction Duration</label>
                <select className="form-input" value={durationHours} onChange={(e) => setDurationHours(e.target.value)}>
                  <option value="6">6 Hours</option>
                  <option value="12">12 Hours</option>
                  <option value="24">24 Hours</option>
                </select>
              </div>
            ) : (
              <div className="form-group">
                <label>Fixed Buyout Price (Rs per kg/unit)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
            )}

            {listingMode === 'auction' && (
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Starting Bid Offer (Rs per kg/unit)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Starting bid"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>Stock Status</label>
              <select className="form-input" value={stockStatus} onChange={(e) => setStockStatus(e.target.value)}>
                <option value="in-stock">In Stock (Available for trade)</option>
                <option value="out-of-stock">Out of Stock</option>
                <option value="sold-out">Sold Out / Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label>Delivery Option</label>
              <select className="form-input" value={deliveryOption} onChange={(e) => setDeliveryOption(e.target.value)}>
                <option value="logistics-delivery">Logistics Trucking Delivery (Recommended)</option>
                <option value="farm-pickup">Direct Farm Pickup (Buyer arranges transport)</option>
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Product Images (Comma-separated URLs for multiple image uploads)</label>
              <input
                type="text"
                className="form-input"
                placeholder="url1, url2, url3"
                value={imagesText}
                onChange={(e) => setImagesText(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>{t('description')}</label>
              <textarea
                className="form-input"
                style={{ height: '80px', resize: 'none' }}
                placeholder="Product attributes, storage directives, organic fertilizer tags..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '15px' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '12px' }}>
                {editingCropId ? 'Save Changes' : 'Publish to showcase'}
              </button>
              {editingCropId && (
                <button type="button" onClick={resetForm} className="btn btn-secondary" style={{ padding: '12px' }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* RENDER FINANCIAL TRACKERS */}
      {activeSubTab === 'finance' && (
        <div style={styles.financeLayout}>
          <div style={styles.statsBlocks}>
            <div className="glass-card" style={styles.statBox}>
              <div style={styles.statLabel}>Revenues</div>
              <div style={{ ...styles.statVal, color: 'var(--emerald)' }}>Rs {financials.totalRevenue.toLocaleString()}</div>
            </div>
            <div className="glass-card" style={styles.statBox}>
              <div style={styles.statLabel}>Input Expenses</div>
              <div style={{ ...styles.statVal, color: 'var(--error)' }}>Rs {financials.totalExpenses.toLocaleString()}</div>
            </div>
            <div className="glass-card" style={styles.statBox}>
              <div style={styles.statLabel}>Net Margin profits</div>
              <div style={{ ...styles.statVal, color: financials.netProfit >= 0 ? 'var(--forest-green)' : 'var(--error)' }}>
                Rs {financials.netProfit.toLocaleString()}
              </div>
            </div>
            <div className="glass-card" style={styles.statBox}>
              <div style={styles.statLabel}>ROI Rate</div>
              <div style={{ ...styles.statVal, color: 'var(--amber-gold)' }}>{financials.roiPercentage}% ROI</div>
            </div>
          </div>

          <div style={styles.financePanelGrid}>
            <div className="glass-card" style={{ flex: '1 1 500px' }}>
              <h4 style={{ marginBottom: '15px' }}>Monthly Sales & Expenditure</h4>
              <AnalyticsChart data={monthlySales} type="bar" height={220} />
            </div>

            <div className="glass-card" style={{ flex: '1 1 350px' }}>
              <h4 style={{ marginBottom: '15px' }}>Log New Expense</h4>
              <form onSubmit={handleAddExpense} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Category</label>
                  <select className="form-input" value={expCategory} onChange={(e) => setExpCategory(e.target.value)}>
                    <option value="Seeds">High-yield Seeds</option>
                    <option value="Fertilizers">Fertilizers & Pest Controls</option>
                    <option value="Labor">Labor Hire</option>
                    <option value="Electricity">Electricity & Irrigation Bills</option>
                    <option value="Transport">Logistics / Transport Costs</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Cost Amount (Rs)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Enter cost"
                    value={expCost}
                    onChange={(e) => setExpCost(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Short Description</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Bought NPK fertilizer pack"
                    value={expDesc}
                    onChange={(e) => setExpDesc(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                  <Plus size={16} /> Log Expense
                </button>
              </form>
            </div>
          </div>

          {/* Expense Log History */}
          <div className="glass-card">
            <h4 style={{ marginBottom: '15px' }}>Farming Expense Log History</h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Category</th>
                    <th style={styles.th}>Description</th>
                    <th style={styles.th}>Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((ex) => (
                    <tr key={ex.id} style={styles.tableRow}>
                      <td style={styles.td}>{ex.date}</td>
                      <td style={styles.td}><span className="badge badge-verified" style={{ textTransform: 'none' }}>{ex.category}</span></td>
                      <td style={styles.td}>{ex.description}</td>
                      <td style={{ ...styles.td, color: 'var(--error)', fontWeight: '600' }}>Rs {ex.cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
    gap: '24px',
    paddingBottom: '50px'
  },
  verifyHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap'
  },
  subTabs: {
    display: 'flex',
    gap: '12px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '10px',
    flexWrap: 'wrap'
  },
  subTabBtn: {
    padding: '10px 20px',
    borderRadius: '20px',
    border: 'none',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  tabContent: {
    animation: 'fadeIn 0.3s ease-out'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    marginBottom: '15px'
  },
  empty: {
    padding: '40px',
    textAlign: 'center',
    color: 'var(--text-secondary)',
    border: '1px dashed var(--border-color)',
    borderRadius: '12px',
    backgroundColor: 'var(--bg-secondary)',
    fontSize: '14px'
  },
  listGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  listingCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px',
    padding: '20px'
  },
  showcaseItemMain: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    flex: '1 1 500px',
    flexWrap: 'wrap'
  },
  showcaseImg: {
    width: '120px',
    height: '100px',
    objectFit: 'cover',
    borderRadius: '8px',
    border: '1px solid var(--border-color)'
  },
  showcaseDetails: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  showcaseRowHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap'
  },
  metaRow: {
    display: 'flex',
    gap: '10px',
    fontSize: '13px',
    color: 'var(--text-secondary)',
    flexWrap: 'wrap'
  },
  analyticsSection: {
    display: 'flex',
    gap: '15px',
    marginTop: '5px',
    flexWrap: 'wrap'
  },
  analyticsStat: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: 'var(--text-secondary)',
    backgroundColor: 'var(--bg-primary)',
    padding: '4px 10px',
    borderRadius: '6px',
    border: '1px solid var(--border-color)'
  },
  showcaseActions: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '12px',
    flexShrink: 0
  },
  toggleStockBtn: {
    background: 'none',
    border: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
    borderRadius: '50px',
    width: '24px',
    height: '24px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: '5px',
    transition: 'background-color 0.2s'
  },
  btnRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  },
  iconActionBtn: {
    width: '32px',
    height: '32px',
    padding: 0,
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px'
  },
  aiPricingCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    backgroundColor: 'var(--green-glow)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    borderRadius: '8px',
    color: 'var(--forest-green)',
    fontSize: '13px',
    flexWrap: 'wrap',
    gap: '10px'
  },
  applyAiBtn: {
    backgroundColor: 'var(--forest-green)',
    color: 'white',
    border: 'none',
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  financeLayout: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  statsBlocks: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '15px'
  },
  statBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    padding: '20px'
  },
  statLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase'
  },
  statVal: {
    fontSize: '22px',
    fontWeight: '700'
  },
  financePanelGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  tableHeaderRow: {
    borderBottom: '1px solid var(--border-color)'
  },
  th: {
    padding: '12px',
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase'
  },
  tableRow: {
    borderBottom: '1px solid var(--border-color)',
    transition: 'background-color 0.2s'
  },
  td: {
    padding: '14px 12px',
    fontSize: '13px',
    color: 'var(--text-primary)'
  }
};
