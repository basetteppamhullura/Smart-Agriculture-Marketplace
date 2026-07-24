import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import { useSocket } from '../context/SocketContext';
import { MessageSquare, ThumbsUp, XCircle, RefreshCw, Send, CheckCircle, CreditCard, ShoppingBag, ShieldAlert } from 'lucide-react';

export default function BargainingHub() {
  const { user, apiUrl } = useAuth();
  const { t } = useThemeLanguage();
  const { subscribe, sendChatMessage } = useSocket();

  const token = localStorage.getItem('sam-token');

  const [negotiations, setNegotiations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Active selected negotiation for chat drawer
  const [activeId, setActiveId] = useState(null);
  
  // Bargaining input states
  const [counterPrice, setCounterPrice] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  
  // Purchase checkout state for accepted bargains
  const [checkoutQuantity, setCheckoutQuantity] = useState('100');
  const [payingId, setPayingId] = useState(null);

  const fetchNegotiations = async () => {
    if (!user) return;
    try {
      const endpoint = user.role === 'buyer' ? 'buyer' : 'seller';
      const res = await fetch(`${apiUrl}/negotiations/${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNegotiations(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNegotiations();
  }, [apiUrl, user]);

  useEffect(() => {
    if (!activeId) return;

    const unsubscribe = subscribe(`negotiation:${activeId}`, (event) => {
      console.log('Received WebSocket negotiation update:', event);
      if (event.type === 'chat') {
        setNegotiations(prev => prev.map(n => {
          if (n._id === activeId) {
            const msgExists = (n.messages || []).some(m => m.text === event.text && m.sender === event.sender && Math.abs(new Date(m.createdAt) - new Date(event.createdAt)) < 2000);
            if (msgExists) return n;
            return {
              ...n,
              messages: [...(n.messages || []), event]
            };
          }
          return n;
        }));
      } else if (event.type === 'counter' || event.type === 'accept' || event.type === 'reject') {
        setNegotiations(prev => prev.map(n => n._id === activeId ? event.negotiation : n));
      }
    });

    return () => {
      unsubscribe();
    };
  }, [activeId]);

  const activeNeg = negotiations.find(n => n._id === activeId);

  // Accept Deal
  const handleAccept = async (negId) => {
    if (!window.confirm('Are you sure you want to accept this price offer?')) return;
    try {
      const res = await fetch(`${apiUrl}/negotiations/${negId}/accept`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Deal accepted! Bargain completed.');
        fetchNegotiations();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Reject Deal
  const handleReject = async (negId) => {
    if (!window.confirm('Are you sure you want to reject this offer?')) return;
    try {
      const res = await fetch(`${apiUrl}/negotiations/${negId}/reject`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Offer rejected.');
        fetchNegotiations();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Counteroffer
  const handleCounter = async (e, negId) => {
    e.preventDefault();
    if (!counterPrice && !chatMessage.trim()) return;

    const activeNeg = negotiations.find(n => n._id === negId);
    const offerPriceToSend = counterPrice ? Number(counterPrice) : activeNeg.currentOffer;

    try {
      const res = await fetch(`${apiUrl}/negotiations/${negId}/counter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          offerPrice: offerPriceToSend,
          message: chatMessage || `Counteroffer submitted: Rs ${offerPriceToSend}/unit.`
        })
      });

      if (res.ok) {
        const updated = await res.json();
        // Update local state messages to include the user message
        setNegotiations(prev => prev.map(n => n._id === negId ? updated : n));
        
        // Broadcast via WebSocket
        sendChatMessage(negId, chatMessage || `Counteroffer submitted: Rs ${offerPriceToSend}/unit.`, user.role === 'buyer' ? 'buyer' : 'seller');
        
        setCounterPrice('');
        setChatMessage('');
      } else {
        const errData = await res.json();
        alert(errData.message || 'Counteroffer failed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Buyer proceed to payment checkout
  const handleProceedCheckout = async (e, neg) => {
    e.preventDefault();
    if (!checkoutQuantity || Number(checkoutQuantity) <= 0) return;

    try {
      const res = await fetch(`${apiUrl}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cropId: neg.crop._id || neg.crop,
          quantity: Number(checkoutQuantity),
          negotiationId: neg._id
        })
      });

      if (res.ok) {
        alert('Bargain Checkout completed successfully! Funds paid from your digital wallet.');
        setPayingId(null);
        fetchNegotiations();
      } else {
        const errData = await res.json();
        alert(errData.message || 'Checkout payment failed.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '30px' }}>Loading Bargains Panel...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.layout}>
        {/* NEGOTIATIONS LIST PANEL */}
        <div style={styles.listPanel} className="glass-card">
          <div style={styles.panelHeader}>
            <MessageSquare size={18} color="var(--forest-green)" />
            <h3 style={{ margin: 0 }}>Active Bargains Console</h3>
          </div>

          {negotiations.length === 0 ? (
            <div style={styles.empty}>No negotiations recorded. Initiating price bargains on product listings will populate this tab.</div>
          ) : (
            <div style={styles.list}>
              {negotiations.map((neg) => {
                const isSelected = neg._id === activeId;
                const statusColor = neg.status === 'Accepted' ? 'var(--emerald)' : neg.status === 'Rejected' ? 'var(--error)' : 'var(--amber-gold)';
                return (
                  <div 
                    key={neg._id} 
                    onClick={() => { setActiveId(neg._id); setPayingId(null); }}
                    style={{
                      ...styles.itemCard,
                      borderLeft: `4px solid ${statusColor}`,
                      backgroundColor: isSelected ? 'var(--bg-secondary)' : 'var(--glass-bg)'
                    }}
                  >
                    <div style={styles.itemTitleRow}>
                      <strong>{neg.buyerName === user.name ? `Seller: ${neg.sellerName}` : `Buyer: ${neg.buyerName}`}</strong>
                      <span className="badge" style={{ backgroundColor: statusColor, color: 'white', fontSize: '9px', padding: '1px 6px' }}>
                        {neg.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Current Deal: <strong style={{ color: 'var(--text-primary)' }}>Rs {neg.currentOffer}/unit</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* CHAT/WORK CONSOLE DETAILS */}
        <div style={styles.workPanel} className="glass-card">
          {activeNeg ? (
            <div style={styles.bargainConsole}>
              <div style={styles.chatHeader}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0' }}>Bargain Negotiation Details</h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Created: {new Date(activeNeg.createdAt).toLocaleString()}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={fetchNegotiations} className="btn btn-outline" style={{ padding: '6px' }}>
                    <RefreshCw size={14} />
                  </button>
                </div>
              </div>

              {/* Chat Thread history */}
              <div style={styles.chatThread}>
                {activeNeg.messages.map((msg, idx) => {
                  const isOwn = (user.role === 'buyer' && msg.sender === 'buyer') || (user.role === 'farmer' && msg.sender === 'seller');
                  return (
                    <div 
                      key={idx} 
                      style={{
                        ...styles.chatBubbleContainer,
                        justifyContent: isOwn ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div 
                        style={{
                          ...styles.chatBubble,
                          backgroundColor: isOwn ? 'var(--forest-green)' : 'var(--bg-secondary)',
                          color: isOwn ? 'white' : 'var(--text-primary)'
                        }}
                      >
                        <p style={{ margin: 0, fontSize: '13px' }}>{msg.text}</p>
                        {msg.offer && (
                          <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.9, fontWeight: '700' }}>
                            Offer: Rs {msg.offer}/unit
                          </div>
                        )}
                        <span style={styles.chatBubbleTime}>
                          {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Status workflow prompts */}
              <div style={styles.consoleWorkflow}>
                {activeNeg.status === 'Accepted' && (
                  <div style={styles.workflowPromptSuccess}>
                    <CheckCircle size={18} color="var(--emerald)" />
                    <span><strong>Deal Accepted!</strong> Final pricing settled at <strong>Rs {activeNeg.currentOffer}</strong>/unit.</span>
                    {user.role === 'buyer' && (
                      <button 
                        onClick={() => setPayingId(activeNeg._id)}
                        className="btn btn-primary"
                        style={{ padding: '8px 16px', fontSize: '12px', marginLeft: 'auto' }}
                      >
                        <CreditCard size={14} /> Proceed to Pay
                      </button>
                    )}
                  </div>
                )}

                {activeNeg.status === 'Rejected' && (
                  <div style={styles.workflowPromptDanger}>
                    <XCircle size={18} color="var(--error)" />
                    <span>Bargaining offer rejected. Feel free to start a new negotiation workspace.</span>
                  </div>
                )}

                {/* Counter & Action controls for Pending/Counter states */}
                {(activeNeg.status === 'Pending' || activeNeg.status === 'Counter') && (
                  <div>
                    {/* Check whose turn it is to act */}
                    {((user.role === 'buyer' && activeNeg.lastOfferBy === 'seller') || 
                      (user.role === 'farmer' && activeNeg.lastOfferBy === 'buyer')) ? (
                      <div style={styles.counterActionArea}>
                        <div style={styles.dealMeta}>
                          Awaiting your action. Counter-offer is: <strong>Rs {activeNeg.currentOffer}/unit</strong>
                        </div>
                        <div style={styles.actionRow}>
                          <button onClick={() => handleAccept(activeNeg._id)} className="btn btn-primary" style={styles.actionBtn}>
                            Accept Deal
                          </button>
                          <button onClick={() => handleReject(activeNeg._id)} className="btn btn-danger" style={styles.actionBtn}>
                            Reject Deal
                          </button>
                        </div>

                        {/* Counter offer form */}
                        <form onSubmit={(e) => handleCounter(e, activeNeg._id)} style={styles.counterForm}>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <input 
                              type="number"
                              className="form-input"
                              style={{ width: '130px' }}
                              placeholder="New Offer Price"
                              value={counterPrice}
                              onChange={(e) => setCounterPrice(e.target.value)}
                              required
                            />
                            <input 
                              type="text"
                              className="form-input"
                              style={{ flex: 1 }}
                              placeholder="Add message..."
                              value={chatMessage}
                              onChange={(e) => setChatMessage(e.target.value)}
                            />
                            <button type="submit" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Send size={14} /> Send Counter
                            </button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      <div style={styles.workflowPromptWarning}>
                        <RefreshCw size={16} className="spin" color="var(--amber-gold)" />
                        <span>Awaiting response from the other party. We'll update the workspace instantly.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Purchase checkout inline layout */}
              {payingId === activeNeg._id && (
                <div style={styles.payingOverlay} className="glass-card">
                  <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-primary)' }}>Secure Wallet Checkout</h4>
                  <form onSubmit={(e) => handleProceedCheckout(e, activeNeg)} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Checkout Quantity (kg/units)</label>
                      <input 
                        type="number"
                        className="form-input"
                        value={checkoutQuantity}
                        onChange={(e) => setCheckoutQuantity(e.target.value)}
                        required
                      />
                    </div>
                    <div style={styles.payBreakdown}>
                      <div>Negotiated Price: <strong>Rs {activeNeg.currentOffer} / unit</strong></div>
                      <div>Quantity: <strong>{checkoutQuantity} units</strong></div>
                      <div style={{ fontSize: '15px', color: 'var(--forest-green)', borderTop: '1px solid var(--border-color)', paddingTop: '6px', marginTop: '4px' }}>
                        Total Wallet Deductible: <strong>Rs {(activeNeg.currentOffer * Number(checkoutQuantity)).toLocaleString()}</strong>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button type="button" onClick={() => setPayingId(null)} className="btn btn-secondary" style={{ flex: 1 }}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                        Confirm & Pay
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <div style={styles.emptyPrompt}>
              <ShoppingBag size={48} color="var(--text-secondary)" style={{ opacity: 0.5, marginBottom: '10px' }} />
              <h4>Bargaining Chat Workspace</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Select an active bargaining contract from the left panel to review message threads, issue counteroffers, or proceed to wallet payments.</p>
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
    gap: '20px',
    height: '500px'
  },
  layout: {
    display: 'flex',
    gap: '20px',
    height: '100%',
    flexWrap: 'wrap'
  },
  listPanel: {
    flex: '1 1 280px',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: '16px',
    overflowY: 'auto'
  },
  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '10px',
    marginBottom: '15px'
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  itemCard: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    transition: 'background-color 0.2s'
  },
  itemTitleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  empty: {
    padding: '20px',
    textAlign: 'center',
    color: 'var(--text-secondary)',
    fontSize: '12px'
  },
  workPanel: {
    flex: '2 1 450px',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    padding: '0'
  },
  emptyPrompt: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: '40px',
    textAlign: 'center'
  },
  bargainConsole: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  chatHeader: {
    padding: '16px',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  chatThread: {
    flex: 1,
    padding: '16px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxHeight: '260px'
  },
  chatBubbleContainer: {
    display: 'flex',
    width: '100%'
  },
  chatBubble: {
    maxWidth: '70%',
    padding: '10px 14px',
    borderRadius: '12px',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    boxShadow: 'var(--shadow-sm)'
  },
  chatBubbleTime: {
    fontSize: '9px',
    alignSelf: 'flex-end',
    opacity: 0.8,
    marginTop: '2px'
  },
  consoleWorkflow: {
    padding: '16px',
    borderTop: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-secondary)'
  },
  workflowPromptSuccess: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    backgroundColor: 'var(--green-glow)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    borderRadius: '8px',
    fontSize: '13px',
    color: 'var(--text-primary)',
    flexWrap: 'wrap'
  },
  workflowPromptDanger: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    border: '1px solid rgba(239, 68, 68, 0.1)',
    borderRadius: '8px',
    fontSize: '13px',
    color: 'var(--text-primary)'
  },
  workflowPromptWarning: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    backgroundColor: 'linear-gradient(135deg, rgba(217, 119, 6, 0.05) 0%, rgba(217, 119, 6, 0.02) 100%)',
    border: '1px solid rgba(217, 119, 6, 0.1)',
    borderRadius: '8px',
    fontSize: '13px',
    color: 'var(--text-primary)'
  },
  counterActionArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  dealMeta: {
    fontSize: '13px',
    color: 'var(--text-secondary)'
  },
  actionRow: {
    display: 'flex',
    gap: '10px'
  },
  actionBtn: {
    flex: 1,
    padding: '8px 12px',
    fontSize: '13px'
  },
  counterForm: {
    borderTop: '1px solid var(--border-color)',
    paddingTop: '10px',
    marginTop: '5px'
  },
  payingOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'var(--bg-secondary)',
    borderTop: '2px solid var(--border-color)',
    padding: '20px',
    animation: 'slideUp 0.2s',
    zIndex: 10
  },
  payBreakdown: {
    padding: '12px',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    fontSize: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  }
};
