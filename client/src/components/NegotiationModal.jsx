import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import { Landmark, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function NegotiationModal({ crop, onClose, onSuccess }) {
  const { apiUrl } = useAuth();
  const { t } = useThemeLanguage();

  const token = localStorage.getItem('sam-token');

  const [offerPrice, setOfferPrice] = useState(crop.aiPriceRecommended || Math.round(crop.price * 0.9));
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const minPrice = crop.minPriceAcceptable || Math.round(crop.price * 0.8);
  const isTooLow = Number(offerPrice) < minPrice;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isTooLow) {
      setError(`Offer is below the minimum acceptable price of Rs ${minPrice}.`);
      return;
    }

    setLoading(false);
    try {
      const res = await fetch(`${apiUrl}/negotiations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cropId: crop._id,
          offerPrice: Number(offerPrice),
          message: message || `Hello! I would like to offer Rs ${offerPrice} for this crop.`
        })
      });

      if (res.ok) {
        alert('Negotiation initiated successfully! The farmer has been notified.');
        onSuccess();
        onClose();
      } else {
        const errData = await res.json();
        setError(errData.message || 'Failed to start negotiation.');
      }
    } catch (err) {
      setError('Network error.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={styles.overlay}>
      <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()} style={styles.modal}>
        <div style={styles.header}>
          <h3 style={{ margin: 0 }}>Price Negotiation Workspace</h3>
          <span className="badge badge-auction">Bargain Active</span>
        </div>

        <div style={styles.cropSummary}>
          <img src={crop.imageUrl} alt={crop.name} style={styles.cropImg} />
          <div>
            <h4 style={{ margin: '0 0 4px 0' }}>{crop.name}</h4>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Listed by: <strong>{crop.farmer.name}</strong> • Location: {crop.location}
            </span>
          </div>
        </div>

        <div style={styles.priceStrip}>
          <div style={styles.priceBox}>
            <span style={styles.priceLabel}>Listed Price</span>
            <strong style={styles.priceVal}>Rs {crop.price}</strong>
          </div>
          <div style={styles.priceBox}>
            <span style={styles.priceLabel}>AI Fair Price</span>
            <strong style={{ ...styles.priceVal, color: 'var(--emerald)' }}>Rs {crop.aiPriceRecommended || 'N/A'}</strong>
          </div>
          <div style={styles.priceBox}>
            <span style={styles.priceLabel}>Min Acceptable</span>
            <strong style={{ ...styles.priceVal, color: 'var(--error)' }}>Rs {minPrice}</strong>
          </div>
        </div>

        {error && <div style={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label style={{ fontWeight: '700' }}>Enter Your Bargain Offer (Rs per kg/unit)</label>
            <input 
              type="number"
              className="form-input"
              value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value)}
              placeholder={`Suggest offer price (Min: Rs ${minPrice})`}
              required
            />
            {isTooLow && (
              <div style={styles.warning}>
                <AlertTriangle size={14} />
                <span>Lowball Alert: Offers below Rs {minPrice} will be auto-rejected by the farmer.</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label style={{ fontWeight: '700' }}>Message to Farmer</label>
            <textarea
              className="form-input"
              style={{ height: '70px', resize: 'none' }}
              placeholder="Explain why this price is fair (e.g. purchasing bulk quantity, long-term buyer)."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div style={styles.footerBtns}>
            <button 
              type="button" 
              onClick={onClose} 
              className="btn btn-secondary" 
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ flex: 1 }}
              disabled={isTooLow || loading}
            >
              Send Offer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    zIndex: 1100
  },
  modal: {
    maxWidth: '480px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    padding: '24px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '12px'
  },
  cropSummary: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    backgroundColor: 'var(--bg-secondary)',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)'
  },
  cropImg: {
    width: '50px',
    height: '50px',
    objectFit: 'cover',
    borderRadius: '6px'
  },
  priceStrip: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '10px',
    textAlign: 'center'
  },
  priceBox: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--bg-primary)',
    padding: '8px',
    borderRadius: '6px',
    border: '1px solid var(--border-color)'
  },
  priceLabel: {
    fontSize: '10px',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase'
  },
  priceVal: {
    fontSize: '15px',
    color: 'var(--text-primary)',
    fontWeight: '700',
    marginTop: '2px'
  },
  errorAlert: {
    padding: '10px 14px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: 'var(--error)',
    fontSize: '13px',
    fontWeight: '600',
    borderRadius: '6px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  warning: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    color: 'var(--error)',
    marginTop: '5px',
    fontWeight: '600'
  },
  footerBtns: {
    display: 'flex',
    gap: '15px',
    marginTop: '10px'
  }
};
