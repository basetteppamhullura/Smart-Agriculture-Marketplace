import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import { X, CreditCard, ArrowUpRight, ArrowDownLeft, Loader2 } from 'lucide-react';

export default function WalletManager({ isOpen, onClose }) {
  const { user, updateWallet } = useAuth();
  const { t } = useThemeLanguage();
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('deposit'); // 'deposit' | 'withdraw'
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const val = Number(amount);
    if (!val || val <= 0) {
      setMsg({ type: 'error', text: 'Please enter a valid amount' });
      return;
    }

    if (type === 'withdraw' && user.walletBalance < val) {
      setMsg({ type: 'error', text: 'Insufficient wallet balance' });
      return;
    }

    setLoading(true);
    setMsg(null);
    const success = await updateWallet(val, type);
    setLoading(false);

    if (success) {
      setMsg({ type: 'success', text: `Successfully ${type === 'deposit' ? 'added' : 'withdrawn'} Rs ${val.toLocaleString()}` });
      setAmount('');
      setTimeout(() => {
        setMsg(null);
      }, 3000);
    } else {
      setMsg({ type: 'error', text: 'Transaction failed. Please try again.' });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={styles.closeBtn}>
          <X size={20} />
        </button>

        <div style={styles.header}>
          <CreditCard size={28} color="var(--forest-green)" />
          <h2 style={{ fontSize: '22px' }}>{t('wallet')}</h2>
        </div>

        {/* Current Balance */}
        <div style={styles.balanceCard}>
          <div style={styles.balLabel}>{t('balance')}</div>
          <div style={styles.balAmt}>Rs {user.walletBalance.toLocaleString()}</div>
        </div>

        {msg && (
          <div style={{
            ...styles.alert,
            backgroundColor: msg.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: msg.type === 'success' ? 'var(--emerald)' : 'var(--error)',
            border: `1px solid ${msg.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
          }}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.tabContainer}>
            <button
              type="button"
              onClick={() => setType('deposit')}
              style={{
                ...styles.tabBtn,
                backgroundColor: type === 'deposit' ? 'var(--green-glow)' : 'transparent',
                color: type === 'deposit' ? 'var(--forest-green)' : 'var(--text-secondary)',
                borderBottom: type === 'deposit' ? '3px solid var(--forest-green)' : '3px solid transparent'
              }}
            >
              <ArrowUpRight size={16} />
              <span>{t('addFunds')}</span>
            </button>
            <button
              type="button"
              onClick={() => setType('withdraw')}
              style={{
                ...styles.tabBtn,
                backgroundColor: type === 'withdraw' ? 'rgba(239, 68, 68, 0.05)' : 'transparent',
                color: type === 'withdraw' ? 'var(--error)' : 'var(--text-secondary)',
                borderBottom: type === 'withdraw' ? '3px solid var(--error)' : '3px solid transparent'
              }}
            >
              <ArrowDownLeft size={16} />
              <span>{t('withdraw')}</span>
            </button>
          </div>

          <div className="form-group" style={{ marginTop: '15px' }}>
            <label>Amount (Rs)</label>
            <input
              type="number"
              className="form-input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 5000"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={loading}>
            {loading ? <Loader2 size={16} className="spinner" style={{ animation: 'spin 1s linear infinite' }} /> : t('submit')}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  closeBtn: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px'
  },
  balanceCard: {
    backgroundColor: 'var(--bg-primary)',
    borderRadius: 'var(--radius-sm)',
    padding: '20px',
    textAlign: 'center',
    border: '1px solid var(--border-color)',
    marginBottom: '20px'
  },
  balLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  balAmt: {
    fontSize: '28px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginTop: '5px'
  },
  tabContainer: {
    display: 'flex',
    borderBottom: '1px solid var(--border-color)',
    marginBottom: '15px'
  },
  tabBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '12px',
    border: 'none',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  form: {
    display: 'flex',
    flexDirection: 'column'
  },
  alert: {
    padding: '12px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: '15px'
  }
};
