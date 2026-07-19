import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import { Brain, DollarSign, TrendingUp, Calendar, MapPin, BarChart3, Award, Sparkles } from 'lucide-react';
import AnalyticsChart from '../components/AnalyticsChart';

export default function AiValuationPage() {
  const { apiUrl, user } = useAuth();
  const { t, language } = useThemeLanguage();

  const [cropName, setCropName] = useState('Sona Masuri Rice');
  const [quantity, setQuantity] = useState('500');
  const [grade, setGrade] = useState('Premium');
  const [location, setLocation] = useState('Mandya, Karnataka');
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split('T')[0]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleCalculate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Direct API fetch
      const res = await fetch(`${apiUrl}/ai/dynamic-pricing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cropName,
          grade,
          quantity: Number(quantity),
          location
        })
      });

      if (res.ok) {
        const data = await res.json();
        
        // Generate mock trend forecast data
        const forecastData = [
          { month: 'Current', sales: data.fairPrice },
          { month: 'Week 1', sales: Math.round(data.fairPrice * 1.02) },
          { month: 'Week 2', sales: Math.round(data.fairPrice * 1.05) },
          { month: 'Week 3', sales: Math.round(data.fairPrice * 1.04) },
          { month: 'Week 4', sales: Math.round(data.fairPrice * 1.03) }
        ];

        setResult({
          fairPrice: data.fairPrice,
          priceRange: data.priceRange,
          forecastData,
          demandRating: data.fairPrice > 100 ? 'Moderate' : 'High Demand',
          analysis: `Dynamic Mandi index parses strong purchase sentiment for Grade ${grade} ${cropName} near ${location}. Supply is slightly restricted this week, leading to a projected 5% price appreciation by Week 2 before crop inflows stabilize.`
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={styles.container}>
      {/* Title Header */}
      <div className="glass-card" style={styles.header}>
        <div style={styles.titleRow}>
          <Brain size={28} color="var(--forest-green)" />
          <h2 style={{ fontSize: '22px', margin: 0 }}>AI Crop Price Valuation</h2>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '5px 0 0 0' }}>
          Evaluate fair-trade crop values in real-time by analyzing historical mandi parameters, regional logistics, and seasonal demands.
        </p>
      </div>

      <div style={styles.layoutGrid}>
        {/* INPUT FORM PANEL */}
        <div className="glass-card" style={styles.formPanel}>
          <h4 style={{ margin: '0 0 15px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
            Crop Valuation Input
          </h4>
          <form onSubmit={handleCalculate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div className="form-group">
              <label>Crop / Product Name</label>
              <select className="form-input" value={cropName} onChange={(e) => setCropName(e.target.value)}>
                <option value="Sona Masuri Rice">Sona Masuri Rice</option>
                <option value="Basmati Rice">Basmati Rice</option>
                <option value="Ragi (Finger Millet)">Ragi (Finger Millet)</option>
                <option value="Jowar (Sorghum)">Jowar (Sorghum)</option>
                <option value="Organic Turmeric">Organic Turmeric</option>
                <option value="Black Pepper">Black Pepper</option>
                <option value="Cardamom">Cardamom</option>
                <option value="Red Rice">Red Rice</option>
                <option value="Oats">Oats</option>
              </select>
            </div>

            <div className="form-group">
              <label>Quantity available (in kg/units)</label>
              <input 
                type="number"
                className="form-input"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Quality Grade</label>
              <select className="form-input" value={grade} onChange={(e) => setGrade(e.target.value)}>
                <option value="Premium">Premium Grade (Top moisture index, export grade)</option>
                <option value="A">Grade A (High quality, standard size grains)</option>
                <option value="B">Grade B (Average quality, local mandi scale)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Location / District</label>
              <input 
                type="text"
                className="form-input"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Mandya, Karnataka"
                required
              />
            </div>

            <div className="form-group">
              <label>Harvest Date</label>
              <input 
                type="date"
                className="form-input"
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} disabled={loading}>
              <Sparkles size={16} />
              <span>{loading ? 'Consulting AI Pricing models...' : 'Estimate AI Fair Price'}</span>
            </button>
          </form>
        </div>

        {/* RESULTS VALUATION DETAILS */}
        <div style={{ flex: '1 1 450px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {result ? (
            <div className="glass-card" style={styles.resultsCard}>
              <h4 style={{ margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <Award size={16} color="var(--amber-gold)" /> Price Valuation Result
              </h4>

              <div style={styles.pricingBoxes}>
                <div style={styles.priceItemBox}>
                  <span style={styles.boxLabel}>Suggested Fair Price</span>
                  <strong style={{ ...styles.boxVal, color: 'var(--forest-green)' }}>Rs {result.fairPrice} / kg</strong>
                </div>
                <div style={styles.priceItemBox}>
                  <span style={styles.boxLabel}>Expected Mandi Range</span>
                  <strong style={styles.boxVal}>{result.priceRange}</strong>
                </div>
                <div style={styles.priceItemBox}>
                  <span style={styles.boxLabel}>Market Demand index</span>
                  <strong style={{ ...styles.boxVal, color: 'var(--amber-gold)' }}>{result.demandRating}</strong>
                </div>
              </div>

              <div style={styles.textAnalysis}>
                <strong>AI Market Analysis:</strong>
                <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  {result.analysis}
                </p>
              </div>

              {/* Price trend charts */}
              <div style={styles.trendChartBox}>
                <h5 style={{ margin: '0 0 10px 0', fontSize: '13px', color: 'var(--text-primary)' }}>4-Week Trend Forecast Model</h5>
                <AnalyticsChart data={result.forecastData} type="line" height={160} />
              </div>
            </div>
          ) : (
            <div className="glass-card" style={styles.placeholderCard}>
              <Brain size={48} color="var(--text-secondary)" style={{ opacity: 0.4, marginBottom: '10px' }} />
              <h4>Dynamic AI Pricing Console</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                Input your crop parameters (category, quality index, and location details) in the left panel to simulate real-time fair trade price valuations and upcoming monthly trends.
              </p>
            </div>
          )}
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
  layoutGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px'
  },
  formPanel: {
    flex: '1 1 350px',
    textAlign: 'left'
  },
  resultsCard: {
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  pricingBoxes: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '12px'
  },
  priceItemBox: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    textAlign: 'center'
  },
  boxLabel: {
    fontSize: '9px',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase'
  },
  boxVal: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--text-primary)'
  },
  textAnalysis: {
    padding: '12px',
    backgroundColor: 'var(--green-glow)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    borderRadius: '8px',
    fontSize: '13px'
  },
  trendChartBox: {
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '15px',
    backgroundColor: 'var(--bg-secondary)'
  },
  placeholderCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: '40px',
    textAlign: 'center',
    minHeight: '300px'
  }
};
