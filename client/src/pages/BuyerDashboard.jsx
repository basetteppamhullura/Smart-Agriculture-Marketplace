import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import ProductReviewsSection from '../components/ProductReviewsSection';
import NegotiationModal from '../components/NegotiationModal';
import BargainingHub from '../components/BargainingHub';
import { Search, MapPin, Award, Calendar, DollarSign, Heart, ShoppingBag, Bell, Star, Navigation, Clock, Truck, ChevronRight, Brain, Landmark, BookOpen } from 'lucide-react';

export default function BuyerDashboard({ actionPayload, clearActionPayload, onChangeTab }) {
  const { user, toggleFavorite, apiUrl } = useAuth();
  const { t } = useThemeLanguage();

  const [activeSubTab, setActiveSubTab] = useState('browse'); // 'browse' | 'orders' | 'subscriptions' | 'favorites'
  const [crops, setCrops] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (actionPayload && actionPayload.crop) {
      // Find exact match in our loaded crop list
      const matchedCrop = crops.find(c => c._id === actionPayload.crop._id) || actionPayload.crop;
      if (actionPayload.action === 'buy') {
        setSelectedCrop(matchedCrop);
      } else if (actionPayload.action === 'negotiate') {
        setNegotiatingCrop(matchedCrop);
      }
      clearActionPayload();
    }
  }, [actionPayload, crops]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [listingMode, setListingMode] = useState('');
  const [qualityGrade, setQualityGrade] = useState('');
  const [category, setCategory] = useState('');

  // Transaction modals states
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [negotiatingCrop, setNegotiatingCrop] = useState(null);
  const [checkoutQty, setCheckoutQty] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [isSubscription, setIsSubscription] = useState(false);
  const [subFrequency, setSubFrequency] = useState('weekly');

  // Review modal states
  const [reviewOrder, setReviewOrder] = useState(null);
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');

  const token = localStorage.getItem('sam-token');

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

  // Apply filters on search change
  useEffect(() => {
    loadCrops();
  }, [search, location, listingMode, qualityGrade, category]);

  // Handle Instant purchase checkout (with Bulk Discount logic)
  const handlePurchase = async (e) => {
    e.preventDefault();
    if (!checkoutQty || Number(checkoutQty) <= 0) return;

    const qty = Number(checkoutQty);
    let finalPrice = selectedCrop.price;
    
    // Apply 10% bulk discount for quantities >= 500
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
          customPrice: finalPrice // Backend will capture this or calculate it
        })
      });

      const data = await res.json();
      if (res.ok) {
        alert(qty >= 500 
          ? `Bulk Order Successful! You saved Rs ${(selectedCrop.price - finalPrice) * qty} with our 10% wholesale discount.`
          : 'Order purchased successfully!'
        );
        setSelectedCrop(null);
        setCheckoutQty('');
        setIsSubscription(false);
        await Promise.all([loadCrops(), loadOrders()]);
      } else {
        alert(data.message || 'Payment/checkout failed.');
      }
    } catch (err) {
      alert('Error connecting to payment gateway');
    }
  };

  // Place a Bid on Live Auction
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

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading Buyer Dashboard...</div>;
  }

  const subscriptionOrders = orders.filter(o => o.subscriptionDetails && o.subscriptionDetails.isSubscription);
  const normalOrders = orders.filter(o => !o.subscriptionDetails || !o.subscriptionDetails.isSubscription);
  const categoriesList = [
    'Fruits', 'Vegetables', 'Grains', 'Pulses', 'Spices', 
    'Flowers', 'Seeds', 'Organic products', 'Dairy products', 
    'Agricultural equipment', 'Fertilizers', 'Other farm-related products'
  ];

  // Bulk Discount values
  const qtyNum = Number(checkoutQty) || 0;
  const isBulk = qtyNum >= 500;
  const unitPrice = selectedCrop ? (isBulk ? Math.round(selectedCrop.price * 0.9) : selectedCrop.price) : 0;
  const totalCost = selectedCrop ? unitPrice * qtyNum : 0;

  return (
    <div className="fade-in" style={styles.container}>
      {/* Title Panel */}
      <div className="glass-card" style={styles.header}>
        <h2 style={{ fontSize: '22px' }}>Buyer Dashboard - Purchase Window</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Browse all active crops and agricultural equipment in the showcase, place bids, or subscribe for boxes.
        </p>
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
          onClick={() => setActiveSubTab('orders')}
          style={{
            ...styles.subTabBtn,
            backgroundColor: activeSubTab === 'orders' ? 'var(--forest-green)' : 'transparent',
            color: activeSubTab === 'orders' ? 'white' : 'var(--text-secondary)'
          }}
        >
          Purchases & Shipments tracking
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
          Starred Sellers
        </button>
      </div>

      {/* BROWSE CROPS SECTION */}
      {activeSubTab === 'browse' && (
        <div style={styles.browseSection} className="fade-in">
          {/* Search bar & Filters */}
          <div className="glass-card" style={styles.filterBar}>
            <div style={styles.searchBox}>
              <Search size={18} color="var(--text-secondary)" />
              <input
                type="text"
                placeholder="Search products, fruits, equipment, seeds..."
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
                <option value="">Location: {t('all')}</option>
                <option value="Mandya, Karnataka">Mandya, Karnataka</option>
                <option value="Nashik, Maharashtra">Nashik, Maharashtra</option>
              </select>

              <select className="form-input" style={styles.filterSelect} value={listingMode} onChange={(e) => setListingMode(e.target.value)}>
                <option value="">Mode: {t('all')}</option>
                <option value="buynow">{t('buynow')}</option>
                <option value="auction">{t('auction')}</option>
              </select>
            </div>
          </div>

          {/* Crops Grid */}
          <div style={styles.grid}>
            {crops.map((crop) => {
              const isFav = user.favoriteFarmers && user.favoriteFarmers.includes(crop.farmer._id);
              const isSoldOut = crop.stockStatus === 'sold-out' || crop.quantity <= 0;
              return (
                <div key={crop._id} className="glass-card" style={styles.cropCard}>
                  <img src={crop.imageUrl || (crop.images && crop.images[0])} alt={crop.name} style={styles.cropImg} />
                  
                  <div style={styles.cardBody}>
                    <div style={styles.cardHeader}>
                      <h4 style={{ fontSize: '17px' }}>{crop.name}</h4>
                      <button 
                        onClick={() => toggleFavorite(crop.farmer._id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        <Heart size={20} fill={isFav ? '#ef4444' : 'none'} color={isFav ? '#ef4444' : 'var(--text-secondary)'} />
                      </button>
                    </div>

                    <div style={styles.farmerLine}>
                      <span>{crop.farmer.name}</span>
                      <span style={{ color: 'var(--amber-gold)', fontWeight: 'bold' }}>★ {crop.farmer.smartFarmingScore.overallScore}</span>
                      {crop.farmer.hasTrustedBadge && (
                        <span className="badge badge-trusted" style={{ fontSize: '8px', padding: '1px 5px' }}>Trusted</span>
                      )}
                    </div>

                    <div style={styles.cropSpecs}>
                      <span className="badge badge-verified" style={{ alignSelf: 'flex-start', textTransform: 'none', fontSize: '9px' }}>{crop.category}</span>
                      <div style={styles.specItem}>
                        <MapPin size={13} color="var(--text-secondary)" />
                        <span>{crop.location}</span>
                      </div>
                      <div style={styles.specItem}>
                        <Calendar size={13} color="var(--text-secondary)" />
                        <span>Grade {crop.qualityGrade} • Delivery: {crop.deliveryOption === 'farm-pickup' ? 'Farm Pickup' : 'Express Delivery'}</span>
                      </div>
                    </div>

                    <div style={styles.priceRow}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                          {isSoldOut ? 'SOLD OUT' : `Stock: ${crop.quantity} left`}
                        </span>
                        <strong style={{ fontSize: '18px' }}>Rs {crop.price} / unit</strong>
                      </div>
                      
                      {crop.listingMode === 'buynow' ? (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button 
                            onClick={() => setSelectedCrop(crop)}
                            className="btn btn-primary"
                            style={{ padding: '6px 12px', fontSize: '11px' }}
                            disabled={isSoldOut}
                          >
                            Buy Now
                          </button>
                          <button 
                            onClick={() => setNegotiatingCrop(crop)}
                            className="btn btn-outline"
                            style={{ padding: '6px 12px', fontSize: '11px', borderColor: 'var(--amber-gold)', color: 'var(--amber-gold)' }}
                            disabled={isSoldOut}
                          >
                            Negotiate
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setSelectedCrop(crop)}
                          className="btn btn-primary"
                          style={{ padding: '8px 16px', fontSize: '12px' }}
                          disabled={isSoldOut}
                        >
                          Place Bid
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ORDERS & SHIPPINGS SECTION */}
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
                    <h4 style={{ fontSize: '16px' }}>{order.crop.name}</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Seller: {order.farmer.name} • Quantity: {order.quantity} units • Total: Rs {order.totalAmount}
                    </p>
                    <div style={{ marginTop: '10px' }}>
                      <span className="badge badge-verified" style={{ textTransform: 'capitalize' }}>Payment: {order.paymentStatus}</span>
                      <span className="badge badge-trusted" style={{ marginLeft: '10px', textTransform: 'capitalize', color: 'var(--forest-green)', backgroundColor: 'var(--green-glow)' }}>
                        Delivery: {order.deliveryStatus}
                      </span>
                    </div>
                  </div>

                  {/* Delivery Timeline Summary */}
                  <div style={styles.timelineContainer}>
                    <div style={{ fontWeight: '600', fontSize: '12px', marginBottom: '8px' }}>Logistics Route:</div>
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

                  {/* Reviews Trigger */}
                  <div style={styles.reviewTriggerArea}>
                    {!order.review ? (
                      <button 
                        onClick={() => setReviewOrder(order)}
                        className="btn btn-outline" 
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

      {/* SUBSCRIPTIONS SECTION */}
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

      {/* STARRED FARMERS SECTION */}
      {activeSubTab === 'favorites' && (
        <div style={styles.tabContent} className="fade-in">
          <div style={styles.sectionTitle}>Starred Sellers ({user.favoriteFarmers ? user.favoriteFarmers.length : 0})</div>
          {(!user.favoriteFarmers || user.favoriteFarmers.length === 0) ? (
            <div style={styles.empty}>No favorite farmers bookmarked. Bookmark farmers from the crop lists.</div>
          ) : (
            <div style={styles.grid}>
              {crops.filter(c => user.favoriteFarmers.includes(c.farmer._id)).map((crop) => (
                <div key={crop._id} className="glass-card" style={styles.cropCard}>
                  <img src={crop.imageUrl || (crop.images && crop.images[0])} alt={crop.name} style={crop.cropImg} />
                  <div style={styles.cardBody}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4>{crop.farmer.name}</h4>
                      <button onClick={() => toggleFavorite(crop.farmer._id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <Heart size={20} fill="#ef4444" color="#ef4444" />
                      </button>
                    </div>
                    <div style={{ color: 'var(--amber-gold)', fontWeight: 'bold', margin: '5px 0' }}>★ {crop.farmer.smartFarmingScore.overallScore} Smart Score</div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Region: {crop.location}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Specialty: {crop.name}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'bargains' && (
        <div style={styles.tabContent} className="fade-in">
          <BargainingHub />
        </div>
      )}

      {/* CHECKOUT MODAL (Buy now or Bid with Multi-image carousel) */}
      {selectedCrop && (
        <div className="modal-overlay" onClick={() => setSelectedCrop(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedCrop.name}</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '15px' }}>
              Category: {selectedCrop.category} • Farmer: {selectedCrop.farmer.name}
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
                  <label>Order Quantity (Max {selectedCrop.quantity} available)</label>
                  <input
                    type="number"
                    className="form-input"
                    max={selectedCrop.quantity}
                    value={checkoutQty}
                    onChange={(e) => setCheckoutQty(e.target.value)}
                    placeholder="e.g. 100"
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

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
                  Confirm Order Checkout
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
    gap: '24px',
    paddingBottom: '50px'
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
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
  browseSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  filterBar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)'
  },
  searchInput: {
    flex: 1,
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--text-primary)',
    fontSize: '14px',
    outline: 'none'
  },
  filterRow: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },
  filterSelect: {
    flex: 1,
    minWidth: '150px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px'
  },
  cropCard: {
    padding: 0,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
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
    gap: '10px'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  farmerLine: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: 'var(--text-secondary)'
  },
  cropSpecs: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    paddingTop: '8px',
    borderTop: '1px solid var(--border-color)'
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
    marginTop: '10px',
    paddingTop: '10px',
    borderTop: '1px solid var(--border-color)'
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
  ordersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  // Styled by class order-row-grid in index.css
  timelineContainer: {
    borderLeft: '1px solid var(--border-color)',
    paddingLeft: '20px'
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
    marginBottom: '20px'
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
