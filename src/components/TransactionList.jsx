import React, { useState } from 'react';
import { Search, Filter, Shield, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';

export default function TransactionList({ assessments, selectedTxnId, onSelectTransaction }) {
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");

  // Filter logic
  const filteredAssessments = assessments.filter(item => {
    const matchesRisk = riskFilter === "ALL" || item.riskLevel === riskFilter;
    const searchLower = search.toLowerCase();
    const matchesSearch = 
      item.transactionId.toLowerCase().includes(searchLower) ||
      item.userId.toLowerCase().includes(searchLower) ||
      item.userName.toLowerCase().includes(searchLower) ||
      item.device.toLowerCase().includes(searchLower) ||
      item.ipAddress.toLowerCase().includes(searchLower) ||
      item.country.toLowerCase().includes(searchLower) ||
      item.merchant.toLowerCase().includes(searchLower) ||
      item.threatClassification.toLowerCase().includes(searchLower);
      
    return matchesRisk && matchesSearch;
  });

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header and filter bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem' }}>Security Incident & Transaction Log</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Correlated transaction telemetry and behavior profiles</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          
          {/* Search Input */}
          <div style={{ position: 'relative', width: '250px' }}>
            <input 
              type="text" 
              placeholder="Search ID, user, IP, device..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="cyber-input"
              style={{ paddingLeft: '2.25rem' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>

          {/* Risk Level Filter dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} style={{ color: 'var(--text-muted)' }} />
            <select 
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="cyber-input"
              style={{ width: '130px', cursor: 'pointer' }}
            >
              <option value="ALL">All Risk Levels</option>
              <option value="LOW">Low Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="HIGH">High Risk</option>
              <option value="CRITICAL">Critical Risk</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cyber Table */}
      <div className="cyber-table-container">
        <table className="cyber-table">
          <thead>
            <tr>
              <th>TXN ID</th>
              <th>User Name</th>
              <th>Timestamp</th>
              <th>Amount</th>
              <th>Location</th>
              <th>Device Fingerprint</th>
              <th>Threat Vector</th>
              <th>Risk Score</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssessments.length > 0 ? (
              filteredAssessments.map(item => {
                const isSelected = item.transactionId === selectedTxnId;
                
                return (
                  <tr 
                    key={item.transactionId}
                    onClick={() => onSelectTransaction(item.transactionId)}
                    className={isSelected ? "selected" : ""}
                    style={{ cursor: 'pointer' }}
                  >
                    <td style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{item.transactionId}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{item.userName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.userId} ({item.userRole})</div>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{item.timestamp}</td>
                    <td style={{ fontWeight: 600 }}>₹{parseFloat(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>{item.country}</td>
                    <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.device}>
                      <div>{item.device}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>IP: {item.ipAddress}</div>
                    </td>
                    <td style={{ fontWeight: 500 }}>
                      {item.threatClassification === "Normal Transactions" ? (
                        <span style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <ShieldCheck size={14} color="var(--color-success)" /> Baseline Clean
                        </span>
                      ) : (
                        <span style={{ color: item.riskLevel === 'CRITICAL' ? 'var(--color-danger)' : 'var(--color-warning)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                          <AlertTriangle size={14} /> {item.threatClassification}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`risk-badge risk-${item.riskLevel.toLowerCase()}`}>
                        {item.riskLevel} ({item.riskScore}%)
                      </span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span style={{
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: item.riskScore > 30 ? 'var(--color-warning)' : 'var(--text-muted)',
                        background: 'rgba(255,255,255,0.02)',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        border: '1px solid rgba(255,255,255,0.05)'
                      }}>
                        {item.recommendedAction}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No transactions match your search/filter parameters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '1.5rem' }}>
        <span>Showing <strong>{filteredAssessments.length}</strong> of <strong>{assessments.length}</strong> transactions</span>
        <span>•</span>
        <span>Click any row to open the Transaction Details Page & AI Security Explanation.</span>
      </div>

    </div>
  );
}
