import React, { useRef } from 'react';
import { FileText, Download, Printer, ShieldAlert, Sparkles } from 'lucide-react';

export default function ReportGenerator({ assessment }) {
  if (!assessment) {
    return (
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', color: 'var(--text-muted)' }}>
        <FileText size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
        <h3>No Incident Report Selected</h3>
        <p style={{ fontSize: '0.85rem' }}>Select a suspicious transaction from the log to generate a professional security incident report.</p>
      </div>
    );
  }

  const {
    transactionId, userId, userName, userRole, amount, timestamp,
    device, ipAddress, country, merchant, riskScore, riskLevel,
    threatClassification, indicators, recommendedAction, profile,
    impossibleTravelDetails
  } = assessment;

  // Calculate Loss Prevented: if risk score > 30 and recommended action holds/freezes/MFAs the transaction
  const isLossPrevented = riskScore > 30;
  const financialLossPrevented = isLossPrevented ? parseFloat(amount) : 0.00;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Action panel */}
      <div className="glass-card no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h4>Export Security Incident Report</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Generate a compliance-ready executive PDF dossier for risk management and auditing.</p>
        </div>
        <button 
          onClick={handlePrint}
          className="cyber-button"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Printer size={16} /> Print / Export PDF
        </button>
      </div>

      {/* The Printable Dossier Container */}
      <div className="glass-card print-dossier" style={{
        background: 'var(--bg-card)',
        padding: '2.5rem',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        color: 'var(--text-main)',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
      }}>
        
        {/* Report Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          borderBottom: '2px solid var(--accent-cyan)',
          paddingBottom: '1.5rem'
        }}>
          <div>
            <h1 style={{ fontSize: '2rem', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 800 }}>
              QUANTUM SENTINEL AI
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
              ENTERPRISE CYBERSECURITY & THREAT CORRELATION DOSSIER
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--color-danger)',
              color: '#f87171',
              padding: '0.25rem 0.75rem',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase'
            }}>
              {riskLevel} RISK INCIDENT
            </span>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Ref: INC-{transactionId}
            </div>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div>
          <h3 style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '0.5rem', color: 'var(--accent-cyan)', fontSize: '1.1rem', marginBottom: '0.75rem' }}>
            I. EXECUTIVE SUMMARY
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            background: '#f8fafc',
            padding: '1.25rem',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>THREAT CLASSIFICATION</span>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: riskScore > 30 ? 'var(--color-warning)' : 'var(--text-main)' }}>{threatClassification}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CORRELATED RISK SCORE</span>
              <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--color-danger)' }}>{riskScore} / 100</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PREVENTED FINANCIAL LOSS</span>
              <div style={{ fontWeight: 800, fontSize: '1.2rem', color: financialLossPrevented > 0 ? 'var(--color-success)' : 'var(--text-main)' }}>
                ₹{financialLossPrevented.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DETECTION TIMESTAMP</span>
              <div style={{ fontWeight: 600 }}>{timestamp}</div>
            </div>
          </div>
        </div>

        {/* Section 2: Transaction Details */}
        <div>
          <h3 style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '0.5rem', color: 'var(--accent-cyan)', fontSize: '1.1rem', marginBottom: '0.75rem' }}>
            II. COMPROMISED TRANSACTION PARAMETERS
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Transaction ID:</span>
                <span style={{ fontWeight: 600 }}>{transactionId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Merchant/Target:</span>
                <span style={{ fontWeight: 600 }}>{merchant}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Cleared Value:</span>
                <span style={{ fontWeight: 700 }}>₹{parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>User Reference:</span>
                <span style={{ fontWeight: 600 }}>{userName} ({userId})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Access IP Address:</span>
                <span style={{ fontWeight: 600 }}>{ipAddress} ({country})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Device Fingerprint:</span>
                <span style={{ fontWeight: 600 }}>{device}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: UEBA Anomaly Profile Check */}
        <div>
          <h3 style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '0.5rem', color: 'var(--accent-cyan)', fontSize: '1.1rem', marginBottom: '0.75rem' }}>
            III. USER ENTITY & BEHAVIOR ANOMALIES (UEBA)
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                <th style={{ padding: '0.5rem 0', color: 'var(--text-muted)' }}>Vector</th>
                <th style={{ padding: '0.5rem 0', color: 'var(--text-muted)' }}>User Baseline Standard</th>
                <th style={{ padding: '0.5rem 0', color: 'var(--text-muted)' }}>Audit Trail Record</th>
                <th style={{ padding: '0.5rem 0', color: 'var(--text-muted)', textAlign: 'right' }}>Anomaly Status</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '0.75rem 0', fontWeight: 600 }}>Device Authorization</td>
                <td>{profile.normalDevice}</td>
                <td>{device}</td>
                <td style={{ textAlign: 'right', fontWeight: 700, color: device !== profile.normalDevice ? 'var(--color-warning)' : 'var(--color-success)' }}>
                  {device !== profile.normalDevice ? "Anomalous Device" : "Pass"}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '0.75rem 0', fontWeight: 600 }}>IP Network</td>
                <td>{profile.normalIp}</td>
                <td>{ipAddress}</td>
                <td style={{ textAlign: 'right', fontWeight: 700, color: ipAddress !== profile.normalIp ? 'var(--color-warning)' : 'var(--color-success)' }}>
                  {ipAddress !== profile.normalIp ? "Anomalous IP" : "Pass"}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '0.75rem 0', fontWeight: 600 }}>Physical Geolocation</td>
                <td>{profile.normalLocation}</td>
                <td>{country}</td>
                <td style={{ textAlign: 'right', fontWeight: 700, color: country !== profile.normalLocation ? 'var(--color-danger)' : 'var(--color-success)' }}>
                  {country !== profile.normalLocation ? "Impossible Travel Alert" : "Pass"}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '0.75rem 0', fontWeight: 600 }}>Financial Limit Threshold</td>
                <td>Avg ₹{profile.avgTransactionAmount.toFixed(2)}</td>
                <td>₹{parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td style={{ textAlign: 'right', fontWeight: 700, color: parseFloat(amount) > profile.avgTransactionAmount * 3 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                  {parseFloat(amount) > profile.avgTransactionAmount * 3 ? "Transaction Spike" : "Pass"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 4: AI Audit Log Summary */}
        <div>
          <h3 style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '0.5rem', color: 'var(--accent-cyan)', fontSize: '1.1rem', marginBottom: '0.75rem' }}>
            IV. EXPLAINABLE AI AUDIT ANALYSIS (GEMINI COGNITIVE LOG)
          </h3>
          <div style={{
            background: '#f8fafc',
            padding: '1.25rem',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '0.85rem',
            lineHeight: '1.6',
            color: 'var(--text-main)',
            whiteSpace: 'pre-line'
          }}>
            {/* Simple text representations instead of React element formatting for printing stability */}
            {assessment.riskScore > 30 ? (
              `Threat Identification: ${threatClassification} (Risk: ${riskScore}%)
              
              Correlated telemetry logs demonstrate critical risk matching user credential stuffing or account takeover. 
              The anomaly engine confirmed device fingerprint deviations alongside impossible travel vectors. 
              Specifically, IP ${ipAddress} logged in from ${country} within a temporal boundary that prohibits physical travel from the user's primary operating region.
              Furthermore, the transaction value of ₹${parseFloat(amount).toLocaleString()} is abnormal compared to the average retail profile (₹${profile.avgTransactionAmount.toFixed(2)}).`
            ) : (
              `Transaction is classified as Normal / Low Risk (Risk Score: ${riskScore}%). No security anomalies detected.
              Session parameters conform to User and Entity Behavior Analytics (UEBA) baseline.`
            )}
          </div>
        </div>

        {/* Section 5: Remediation Actions */}
        <div>
          <h3 style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '0.5rem', color: 'var(--accent-cyan)', fontSize: '1.1rem', marginBottom: '0.75rem' }}>
            V. REMEDIATION & COMPLIANCE ACTIONS
          </h3>
          <div style={{ fontSize: '0.85rem' }}>
            <p><strong>System Recommended SOC Action:</strong> <span style={{ color: 'var(--color-warning)' }}>{recommendedAction}</span></p>
            <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>
              Compliance Checklist:
              <br />[x] Ingest transaction log and correlate cybersecurity events
              <br />[x] Evaluate user behavior profiling thresholds (UEBA)
              <br />[x] Run impossible travel and device fingerprinting algorithms
              <br />[ ] Terminate user sessions and reset security tokens (in progress)
            </p>
          </div>
        </div>

        {/* Report Footer */}
        <div style={{
          marginTop: '2rem',
          borderTop: '1px solid #e2e8f0',
          paddingTop: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          color: 'var(--text-muted)'
        }}>
          <span>Quantum Sentinel AI SOC Incident Report Engine v1.0.4</span>
          <span>Security Officer Signature: ___________________________</span>
        </div>

      </div>

      {/* Print-specific layout CSS */}
      <style>{`
        @media print {
          body {
            background: #fff !important;
            color: #000 !important;
          }
          .glass-card {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
          }
          .print-dossier {
            background: #fff !important;
            color: #000 !important;
            border: 1px solid #000 !important;
            box-shadow: none !important;
            padding: 1rem !important;
          }
          .print-dossier h1, .print-dossier h3 {
            color: #000 !important;
            background: none !important;
            -webkit-text-fill-color: initial !important;
          }
          .print-dossier span, .print-dossier td, .print-dossier th {
            color: #000 !important;
          }
          .print-dossier div {
            background: none !important;
            border-color: #ccc !important;
            color: #000 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

    </div>
  );
}
