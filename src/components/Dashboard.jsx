import React from 'react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { 
  ShieldAlert, ShieldCheck, AlertTriangle, Users, 
  Activity, DollarSign, Ban, Key 
} from 'lucide-react';

export default function Dashboard({ assessments, onViewTransaction }) {
  // 1. Calculate Stats
  const totalTransactions = assessments.length;
  const safeTxns = assessments.filter(a => a.riskLevel === 'LOW').length;
  const medTxns = assessments.filter(a => a.riskLevel === 'MEDIUM').length;
  const highTxns = assessments.filter(a => a.riskLevel === 'HIGH').length;
  const criticalTxns = assessments.filter(a => a.riskLevel === 'CRITICAL').length;
  const activeAlerts = assessments.filter(a => a.riskScore > 30).length;
  
  const blockedAccounts = new Set(
    assessments
      .filter(a => ['PENDING_BLOCK', 'HOLD_SOC', 'FREEZE'].includes(a.recommendedAction.toUpperCase()) || a.status === 'HOLD_SOC' || a.status === 'PENDING_BLOCK')
      .map(a => a.userId)
  ).size;

  const avgRiskScore = totalTransactions > 0 
    ? Math.round(assessments.reduce((sum, a) => sum + a.riskScore, 0) / totalTransactions) 
    : 0;

  // 2. Risk Distribution Chart Data
  const pieData = [
    { name: 'Low Risk', value: safeTxns, color: '#10b981' },
    { name: 'Medium Risk', value: medTxns, color: '#f59e0b' },
    { name: 'High Risk', value: highTxns, color: '#ef4444' },
    { name: 'Critical Risk', value: criticalTxns, color: '#7f1d1d' }
  ].filter(d => d.value > 0);

  // 3. Risk Trend Chart Data (grouped by hours or in order of occurrence)
  // We'll sort by timestamp and construct a moving average
  const sortedTxns = [...assessments].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  const lineData = sortedTxns.map((t, idx) => ({
    time: t.timestamp.substring(11, 16),
    'Risk Score': t.riskScore,
    'Txn Amount': parseFloat(t.amount)
  }));

  // 4. Filter for recent high severity alerts
  const recentAlerts = assessments
    .filter(a => a.riskScore > 30)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Top Banner Warning for Active Critical Alerts */}
      {criticalTxns > 0 && (
        <div className="glass-card risk-critical" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
          <ShieldAlert size={28} />
          <div>
            <h4 style={{ fontWeight: 800 }}>CRITICAL SOC ALERTS ACTIVE</h4>
            <p style={{ fontSize: '0.85rem' }}>The threat engine has detected {criticalTxns} potential critical security compromises (Account Takeovers / Privileged Insider abuse). Immediate analyst intervention required.</p>
          </div>
        </div>
      )}

      {/* Grid of Key Performance Indicators (KPIs) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem'
      }}>
        
        <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>TOTAL TRANSACTIONS</span>
            <h2 style={{ fontSize: '2rem', marginTop: '0.25rem' }}>{totalTransactions}</h2>
          </div>
          <div style={{ color: 'var(--accent-cyan)', background: 'rgba(0,242,254,0.1)', padding: '0.75rem', borderRadius: '8px' }}>
            <Activity size={24} />
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>AVERAGE RISK SCORE</span>
            <h2 style={{ fontSize: '2rem', marginTop: '0.25rem', color: avgRiskScore > 50 ? 'var(--color-danger)' : 'var(--color-success)' }}>
              {avgRiskScore}%
            </h2>
          </div>
          <div style={{ 
            color: avgRiskScore > 50 ? 'var(--color-danger)' : 'var(--color-success)', 
            background: avgRiskScore > 50 ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', 
            padding: '0.75rem', 
            borderRadius: '8px' 
          }}>
            <ShieldAlert size={24} />
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ACTIVE ALERTS</span>
            <h2 style={{ fontSize: '2rem', marginTop: '0.25rem', color: activeAlerts > 0 ? 'var(--color-warning)' : 'inherit' }}>
              {activeAlerts}
            </h2>
          </div>
          <div style={{ color: 'var(--color-warning)', background: 'rgba(245,158,11,0.1)', padding: '0.75rem', borderRadius: '8px' }}>
            <AlertTriangle size={24} />
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>SUSPENDED ACCOUNTS</span>
            <h2 style={{ fontSize: '2rem', marginTop: '0.25rem', color: blockedAccounts > 0 ? 'var(--color-danger)' : 'inherit' }}>
              {blockedAccounts}
            </h2>
          </div>
          <div style={{ color: 'var(--color-danger)', background: 'rgba(239,68,68,0.1)', padding: '0.75rem', borderRadius: '8px' }}>
            <Ban size={24} />
          </div>
        </div>
      </div>

      {/* Chart Panels */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
        gap: '1.5rem'
      }}>
        
        {/* Risk Trend Line Chart */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} color="var(--accent-cyan)" /> Risk Trend & Amount Log
          </h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={lineData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={11} />
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-navy)', borderColor: 'var(--accent-cyan)', color: '#fff' }}
                  itemStyle={{ color: 'var(--accent-cyan)' }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Line type="monotone" dataKey="Risk Score" stroke="var(--accent-cyan)" strokeWidth={2} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution Pie Chart */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={18} color="var(--accent-cyan)" /> Threat Risk Distribution
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', height: 300 }}>
            <div style={{ width: '60%', height: '100%' }}>
              {pieData.length > 0 ? (
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--bg-navy)', borderColor: 'var(--border-color)', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  No transaction telemetry available
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {pieData.map((entry, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: entry.color }} />
                  <span style={{ fontWeight: 600 }}>{entry.name}:</span>
                  <span style={{ color: 'var(--text-muted)' }}>{entry.value} txn(s)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Recent Security Incidents List */}
      <div className="glass-card">
        <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldAlert size={18} color="var(--color-warning)" /> Recent Suspicious Events (Correlation Alerts)
        </h3>
        {recentAlerts.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentAlerts.map(alert => (
              <div 
                key={alert.transactionId}
                onClick={() => onViewTransaction(alert.transactionId)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 1fr 140px 100px 120px 80px',
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  padding: '1rem',
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)'
                }}
                className="hover-alert-row"
              >
                <span style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{alert.transactionId}</span>
                <div>
                  <div style={{ fontWeight: 600 }}>{alert.threatClassification}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>User: {alert.userName} | IP: {alert.ipAddress}</div>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{alert.timestamp}</div>
                <div style={{ fontWeight: 700 }}>₹{parseFloat(alert.amount).toLocaleString()}</div>
                <div>
                  <span className={`risk-badge risk-${alert.riskLevel.toLowerCase()}`}>
                    {alert.riskLevel} ({alert.riskScore}%)
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', textAlign: 'right', fontWeight: 600 }}>
                  INVESTIGATE
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            No security anomalies or active alerts reported.
          </div>
        )}
      </div>

      {/* Quick CSS style additions for hover row */}
      <style>{`
        .hover-alert-row:hover {
          background: rgba(0, 242, 254, 0.04) !important;
          border-color: rgba(0, 242, 254, 0.25) !important;
          transform: translateX(4px);
        }
      `}</style>

    </div>
  );
}
