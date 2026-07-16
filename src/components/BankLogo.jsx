import React from 'react';

export default function BankLogo({ size = 80, showText = true, textColor = "#0033a0" }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 200 200" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        {/* Outer Circular border */}
        <circle cx="100" cy="100" r="90" stroke="#0033a0" strokeWidth="6" fill="#ffffff" />
        <circle cx="100" cy="100" r="80" stroke="#0033a0" strokeWidth="2" />

        {/* Waves at the top representing M-M-M */}
        <path 
          d="M 45,65 Q 60,35 75,60 Q 90,30 100,55 Q 110,30 125,60 Q 140,35 155,65" 
          stroke="#0033a0" 
          strokeWidth="4" 
          strokeLinecap="round"
          fill="none" 
        />

        {/* Center Deepstambh Lamp Pillar */}
        <rect x="94" y="65" width="12" height="75" fill="#0033a0" rx="3" />
        
        {/* Horizontal plates on Deepstambh */}
        <rect x="88" y="75" width="24" height="3" fill="#0033a0" />
        <rect x="86" y="90" width="28" height="3" fill="#0033a0" />
        <rect x="86" y="105" width="28" height="3" fill="#0033a0" />
        <rect x="88" y="120" width="24" height="3" fill="#0033a0" />
        
        {/* Flames / Lights on the lamp post sides */}
        <path d="M 88,75 Q 83,67 88,65 Q 93,67 88,75 Z" fill="#0033a0" />
        <path d="M 112,75 Q 117,67 112,65 Q 107,67 112,75 Z" fill="#0033a0" />
        
        <path d="M 86,90 Q 81,82 86,80 Q 91,82 86,90 Z" fill="#0033a0" />
        <path d="M 114,90 Q 119,82 114,80 Q 109,82 114,90 Z" fill="#0033a0" />
        
        <path d="M 86,105 Q 81,97 86,95 Q 91,97 86,105 Z" fill="#0033a0" />
        <path d="M 114,105 Q 119,97 114,95 Q 109,97 114,105 Z" fill="#0033a0" />
        
        <path d="M 88,120 Q 83,112 88,110 Q 93,112 88,120 Z" fill="#0033a0" />
        <path d="M 112,120 Q 117,112 112,110 Q 107,112 112,120 Z" fill="#0033a0" />

        {/* Base of deepstambh */}
        <path d="M 85,140 L 115,140 L 125,148 L 75,148 Z" fill="#0033a0" />

        {/* Left Box (Hindi 'म' and English 'M') */}
        <rect x="38" y="80" width="30" height="42" stroke="#0033a0" strokeWidth="2" rx="2" fill="#ffffff" />
        <line x1="38" y1="101" x2="68" y2="101" stroke="#0033a0" strokeWidth="2" />
        <text x="53" y="95" fill="#0033a0" fontSize="15" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">म</text>
        <text x="53" y="116" fill="#0033a0" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="monospace">M</text>

        {/* Right Box (Hindi 'बैं' and English 'B') */}
        <rect x="132" y="80" width="30" height="42" stroke="#0033a0" strokeWidth="2" rx="2" fill="#ffffff" />
        <line x1="132" y1="101" x2="162" y2="101" stroke="#0033a0" strokeWidth="2" />
        <text x="147" y="95" fill="#0033a0" fontSize="14" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">बैं</text>
        <text x="147" y="116" fill="#0033a0" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="monospace">B</text>

        {/* Curved Path for Text: मुद्रय लोक मङ्गलम */}
        {/* We create a path running in a circle at the bottom */}
        <path id="textPathBottom" d="M 32,130 A 78,78 0 0,0 168,130" fill="none" />
        <text fontSize="12" fontWeight="800" fontFamily="sans-serif" fill="#0033a0">
          <textPath href="#textPathBottom" startOffset="50%" textAnchor="middle">
            ॥ मुद्रय लोक मङ्गलम ॥
          </textPath>
        </text>
      </svg>

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ 
            fontSize: '1.6rem', 
            fontWeight: 800, 
            color: textColor, 
            lineHeight: 1.1,
            fontFamily: "'Outfit', sans-serif",
            letterSpacing: '-0.02em'
          }}>
            बैंक ऑफ महाराष्ट्र
          </span>
          <span style={{ 
            fontSize: '1.4rem', 
            fontWeight: 700, 
            color: textColor, 
            lineHeight: 1.1,
            fontFamily: "'Outfit', sans-serif",
            letterSpacing: '-0.02em'
          }}>
            Bank of Maharashtra
          </span>
          <span style={{ 
            fontSize: '0.65rem', 
            color: '#ef4444', 
            fontWeight: 700, 
            letterSpacing: '0.15em',
            marginTop: '0.2rem',
            textTransform: 'uppercase'
          }}>
            भारत सरकार का उद्यम / A Govt. of India Enterprise
          </span>
        </div>
      )}
    </div>
  );
}
