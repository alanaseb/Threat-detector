import React, { useState } from 'react';
import { parseCSV, triggerCSVDownload, generateMockData } from '../utils/mockData';
import { Upload, Download, FileSpreadsheet, ShieldAlert, CheckCircle2, RefreshCw } from 'lucide-react';

export default function UploadData({ onDataCorrelated }) {
  const [txns, setTxns] = useState(null);
  const [telemetry, setTelemetry] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  // Helper to compile combined security telemetry for sample download
  const getCombinedSampleTelemetry = () => {
    const mock = generateMockData();
    const combined = [
      ...mock.logins.map(l => ({
        eventId: l.loginId,
        userId: l.userId,
        timestamp: l.timestamp,
        eventType: l.status === "SUCCESS" ? "LOGIN_SUCCESS" : "LOGIN_FAILED",
        severity: "INFO",
        ipAddress: l.ipAddress,
        device: l.device,
        country: l.country,
        description: `Authentication session ${l.status.toLowerCase()}.`
      })),
      ...mock.securityEvents.map(e => ({
        eventId: e.eventId,
        userId: e.userId,
        timestamp: e.timestamp,
        eventType: e.eventType,
        severity: e.severity,
        ipAddress: "",
        device: "",
        country: "",
        description: e.description
      }))
    ].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    return combined;
  };

  const handleDownloadSample = (type) => {
    const mock = generateMockData();
    if (type === 'transactions') {
      triggerCSVDownload('sample_banking_transactions.csv', mock.transactions);
    } else if (type === 'telemetry') {
      const combined = getCombinedSampleTelemetry();
      triggerCSVDownload('sample_security_telemetry.csv', combined);
    }
  };

  const handleFileUpload = (e, setter, label) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      try {
        const parsed = parseCSV(text);
        if (parsed.length === 0) {
          throw new Error("No valid rows found. Please check CSV header format.");
        }
        setter(parsed);
        setStatusMessage(`Successfully loaded ${parsed.length} rows for ${label}.`);
      } catch (err) {
        setStatusMessage(`Error parsing ${label}: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleApplyData = () => {
    if (!txns && !telemetry) {
      setStatusMessage("Please upload at least one dataset before applying.");
      return;
    }

    const mockDefault = generateMockData();
    const finalTxns = txns || mockDefault.transactions;

    let finalLogins = mockDefault.logins;
    let finalEvents = mockDefault.securityEvents;

    if (telemetry) {
      // Split telemetry back into logins and events for the engine
      // Logins are events with eventType = LOGIN_SUCCESS / LOGIN_FAILED
      const uploadedLogins = telemetry
        .filter(t => t.eventType === "LOGIN_SUCCESS" || t.eventType === "LOGIN_FAILED" || t.status)
        .map(t => ({
          loginId: t.eventId || `LOG-${Math.random().toString(36).substr(2, 4)}`,
          userId: t.userId,
          timestamp: t.timestamp,
          ipAddress: t.ipAddress || "",
          device: t.device || "",
          country: t.country || "",
          status: (t.eventType === "LOGIN_SUCCESS" || t.status === "SUCCESS") ? "SUCCESS" : "FAILED",
          failedAttemptsBeforeSuccess: 0 // Baseline heuristics
        }));

      const uploadedEvents = telemetry
        .filter(t => t.eventType !== "LOGIN_SUCCESS" && t.eventType !== "LOGIN_FAILED" && t.status !== "SUCCESS" && t.status !== "FAILED")
        .map(t => ({
          eventId: t.eventId || `SEC-${Math.random().toString(36).substr(2, 4)}`,
          userId: t.userId,
          timestamp: t.timestamp,
          eventType: t.eventType,
          severity: t.severity || "MEDIUM",
          description: t.description || ""
        }));

      if (uploadedLogins.length > 0) finalLogins = uploadedLogins;
      if (uploadedEvents.length > 0) finalEvents = uploadedEvents;
    }

    onDataCorrelated(finalTxns, finalLogins, finalEvents);
    setStatusMessage("Threat correlation completed! All datasets correlated and branch SOC updated.");
  };

  const handleResetDefaults = () => {
    const mock = generateMockData();
    onDataCorrelated(mock.transactions, mock.logins, mock.securityEvents);
    setTxns(null);
    setTelemetry(null);
    setStatusMessage("Reset dashboard back to Bank of Maharashtra threat scenario logs.");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Introduction Card */}
      <div className="glass-card" style={{ borderLeft: '4px solid #0033a0' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileSpreadsheet color="var(--accent-cyan)" /> SOC Threat Correlation Ingestion
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
          Upload banking transaction streams alongside consolidated security telemetry (login activities and threat alerts) 
          to analyze branch risk profiles on the fly. Download sample templates below to examine structure requirements.
        </p>

        {/* Template Downloads */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
          <button 
            onClick={() => handleDownloadSample('transactions')}
            className="cyber-button secondary"
            style={{ fontSize: '0.8rem', padding: '0.5rem 0.85rem' }}
          >
            <Download size={14} /> Download Sample Transactions CSV
          </button>
          
          <button 
            onClick={() => handleDownloadSample('telemetry')}
            className="cyber-button secondary"
            style={{ fontSize: '0.8rem', padding: '0.5rem 0.85rem' }}
          >
            <Download size={14} /> Download Sample Security Telemetry CSV
          </button>
        </div>
      </div>

      {/* Upload Columns */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '1.5rem'
      }}>
        
        {/* Box 1: Transactions */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              1. Banking Transactions CSV
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Upload CSV containing columns: <code>transactionId</code>, <code>userId</code>, <code>amount</code>, <code>timestamp</code>, <code>device</code>, <code>ipAddress</code>, <code>country</code>, <code>merchant</code>.
            </p>
          </div>

          <div style={{
            border: '2px dashed #cbd5e1',
            borderRadius: '8px',
            padding: '2.5rem 1rem',
            textAlign: 'center',
            background: txns ? '#ecfdf5' : '#f8fafc',
            borderColor: txns ? '#10b981' : '#cbd5e1',
            transition: 'var(--transition-smooth)'
          }}>
            {txns ? (
              <div style={{ color: 'var(--color-success)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={36} />
                <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{txns.length} Transactions Loaded</span>
              </div>
            ) : (
              <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <Upload size={32} color="#0033a0" />
                <span style={{ fontSize: '0.9rem', color: '#0033a0', fontWeight: 600 }}>Choose Transactions CSV</span>
                <input 
                  type="file" 
                  accept=".csv" 
                  onChange={(e) => handleFileUpload(e, setTxns, "Transactions")}
                  style={{ display: 'none' }}
                />
              </label>
            )}
          </div>
        </div>

        {/* Box 2: Security Telemetry (Logins + Events) */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              2. Security Telemetry CSV
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Upload CSV containing: <code>eventId</code>, <code>userId</code>, <code>timestamp</code>, <code>eventType</code> (e.g. LOGIN_SUCCESS, LOGIN_FAILED, IMP_TRAVEL), <code>severity</code>, <code>ipAddress</code>, <code>device</code>, <code>country</code>, <code>description</code>.
            </p>
          </div>

          <div style={{
            border: '2px dashed #cbd5e1',
            borderRadius: '8px',
            padding: '2.5rem 1rem',
            textAlign: 'center',
            background: telemetry ? '#ecfdf5' : '#f8fafc',
            borderColor: telemetry ? '#10b981' : '#cbd5e1',
            transition: 'var(--transition-smooth)'
          }}>
            {telemetry ? (
              <div style={{ color: 'var(--color-success)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={36} />
                <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{telemetry.length} Telemetry Records Loaded</span>
              </div>
            ) : (
              <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <Upload size={32} color="#0033a0" />
                <span style={{ fontSize: '0.9rem', color: '#0033a0', fontWeight: 600 }}>Choose Telemetry CSV</span>
                <input 
                  type="file" 
                  accept=".csv" 
                  onChange={(e) => handleFileUpload(e, setTelemetry, "Security Telemetry")}
                  style={{ display: 'none' }}
                />
              </label>
            )}
          </div>
        </div>

      </div>

      {/* Control Actions and Status */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          {statusMessage ? (
            <p style={{ fontSize: '0.9rem', color: '#0033a0', fontWeight: 700 }}>{statusMessage}</p>
          ) : (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Note: Unuploaded files will use preloaded Bank of Maharashtra scenarios.
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            onClick={handleResetDefaults}
            className="cyber-button secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <RefreshCw size={14} /> Reset Scenario Data
          </button>

          <button 
            onClick={handleApplyData}
            disabled={!txns && !telemetry}
            className="cyber-button"
            style={{ opacity: (!txns && !telemetry) ? 0.5 : 1 }}
          >
            Correlate & Run Engine
          </button>
        </div>
      </div>

    </div>
  );
}
