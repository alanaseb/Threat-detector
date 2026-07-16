import React from 'react';
import BankLogo from './BankLogo';
import { ShieldCheck, ArrowRight, Eye, ShieldAlert, Cpu } from 'lucide-react';

export default function WelcomePage({ onNext }) {
  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div className="glass-card" style={{
        maxWidth: '750px',
        width: '100%',
        padding: '3rem 2.5rem',
        textAlign: 'center',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        boxShadow: '0 10px 25px -5px rgba(0, 51, 160, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem'
      }}>
        
        {/* Bank Logo */}
        <BankLogo size={120} showText={true} />

        <div style={{
          width: '100%',
          height: '2px',
          background: 'linear-gradient(90deg, transparent 0%, #0033a0 50%, transparent 100%)',
          margin: '0.5rem 0'
        }} />

        {/* Portal Information */}
        <div>
          <h2 style={{ 
            fontSize: '2rem', 
            fontWeight: 800, 
            color: '#0a2540',
            fontFamily: "'Outfit', sans-serif",
            letterSpacing: '-0.02em',
            marginBottom: '0.5rem'
          }}>
            QUANTUM SENTINEL AI
          </h2>
          <h4 style={{ 
            fontSize: '1.05rem', 
            color: '#0033a0', 
            fontWeight: 700, 
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '1rem'
          }}>
            Branch SOC Threat Correlation Portal
          </h4>
          <p style={{ 
            fontSize: '0.925rem', 
            color: '#4b5563', 
            lineHeight: 1.6,
            maxWidth: '620px',
            margin: '0 auto'
          }}>
            Quantum Sentinel AI is an intelligent cyber threat correlation platform developed for the **Bank of Maharashtra**. 
            Unlike traditional fraud checkers, this platform merges core retail transaction records with cybersecurity telemetry 
            (logins, device hashes, geolocations, and threat feeds) to provide explainable, AI-driven security auditing 
            across key regional branch nodes.
          </p>
        </div>

        {/* Highlighted Concepts */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          width: '100%',
          marginTop: '1rem'
        }}>
          <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <Cpu size={24} color="#0033a0" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Telemetry Correlation</span>
          </div>

          <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <Eye size={24} color="#0033a0" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>UEBA Behavior Profiling</span>
          </div>

          <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={24} color="#0033a0" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Explainable AI Audit</span>
          </div>
        </div>

        {/* Enter Button */}
        <button 
          onClick={onNext}
          className="cyber-button"
          style={{
            marginTop: '1.5rem',
            padding: '0.85rem 2rem',
            fontSize: '1rem',
            borderRadius: '8px',
            backgroundColor: '#0033a0',
            color: '#ffffff',
            boxShadow: '0 4px 14px 0 rgba(0, 51, 160, 0.4)'
          }}
        >
          Access Branch SOC Portals <ArrowRight size={18} />
        </button>

      </div>
    </div>
  );
}
