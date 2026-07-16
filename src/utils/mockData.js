// Mock Data Generator for Quantum Sentinel AI

// Predefined trusted profiles for users to establish baseline UEBA behavior
export const USER_PROFILES = {
  "USR-101": {
    userId: "USR-101",
    name: "Alana Vance",
    role: "System Administrator", // Privileged user for Insider Threat demo
    normalDevice: "Windows 11 PC (Chrome)",
    normalIp: "198.51.100.12",
    normalLocation: "United States (New York)",
    avgTransactionAmount: 450.00,
    typicalLoginTime: "08:00 - 18:00",
    isPrivileged: true
  },
  "USR-102": {
    userId: "USR-102",
    name: "Marcus Chen",
    role: "Retail Customer",
    normalDevice: "Apple iPhone 15 (Safari)",
    normalIp: "203.0.113.84",
    normalLocation: "Canada (Toronto)",
    avgTransactionAmount: 85.50,
    typicalLoginTime: "07:00 - 23:00",
    isPrivileged: false
  },
  "USR-103": {
    userId: "USR-103",
    name: "Elena Rostova",
    role: "Commercial Client Manager",
    normalDevice: "MacBook Pro (Firefox)",
    normalIp: "185.190.140.23",
    normalLocation: "Germany (Frankfurt)",
    avgTransactionAmount: 3200.00,
    typicalLoginTime: "09:00 - 17:00",
    isPrivileged: true
  },
  "USR-104": {
    userId: "USR-104",
    name: "David Kojo",
    role: "Retail Customer",
    normalDevice: "Samsung Galaxy S24 (Chrome)",
    normalIp: "41.210.15.6",
    normalLocation: "Ghana (Accra)",
    avgTransactionAmount: 120.00,
    typicalLoginTime: "06:00 - 22:00",
    isPrivileged: false
  },
  "USR-105": {
    userId: "USR-105",
    name: "Sarah Jenkins",
    role: "Retail Customer",
    normalDevice: "Dell XPS 13 (Edge)",
    normalIp: "93.184.216.34",
    normalLocation: "United Kingdom (London)",
    avgTransactionAmount: 210.00,
    typicalLoginTime: "07:00 - 22:00",
    isPrivileged: false
  }
};

