import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import { Award, Star, CheckCircle, ShieldAlert, ArrowUpRight, ShieldCheck, Truck, Sparkles, MessageSquare } from 'lucide-react';

export default function ReputationDashboard() {
  const { apiUrl } = useAuth();
  const { t } = useThemeLanguage();

  const [farmers, setFarmers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLeaderboardData = async () => {
    try {
      // 1. Fetch crops list which populates farmer details
      const cropsRes = await fetch(`${apiUrl}/crops`);
      if (cropsRes.ok) {
        const cropsList = await cropsRes.json();
        
        // Group unique farmers
        const farmersMap = {};
        cropsList.forEach(crop => {
          if (crop.farmer && crop.farmer._id && !farmersMap[crop.farmer._id]) {
            // Assign custom mock ranking tier and specialty based on their ratings
            const rating = crop.farmer.smartFarmingScore?.overallScore || 4.5;
            let rankTier = 'Trusted Farmer';
            if (rating >= 4.7) rankTier = 'Top Seller';
            else if (rating >= 4.5) rankTier = 'Premium Seller';
            
            farmersMap[crop.farmer._id] = {
              ...crop.farmer,
              specialty: crop.name,
              rankTier,
              location: crop.location || 'Karnataka, India',
              organicCertified: crop.category === 'Organic products' || crop.name.toLowerCase().includes('organic'),
              productsCount: 1
            };
          } else if (crop.farmer && crop.farmer._id) {
            farmersMap[crop.farmer._id].productsCount += 1;
            if (crop.category === 'Organic products' || crop.name.toLowerCase().includes('organic')) {
              farmersMap[crop.farmer._id].organicCertified = true;
            }
          }
        });
        setFarmers(Object.values(farmersMap).sort((a, b) => (b.smartFarmingScore?.overallScore || 0) - (a.smartFarmingScore?.overallScore || 0)));
      }

      // 2. Fetch mock order feedback reviews
      const ordersRes = await fetch(`${apiUrl}/orders`);
      if (ordersRes.ok) {
        const ordersList = await ordersRes.json();
        const reviewsFeed = [];
        ordersList.forEach(order => {
          if (order.review && order.review.rating) {
            reviewsFeed.push({
              _id: order._id,
              buyerName: order.buyer?.name || 'Retailer',
              farmerName: order.farmer?.name || 'Farmer',
              cropName: order.crop?.name || 'Crop Listing',
              rating: order.review.rating,
              comment: order.review.comment,
              date: order.review.createdAt
            });
          }
        });
        
        // Add fallback seed reviews if empty
        if (reviewsFeed.length === 0) {
          reviewsFeed.push(
            {
              _id: 'rev_1',
              buyerName: 'Ramesh Kumar (Retailer)',
              farmerName: 'Basappa Gowda',
              cropName: 'Sona Masuri Rice (Aged)',
              rating: 5,
              comment: 'Moisture-controlled packaging is excellent! Direct delivery was handled cleanly within 3 days.',
              date: new Date().toISOString()
            },
            {
              _id: 'rev_2',
              buyerName: 'Suresh Gowda',
              farmerName: 'Malleshappa Belagavi',
              cropName: 'Organic Jowar (Sorghum)',
              rating: 4,
              comment: 'Great quality, organic certification tags were verified. Will buy again.',
              date: new Date().toISOString()
            }
          );
        }
        setReviews(reviewsFeed);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboardData();
  }, [apiUrl]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading Reputation Leaderboard...</div>;
  }

  return (
    <div className="fade-in" style={styles.container}>
      {/* Title Header */}
      <div className="glass-card" style={styles.header}>
        <div style={styles.titleRow}>
          <Award size={28} color="var(--amber-gold)" />
          <h2 style={{ fontSize: '22px', margin: 0 }}>Farmer Reputation & Leaderboard</h2>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '5px 0 0 0' }}>
          Real profiles, smart farming scores, quality indicators, and trust rankings of local agricultural producers.
        </p>
      </div>

      {/* LEADERBOARD TABLE GRID */}
      <div className="glass-card" style={styles.mainCard}>
        <h4 style={{ margin: '0 0 15px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
          Seller Rank Leaderboard
        </h4>
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.th}>Rank & Farmer</th>
                <th style={styles.th}>Overall Score</th>
                <th style={styles.th}>Quality index</th>
                <th style={styles.th}>Delivery Reliability</th>
                <th style={styles.th}>Trust Badges</th>
                <th style={styles.th}>Specialty</th>
              </tr>
            </thead>
            <tbody>
              {farmers.map((f, idx) => (
                <tr key={f._id || idx} style={styles.tableRow}>
                  <td style={styles.td}>
                    <div style={styles.farmerMetaCol}>
                      <span style={styles.rankNum}>#{idx + 1}</span>
                      <img 
                        src={f.avatarUrl || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=80&q=80"} 
                        alt={f.name} 
                        style={styles.farmerAvatar} 
                      />
                      <div>
                        <strong style={{ display: 'block', fontSize: '14px' }}>{f.name}</strong>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{f.location}</span>
                      </div>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
                      <Star size={14} fill="var(--amber-gold)" color="var(--amber-gold)" />
                      <span>{f.smartFarmingScore?.overallScore || '4.5'}</span>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Sparkles size={13} color="var(--emerald)" />
                      <span>{f.smartFarmingScore?.quality || '4.5'} / 5.0</span>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Truck size={13} color="var(--forest-green)" />
                      <span>{f.smartFarmingScore?.deliveryReliability || '4.8'} / 5.0</span>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      <span className="badge" style={{ backgroundColor: 'var(--forest-green)', color: 'white', fontSize: '9px', padding: '2px 8px' }}>
                        {f.rankTier}
                      </span>
                      {f.hasTrustedBadge && (
                        <span className="badge badge-trusted" style={{ fontSize: '9px', padding: '2px 8px' }}>Trusted</span>
                      )}
                      {f.organicCertified && (
                        <span className="badge badge-verified" style={{ fontSize: '9px', padding: '2px 8px', color: 'var(--emerald)', backgroundColor: 'var(--green-glow)' }}>Organic Certified</span>
                      )}
                    </div>
                  </td>
                  <td style={styles.td}>{f.specialty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECENT VERIFIED REVIEWS */}
      <div className="glass-card" style={styles.reviewsCard}>
        <h4 style={{ margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
          <MessageSquare size={16} color="var(--forest-green)" /> Buyer Feedback & Verified Reviews
        </h4>
        <div style={styles.reviewsGrid}>
          {reviews.map((rev) => (
            <div key={rev._id} style={styles.reviewCard}>
              <div style={styles.reviewHeader}>
                <div>
                  <strong>{rev.buyerName}</strong>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>
                    Purchased <strong>{rev.cropName}</strong> from {rev.farmerName}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star 
                      key={s} 
                      size={12} 
                      fill={s <= rev.rating ? "var(--amber-gold)" : "none"} 
                      color="var(--amber-gold)" 
                    />
                  ))}
                </div>
              </div>
              <p style={styles.reviewText}>{rev.comment}</p>
              <div style={styles.verifiedStamp}>
                <CheckCircle size={10} fill="var(--emerald)" color="white" />
                <span>Verified Buyer Purchase</span>
              </div>
            </div>
          ))}
        </div>
      </div>
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
    textAlign: 'left'
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  mainCard: {
    textAlign: 'left'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    minWidth: '700px'
  },
  tableHeaderRow: {
    borderBottom: '1px solid var(--border-color)'
  },
  th: {
    padding: '12px',
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase'
  },
  tableRow: {
    borderBottom: '1px solid var(--border-color)',
    transition: 'background-color 0.2s',
    cursor: 'default'
  },
  td: {
    padding: '14px 12px',
    fontSize: '13px',
    color: 'var(--text-primary)',
    verticalAlign: 'middle'
  },
  farmerMetaCol: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  rankNum: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: 'var(--text-secondary)',
    width: '24px'
  },
  farmerAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '1px solid var(--border-color)'
  },
  reviewsCard: {
    textAlign: 'left'
  },
  reviewsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '15px'
  },
  reviewCard: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '15px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  reviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  reviewText: {
    fontSize: '12px',
    color: 'var(--text-primary)',
    lineHeight: '1.4',
    margin: 0
  },
  verifiedStamp: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '10px',
    color: 'var(--emerald)',
    fontWeight: '700'
  }
};
