// Retrieve Groq API key dynamically from environment or local storage
const getApiKey = () => {
  return import.meta.env.VITE_GROQ_API_KEY || localStorage.getItem('quantum_sentinel_groq_key') || "";
};

export function isAiActive() {
  return getApiKey().trim().length > 0;
}

// Function to call our Express backend proxy for Groq AI Explanations
export async function generateTransactionExplanation(assessment) {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    // Simulation Mode Fallback
    return getMockExplanation(assessment);
  }

  try {
    const response = await fetch('/api/generate-explanation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ assessment })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.explanation;
  } catch (error) {
    console.error("Groq API Error, falling back to Simulation Mode:", error);
    return `**[Groq API Connection Failed: ${error.message}]**\n\n*Please verify if your API key is correct. Reverting to simulated report analysis:*\n\n` + getMockExplanation(assessment);
  }
}

// Simulation Mode generator for Explanations
function getMockExplanation(assessment) {
  const { amount, userName, profile, riskScore, threatClassification, recommendedAction, device, ipAddress, country } = assessment;
  
  if (riskScore < 30) {
    return `### **Threat Classification**: Normal Transaction (Safe)
**Risk Score**: ${riskScore}% | **Confidence**: 99%

This transaction aligns fully with the established User and Entity Behavior Analytics (UEBA) profile for **${userName}**. 

* **Behavioral Checkpoints**:
  * **Device Match**: The initiating device \`${device}\` matches the user's trusted device \`${profile.normalDevice}\`.
  * **Network Verification**: The access IP \`${ipAddress}\` aligns with the user's home network \`${profile.normalIp}\`.
  * **Transaction Baseline**: The amount of ₹${parseFloat(amount).toFixed(2)} is well within the typical average spend (₹${profile.avgTransactionAmount.toFixed(2)}).

**SOC Decision**: The correlation engine indicates no anomalous signals. The transaction is approved.`;
  }

  if (threatClassification.includes("Account Takeover")) {
    return `### **Threat Classification**: Potential Account Takeover (ATO)
**Risk Score**: ${riskScore}% | **Confidence**: 97%

The engine has flagged a high-probability **Account Takeover (ATO)** by correlating multiple critical security signals:

1. **Impossible Physical Travel**: A session was active in ${profile.normalLocation} and initiated a transaction from ${country} within minutes. This represents physical impossibility.
2. **Device Fingerprint Mismatch**: The device \`${device}\` does not match the registered user hardware \`${profile.normalDevice}\`.
3. **Anomalous Transaction Volume**: The transaction amount of **₹${parseFloat(amount).toLocaleString()}** deviates drastically from the user's average baseline (₹${profile.avgTransactionAmount.toFixed(2)}), representing a **${Math.round(amount / profile.avgTransactionAmount)}x** increase.
4. **New Access Location**: The transaction originated from IP \`${ipAddress}\` in ${country}, which has never been associated with this account.

**SOC Action Recommendation**: ${recommendedAction}. All active sessions must be terminated, and the user must be contacted via out-of-band communication.`;
  }

  if (threatClassification.includes("Insider Threat")) {
    return `### **Threat Classification**: Privileged Insider Threat Anomaly
**Risk Score**: ${riskScore}% | **Confidence**: 91%

A high-risk administrative anomaly has been identified on the account of **${userName}** (Role: ${profile.role}):

1. **Privileged Privilege Deviation**: The transaction consists of a high-value transfer of **₹${parseFloat(amount).toLocaleString()}** which represents a massive spike relative to the standard administrator average (₹${profile.avgTransactionAmount.toFixed(2)}).
2. **Temporal Anomaly (Out-of-Hours)**: The transaction was executed at ${assessment.timestamp.substring(11, 16)}, which falls significantly outside normal working hours (${profile.typicalLoginTime}).
3. **Device & Network Authenticity**: Crucially, the transaction was authorized from the user's standard trusted device (\`${device}\`) and normal IP (\`${ipAddress}\`). 

**Conclusion**: This represents a classic insider threat profile or complete machine compromise where the attacker has remote control of the legitimate hardware.
**SOC Action Recommendation**: ${recommendedAction}. The transaction has been held, and an active incident review has been raised.`;
  }

  if (threatClassification.includes("Brute Force")) {
    return `### **Threat Classification**: Brute Force Auth Attack
**Risk Score**: ${riskScore}% | **Confidence**: 88%

Suspicious transaction authorization preceded by active credential guessing on the account of **${userName}**:

1. **Authentication Telemetry**: 4 consecutive failed login attempts occurred immediately prior to the successful authorization.
2. **IP Correlation**: The brute-force attempts and subsequent successful transaction originated from an unfamiliar IP address (\`${ipAddress}\`), suggesting a credential stuffing attack.
3. **Value Spike**: The transaction amount of **₹${parseFloat(amount).toLocaleString()}** is elevated compared to the average retail profile.

**SOC Action Recommendation**: ${recommendedAction}. Prompt the user for second-factor SMS/hardware token approval to authorize this transfer.`;
  }

  // Generic Suspicious Behavioral Deviation
  return `### **Threat Classification**: Suspicious Behavioral Deviation
**Risk Score**: ${riskScore}% | **Confidence**: 85%

Anomalous indicators detected for user **${userName}**:
* **Device**: Unknown device fingerprint (\`${device}\`).
* **Location**: Unfamiliar IP address (\`${ipAddress}\`) in ${country}.
* **Value**: Elevated amount of ₹${parseFloat(amount).toLocaleString()} (avg: ₹${profile.avgTransactionAmount.toFixed(2)}).

**SOC Action Recommendation**: ${recommendedAction}.`;
}