// Generates baseline mock databases: Transactions, Logins, and Security Events
export function generateMockData() {
  const transactions = [];
  const logins = [];
  const securityEvents = [];

  const addNormalTransaction = (userId, txnId, amount, country, device, ip, hoursAgo) => {
    const time = new Date(Date.now() - hoursAgo * 3600000);
    const timeStr = time.toISOString().replace('T', ' ').substring(0, 19);
    
    // Add success login
    logins.push({
      loginId: `LOG-${1000 + logins.length}`,
      userId,
      timestamp: new Date(time.getTime() - 5 * 60000).toISOString().replace('T', ' ').substring(0, 19),
      ipAddress: ip,
      device,
      country,
      status: "SUCCESS",
      failedAttemptsBeforeSuccess: 0
    });

    transactions.push({
      transactionId: txnId,
      userId,
      timestamp: timeStr,
      amount,
      merchant: "SafeMerchant Store",
      status: "COMPLETED",
      device,
      ipAddress: ip,
      country
    });
  };

  // 1. Populate normal baseline data
  addNormalTransaction("USR-101", "TXN-1001", 120.00, "United States (New York)", "Windows 11 PC (Chrome)", "198.51.100.12", 24);
  addNormalTransaction("USR-101", "TXN-1002", 55.40, "United States (New York)", "Windows 11 PC (Chrome)", "198.51.100.12", 20);
  addNormalTransaction("USR-102", "TXN-1003", 42.00, "Canada (Toronto)", "Apple iPhone 15 (Safari)", "203.0.113.84", 18);
  addNormalTransaction("USR-102", "TXN-1004", 112.50, "Canada (Toronto)", "Apple iPhone 15 (Safari)", "203.0.113.84", 15);
  addNormalTransaction("USR-103", "TXN-1005", 2800.00, "Germany (Frankfurt)", "MacBook Pro (Firefox)", "185.190.140.23", 12);
  addNormalTransaction("USR-104", "TXN-1006", 15.99, "Ghana (Accra)", "Samsung Galaxy S24 (Chrome)", "41.210.15.6", 8);
  addNormalTransaction("USR-105", "TXN-1007", 340.00, "United Kingdom (London)", "Dell XPS 13 (Edge)", "93.184.216.34", 6);

  // 2. Scenario A: Account Takeover (ATO) with Impossible Travel (High/Critical Risk)
  // User 102 (Marcus Chen) usually in Canada. 
  // Let's simulate a login from Canada, and 10 mins later a login & transaction from Russia/Germany.
  const timeA = new Date(Date.now() - 4 * 3600000); // 4 hours ago
  
  // Legitimate login in Canada
  logins.push({
    loginId: "LOG-1008",
    userId: "USR-102",
    timestamp: new Date(timeA.getTime() - 15 * 60000).toISOString().replace('T', ' ').substring(0, 19),
    ipAddress: "203.0.113.84",
    device: "Apple iPhone 15 (Safari)",
    country: "Canada (Toronto)",
    status: "SUCCESS",
    failedAttemptsBeforeSuccess: 0
  });

  // Suspect login 10 minutes later in India
  const timeSuspectA = new Date(timeA.getTime() - 5 * 60000);
  logins.push({
    loginId: "LOG-1009",
    userId: "USR-102",
    timestamp: timeSuspectA.toISOString().replace('T', ' ').substring(0, 19),
    ipAddress: "103.241.12.89",
    device: "Linux Operating System (Firefox Mobile)", // Device change
    country: "India (Mumbai)",
    status: "SUCCESS",
    failedAttemptsBeforeSuccess: 0
  });

  transactions.push({
    transactionId: "TXN-2001",
    userId: "USR-102",
    timestamp: timeA.toISOString().replace('T', ' ').substring(0, 19),
    amount: 9800.00, // High Amount for this user (avg is $85)
    merchant: "Global Crypto Exchange LLC",
    status: "PENDING_BLOCK",
    device: "Linux Operating System (Firefox Mobile)",
    ipAddress: "103.241.12.89",
    country: "India (Mumbai)"
  });

  securityEvents.push({
    eventId: "SEC-3001",
    userId: "USR-102",
    timestamp: timeSuspectA.toISOString().replace('T', ' ').substring(0, 19),
    eventType: "IMP_TRAVEL_DETECTED",
    severity: "HIGH",
    description: "User session relocated from Canada to India in 10 minutes (Required speed > 9000 km/h)."
  });


  // 3. Scenario B: Brute Force Attack (Medium/High Risk)
  // User 104 (David Kojo) experiences brute-force attempts on Samsung/Ghana baseline.
  const timeB = new Date(Date.now() - 3 * 3600000); // 3 hours ago
  
  // 4 Failed login attempts
  for (let i = 1; i <= 4; i++) {
    logins.push({
      loginId: `LOG-BF-${i}`,
      userId: "USR-104",
      timestamp: new Date(timeB.getTime() - (15 - i) * 60000).toISOString().replace('T', ' ').substring(0, 19),
      ipAddress: "197.255.195.42", // Different IP
      device: "Samsung Galaxy S24 (Chrome)",
      country: "Ghana (Accra)",
      status: "FAILED",
      failedAttemptsBeforeSuccess: i
    });
  }

  // 1 Successful login
  logins.push({
    loginId: "LOG-1010",
    userId: "USR-104",
    timestamp: new Date(timeB.getTime() - 2 * 60000).toISOString().replace('T', ' ').substring(0, 19),
    ipAddress: "197.255.195.42",
    device: "Samsung Galaxy S24 (Chrome)",
    country: "Ghana (Accra)",
    status: "SUCCESS",
    failedAttemptsBeforeSuccess: 4
  });

  transactions.push({
    transactionId: "TXN-2002",
    userId: "USR-104",
    timestamp: timeB.toISOString().replace('T', ' ').substring(0, 19),
    amount: 950.00, // Higher than normal
    merchant: "Prepaid GiftCards Online",
    status: "FLAGGED_MFA",
    device: "Samsung Galaxy S24 (Chrome)",
    ipAddress: "197.255.195.42",
    country: "Ghana (Accra)"
  });

  securityEvents.push({
    eventId: "SEC-3002",
    userId: "USR-104",
    timestamp: new Date(timeB.getTime() - 2 * 60000).toISOString().replace('T', ' ').substring(0, 19),
    eventType: "BRUTE_FORCE_WARNING",
    severity: "MEDIUM",
    description: "4 consecutive failed authentication attempts from IP 197.255.195.42."
  });


  // 4. Scenario C: Insider Threat (High Risk)
  // User 101 (Alana Vance) is a SysAdmin. Transfers massive funds outside standard hours.
  const timeC = new Date(Date.now() - 2 * 3600000); // 2 hours ago
  // Let's set the time explicitly to 02:14 AM
  const offsetTime = new Date();
  offsetTime.setHours(2, 14, 0, 0); // 2:14 AM
  const timeCStr = offsetTime.toISOString().replace('T', ' ').substring(0, 19);

  logins.push({
    loginId: "LOG-1011",
    userId: "USR-101",
    timestamp: new Date(offsetTime.getTime() - 10 * 60000).toISOString().replace('T', ' ').substring(0, 19),
    ipAddress: "198.51.100.12", // Normal IP
    device: "Windows 11 PC (Chrome)", // Normal Device
    country: "United States (New York)",
    status: "SUCCESS",
    failedAttemptsBeforeSuccess: 0
  });

  transactions.push({
    transactionId: "TXN-2003",
    userId: "USR-101",
    timestamp: timeCStr,
    amount: 150000.00, // Massive Transfer (exceeds $450 average drastically)
    merchant: "Wire Transfer Off-Shore Bank",
    status: "HOLD_SOC",
    device: "Windows 11 PC (Chrome)",
    ipAddress: "198.51.100.12",
    country: "United States (New York)"
  });

  securityEvents.push({
    eventId: "SEC-3003",
    userId: "USR-101",
    timestamp: timeCStr,
    eventType: "UEBA_ANOMALY",
    severity: "HIGH",
    description: "High-value wire transfer ($150,000.00) initiated at 02:14 AM by administrative user outside normal working hours (08:00 - 18:00)."
  });


  // 5. Scenario D: Device Fingerprint Anomaly (Medium Risk)
  // User 105 (Sarah Jenkins) uses Dell XPS/London. Suddenly makes purchase from iPad in France.
  const timeD = new Date(Date.now() - 1 * 3600000); // 1 hour ago
  
  logins.push({
    loginId: "LOG-1012",
    userId: "USR-105",
    timestamp: new Date(timeD.getTime() - 3 * 60000).toISOString().replace('T', ' ').substring(0, 19),
    ipAddress: "82.120.45.109", // French IP
    device: "Apple iPad (Safari)", // Unknown device
    country: "France (Paris)",
    status: "SUCCESS",
    failedAttemptsBeforeSuccess: 0
  });

  transactions.push({
    transactionId: "TXN-2004",
    userId: "USR-105",
    timestamp: timeD.toISOString().replace('T', ' ').substring(0, 19),
    amount: 890.00,
    merchant: "Luxury Boutique Paris",
    status: "APPROVED",
    device: "Apple iPad (Safari)",
    ipAddress: "82.120.45.109",
    country: "France (Paris)"
  });

  // More standard normal transactions to pad the dashboard
  addNormalTransaction("USR-103", "TXN-1008", 450.00, "Germany (Frankfurt)", "MacBook Pro (Firefox)", "185.190.140.23", 5);
  addNormalTransaction("USR-102", "TXN-1009", 12.80, "Canada (Toronto)", "Apple iPhone 15 (Safari)", "203.0.113.84", 2);
  addNormalTransaction("USR-105", "TXN-1010", 65.00, "United Kingdom (London)", "Dell XPS 13 (Edge)", "93.184.216.34", 1);

  return {
    transactions,
    logins,
    securityEvents
  };
}

