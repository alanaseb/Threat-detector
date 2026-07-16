// Dynamic user profiles loaded from MongoDB

// Dynamic score and explanation engine following your precise weights
export function correlateTransaction(txn, sec, allTxns = [], userProfilesMap = {}) {
  const customerId = txn.Customer_ID || sec.Customer_ID;
  const profileRaw = userProfilesMap[customerId] || {};
  const profile = {
    userId: profileRaw.Customer_ID || profileRaw.userId || customerId,
    name: profileRaw.Name || profileRaw.name || txn.Account_Holder_Name || sec.Account_Holder_Name || "Bank Customer",
    normalDevice: profileRaw.Normal_Device || profileRaw.normalDevice || "Windows PC",
    normalLocation: profileRaw.Normal_Location || profileRaw.normalLocation || txn.Location || sec.Location || "Chennai",
    accountNumber: profileRaw.Account_Number || profileRaw.accountNumber || txn.Account_Number || "Unknown",
    ifsc: profileRaw.IFSC_Code || profileRaw.ifsc || txn.IFSC_Code || "000",
    accountType: profileRaw.Account_Type || profileRaw.accountType || txn.Account_Type || "Savings",
    avgAmount: parseFloat(profileRaw.Avg_Amount || profileRaw.avgAmount || 2000)
  };

  const amountVal = parseFloat(txn.Transaction_Amount || 0);
  const locationVal = sec.Location || txn.Location || "";
  const deviceVal = sec.Device_Information || txn.Device_Information || "";
  const vpnVal = sec.VPN_Used || "";
  const firewallVal = sec.Firewall_Alert || "";
  const statusVal = txn.Transaction_Status || "";
  const timeVal = sec.Login_Time || txn.Login_Time || "12:00";
  const dateVal = sec.Login_Date || txn.Login_Date || "01-07-2026";

  let score = 0;
  const indicators = [];
  const explanationParts = [];

  // Rule 1: VPN Used (+20)
  if (vpnVal.toLowerCase() === "yes") {
    score += 20;
    indicators.push({ code: "VPN", label: "VPN Usage Detected", weight: 20, description: "Connection routed through proxy/VPN network." });
    explanationParts.push("VPN used (+20)");
  }

  // Rule 2: Firewall Alert (+20)
  if (firewallVal.toLowerCase() === "yes") {
    score += 20;
    indicators.push({ code: "FW", label: "Firewall Alert Triggered", weight: 20, description: "Bank gateway blocked anomalous network handshake." });
    explanationParts.push("Firewall alert triggered (+20)");
  }

  // Rule 3: Transaction Failed/Blocked (+15)
  if (statusVal.toLowerCase() === "failed" || statusVal.toLowerCase() === "blocked") {
    score += 15;
    indicators.push({ code: "BLOCKED", label: "Blocked Status", weight: 15, description: "Transaction flagged and halted in pending clearance." });
    explanationParts.push("Transaction failed/blocked (+15)");
  }

  // Rule 4: Location Anomaly (+15)
  const isAnomalousLocation = locationVal && profile.normalLocation && locationVal.toLowerCase() !== profile.normalLocation.toLowerCase();
  if (isAnomalousLocation) {
    score += 15;
    indicators.push({ code: "LOC", label: "Anomalous Location Jump", weight: 15, description: `Access from ${locationVal} deviates from typical branch ${profile.normalLocation}.` });
    explanationParts.push(`Login location '${locationVal}' differs from usual '${profile.normalLocation}' (+15)`);
  }

  // Rule 5: Device Mismatch (+10)
  const isAnomalousDevice = deviceVal && profile.normalDevice && deviceVal.toLowerCase() !== profile.normalDevice.toLowerCase();
  if (isAnomalousDevice) {
    score += 10;
    indicators.push({ code: "DEV", label: "Device Fingerprint Deviation", weight: 10, description: `Hardware profile ${deviceVal} differs from user register ${profile.normalDevice}.` });
    explanationParts.push(`Device '${deviceVal}' differs from registered '${profile.normalDevice}' (+10)`);
  }

  // Rule 6: Transaction Spike > 10x (+15)
  const isSpike = amountVal > (profile.avgAmount * 10);
  if (isSpike) {
    score += 15;
    indicators.push({ code: "VAL_SPIKE", label: "High Volume Transaction Spike", weight: 15, description: `Amount ₹${amountVal.toLocaleString()} is over 10x the user average baseline (₹${profile.avgAmount.toLocaleString()}).` });
    explanationParts.push(`Amount ₹${amountVal.toLocaleString()} is >10x usual (₹${Math.round(profile.avgAmount).toLocaleString()}) (+15)`);
  }

  // Rule 7: Off-hours Login (+5)
  // Check if hour is between 00:00 and 05:00
  let isOffHour = false;
  try {
    const hour = parseInt(timeVal.split(':')[0], 10);
    isOffHour = hour >= 0 && hour <= 5;
  } catch (e) {}

  if (isOffHour) {
    score += 5;
    indicators.push({ code: "TIME", label: "Atypical Access Hours", weight: 5, description: `Activity logged at ${timeVal} (Unusual early hours).` });
    explanationParts.push(`Unusual login hour (${timeVal}) (+5)`);
  }

  // Final score bounds
  score = Math.min(score, 100);

  // Map Risk Level
  let riskLevel = "Low";
  if (score > 60) riskLevel = "High";
  else if (score > 30) riskLevel = "Medium";

  // Threats Classification
  let threatClassification = "Normal Transactions";
  if (score === 100) {
    threatClassification = "Potential Account Takeover (ATO)";
  } else if (score > 60) {
    threatClassification = "Anomalous Transaction Alert";
  } else if (score > 30) {
    threatClassification = "Behavioral Deviation Warning";
  }

  // recommended action
  let recommendedAction = "Allow Transaction";
  if (score === 100) {
    recommendedAction = "Freeze Account & Cancel Transaction";
  } else if (score > 60) {
    recommendedAction = "Notify Security Operations Center (SOC)";
  } else if (score > 30) {
    recommendedAction = "Require Multi-Factor Authentication (MFA)";
  }

  // Build explanation text
  const riskExplanationText = score === 0 
    ? "No risk indicators triggered" 
    : explanationParts.join("; ");

  // Build chronological Attack Storyline
  const timeline = [];
  
  // 1. Session start
  timeline.push({
    time: timeVal,
    title: "Login Logged",
    description: `Device: ${deviceVal} | Location: ${locationVal} ${vpnVal === 'Yes' ? '(VPN Active)' : ''}`,
    type: isAnomalousLocation || isAnomalousDevice || vpnVal === 'Yes' ? 'warning' : 'success'
  });

  // 2. Firewall / security event
  if (firewallVal === 'Yes') {
    timeline.push({
      time: timeVal,
      title: "Firewall Warning Triggered",
      description: "Gateway logged malicious ingress threat vector.",
      type: 'danger'
    });
  }

  // 3. Transaction
  timeline.push({
    time: timeVal,
    title: `Transfer of ₹${amountVal.toLocaleString()} Initiated`,
    description: `Type: ${txn.Transaction_Type} | Account: ${profile.accountNumber}`,
    type: isSpike ? 'danger' : 'success'
  });

  // 4. Decision
  timeline.push({
    time: timeVal,
    title: score > 30 ? "AI Alerts: Critical ATO Hijack" : "System Status Approved",
    description: `Risk Assessment: ${score}% | Status: ${statusVal}`,
    type: score > 30 ? 'danger' : 'success'
  });

  return {
    transactionId: txn.Transaction_ID,
    userId: customerId,
    userName: profile.name,
    userRole: profile.accountType === "Savings" ? "Retail Client (Savings)" : "Commercial Client (Current)",
    amount: amountVal,
    timestamp: `${dateVal} ${timeVal}`,
    device: deviceVal,
    ipAddress: sec.ipAddress || "198.51.100.12",
    country: locationVal,
    merchant: txn.Transaction_Type || "Standard Transfer",
    riskScore: score,
    riskLevel: riskLevel,
    threatClassification,
    indicators,
    recommendedAction,
    timeline,
    profile: {
      normalDevice: profile.normalDevice,
      normalIp: profile.normalLocation === "Coimbatore" ? "198.51.100.12" : "203.0.113.84",
      normalLocation: profile.normalLocation,
      avgTransactionAmount: profile.avgAmount,
      typicalLoginTime: "07:00 - 23:00"
    },
    status: statusVal,
    riskExplanation: riskExplanationText
  };
}

// Relational inner join by Transaction_ID
export function correlateAll(transactions = [], securityData = [], userProfilesMap = {}) {
  return transactions.map(txn => {
    const sec = securityData.find(s => s.Transaction_ID === txn.Transaction_ID) || {
      Customer_ID: txn.Customer_ID,
      Transaction_ID: txn.Transaction_ID,
      Login_Date: txn.Login_Date || "01-07-2026",
      Login_Time: txn.Login_Time || "12:00",
      Location: txn.Location || "Chennai",
      Device_Information: txn.Device_Information || "Windows PC",
      VPN_Used: txn.VPN_Used || "No",
      Firewall_Alert: txn.Firewall_Alert || "No"
    };

    return correlateTransaction(txn, sec, transactions, userProfilesMap);
  });
}