// Function to handle chatbot dialogue via Express Groq proxy
export async function chatWithCopilot(userMessage, chatHistory = [], allAssessments = []) {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    // Simulation Mode Fallback
    return getMockChatResponse(userMessage, allAssessments);
  }

  try {
    const response = await fetch('/api/copilot-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ userMessage, chatHistory, allAssessments })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.reply;
  } catch (error) {
    console.error("Groq Copilot Error, using simulated response:", error);
    return `**[Groq API Connection Failed: ${error.message}]**\n\n*Copilot has temporarily reverted to Local Simulation Mode. Response:*\n\n` + getMockChatResponse(userMessage, allAssessments);
  }
}

// Simulation Mode chatbot intelligence
function getMockChatResponse(message, allAssessments) {
  const msg = message.toLowerCase();
  
  // 1. Specific Transaction Queries
  if (msg.includes("txn-") || msg.includes("transaction")) {
    const match = allAssessments.find(t => msg.includes(t.transactionId.toLowerCase()));
    if (match) {
      return `### Transaction Report: **${match.transactionId}**
* **User**: ${match.userName} (${match.userRole})
* **Alert Status**: ${match.riskLevel} Risk (${match.riskScore}%)
* **Threat Type**: ${match.threatClassification}
* **Financial Amount**: ₹${parseFloat(match.amount).toLocaleString()}
* **Recommended Action**: \`${match.recommendedAction}\`

**Threat Synopsis**: The threat correlation engine flagged this transaction due to ${match.indicators.map(i => i.label).join(", ")}. ${match.impossibleTravelDetails ? `Impossible Travel was detected between ${match.impossibleTravelDetails.fromLocation} and ${match.impossibleTravelDetails.toLocation}.` : ""}`;
    }
  }

  // 2. Incident Summary Queries
  if (msg.includes("summarize") || msg.includes("summary") || msg.includes("alerts") || msg.includes("incidents") || msg.includes("today")) {
    const highAlerts = allAssessments.filter(t => t.riskScore >= 60);
    const medAlerts = allAssessments.filter(t => t.riskScore >= 31 && t.riskScore < 60);
    
    if (highAlerts.length === 0 && medAlerts.length === 0) {
      return `All transaction systems are operating nominally. There are no active alerts or security incidents detected in today's logs.`;
    }

    let response = `### Security Alert Summary
I have compiled the current active security alerts in the threat correlation engine:

* **High/Critical Severity Alerts (${highAlerts.length})**:
${highAlerts.map(a => `  * **${a.transactionId}** (${a.userName}): **${a.threatClassification}** | Risk Score: **${a.riskScore}%** | Recommended Action: *${a.recommendedAction}*`).join('\n')}

* **Medium Severity Alerts (${medAlerts.length})**:
${medAlerts.map(a => `  * **${a.transactionId}** (${a.userName}): **${a.threatClassification}** | Risk Score: **${a.riskScore}%**`).join('\n')}

**Assessment Summary**: The primary vector is a potential Account Takeover (ATO) showing impossible travel, alongside a privileged user performing out-of-hours high-value operations. I recommend immediate analyst review of critical tickets.`;
    return response;
  }

  // 3. Insider Threat Queries
  if (msg.includes("insider") || msg.includes("insider threat")) {
    const insider = allAssessments.find(t => t.threatClassification.toLowerCase().includes("insider"));
    if (insider) {
      return `### Insider Threat Alert: **${insider.transactionId}**
We detected anomalous activity on the account of **${insider.userName}** (${insider.userRole}).

* **Incident Details**: Initiated a transfer of ₹150,000.00 at 02:14 AM (outside typical hours 08:00 - 18:00).
* **Mitigating Factors**: Device and IP address are normal, which points to either a malicious insider, compromised credentials used from the native host, or an approved urgent emergency transfer.
* **Recommended Action**: Hold transaction and contact the user for out-of-band authorization.`;
    }
    return `No insider threat behaviors are currently detected in our transaction telemetry.`;
  }

  // 4. General Queries
  return `### Quantum Sentinel Copilot
I am ready to assist. You can ask me queries such as:
* *"Summarize today's security incidents."*
* *"Why was transaction TXN-2001 blocked?"*
* *"What makes account USR-101 suspicious?"*
* *"Explain the threat indicators for TXN-2002."*

How can I assist your investigation today?`;
}
