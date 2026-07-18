import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import { ShieldAlert, Users, Award, ShoppingCart, Calendar, Plus, RefreshCw } from 'lucide-react';

export default function AdminDashboard() {
  const { apiUrl } = useAuth();
  const { t } = useThemeLanguage();

  const [users, setUsers] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('users'); // 'users' | 'listings' | 'postings'

  // News posting form state
  const [newsTitle, setNewsTitle] = useState('');
  const [newsCategory, setNewsCategory] = useState('Government Scheme');
  const [newsContent, setNewsContent] = useState('');

  const token = localStorage.getItem('sam-token');

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [usersRes, cropsRes] = await Promise.all([
        fetch(`${apiUrl}/auth/users`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${apiUrl}/crops`)
      ]);

      if (usersRes.ok && cropsRes.ok) {
        setUsers(await usersRes.json());
        setCrops(await cropsRes.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [apiUrl]);

  // Handle Verify Farmer
  const handleVerifyFarmer = async (userId) => {
    try {
      const res = await fetch(`${apiUrl}/auth/verify/${userId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Farmer profile verified successfully!');
        loadAdminData();
      }
    } catch (err) {
      alert('Verification request failed');
    }
  };

  // Add mock news item
  const handlePostNews = (e) => {
    e.preventDefault();
    if (!newsTitle || !newsContent) return;

    // Simulate posting news (storing in localStorage for InfoHub retrieval!)
    const storedNews = JSON.parse(localStorage.getItem('sam-news') || '[]');
    const newArticle = {
      id: `news_${Date.now()}`,
      title: newsTitle,
      category: newsCategory,
      content: newsContent,
      date: new Date().toLocaleDateString()
    };

    localStorage.setItem('sam-news', JSON.stringify([newArticle, ...storedNews]));
    alert('News article posted to the Information Hub!');
    setNewsTitle('');
    setNewsContent('');
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading Admin Console...</div>;
  }

  const farmersCount = users.filter(u => u.role === 'farmer').length;
  const verifiedFarmers = users.filter(u => u.role === 'farmer' && u.isVerified).length;
  const buyersCount = users.filter(u => u.role === 'buyer').length;

  return (
    <div className="fade-in" style={styles.container}>
      {/* Title */}
      <div className="glass-card" style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={24} color="var(--forest-green)" />
          <h2 style={{ fontSize: '22px' }}>Admin Moderation Panel</h2>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Manage farmer verification requests, moderate active crop listings, and issue market news flashes.
        </p>
      </div>

      {/* KPI Blocks */}
      <div style={styles.kpiGrid}>
        <div className="glass-card" style={styles.kpiCard}>
          <Users size={28} color="var(--forest-green)" />
          <div>
            <div style={styles.kpiLabel}>Total Registered Users</div>
            <div style={styles.kpiVal}>{users.length}</div>
          </div>
        </div>
        <div className="glass-card" style={styles.kpiCard}>
          <Award size={28} color="var(--forest-green)" />
          <div>
            <div style={styles.kpiLabel}>Verified Farmers</div>
            <div style={styles.kpiVal}>{verifiedFarmers} / {farmersCount}</div>
          </div>
        </div>
        <div className="glass-card" style={styles.kpiCard}>
          <ShoppingCart size={28} color="var(--forest-green)" />
          <div>
            <div style={styles.kpiLabel}>Active Listings</div>
            <div style={styles.kpiVal}>{crops.length} crops</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.subTabs}>
        <button
          onClick={() => setActiveSubTab('users')}
          style={{
            ...styles.subTabBtn,
            backgroundColor: activeSubTab === 'users' ? 'var(--forest-green)' : 'transparent',
            color: activeSubTab === 'users' ? 'white' : 'var(--text-secondary)'
          }}
        >
          Verify Farmers & User Accounts
        </button>
        <button
          onClick={() => setActiveSubTab('listings')}
          style={{
            ...styles.subTabBtn,
            backgroundColor: activeSubTab === 'listings' ? 'var(--forest-green)' : 'transparent',
            color: activeSubTab === 'listings' ? 'white' : 'var(--text-secondary)'
          }}
        >
          Monitor Crop Listings
        </button>
        <button
          onClick={() => setActiveSubTab('postings')}
          style={{
            ...styles.subTabBtn,
            backgroundColor: activeSubTab === 'postings' ? 'var(--forest-green)' : 'transparent',
            color: activeSubTab === 'postings' ? 'white' : 'var(--text-secondary)'
          }}
        >
          Post Scheme / News Update
        </button>
      </div>

      {/* RENDER USER MANAGEMENT */}
      {activeSubTab === 'users' && (
        <div style={styles.tabContent} className="glass-card">
          <h4 style={{ marginBottom: '15px' }}>User Profiles</h4>
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Verification Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} style={styles.tableRow}>
                    <td style={styles.td}><strong>{u.name}</strong></td>
                    <td style={styles.td}>{u.email}</td>
                    <td style={styles.td}>
                      <span className="badge badge-verified" style={{ textTransform: 'capitalize' }}>{u.role}</span>
                    </td>
                    <td style={styles.td}>
                      {u.role === 'farmer' ? (
                        <span className={`badge ${u.isVerified ? 'badge-verified' : 'badge-pending'}`}>
                          {u.isVerified ? 'Verified' : 'Pending'}
                        </span>
                      ) : (
                        <span className="badge badge-verified">Active</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      {u.role === 'farmer' && !u.isVerified && (
                        <button 
                          onClick={() => handleVerifyFarmer(u._id)}
                          className="btn btn-primary" 
                          style={{ fontSize: '11px', padding: '4px 10px' }}
                        >
                          Verify Account
                        </button>
                      )}
                      {u.role === 'farmer' && u.isVerified && (
                        <span style={{ fontSize: '12px', color: 'var(--emerald)', fontWeight: '600' }}>Approved</span>
                      )}
                      {u.role !== 'farmer' && <span style={{ color: 'var(--text-secondary)' }}>N/A</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RENDER LISTINGS MONITOR */}
      {activeSubTab === 'listings' && (
        <div style={styles.tabContent} className="glass-card">
          <h4 style={{ marginBottom: '15px' }}>Listed Crops Management</h4>
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={styles.th}>Crop Name</th>
                  <th style={styles.th}>Farmer</th>
                  <th style={styles.th}>Price / kg</th>
                  <th style={styles.th}>Mode</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {crops.map((crop) => (
                  <tr key={crop._id} style={styles.tableRow}>
                    <td style={styles.td}><strong>{crop.name}</strong></td>
                    <td style={styles.td}>{crop.farmer.name}</td>
                    <td style={styles.td}>Rs {crop.price}</td>
                    <td style={styles.td}><span className="badge badge-trusted">{crop.listingMode}</span></td>
                    <td style={styles.td}><span className="badge badge-verified">{crop.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RENDER NEWS SCHEME POSTER */}
      {activeSubTab === 'postings' && (
        <div style={styles.tabContent} className="glass-card">
          <h4 style={{ marginBottom: '15px' }}>Draft News / Subsidy Scheme</h4>
          <form onSubmit={handlePostNews} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div className="form-group">
              <label>Article Title</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Karnataka Govt Announces Organic Compost Subsidy under PM-PRANAM"
                value={newsTitle}
                onChange={(e) => setNewsTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Category</label>
              <select className="form-input" value={newsCategory} onChange={(e) => setNewsCategory(e.target.value)}>
                <option value="Government Scheme">Government Scheme</option>
                <option value="Daily Price Updates">Daily Price Updates</option>
                <option value="Tutorial Guide">Tutorial Guide</option>
                <option value="Agricultural News">Agricultural News</option>
              </select>
            </div>

            <div className="form-group">
              <label>Content Description</label>
              <textarea
                className="form-input"
                style={{ height: '120px', resize: 'none' }}
                placeholder="Detail eligibility conditions, crop application criteria, or pricing ranges..."
                value={newsContent}
                onChange={(e) => setNewsContent(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary">
              <Plus size={16} /> Publish Posting
            </button>
          </form>
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
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px'
  },
  kpiCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '20px'
  },
  kpiLabel: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase'
  },
  kpiVal: {
    fontSize: '22px',
    fontWeight: '700'
  },
  subTabs: {
    display: 'flex',
    gap: '12px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '10px'
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
