import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import { BookOpen, CloudRain, ShieldCheck, PlayCircle, HelpCircle, AlertTriangle, FileSpreadsheet, Loader2 } from 'lucide-react';

export default function InfoHub() {
  const { apiUrl } = useAuth();
  const { t } = useThemeLanguage();

  const [activeSubTab, setActiveSubTab] = useState('disease'); // 'disease' | 'prices' | 'schemes' | 'guides'
  
  // Disease Scan States
  const [scanCrop, setScanCrop] = useState('rice');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  // Government schemes listings
  const [schemes, setSchemes] = useState([
    {
      id: 'sch_1',
      title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
      category: 'Government Scheme',
      content: 'Low-premium crop insurance program supporting farmers against unavoidable environmental damages (monsoon floods, pest epidemics, storms). Premium rates are capped at 2.0% for Kharif and 1.5% for Rabi crops.',
      date: '12/07/2026'
    },
    {
      id: 'sch_2',
      title: 'PM Kisan Samman Nidhi (PM-KISAN)',
      category: 'Government Scheme',
      content: 'Income support scheme providing Rs 6,000 per year in three equal installments directly transferred to bank accounts of all landholder farmer families across the country.',
      date: '10/07/2026'
    }
  ]);

  // Daily Mandi prices
  const mandiPrices = [
    { crop: 'Basmati Paddy', state: 'Haryana', min: 3800, max: 4200, avg: 4000 },
    { crop: 'Premium Wheat', state: 'Punjab', min: 2100, max: 2400, avg: 2250 },
    { crop: 'Red Tomatoes', state: 'Karnataka', min: 1800, max: 3200, avg: 2500 },
    { crop: 'Standard Potatoes', state: 'Uttar Pradesh', min: 1200, max: 1600, avg: 1400 },
    { crop: 'Red Onions', state: 'Maharashtra', min: 1500, max: 2200, avg: 1850 }
  ];

  // Tutorials List
  const tutorials = [
    { title: 'Drip Irrigation Setup Guide', duration: '12 mins', views: '4.2k views', desc: 'Step-by-step layout of piping and nozzles for clayey and loamy soils.' },
    { title: 'Making Jeevamrutha Organic Fertilizer', duration: '8 mins', views: '8.5k views', desc: 'Formula using cow dung, pulse flour, jaggery, and forest soil.' },
    { title: 'Zero Budget Natural Farming (ZBNF)', duration: '15 mins', views: '12k views', desc: 'Introduction to natural cultivation methods that lower input expenses.' }
  ];

  // Load Admin posted news from localStorage
  useEffect(() => {
    const adminNews = JSON.parse(localStorage.getItem('sam-news') || '[]');
    if (adminNews.length > 0) {
      setSchemes(prev => [...adminNews, ...prev]);
    }
  }, []);

  // Trigger Plant Disease Scan
  const handleDiseaseScan = async (e) => {
    e.preventDefault();
    setScanning(true);
    setScanResult(null);

    // Simulate image upload processing
    setTimeout(async () => {
      try {
        const res = await fetch(`${apiUrl}/ai/detect-disease`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cropName: scanCrop })
        });
        if (res.ok) {
          const data = await res.json();
          setScanResult(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setScanning(false);
      }
    }, 2000);
  };

  return (
    <div className="fade-in" style={styles.container}>
      {/* Title */}
      <div className="glass-card" style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen size={24} color="var(--forest-green)" />
          <h2 style={{ fontSize: '22px' }}>Agricultural Information Hub</h2>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Access real-time Mandi market rates, check localized weather forecasts, read government schemes, or use our AI crop leaves diagnostic scan.
        </p>
      </div>

      {/* Sub tabs */}
      <div style={styles.subTabs}>
        <button
          onClick={() => setActiveSubTab('disease')}
          style={{
            ...styles.subTabBtn,
            backgroundColor: activeSubTab === 'disease' ? 'var(--forest-green)' : 'transparent',
            color: activeSubTab === 'disease' ? 'white' : 'var(--text-secondary)'
          }}
        >
          AI Plant Disease Scanner
        </button>
        <button
          onClick={() => setActiveSubTab('prices')}
          style={{
            ...styles.subTabBtn,
            backgroundColor: activeSubTab === 'prices' ? 'var(--forest-green)' : 'transparent',
            color: activeSubTab === 'prices' ? 'white' : 'var(--text-secondary)'
          }}
        >
          Mandi Market Prices
        </button>
        <button
          onClick={() => setActiveSubTab('schemes')}
          style={{
            ...styles.subTabBtn,
            backgroundColor: activeSubTab === 'schemes' ? 'var(--forest-green)' : 'transparent',
            color: activeSubTab === 'schemes' ? 'white' : 'var(--text-secondary)'
          }}
        >
          Govt Schemes & Subsidies
        </button>
        <button
          onClick={() => setActiveSubTab('guides')}
          style={{
            ...styles.subTabBtn,
            backgroundColor: activeSubTab === 'guides' ? 'var(--forest-green)' : 'transparent',
            color: activeSubTab === 'guides' ? 'white' : 'var(--text-secondary)'
          }}
        >
          Farming Tutorials
        </button>
      </div>

      {/* RENDER DISEASE SCANNER */}
      {activeSubTab === 'disease' && (
        <div style={styles.tabContent} className="glass-card">
          <h3 style={{ marginBottom: '15px', fontSize: '18px' }}>AI Plant Disease Diagnosis</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px' }}>
            Upload a high-resolution photo of your crop leaf showing discoloration or spots. Our AI scans leaf textures to diagnose pests or nutrient deficiencies and recommends organic remedies.
          </p>

          <form onSubmit={handleDiseaseScan} style={styles.scanForm}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Select Crop Leaf Specimen</label>
              <select className="form-input" value={scanCrop} onChange={(e) => setScanCrop(e.target.value)}>
                <option value="rice">Rice (Paddy Leaves)</option>
                <option value="tomato">Tomato Leaves</option>
                <option value="potato">Potato / General Foliage</option>
              </select>
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label>Mock Leaf Image Upload</label>
              <div style={styles.uploadBox}>
                <span>📸 leaf_specimen_scan.png</span>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ height: '45px', alignSelf: 'flex-end' }} disabled={scanning}>
              {scanning ? <Loader2 size={16} className="spinner" style={{ animation: 'spin 1s linear infinite' }} /> : 'Diagnose Leaf'}
            </button>
          </form>

          {/* Results Display */}
          {scanResult && (
            <div style={styles.resultCard} className="fade-in">
              <div style={styles.resultHeader}>
                <h4 style={{ color: 'var(--error)' }}>Diagnosis: {scanResult.disease}</h4>
                <span className="badge badge-pending">Severity: {scanResult.severity}</span>
              </div>
              
              <div style={{ marginTop: '10px', fontSize: '13px' }}>
                <p><strong>Visual Symptoms:</strong> {scanResult.symptoms}</p>
                <div style={styles.remedyBox}>
                  <div style={styles.remedyItem}>
                    <strong>Organic Bio-remedy (Recommended):</strong>
                    <p style={{ color: 'var(--forest-green)', marginTop: '4px' }}>{scanResult.organicRemedy}</p>
                  </div>
                  <div style={styles.remedyItem}>
                    <strong>Chemical Fungicide Control:</strong>
                    <p style={{ color: 'var(--error)', marginTop: '4px' }}>{scanResult.chemicalRemedy}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RENDER MARKET PRICES */}
      {activeSubTab === 'prices' && (
        <div style={styles.tabContent} className="glass-card">
          <div style={styles.priceHeaderRow}>
            <h3 style={{ fontSize: '18px' }}>Daily Mandi Market Price Index</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Updated: Today, 08:00 AM</span>
          </div>

          <div style={{ overflowX: 'auto', marginTop: '15px' }}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={styles.th}>Crop Name</th>
                  <th style={styles.th}>State / Market</th>
                  <th style={styles.th}>Min Rate (Rs/q)</th>
                  <th style={styles.th}>Max Rate (Rs/q)</th>
                  <th style={styles.th}>Mandi Average</th>
                </tr>
              </thead>
              <tbody>
                {mandiPrices.map((p, idx) => (
                  <tr key={idx} style={styles.tableRow}>
                    <td style={styles.td}><strong>{p.crop}</strong></td>
                    <td style={styles.td}>{p.state}</td>
                    <td style={styles.td}>Rs {p.min}</td>
                    <td style={styles.td}>Rs {p.max}</td>
                    <td style={{ ...styles.td, color: 'var(--forest-green)', fontWeight: '600' }}>Rs {p.avg} / quintal</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RENDER GOVT SCHEMES */}
      {activeSubTab === 'schemes' && (
        <div style={styles.tabContent} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {schemes.map((sch) => (
            <div key={sch.id} className="glass-card" style={styles.schemeCard}>
              <div style={styles.schemeHeader}>
                <h4 style={{ fontSize: '16px', color: 'var(--forest-green)' }}>{sch.title}</h4>
                <span className="badge badge-verified">{sch.category}</span>
              </div>
              <p style={{ fontSize: '13px', marginTop: '10px', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                {sch.content}
              </p>
              <div style={{ marginTop: '15px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                Published: {sch.date}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RENDER TUTORIALS */}
      {activeSubTab === 'guides' && (
        <div style={styles.tabContent} style={styles.tutorialGrid}>
          {tutorials.map((t, idx) => (
            <div key={idx} className="glass-card" style={styles.tutorialCard}>
              <PlayCircle size={36} color="var(--forest-green)" style={{ marginBottom: '10px' }} />
              <h4>{t.title}</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '8px 0' }}>{t.desc}</p>
              <div style={styles.tutorialMeta}>
                <span>Duration: {t.duration}</span>
                <span>•</span>
                <span>{t.views}</span>
              </div>
            </div>
          ))}
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
  tabContent: {
    animation: 'fadeIn 0.3s ease-out'
  },
  scanForm: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: '20px'
  },
  uploadBox: {
    height: '42px',
    border: '1px dashed var(--border-color)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '15px',
    backgroundColor: 'var(--bg-primary)',
    fontSize: '13px',
    color: 'var(--text-secondary)'
  },
  resultCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.03)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '20px',
    marginTop: '20px'
  },
  resultHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  remedyBox: {
    display: 'flex',
    gap: '20px',
    marginTop: '15px',
    flexWrap: 'wrap'
  },
  remedyItem: {
    flex: 1,
    minWidth: '220px',
    padding: '15px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px'
  },
  priceHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
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
  },
  schemeCard: {
    padding: '24px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)'
  },
  schemeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  tutorialGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px'
  },
  tutorialCard: {
    display: 'flex',
    flexDirection: 'column'
  },
  tutorialMeta: {
    display: 'flex',
    gap: '10px',
    fontSize: '11px',
    color: 'var(--text-secondary)',
    marginTop: 'auto'
  }
};
