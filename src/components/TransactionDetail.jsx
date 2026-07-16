import React, { useState, useEffect } from 'react';
import { 
  generateTransactionExplanation, 
  isAiActive 
} from '../utils/gemini';
import { 
  ShieldAlert, ShieldCheck, AlertTriangle, ShieldX, 
  User, Smartphone, Globe, Clock, DollarSign, ArrowRight,
  Sparkles, ClipboardList, ShieldAlert as SocIcon, CheckCircle2,
  Lock, RefreshCw
} from 'lucide-react';

export default function TransactionDetail({ assessment, onActionApplied }) {
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeAction, setActiveAction] = useState("");
  const [aiKeyStatus, setAiKeyStatus] = useState(false);

  useEffect(() => {
    if (!assessment) return;
    
    // Clear old explanation and load new one
    setExplanation("");
    setActiveAction(assessment.recommendedAction);
    setAiKeyStatus(isAiActive());

    const loadExplanation = async () => {
      setLoading(true);
      try {
        const text = await generateTransactionExplanation(assessment);
        setExplanation(text);
      } catch (e) {
        setExplanation("Error generating security explanation: " + e.message);
      } finally {
        setLoading(false);
      }
    };
    loadExplanation();
  }, [assessment]);

  if (!assessment) {
    return (
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', color: 'var(--text-muted)' }}>
        <SocIcon size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
        <h3>No Transaction Selected</h3>
        <p style={{ fontSize: '0.85rem' }}>Select a transaction from the list to analyze threat correlation telemetry.</p>
      </div>
    );
  }

  const {
    transactionId, userId, userName, userRole, amount, timestamp,
    device, ipAddress, country, merchant, riskScore, riskLevel,
    threatClassification, indicators, recommendedAction, timeline,
    profile, impossibleTravelDetails
  } = assessment;

  // Color code for risk gauge
  const getRiskColor = (level) => {
    switch (level) {
      case 'CRITICAL': return 'var(--color-danger)';
      case 'HIGH': return '#ef4444';
      case 'MEDIUM': return 'var(--color-warning)';
      default: return 'var(--color-success)';
    }
  };

  const handleActionClick = (actionName) => {
    setActiveAction(actionName);
    if (onActionApplied) {
      onActionApplied(transactionId, actionName);
    }
  };

  // Convert raw markdown strings from AI response to readable HTML breaks
  const formatExplanation = (text) => {
    if (!text) return "";
    return text.split('\n').map((line, idx) => {
      // Bold Markdown converter
      let formattedLine = line;
      
      // Simple bold matching
      const boldRegex = /\*\*(.*?)\*\*/g;
      formattedLine = formattedLine.replace(boldRegex, '<strong>$1</strong>');
      
      // Simple code block / inline code matching
      const codeRegex = /`(.*?)`/g;
      formattedLine = formattedLine.replace(codeRegex, '<code class="cyber-inline-code">$1</code>');

      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return <li key={idx} style={{ marginLeft: '1.25rem', marginBottom: '0.25rem' }} dangerouslySetInnerHTML={{ __html: formattedLine.substring(2) }} />;
      }
      if (line.trim().startsWith('###')) {
        return <h4 key={idx} style={{ color: 'var(--accent-cyan)', marginTop: '1rem', marginBottom: '0.5rem' }} dangerouslySetInnerHTML={{ __html: formattedLine.substring(3).trim() }} />;
      }
      if (line.trim().startsWith('##')) {
        return <h3 key={idx} style={{ color: 'var(--accent-cyan)', marginTop: '1.25rem', marginBottom: '0.5rem' }} dangerouslySetInnerHTML={{ __html: formattedLine.substring(2).trim() }} />;
      }
      if (line.trim().startsWith('#')) {
        return <h2 key={idx} style={{ color: 'var(--accent-cyan)', marginTop: '1.5rem', marginBottom: '0.5rem' }} dangerouslySetInnerHTML={{ __html: formattedLine.substring(1).trim() }} />;
      }
      
      return <p key={idx} style={{ marginBottom: '0.75rem' }} dangerouslySetInnerHTML={{ __html: formattedLine }} />;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Top Threat Alert Bar */}
      <div className="glass-card" style={{
        borderColor: getRiskColor(riskLevel),
        background: `linear-gradient(90deg, rgba(11, 15, 25, 0.9) 0%, ${getRiskColor(riskLevel)}15 100%)`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>INCIDENT REPORT</span>
            <span style={{
              background: aiKeyStatus ? 'rgba(0, 242, 254, 0.1)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${aiKeyStatus ? 'var(--accent-cyan)' : 'var(--text-muted)'}`,
              color: aiKeyStatus ? 'var(--accent-cyan)' : 'var(--text-muted)',
              fontSize: '0.65rem',
              padding: '0.1rem 0.4rem',
              borderRadius: '4px',
              fontWeight: 700
            }}>
              {aiKeyStatus ? "LIVE GEMINI AI" : "SIMULATED AI ENGINE"}
            </span>
          </div>
          <h2 style={{ fontSize: '1.75rem', marginTop: '0.25rem' }}>{transactionId}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Telemetry Correlation Context for **{userName}** (ID: {userId})
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>RISK LEVEL</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: getRiskColor(riskLevel) }}>{riskLevel}</div>
          </div>
          
          {/* Risk Gauge Circle */}
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            border: `4px solid rgba(255,255,255,0.05)`,
            borderTopColor: getRiskColor(riskLevel),
            borderRightColor: getRiskColor(riskLevel),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1.1rem',
            color: '#fff',
            boxShadow: `0 0 15px ${getRiskColor(riskLevel)}20`
          }}>
            {riskScore}
          </div>
        </div>
      </div>

      {/* Main Analysis Panels */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem'
      }}>
        
        {/* Left Column: UEBA Behaviour Profile Correlation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* UEBA Correlation Comparison */}
          <div className="glass-card">
            <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
              <User size={18} color="var(--accent-cyan)" /> UEBA Profile Correlation
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Row: Device */}
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>DEVICE FINGERPRINT</span>
                  {device !== profile.normalDevice ? (
                    <span style={{ color: 'var(--color-warning)', fontWeight: 600 }}>ANOMALOUS DEVIATION</span>
                  ) : (
                    <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>MATCH</span>
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                  <div style={{ width: '45%', fontSize: '0.85rem' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Current:</div>
                    <div style={{ fontWeight: 600, color: device !== profile.normalDevice ? 'var(--color-warning)' : 'inherit' }}>{device}</div>
                  </div>
                  <ArrowRight size={14} color="var(--text-muted)" />
                  <div style={{ width: '45%', fontSize: '0.85rem', textAlign: 'right' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Trusted Profile:</div>
                    <div style={{ fontWeight: 600 }}>{profile.normalDevice}</div>
                  </div>
                </div>
              </div>

              {/* Row: IP & Geolocation */}
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>ACCESS GEOLOCATION & IP</span>
                  {country !== profile.normalLocation ? (
                    <span style={{ color: 'var(--color-danger)', fontWeight: 600 }}>GEOGRAPHIC ANOMALY</span>
                  ) : (
                    <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>MATCH</span>
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                  <div style={{ width: '45%', fontSize: '0.85rem' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Current Location:</div>
                    <div style={{ fontWeight: 600, color: country !== profile.normalLocation ? 'var(--color-danger)' : 'inherit' }}>{country}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>IP: {ipAddress}</div>
                  </div>
                  <ArrowRight size={14} color="var(--text-muted)" />
                  <div style={{ width: '45%', fontSize: '0.85rem', textAlign: 'right' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Normal Location:</div>
                    <div style={{ fontWeight: 600 }}>{profile.normalLocation}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>IP: {profile.normalIp}</div>
                  </div>
                </div>
              </div>

              {/* Row: Transaction Amount */}
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>FINANCIAL TRANSACTION VALUE</span>
                  {parseFloat(amount) > profile.avgTransactionAmount * 3 ? (
                    <span style={{ color: 'var(--color-warning)', fontWeight: 600 }}>SPIKE DETECTED</span>
                  ) : (
                    <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>NORMAL BASING</span>
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                  <div style={{ width: '45%', fontSize: '0.85rem' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Current Amount:</div>
                    <div style={{ fontWeight: 800, color: parseFloat(amount) > profile.avgTransactionAmount * 3 ? 'var(--color-warning)' : 'inherit', fontSize: '1rem' }}>
                      ₹{parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <ArrowRight size={14} color="var(--text-muted)" />
                  <div style={{ width: '45%', fontSize: '0.85rem', textAlign: 'right' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>User Historical Avg:</div>
                    <div style={{ fontWeight: 600 }}>₹{profile.avgTransactionAmount.toFixed(2)}</div>
                  </div>
                </div>
              </div>

              {/* Row: Access Timing */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>TEMPORAL STAMP</span>
                  {indicators.some(i => i.code === 'OFF_HOURS') ? (
                    <span style={{ color: 'var(--color-warning)', fontWeight: 600 }}>OFF-HOURS</span>
                  ) : (
                    <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>IN WORK-WINDOW</span>
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                  <div style={{ width: '45%', fontSize: '0.85rem' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Current Activity:</div>
                    <div style={{ fontWeight: 600 }}>{timestamp.substring(11, 19)}</div>
                  </div>
                  <ArrowRight size={14} color="var(--text-muted)" />
                  <div style={{ width: '45%', fontSize: '0.85rem', textAlign: 'right' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Working Profile:</div>
                    <div style={{ fontWeight: 600 }}>{profile.typicalLoginTime}</div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Triggered Cyber Indicators */}
          <div className="glass-card">
            <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
              <ClipboardList size={18} color="var(--accent-cyan)" /> Triggered Security Indicators
            </h3>
            {indicators.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {indicators.map((ind, i) => (
                  <div key={i} style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    borderRadius: '6px',
                    padding: '0.75rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-warning)' }}>
                        {ind.label}
                      </span>
                      <span style={{ fontSize: '0.75rem', padding: '0.1rem 0.4rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '4px', fontWeight: 600 }}>
                        +{ind.weight} Risk
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ind.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem', fontSize: '0.85rem' }}>
                No anomaly indicators triggered. Base risk clean.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Explanations & Analyst Recommended Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Explainable AI Panel */}
          <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
              <Sparkles size={18} color="var(--accent-cyan)" /> Explainable AI Decision Reasoning
            </h3>
            
            <div style={{ 
              flex: 1,
              background: 'rgba(7, 10, 19, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              padding: '1.25rem',
              overflowY: 'auto',
              maxHeight: '340px',
              fontSize: '0.875rem',
              lineHeight: '1.6'
            }}>
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem' }}>
                  <RefreshCw size={24} className="spin-animation" style={{ color: 'var(--accent-cyan)' }} />
                  <span className="typing-loader" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Querying Gemini Neural Correlation Engine...</span>
                </div>
              ) : (
                <div className="ai-report-content">
                  {formatExplanation(explanation)}
                </div>
              )}
            </div>
          </div>

          {/* Action Recommendation panel */}
          <div className="glass-card">
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
              <CheckCircle2 size={18} color="var(--accent-cyan)" /> Recommended Response & Actions
            </h3>
            
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Quantum Sentinel AI recommends: <strong style={{ color: riskScore > 30 ? 'var(--color-warning)' : 'var(--color-success)' }}>{recommendedAction}</strong>
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button 
                onClick={() => handleActionClick("Allow Transaction")}
                className={`cyber-button ${activeAction === "Allow Transaction" ? "" : "secondary"}`}
                style={{ fontSize: '0.75rem', padding: '0.5rem 0.85rem' }}
              >
                Approve (Allow)
              </button>
              
              <button 
                onClick={() => handleActionClick("Require Multi-Factor Authentication (MFA)")}
                className={`cyber-button ${activeAction === "Require Multi-Factor Authentication (MFA)" ? "" : "secondary"}`}
                style={{ fontSize: '0.75rem', padding: '0.5rem 0.85rem' }}
              >
                Trigger MFA
              </button>

              <button 
                onClick={() => handleActionClick("Notify Security Operations Center (SOC)")}
                className={`cyber-button ${activeAction === "Notify Security Operations Center (SOC)" ? "" : "secondary"}`}
                style={{ fontSize: '0.75rem', padding: '0.5rem 0.85rem' }}
              >
                Escalate SOC
              </button>

              <button 
                onClick={() => handleActionClick("Freeze Account & Cancel Transaction")}
                className={`cyber-button ${activeAction === "Freeze Account & Cancel Transaction" ? "danger" : "secondary"}`}
                style={{ fontSize: '0.75rem', padding: '0.5rem 0.85rem' }}
              >
                Freeze & Terminate
              </button>
            </div>
            
            {activeAction && activeAction !== recommendedAction && (
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', marginTop: '0.75rem', fontWeight: 600 }}>
                Analyst Overrode System Action to: {activeAction}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Bottom Section: Attack Storyline Timeline (WOW FEATURE) */}
      <div className="glass-card">
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
          <SocIcon size={18} color="var(--accent-cyan)" /> Attack Storyline - Cyber Threat Visualization
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Visual chronological reconstruction of aligned events leading to detection:
        </p>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'stretch',
          position: 'relative',
          padding: '1rem 0',
          overflowX: 'auto',
          gap: '1rem'
        }}>
          {/* Horizontal line running behind nodes */}
          <div style={{
            position: 'absolute',
            left: '30px',
            right: '30px',
            top: '40px',
            height: '2px',
            background: 'rgba(0, 242, 254, 0.15)',
            zIndex: 1
          }} />

          {timeline.map((step, idx) => {
            const isDanger = step.type === 'danger';
            const isWarning = step.type === 'warning';
            
            let nodeColor = 'var(--color-success)';
            let nodeGlow = '0 0 10px rgba(16, 185, 129, 0.2)';
            if (isDanger) {
              nodeColor = 'var(--color-danger)';
              nodeGlow = '0 0 15px rgba(239, 68, 68, 0.4)';
            } else if (isWarning) {
              nodeColor = 'var(--color-warning)';
              nodeGlow = '0 0 12px rgba(245, 158, 11, 0.3)';
            }

            return (
              <div 
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: '150px',
                  flex: 1,
                  textAlign: 'center',
                  zIndex: 2
                }}
              >
                {/* Node Time */}
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.5rem' }}>
                  {step.time}
                </span>

                {/* Node Dot Icon */}
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'var(--bg-navy)',
                  border: `3px solid ${nodeColor}`,
                  boxShadow: nodeGlow,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.75rem',
                  transition: 'var(--transition-smooth)'
                }}>
                  {isDanger ? (
                    <Lock size={12} color="var(--color-danger)" />
                  ) : isWarning ? (
                    <AlertTriangle size={12} color="var(--color-warning)" />
                  ) : (
                    <CheckCircle2 size={12} color="var(--color-success)" />
                  )}
                </div>

                {/* Step Title */}
                <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                  {step.title}
                </div>

                {/* Step Description */}
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '140px' }}>
                  {step.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CSS details */}
      <style>{`
        .spin-animation {
          animation: spin 1.5s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .cyber-inline-code {
          background: rgba(0, 242, 254, 0.08);
          border: 1px solid rgba(0, 242, 254, 0.2);
          color: var(--accent-cyan);
          padding: 0.1rem 0.3rem;
          border-radius: 4px;
          font-family: monospace;
          font-size: 0.8rem;
        }
        .ai-report-content p, .ai-report-content li {
          margin-bottom: 0.75rem;
        }
      `}</style>

    </div>
  );
}
