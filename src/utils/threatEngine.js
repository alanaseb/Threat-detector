import { USER_PROFILES } from './mockData';

// Helper to check if time is outside range (format "HH:MM - HH:MM")
function isOutsideWorkingHours(timestamp, rangeStr) {
  if (!rangeStr) return false;
  try {
    const time = new Date(timestamp);
    const hours = time.getHours();
    
    const [start, end] = rangeStr.split('-').map(s => s.trim());
    const startHour = parseInt(start.split(':')[0], 10);
    const endHour = parseInt(end.split(':')[0], 10);
    
    if (startHour <= endHour) {
      return hours < startHour || hours > endHour;
    } else {
      // Over-midnight range
      return hours < startHour && hours > endHour;
    }
  } catch (e) {
    return false;
  }
}

// Main correlation function that generates a complete security assessment for a transaction
export function correlateTransaction(transaction, allLogins = [], allEvents = [], allTransactions = []) {
  const { userId, transactionId, amount, timestamp, device, ipAddress, country } = transaction;
  
  // 1. Get or build user baseline UEBA profile
  let profile = USER_PROFILES[userId];
  if (!profile) {
    // If not a pre-configured user, calculate baseline profile dynamically
    const userTxns = allTransactions.filter(t => t.userId === userId && t.transactionId !== transactionId);
    const userLogins = allLogins.filter(l => l.userId === userId && l.status === "SUCCESS");
    
    const avgAmount = userTxns.length > 0 
      ? userTxns.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0) / userTxns.length 
      : 150.00;
      
    const normalDevice = userLogins.length > 0 ? userLogins[0].device : device;
    const normalIp = userLogins.length > 0 ? userLogins[0].ipAddress : ipAddress;
    const normalLocation = userLogins.length > 0 ? userLogins[0].country : country;

    profile = {
      userId,
      name: `User ${userId.split('-')[1] || userId}`,
      role: "Retail Customer",
      normalDevice,
      normalIp,
      normalLocation,
      avgTransactionAmount: avgAmount,
      typicalLoginTime: "07:00 - 22:00",
      isPrivileged: false
    };
  }

  // 2. Identify transaction timeline/events
  const txnTime = new Date(timestamp);
  
  // Find logins around the transaction (e.g. within 2 hours before the transaction)
  const windowStart = new Date(txnTime.getTime() - 2 * 3600000);
  const relevantLogins = allLogins
    .filter(l => l.userId === userId && new Date(l.timestamp) >= windowStart && new Date(l.timestamp) <= txnTime)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  // Find prior logins (even outside 2h window) to calculate Impossible Travel
  const priorLogins = allLogins
    .filter(l => l.userId === userId && new Date(l.timestamp) < txnTime)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // desc, [0] is closest prior

  // 3. Evaluate Security Indicators & Weights
  const indicators = [];
  let score = 0;

  // Indicator A: High Transaction Amount (+25)
  // We trigger if transaction exceeds 3x user's average amount, or is overall very large (> $50,000 for regular retail)
  const isHighAmount = parseFloat(amount) > (profile.avgTransactionAmount * 3.0) || (parseFloat(amount) > 10000 && !profile.isPrivileged);
  if (isHighAmount) {
    indicators.push({
      code: "HIGH_AMOUNT",
      label: "Abnormal Transaction Value",
      weight: 25,
      description: `Transaction amount ($${parseFloat(amount).toLocaleString()}) significantly exceeds user's normal average ($${profile.avgTransactionAmount.toFixed(2)}).`
    });
    score += 25;
  }

  // Indicator B: Unknown Device (+20)
  const isUnknownDevice = device && profile.normalDevice && !device.toLowerCase().includes(profile.normalDevice.split(' ')[0].toLowerCase());
  if (isUnknownDevice) {
    indicators.push({
      code: "UNKNOWN_DEVICE",
      label: "Untrusted Device Fingerprint",
      weight: 20,
      description: `Transaction initiated from a device/browser (${device}) that deviates from the user's registered device (${profile.normalDevice}).`
    });
    score += 20;
  }

  // Indicator C: Impossible Travel (+25)
  // Check if there was a login in a different country within a small window
  let impossibleTravelDetails = null;
  if (priorLogins.length > 0) {
    const lastLogin = priorLogins[0];
    if (lastLogin.country !== country) {
      const timeDiffMs = Math.abs(txnTime.getTime() - new Date(lastLogin.timestamp).getTime());
      const timeDiffMins = timeDiffMs / 60000;
      
      // If time difference is less than 300 minutes (5 hours) for international, flag it
      if (timeDiffMins < 300) {
        impossibleTravelDetails = {
          fromLocation: lastLogin.country,
          toLocation: country,
          timeDiffMins: Math.round(timeDiffMins),
          fromIp: lastLogin.ipAddress,
          toIp: ipAddress
        };
        
        indicators.push({
          code: "IMP_TRAVEL",
          label: "Impossible Travel Detection",
          weight: 25,
          description: `Impossible physical movement detected. Session active in ${lastLogin.country} at ${lastLogin.timestamp.substring(11, 16)} and initiated transaction in ${country} just ${Math.round(timeDiffMins)} minutes later.`
        });
        score += 25;
      }
    }
  }

  // Indicator D: Multiple Failed Logins / Brute Force (+15)
  // Check if there are failed logins leading up to the successful login that authorized this transaction
  const successLogin = relevantLogins.find(l => l.status === "SUCCESS");
  const failedAttempts = relevantLogins.filter(l => l.status === "FAILED");
  const hasBruteForce = failedAttempts.length >= 3 || (successLogin && successLogin.failedAttemptsBeforeSuccess >= 3);
  if (hasBruteForce) {
    const attemptCount = successLogin ? Math.max(failedAttempts.length, successLogin.failedAttemptsBeforeSuccess) : failedAttempts.length;
    indicators.push({
      code: "BRUTE_FORCE",
      label: "Pre-Auth Brute Force Detected",
      weight: 15,
      description: `${attemptCount} consecutive failed login attempts detected shortly before transaction authorization.`
    });
    score += 15;
  }

  // Indicator E: New IP Address (+10)
  const isNewIp = ipAddress && profile.normalIp && ipAddress !== profile.normalIp;
  if (isNewIp) {
    indicators.push({
      code: "NEW_IP",
      label: "Unfamiliar IP Address",
      weight: 10,
      description: `Access from IP ${ipAddress} which is different from user's standard IP baseline (${profile.normalIp}).`
    });
    score += 10;
  }

  // Indicator F: Outside Normal Login Hours (+10)
  const isOffHours = isOutsideWorkingHours(timestamp, profile.typicalLoginTime);
  if (isOffHours) {
    indicators.push({
      code: "OFF_HOURS",
      label: "Out-of-Hours Activity",
      weight: 10,
      description: `Transaction initiated at ${timestamp.substring(11, 16)} which falls outside normal business hours (${profile.typicalLoginTime}).`
    });
    score += 10;
  }

  // Ensure risk score bounds (0-100)
  score = Math.min(score, 100);

  // 4. Map Risk Level
  let riskLevel = "LOW";
  if (score >= 86) riskLevel = "CRITICAL";
  else if (score >= 61) riskLevel = "HIGH";
  else if (score >= 31) riskLevel = "MEDIUM";

  // 5. Categorize Threat Type (Classification)
  let threatClassification = "Normal Transactions";
  let triggerATO = isUnknownDevice && isNewIp && (impossibleTravelDetails !== null || isHighAmount);
  let triggerInsider = profile.isPrivileged && (isOffHours || isHighAmount) && score >= 30;
  let triggerBruteForce = hasBruteForce && score >= 30;

  if (triggerATO) {
    threatClassification = "Potential Account Takeover (ATO)";
  } else if (triggerInsider) {
    threatClassification = "Privileged Insider Threat Anomaly";
  } else if (triggerBruteForce) {
    threatClassification = "Brute Force Auth Attack";
  } else if (score >= 60) {
    threatClassification = "High-Risk Fraud Deviation";
  } else if (score >= 30) {
    threatClassification = "Suspicious Behavioral Deviation";
  }

  // 6. Action Recommendation
  let recommendedAction = "Allow Transaction";
  if (score >= 86) {
    recommendedAction = "Freeze Account & Cancel Transaction";
  } else if (score >= 61) {
    recommendedAction = "Notify Security Operations Center (SOC) & Hold Transaction";
  } else if (score >= 31) {
    recommendedAction = "Require Multi-Factor Authentication (MFA)";
  }

  // 7. Reconstruct the interactive Attack Storyline timeline
  const timeline = [];
  
  // Sort and populate login activity in chronology
  relevantLogins.forEach(login => {
    if (login.status === "FAILED") {
      timeline.push({
        time: login.timestamp.substring(11, 16),
        title: "Failed Login Attempt",
        description: `IP: ${login.ipAddress} (${login.device})`,
        type: "warning"
      });
    } else {
      const isDevChange = login.device !== profile.normalDevice;
      timeline.push({
        time: login.timestamp.substring(11, 16),
        title: isDevChange ? "Login from Unknown Device" : "Successful User Login",
        description: `IP: ${login.ipAddress} (${login.country})`,
        type: isDevChange ? "warning" : "success"
      });
    }
  });

  // If impossible travel was from a prior login not in the relevant window, add context step
  if (impossibleTravelDetails) {
    timeline.unshift({
      time: priorLogins[0].timestamp.substring(11, 16),
      title: `Prior Session Active`,
      description: `Location: ${impossibleTravelDetails.fromLocation} (IP: ${impossibleTravelDetails.fromIp})`,
      type: "success"
    });
  }

  // Transaction Event
  timeline.push({
    time: timestamp.substring(11, 16),
    title: "High Value Transaction Initiated",
    description: `Transfer of $${parseFloat(amount).toLocaleString()} to ${transaction.merchant || 'External Account'}`,
    type: score >= 60 ? "danger" : "warning"
  });

  // AI correlation decision
  timeline.push({
    time: new Date(txnTime.getTime() + 1 * 60000).toISOString().substring(11, 16), // +1 minute
    title: `Quantum Sentinel AI: ${threatClassification}`,
    description: `Calculated Risk: ${score}% - Recommended: ${recommendedAction}`,
    type: score >= 60 ? "danger" : "warning"
  });

  // Output assessment package
  return {
    transactionId,
    userId,
    userName: profile.name,
    userRole: profile.role,
    amount,
    timestamp,
    device,
    ipAddress,
    country,
    merchant: transaction.merchant || "Standard Store",
    riskScore: score,
    riskLevel,
    threatClassification,
    indicators,
    recommendedAction,
    timeline,
    profile,
    impossibleTravelDetails
  };
}

// Bulk process an entire transactions dataset
export function correlateAll(transactions, logins, events) {
  const allTxns = [...transactions];
  return transactions.map(t => {
    return correlateTransaction(t, logins, events, allTxns);
  });
}
