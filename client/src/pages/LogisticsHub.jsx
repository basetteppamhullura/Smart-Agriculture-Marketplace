import React, { useState } from 'react';
import { Truck, Navigation, Home, Calculator, Check, ArrowRight } from 'lucide-react';

export default function LogisticsHub() {
  const [activeSubTab, setActiveSubTab] = useState('warehouses'); // 'warehouses' | 'booking'

  // Warehouses list
  const facilities = [
    { name: 'Mandya Cold Storage Corp', type: 'Refrigerated (Cold Storage)', capacity: '120 Tons', cost: 'Rs 15 / bag / month', contact: '+91 99001 88220', location: 'Mandya District' },
    { name: 'Cauvery Dry Warehouse', type: 'Dry Storage (Grains/Rice)', capacity: '500 Tons', cost: 'Rs 8 / bag / month', contact: '+91 94480 33411', location: 'Mandya Bypass' },
    { name: 'Nashik Agro-Vault', type: 'Refrigerated (Onions/Grapes)', capacity: '80 Tons', cost: 'Rs 18 / bag / month', contact: '+91 88790 42200', location: 'Nashik Industrial Area' }
  ];

  // Transport Fare Calculator States
  const [vehicle, setVehicle] = useState('pickup'); // 'pickup' | '3ton' | '10ton'
  const [distance, setDistance] = useState('');
  const [totalFare, setTotalFare] = useState(null);

  const handleCalculateFare = (e) => {
    e.preventDefault();
    const dist = Number(distance);
    if (!dist || dist <= 0) return;

    let baseRate = 500;
    let ratePerKm = 12;

    if (vehicle === '3ton') {
      baseRate = 1200;
      ratePerKm = 18;
    } else if (vehicle === '10ton') {
      baseRate = 2500;
      ratePerKm = 28;
    }

    setTotalFare(baseRate + (dist * ratePerKm));
  };

  return (
    <div className="fade-in" style={styles.container}>
      {/* Title */}
      <div className="glass-card" style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Truck size={24} color="var(--forest-green)" />
          <h2 style={{ fontSize: '22px' }}>Logistics, Storage & Transportation</h2>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Book direct farm pickups, calculate transportation fares, and explore cold storage vaults to preserve perishable harvests.
        </p>
      </div>

      {/* Tabs */}
      <div style={styles.subTabs}>
        <button
          onClick={() => setActiveSubTab('warehouses')}
          style={{
            ...styles.subTabBtn,
            backgroundColor: activeSubTab === 'warehouses' ? 'var(--forest-green)' : 'transparent',
            color: activeSubTab === 'warehouses' ? 'white' : 'var(--text-secondary)'
          }}
        >
          Warehouses & Cold Storages
        </button>
        <button
          onClick={() => setActiveSubTab('booking')}
          style={{
            ...styles.subTabBtn,
            backgroundColor: activeSubTab === 'booking' ? 'var(--forest-green)' : 'transparent',
            color: activeSubTab === 'booking' ? 'white' : 'var(--text-secondary)'
          }}
        >
          Book Delivery Vehicles
        </button>
      </div>

      {/* RENDER WAREHOUSES */}
      {activeSubTab === 'warehouses' && (
        <div style={styles.tabContent} style={styles.grid}>
          {facilities.map((fac, idx) => (
            <div key={idx} className="glass-card" style={styles.facCard}>
              <div style={styles.facHeader}>
                <h4>{fac.name}</h4>
                <span className="badge badge-verified" style={{ textTransform: 'none' }}>{fac.type}</span>
              </div>
              <div style={styles.facDetails}>
                <div><strong>Location:</strong> {fac.location}</div>
                <div><strong>Available Capacity:</strong> {fac.capacity}</div>
                <div><strong>Rental Fare:</strong> {fac.cost}</div>
                <div><strong>Office Contact:</strong> {fac.contact}</div>
              </div>
              <button 
                onClick={() => alert(`Booking request sent to ${fac.name}. An agent will call to finalize space reservation.`)}
                className="btn btn-outline" 
                style={{ width: '100%', marginTop: '15px' }}
              >
                Inquire Space
              </button>
            </div>
          ))}
        </div>
      )}

      {/* RENDER BOOKING CALCULATOR */}
      {activeSubTab === 'booking' && (
        <div style={styles.tabContent} className="glass-card" style={styles.bookingContainer}>
          <div className="glass-card" style={{ flex: '1 1 350px' }}>
            <h3 style={{ marginBottom: '15px', fontSize: '18px' }}>Transportation Cost Estimator</h3>
            <form onSubmit={handleCalculateFare} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="form-group">
                <label>Select Transport Vehicle</label>
                <select className="form-input" value={vehicle} onChange={(e) => setVehicle(e.target.value)}>
                  <option value="pickup">Tata Ace / Mini Pickup (Max 1.5 Tons)</option>
                  <option value="3ton">Canter / 3-Ton Truck (Max 3.5 Tons)</option>
                  <option value="10ton">Multi-axle / 10-Ton Lorry (Max 10 Tons)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Distance to Market / Buyer (in km)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 85"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary">
                Calculate Quote
              </button>
            </form>

            {totalFare !== null && (
              <div style={styles.fareResult} className="fade-in">
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Estimated Logistics Price:</div>
                <div style={{ fontSize: '26px', fontWeight: '700', color: 'var(--forest-green)', margin: '5px 0' }}>
                  Rs {totalFare.toLocaleString()}
                </div>
                <button 
                  onClick={() => alert('Delivery booking initialized. A driver will reach your farm location within 3 hours.')}
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '10px' }}
                >
                  Confirm Transport Booking
                </button>
              </div>
            )}
          </div>

          <div className="glass-card" style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3>Logistics Partner Benefits</h3>
            <div style={styles.benefitRow}>
              <Check size={16} color="var(--emerald)" />
              <span>Real-time GPS tracking shared with buyer</span>
            </div>
            <div style={styles.benefitRow}>
              <Check size={16} color="var(--emerald)" />
              <span>Insured transit coverage for vegetable spoilages</span>
            </div>
            <div style={styles.benefitRow}>
              <Check size={16} color="var(--emerald)" />
              <span>Cashless payment settlement from digital wallets</span>
            </div>
            <div style={{ marginTop: 'auto', backgroundColor: 'var(--bg-primary)', padding: '15px', borderRadius: '8px' }}>
              <strong>Need emergency cold carriage?</strong>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '5px' }}>
                Toggle refrigerated carrier selection during booking checkout.
              </p>
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
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px'
  },
  facCard: {
    display: 'flex',
    flexDirection: 'column'
  },
  facHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px'
  },
  facDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    fontSize: '13px',
    color: 'var(--text-secondary)',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '12px'
  },
  bookingContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
    padding: 0,
    border: 'none',
    background: 'none',
    boxShadow: 'none'
  },
  fareResult: {
    marginTop: '20px',
    padding: '15px',
    backgroundColor: 'var(--green-glow)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    borderRadius: '8px',
    textAlign: 'center'
  },
  benefitRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '13px'
  }
};
