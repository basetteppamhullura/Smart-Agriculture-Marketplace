import React, { useState } from 'react';
import { Landmark, Calculator, Globe, Heart, ShieldCheck } from 'lucide-react';

export default function FinancialTools() {
  const [activeSubTab, setActiveSubTab] = useState('loan'); // 'loan' | 'emi' | 'sustain'

  // Loan/Subsidy Checker states
  const [state, setState] = useState('karnataka');
  const [acreage, setAcreage] = useState('');
  const [crop, setCrop] = useState('paddy');
  const [eligibility, setEligibility] = useState(null);

  // EMI Calculator states
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('9'); // standard agri interest rate %
  const [tenure, setTenure] = useState('36'); // in months
  const [emi, setEmi] = useState(null);

  // Carbon Footprint states
  const [tractorHours, setTractorHours] = useState('');
  const [chemFertilizer, setChemFertilizer] = useState(''); // kg used
  const [carbonFootprint, setCarbonFootprint] = useState(null);

  // Handle Eligibility Check
  const handleCheckEligibility = (e) => {
    e.preventDefault();
    const acres = Number(acreage);
    if (!acres || acres <= 0) return;

    let subsidyAmount = acres * 2500; // Rs 2,500 per acre seed/manure subsidy
    let schemesList = ['PM-KISAN (Rs 6,000 / yr income support)'];

    if (crop === 'paddy' || crop === 'sugarcane') {
      subsidyAmount += acres * 1500; // extra water subsidy
      schemesList.push('PM Krishi Sinchayee Yojana (Drip Irrigation Subsidy up to 80%)');
    }

    if (state === 'karnataka') {
      schemesList.push('Raitha Siri Scheme (Millets cultivation incentives)');
    }

    setEligibility({
      isEligible: true,
      estimatedSubsidy: subsidyAmount,
      schemes: schemesList,
      maxLoanLimit: acres * 40000 // Rs 40,000 crop loan limit per acre under Kisan Credit Card
    });
  };

  // Handle EMI Calculation
  const handleCalculateEmi = (e) => {
    e.preventDefault();
    const p = Number(loanAmount);
    const r = Number(interestRate) / 12 / 100; // monthly rate
    const n = Number(tenure);

    if (!p || !r || !n) return;

    // EMI formula: [P x R x (1+R)^N]/[((1+R)^N)-1]
    const emiValue = Math.round((p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
    const totalPayment = emiValue * n;
    const totalInterest = totalPayment - p;

    setEmi({
      monthly: emiValue,
      totalInterest,
      totalPayment
    });
  };

  // Handle Carbon Footprint Calculation
  const handleCalculateCarbon = (e) => {
    e.preventDefault();
    const hrs = Number(tractorHours) || 0;
    const fert = Number(chemFertilizer) || 0;

    // 1 tractor hour ~ 2.6 kg CO2
    // 1 kg chemical fertilizer ~ 1.5 kg CO2
    const totalCO2 = Math.round((hrs * 2.6) + (fert * 1.5));
    const carbonCredits = parseFloat(((totalCO2 / 1000) * 0.4).toFixed(3)); // offset credit factors

    setCarbonFootprint({
      co2Kg: totalCO2,
      rating: totalCO2 < 150 ? 'Green (Low Impact)' : totalCO2 < 500 ? 'Amber (Moderate)' : 'Red (High Footprint)',
      creditsEarned: carbonCredits,
      tip: totalCO2 > 300 ? 'Switch to bio-fertilizers/compost. Practices like mulching reduce tractor requirements.' : 'Excellent organic compliance!'
    });
  };

  return (
    <div className="fade-in" style={styles.container}>
      {/* Title */}
      <div className="glass-card" style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Landmark size={24} color="var(--forest-green)" />
          <h2 style={{ fontSize: '22px' }}>Agri-Finance & Carbon Offset Tools</h2>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Calculate tractor/equipment loan EMIs, check Kisan Credit Card loan eligibility, and monitor your farm's carbon footprints.
        </p>
      </div>

      {/* Tabs */}
      <div style={styles.subTabs}>
        <button
          onClick={() => setActiveSubTab('loan')}
          style={{
            ...styles.subTabBtn,
            backgroundColor: activeSubTab === 'loan' ? 'var(--forest-green)' : 'transparent',
            color: activeSubTab === 'loan' ? 'white' : 'var(--text-secondary)'
          }}
        >
          Subsidy & Loan Eligibility
        </button>
        <button
          onClick={() => setActiveSubTab('emi')}
          style={{
            ...styles.subTabBtn,
            backgroundColor: activeSubTab === 'emi' ? 'var(--forest-green)' : 'transparent',
            color: activeSubTab === 'emi' ? 'white' : 'var(--text-secondary)'
          }}
        >
          Equipment EMI Calculator
        </button>
        <button
          onClick={() => setActiveSubTab('sustain')}
          style={{
            ...styles.subTabBtn,
            backgroundColor: activeSubTab === 'sustain' ? 'var(--forest-green)' : 'transparent',
            color: activeSubTab === 'sustain' ? 'white' : 'var(--text-secondary)'
          }}
        >
          Carbon Footprint & Sustainability
        </button>
      </div>

      {/* RENDER SUBSIDY CHECKER */}
      {activeSubTab === 'loan' && (
        <div style={styles.tabContent} style={styles.panelRow}>
          <div className="glass-card" style={{ flex: '1 1 350px' }}>
            <h3 style={{ marginBottom: '15px', fontSize: '18px' }}>Kisan Credit Card (KCC) Limit Checker</h3>
            <form onSubmit={handleCheckEligibility} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="form-group">
                <label>Select Farm State</label>
                <select className="form-input" value={state} onChange={(e) => setState(e.target.value)}>
                  <option value="karnataka">Karnataka</option>
                  <option value="maharashtra">Maharashtra</option>
                  <option value="punjab">Punjab</option>
                </select>
              </div>

              <div className="form-group">
                <label>Total Landholding Acreage (in acres)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 5"
                  value={acreage}
                  onChange={(e) => setAcreage(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Primary Cultivated Crop</label>
                <select className="form-input" value={crop} onChange={(e) => setCrop(e.target.value)}>
                  <option value="paddy">Paddy Rice</option>
                  <option value="wheat">Wheat</option>
                  <option value="millets">Ragi / Millets</option>
                  <option value="cotton">Cotton</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary">Check Limits</button>
            </form>
          </div>

          {eligibility && (
            <div className="glass-card" style={{ flex: '1 1 350px', backgroundColor: 'var(--green-glow)' }}>
              <h3 style={{ color: 'var(--forest-green)', marginBottom: '15px' }}>Eligibility Report</h3>
              <div style={styles.reportRow}>
                <div>Estimated Government Subsidies:</div>
                <strong style={{ fontSize: '20px', color: 'var(--forest-green)' }}>Rs {eligibility.estimatedSubsidy.toLocaleString()}</strong>
              </div>
              <div style={styles.reportRow} style={{ marginTop: '12px' }}>
                <div>Max KCC Crop Loan Credit Limit:</div>
                <strong style={{ fontSize: '20px', color: 'var(--forest-green)' }}>Rs {eligibility.maxLoanLimit.toLocaleString()}</strong>
              </div>
              <div style={{ marginTop: '15px' }}>
                <strong>Recommended Subsidies:</strong>
                <ul style={{ paddingLeft: '20px', fontSize: '13px', marginTop: '8px', lineHeight: '1.5' }}>
                  {eligibility.schemes.map((s, idx) => <li key={idx}>{s}</li>)}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RENDER EMI CALCULATOR */}
      {activeSubTab === 'emi' && (
        <div style={styles.tabContent} style={styles.panelRow}>
          <div className="glass-card" style={{ flex: '1 1 350px' }}>
            <h3 style={{ marginBottom: '15px', fontSize: '18px' }}>Agri Equipment Loan EMI Calculator</h3>
            <form onSubmit={handleCalculateEmi} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="form-group">
                <label>Loan Amount (Principal - Rs)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 500000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Annual Interest Rate (%)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 9"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Tenure duration (in months)</label>
                <select className="form-input" value={tenure} onChange={(e) => setTenure(e.target.value)}>
                  <option value="12">12 Months (1 Year)</option>
                  <option value="24">24 Months (2 Years)</option>
                  <option value="36">36 Months (3 Years)</option>
                  <option value="60">60 Months (5 Years)</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary">Calculate EMI</button>
            </form>
          </div>

          {emi && (
            <div className="glass-card" style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <h3>Loan Break-up Summary</h3>
              <div style={styles.reportRow}>
                <div>Monthly EMI Installment:</div>
                <strong style={{ fontSize: '24px', color: 'var(--forest-green)' }}>Rs {emi.monthly.toLocaleString()} / mo</strong>
              </div>
              <div style={styles.reportRow}>
                <div>Total Interest Accrued:</div>
                <strong style={{ color: 'var(--error)' }}>Rs {emi.totalInterest.toLocaleString()}</strong>
              </div>
              <div style={styles.reportRow}>
                <div>Total Payment (Principal + Interest):</div>
                <strong>Rs {emi.totalPayment.toLocaleString()}</strong>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RENDER CARBON OFFSETS */}
      {activeSubTab === 'sustain' && (
        <div style={styles.tabContent} style={styles.panelRow}>
          <div className="glass-card" style={{ flex: '1 1 350px' }}>
            <h3 style={{ marginBottom: '15px', fontSize: '18px' }}>Farming Carbon Emission Estimator</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '15px' }}>
              Calculates direct carbon emission equivalents from machinery fuel usage and soil fertilizers to gauge environmental footprint compliance.
            </p>
            <form onSubmit={handleCalculateCarbon} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="form-group">
                <label>Tractor / Tiller usage hours (Annual)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 120"
                  value={tractorHours}
                  onChange={(e) => setTractorHours(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Chemical Nitrogen Fertilizers used (in kg)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 200"
                  value={chemFertilizer}
                  onChange={(e) => setChemFertilizer(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary">Calculate Footprint</button>
            </form>
          </div>

          {carbonFootprint && (
            <div className="glass-card" style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <h3>Carbon Emission Summary</h3>
              <div style={styles.reportRow}>
                <div>CO2 Equivalent Released:</div>
                <strong style={{ fontSize: '22px', color: 'var(--error)' }}>{carbonFootprint.co2Kg} kg CO2e</strong>
              </div>
              <div style={styles.reportRow}>
                <div>Impact Status:</div>
                <span className="badge badge-verified" style={{ backgroundColor: 'var(--bg-primary)' }}>{carbonFootprint.rating}</span>
              </div>
              <div style={styles.reportRow}>
                <div>Carbon Credits Earned:</div>
                <strong style={{ color: 'var(--forest-green)' }}>{carbonFootprint.creditsEarned} Credits</strong>
              </div>
              <div style={{ marginTop: '10px', padding: '12px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', fontSize: '12px' }}>
                <strong>Recommendation:</strong>
                <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>{carbonFootprint.tip}</p>
              </div>
            </div>
          )}
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
  panelRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px'
  },
  reportRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  }
};
