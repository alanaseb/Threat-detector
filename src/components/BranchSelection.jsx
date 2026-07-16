import React from 'react';
import BankLogo from './BankLogo';
import { Shield, ShieldAlert, ArrowLeft, ArrowRight, MapPin, Activity } from 'lucide-react';

export default function BranchSelection({ onSelectBranch, onBack }) {
  const branches = [
    {
      name: "Chennai - George Town",
      zone: "Chennai Zone",
      code: "BOM-0042",
      status: "WARNING", // active threat incidents
      threatCount: 3,
      riskIndex: 78,
      volume: 14,
      desc: "Flagged: Critical threat alerts (Account Takeover & Insider Threat) active."
    },
    {
      name: "Chennai - Kolathur",
      zone: "Chennai Zone",
      code: "BOM-0185",
      status: "SECURE",
      threatCount: 0,
      riskIndex: 12,
      volume: 38,
      desc: "All transactions conforming to normal UEBA baseline profiles."
    },
    {
      name: "Ambattur / Mogappair West",
      zone: "Chennai Zone",
      code: "BOM-0321",
      status: "SECURE",
      threatCount: 0,
      riskIndex: 8,
      volume: 52,
      desc: "Terminal nodes secure. Device fingerprints validated."
    },
    {
      name: "Coimbatore (Periya Negamam)",
      zone: "Coimbatore Zone",
      code: "BOM-0711",
      status: "SECURE",
      threatCount: 0,
      riskIndex: 15,
      volume: 24,
      desc: "ATM and branch retail transaction logs nominal."
    },
    {
      name: "Tirupathur",
      zone: "Vellore Zone",
      code: "BOM-0840",
      status: "SECURE",
      threatCount: 0,
      riskIndex: 10,
      volume: 19,
      desc: "Network encryption tunnels verified. Session logs clean."
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Top Navigation Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button 
          onClick={onBack}
          className="nav-button"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ffffff', border: '1px solid #e2e8f0' }}
        >
          <ArrowLeft size={16} /> Back to Welcome
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <BankLogo size={42} showText={false} />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#4b5563' }}>Bank of Maharashtra Threat Grid</span>
        </div>
      </div>

      {/* Main Title Header */}
      <div style={{ textAlign: 'center', margin: '1rem 0' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0a2540', fontFamily: "'Outfit', sans-serif" }}>
          Select Branch SOC Console
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#4b5563', marginTop: '0.25rem' }}>
          Select a regional branch node below to access transaction correlation details and AI analysis logs.
        </p>
      </div>

      {/* Grid of Branch Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem',
        marginTop: '1rem'
      }}>
        {branches.map((b) => {
          const isWarning = b.status === "WARNING";
          
          return (
            <div 
              key={b.name}
              onClick={() => onSelectBranch(b.name, b.status === "SECURE")}
              className="branch-card"
              style={{
                background: '#ffffff',
                border: isWarning ? '2px solid #ef4444' : '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isWarning 
                  ? '0 10px 20px -5px rgba(239, 68, 68, 0.08)' 
                  : '0 4px 6px -1px rgba(0, 0, 0, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}
            >
              {/* Highlight Badge for warnings */}
              {isWarning && (
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  right: '20px',
                  background: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '9999px',
                  textTransform: 'uppercase',
                  animation: 'pulse-border 2s infinite'
                }}>
                  Active Incidents
                </div>
              )}

              <div>
                {/* Branch name and code */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0a2540' }}>{b.name}</h3>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.1rem' }}>
                      <MapPin size={12} /> {b.zone} (Code: {b.code})
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: '0.825rem', color: '#4b5563', marginBottom: '1.25rem', lineHeight: '1.4' }}>
                  {b.desc}
                </p>
              </div>

              {/* Stats Footer Row */}
              <div style={{
                borderTop: '1px solid #f1f5f9',
                paddingTop: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', gap: '1.25rem' }}>
                  <div>
                    <span style={{ fontSize: '0.65rem', color: '#9ca3af', display: 'block' }}>THREAT INDEX</span>
                    <span style={{ 
                      fontSize: '1rem', 
                      fontWeight: 800, 
                      color: isWarning ? '#ef4444' : '#10b981' 
                    }}>
                      {b.riskIndex}%
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.65rem', color: '#9ca3af', display: 'block' }}>VOLUME (24H)</span>
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0a2540' }}>
                      {b.volume} txns
                    </span>
                  </div>
                </div>

                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#0033a0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }} className="launch-text">
                  Enter Console <ArrowRight size={14} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .branch-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 20px -5px rgba(0, 51, 160, 0.1), 0 8px 16px -8px rgba(0, 0, 0, 0.05);
          border-color: #0033a0 !important;
        }
        .branch-card:hover .launch-text {
          color: #002266 !important;
          text-decoration: underline;
        }
        @keyframes pulse-border {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>

    </div>
  );
}
