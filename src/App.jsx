import React, { useState, useEffect } from 'react';
import WelcomePage from './components/WelcomePage';
import BranchSelection from './components/BranchSelection';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import TransactionDetail from './components/TransactionDetail';
import Copilot from './components/Copilot';
import UploadData from './components/UploadData';
import ReportGenerator from './components/ReportGenerator';
import BankLogo from './components/BankLogo';
import { generateMockData, USER_PROFILES } from './utils/mockData';
import { correlateAll } from './utils/threatEngine';
import { isAiActive } from './utils/gemini';
import { 
  Shield, Activity, Bot, Upload, FileText, 
  Settings, Key, AlertCircle, X, ShieldCheck, MapPin, Grid
} from 'lucide-react';

export default function App() {
  const [page, setPage] = useState('welcome'); // welcome | branch_select | soc_portal
  const [selectedBranch, setSelectedBranch] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [allRawData, setAllRawData] = useState({ transactions: [], securityData: [] });
  const [assessments, setAssessments] = useState([]);
  const [selectedTxnId, setSelectedTxnId] = useState('');
  const [userProfiles, setUserProfiles] = useState({});
  const [dbStatus, setDbStatus] = useState({ connected: false, database: "", error: "Checking status..." });
  
  // API Key state for local override
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [isLiveAi, setIsLiveAi] = useState(false);

  // Initialize data on mount (query Express server or fallback to mock)
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const statusRes = await fetch('/api/db-status');
        const statusData = await statusRes.json();
        setDbStatus(statusData);

        const tRes = await fetch('/api/transactions');
        const sRes = await fetch('/api/securityData');
        const pRes = await fetch('/api/userProfiles');
        
        const transactions = await tRes.json();
        const securityData = await sRes.json();
        const profilesArray = await pRes.json();

        // Convert profiles array to map
        const profileMap = {};
        profilesArray.forEach(p => {
          profileMap[p.Customer_ID || p.userId] = p;
        });
        setUserProfiles(profileMap);

        setAllRawData({ transactions, securityData });
      } catch (err) {
        console.warn("Express backend server offline. Reverting to local frontend simulation mode:", err);
        const mock = generateMockData();
        setAllRawData(mock);
        setUserProfiles(USER_PROFILES);
        setDbStatus({
          connected: false,
          database: "Local Memory",
          error: "Backend server offline. Reverted to client-side heuristics."
        });
      }
    };

    loadInitialData();
    
    // Check key status
    setIsLiveAi(isAiActive());
    const storedKey = localStorage.getItem('quantum_sentinel_gemini_key') || "";
    setApiKeyInput(storedKey);
  }, []);

  const handleSelectBranch = (branchName, isSecureBranch) => {
    setSelectedBranch(branchName);
    
    let finalTxns = allRawData.transactions;
    let finalSec = allRawData.securityData;

    if (isSecureBranch) {
      // Secure branches display clean logs (no high risk alerts)
      finalTxns = allRawData.transactions.filter(t => t.Transaction_ID !== 'TXN3005' && t.Transaction_ID !== 'TXN3010' && t.Transaction_ID !== 'TXN3015');
      finalSec = allRawData.securityData.filter(s => s.Transaction_ID !== 'TXN3005' && s.Transaction_ID !== 'TXN3010' && s.Transaction_ID !== 'TXN3015');
    }

    const correlated = correlateAll(finalTxns, finalSec, userProfiles);
    setAssessments(correlated);

    if (correlated.length > 0) {
      // Chennai George Town default investigation point is U101's threat TXN3005
      const hasThreat = correlated.some(c => c.transactionId === 'TXN3005');
      setSelectedTxnId(hasThreat ? 'TXN3005' : correlated[0].transactionId);
    } else {
      setSelectedTxnId('');
    }

    setActiveTab('dashboard');
    setPage('soc_portal');
  };

  const handleDataCorrelated = async (transactions, securityData) => {
    // Keep reference of current parsed data
    setAllRawData({ transactions, securityData });
    
    const correlated = correlateAll(transactions, securityData, userProfiles);
    setAssessments(correlated);
    if (correlated.length > 0) {
      const sorted = [...correlated].sort((a, b) => b.riskScore - a.riskScore);
      setSelectedTxnId(sorted[0].transactionId);
    }

    try {
      await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions, securityData })
      });
      const statusRes = await fetch('/api/db-status');
      const statusData = await statusRes.json();
      setDbStatus(statusData);
    } catch (e) {
      console.warn("Failed to synchronize ingested data with backend database: ", e);
    }
  };

  const handleActionApplied = (txnId, actionName) => {
    setAssessments(prev => prev.map(item => {
      if (item.transactionId === txnId) {
        return {
          ...item,
          recommendedAction: actionName
        };
      }
      return item;
    }));
  };

  const handleSaveApiKey = () => {
    if (apiKeyInput.trim()) {
      localStorage.setItem('quantum_sentinel_gemini_key', apiKeyInput.trim());
    } else {
      localStorage.removeItem('quantum_sentinel_gemini_key');
    }
    setIsLiveAi(isAiActive());
    setShowSettings(false);
    
    // Force reload explanation on selected txn if key changes
    const tempId = selectedTxnId;
    setSelectedTxnId("");
    setTimeout(() => setSelectedTxnId(tempId), 50);
  };

  const selectedAssessment = assessments.find(a => a.transactionId === selectedTxnId);

  const handleViewTransactionFromDashboard = (txnId) => {
    setSelectedTxnId(txnId);
    setActiveTab('incidents');
  };

  // Rendering conditional pages
  if (page === 'welcome') {
    return <WelcomePage onNext={() => setPage('branch_select')} />;
  }

  if (page === 'branch_select') {
    return (
      <main className="main-content" style={{ padding: '3rem 2rem' }}>
        <BranchSelection 
          onSelectBranch={handleSelectBranch} 
          onBack={() => setPage('welcome')} 
        />
      </main>
    );
  }

  return (
    <div className="app-container">
      
      {/* Header bar */}
      <header className="header">
        <div className="logo-container" style={{ gap: '0.5rem' }}>
          <BankLogo size={42} showText={false} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="logo-text" style={{ fontSize: '1.15rem' }}>Bank of Maharashtra</span>
              <span className="logo-badge">SOC Grid</span>
            </div>
            {/* Display branch in header */}
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 600 }}>
              <MapPin size={10} color="#0033a0" /> Node: {selectedBranch}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-links">
          <button 
            className={`nav-button ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <Activity size={15} /> Dashboard
          </button>
          
          <button 
            className={`nav-button ${activeTab === 'incidents' ? 'active' : ''}`}
            onClick={() => setActiveTab('incidents')}
          >
            <Shield size={15} /> Security Center
          </button>

          <button 
            className={`nav-button ${activeTab === 'copilot' ? 'active' : ''}`}
            onClick={() => setActiveTab('copilot')}
          >
            <Bot size={15} /> AI Copilot
          </button>

          <button 
            className={`nav-button ${activeTab === 'ingestion' ? 'active' : ''}`}
            onClick={() => setActiveTab('ingestion')}
          >
            <Upload size={15} /> Ingest Data
          </button>

          <button 
            className={`nav-button ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <FileText size={15} /> Reports Dossier
          </button>
        </nav>

        {/* AI Key Status & Branch Swap */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          
          {/* Branch Picker Back-Link */}
          <button 
            onClick={() => setPage('branch_select')}
            className="nav-button"
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.60rem', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#334155' }}
          >
            <Grid size={13} /> Change Branch
          </button>

          {/* Database Connection Badge */}
          {dbStatus.connected ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--color-success)', background: '#d1fae5', padding: '0.35rem 0.6rem', borderRadius: '4px', border: '1px solid #a7f3d0', fontWeight: 700 }} title="Atlas Cluster Connected">
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              <span>MONGODB ONLINE</span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#64748b', background: '#f1f5f9', padding: '0.35rem 0.6rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: 700 }} title={dbStatus.error || "Using local in-memory dataset"}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#64748b', display: 'inline-block' }} />
              <span>DB FALLBACK (SIM)</span>
            </div>
          )}

          {isLiveAi ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--color-success)', background: '#d1fae5', padding: '0.35rem 0.6rem', borderRadius: '4px', border: '1px solid #a7f3d0', fontWeight: 700 }}>
              <ShieldCheck size={12} />
              <span>LIVE AI ACTIVE</span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--color-warning)', background: '#fef3c7', padding: '0.35rem 0.6rem', borderRadius: '4px', border: '1px solid #fde68a', fontWeight: 700 }}>
              <AlertCircle size={12} />
              <span>SIMULATED AI</span>
            </div>
          )}

          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="nav-button"
            style={{ padding: '0.4rem', border: '1px solid #cbd5e1', background: '#f8fafc' }}
            title="AI Configuration Settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </header>

      {/* Settings Modal Popover */}
      {showSettings && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.4)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          <div className="glass-card" style={{ width: '450px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', background: '#ffffff', borderColor: '#cbd5e1' }}>
            <button 
              onClick={() => setShowSettings(false)}
              style={{ position: 'absolute', right: '1.25rem', top: '1.25rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Key color="var(--accent-cyan)" size={20} />
              <h3 style={{ fontSize: '1.25rem' }}>AI Configuration Settings</h3>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Enter your Google Gemini API key to activate live generative AI explanation reports and copilot responses. 
              The key is saved locally in your browser memory.
              <br /><br />
              If left blank, the platform operates in <strong>Local Simulation Mode</strong> (heuristics-based insights).
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Gemini API Key (VITE_GEMINI_API_KEY)</label>
              <input 
                type="password" 
                placeholder="AIzaSy..." 
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="cyber-input"
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button 
                onClick={() => { setApiKeyInput(""); localStorage.removeItem('quantum_sentinel_gemini_key'); setIsLiveAi(false); setShowSettings(false); }}
                className="cyber-button secondary"
                style={{ fontSize: '0.8rem' }}
              >
                Clear Key
              </button>
              <button 
                onClick={handleSaveApiKey}
                className="cyber-button"
                style={{ fontSize: '0.8rem' }}
              >
                Save & Apply Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main page content area */}
      <main className="main-content">
        
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-card" style={{ padding: '1rem 1.5rem', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid #0033a0' }}>
              <div>
                <h4 style={{ fontSize: '1.1rem', color: '#0a2540' }}>{selectedBranch} branch Console Active</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Monitoring node status feed from Bank of Maharashtra security endpoints.</p>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#0033a0', fontWeight: 700 }}>
                Branch Status: <span style={{ color: assessments.some(a => a.riskScore > 30) ? 'var(--color-danger)' : 'var(--color-success)' }}>
                  {assessments.some(a => a.riskScore > 30) ? "Active Warnings" : "Secure / Online"}
                </span>
              </div>
            </div>
            <Dashboard 
              assessments={assessments} 
              onViewTransaction={handleViewTransactionFromDashboard} 
            />
          </div>
        )}

        {activeTab === 'incidents' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: '1.5rem',
            alignItems: 'start'
          }}>
            {/* Split Pane: Transaction List on Left */}
            <div>
              <TransactionList 
                assessments={assessments} 
                selectedTxnId={selectedTxnId}
                onSelectTransaction={setSelectedTxnId} 
              />
            </div>
            
            {/* Split Pane: Detail Report Inspector on Right */}
            <div>
              <TransactionDetail 
                assessment={selectedAssessment} 
                onActionApplied={handleActionApplied}
              />
            </div>
          </div>
        )}

        {activeTab === 'copilot' && (
          <Copilot assessments={assessments} />
        )}

        {activeTab === 'ingestion' && (
          <UploadData onDataCorrelated={handleDataCorrelated} />
        )}

        {activeTab === 'reports' && (
          <ReportGenerator assessment={selectedAssessment} />
        )}

      </main>

      {/* Corporate Footer */}
      <footer className="no-print" style={{ 
        background: '#ffffff', 
        borderTop: '1px solid #cbd5e1', 
        padding: '1.25rem 2rem', 
        fontSize: '0.8rem', 
        color: 'var(--text-muted)',
        textAlign: 'center',
        marginTop: 'auto'
      }}>
        <span>Bank of Maharashtra Security Operations Center (SOC) Console. Monitoring is active. Confidential.</span>
      </footer>

    </div>
  );
}