// Convert JSON array to CSV format
export function convertToCSV(array) {
  if (array.length === 0) return "";
  const keys = Object.keys(array[0]);
  const header = keys.join(",") + "\n";
  const rows = array.map(row => {
    return keys.map(key => {
      let cell = row[key] === null || row[key] === undefined ? "" : row[key];
      // escape commas and double quotes
      cell = cell.toString().replace(/"/g, '""');
      if (cell.includes(",") || cell.includes("\n") || cell.includes('"')) {
        cell = `"${cell}"`;
      }
      return cell;
    }).join(",");
  }).join("\n");
  return header + rows;
}

// Parse CSV format back to JSON array
export function parseCSV(csvText) {
  const lines = [];
  let row = [""];
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const c = csvText[i];
    const next = csvText[i+1];
    
    if (c === '"') {
      if (inQuotes && next === '"') {
        row[row.length - 1] += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      row.push('');
    } else if ((c === '\r' || c === '\n') && !inQuotes) {
      if (c === '\r' && next === '\n') {
        i++;
      }
      lines.push(row);
      row = [''];
    } else {
      row[row.length - 1] += c;
    }
  }
  if (row.length > 1 || row[0] !== '') {
    lines.push(row);
  }

  if (lines.length === 0) return [];
  const headers = lines[0].map(h => h.trim());
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i];
    if (values.length !== headers.length) continue;
    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = values[j].trim();
    }
    data.push(obj);
  }

  return data;
}

// Helper to provide download URLs for sample CSVs
export function triggerCSVDownload(filename, dataArray) {
  const csvContent = convertToCSV(dataArray);
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
