// Mock Data for Bank of Maharashtra threat correlation

export const USER_PROFILES = {
  "U101": {
    userId: "U101",
    name: "Rahul Sharma",
    normalDevice: "Windows PC",
    normalLocation: "Coimbatore",
    accountNumber: "8778 9328 7921 7421",
    ifsc: "651",
    accountType: "Savings",
    avgAmount: 2800.00
  },
  "U102": {
    userId: "U102",
    name: "Priya Nair",
    normalDevice: "Windows PC",
    normalLocation: "Chennai",
    accountNumber: "9290 8100 3390 7579",
    ifsc: "962",
    accountType: "Savings",
    avgAmount: 2300.00
  },
  "U103": {
    userId: "U103",
    name: "Arun Kumar",
    normalDevice: "iPhone",
    normalLocation: "Chennai",
    accountNumber: "4701 7468 1453 8401",
    ifsc: "676",
    accountType: "Savings",
    avgAmount: 1750.00
  },
  "U104": {
    userId: "U104",
    name: "Sneha Reddy",
    normalDevice: "Laptop",
    normalLocation: "Chennai",
    accountNumber: "6100 3307 6661 9345",
    ifsc: "189",
    accountType: "Current",
    avgAmount: 2600.00
  },
  "U105": {
    userId: "U105",
    name: "Vikram Singh",
    normalDevice: "Android",
    normalLocation: "Coimbatore",
    accountNumber: "1231 0077 2837 8326",
    ifsc: "759",
    accountType: "Current",
    avgAmount: 2400.00
  },
  "U106": {
    userId: "U106",
    name: "Ananya Iyer",
    normalDevice: "MacBook",
    normalLocation: "Chennai",
    accountNumber: "9081 7263 5410 2938",
    ifsc: "452",
    accountType: "Current",
    avgAmount: 2600.00
  },
  "U107": {
    userId: "U107",
    name: "Karthik Rajan",
    normalDevice: "MacBook",
    normalLocation: "Chennai",
    accountNumber: "9081 7263 5410 2938",
    ifsc: "452",
    accountType: "Current",
    avgAmount: 2600.00
  }
};

// Generates the two split datasets: Transaction Data and Security Data
export function generateMockData() {
  // 1. Transaction dataset: transaction-specific values
  const transactions = [
    // Rahul Sharma U101
    { Customer_ID: "U101", Transaction_ID: "TXN3001", Account_Holder_Name: "Rahul Sharma", Account_Number: "8778 9328 7921 7421", IFSC_Code: "651", Account_Type: "Savings", Transaction_Type: "Grocery", Transaction_Amount: "2300", Transaction_Status: "Completed" },
    { Customer_ID: "U101", Transaction_ID: "TXN3002", Account_Holder_Name: "Rahul Sharma", Account_Number: "8778 9328 7921 7421", IFSC_Code: "651", Account_Type: "Savings", Transaction_Type: "Grocery", Transaction_Amount: "3200", Transaction_Status: "Completed" },
    { Customer_ID: "U101", Transaction_ID: "TXN3003", Account_Holder_Name: "Rahul Sharma", Account_Number: "8778 9328 7921 7421", IFSC_Code: "651", Account_Type: "Savings", Transaction_Type: "Fuel", Transaction_Amount: "1200", Transaction_Status: "Completed" },
    { Customer_ID: "U101", Transaction_ID: "TXN3004", Account_Holder_Name: "Rahul Sharma", Account_Number: "8778 9328 7921 7421", IFSC_Code: "651", Account_Type: "Savings", Transaction_Type: "Bill Payment", Transaction_Amount: "4500", Transaction_Status: "Completed" },
    { Customer_ID: "U101", Transaction_ID: "TXN3005", Account_Holder_Name: "Rahul Sharma", Account_Number: "8778 9328 7921 7421", IFSC_Code: "651", Account_Type: "Savings", Transaction_Type: "IMPS - Unknown Beneficiary", Transaction_Amount: "185000", Transaction_Status: "Failed" },
    
    // Priya Nair U102
    { Customer_ID: "U102", Transaction_ID: "TXN3006", Account_Holder_Name: "Priya Nair", Account_Number: "9290 8100 3390 7579", IFSC_Code: "962", Account_Type: "Savings", Transaction_Type: "Shopping", Transaction_Amount: "4500", Transaction_Status: "Completed" },
    { Customer_ID: "U102", Transaction_ID: "TXN3007", Account_Holder_Name: "Priya Nair", Account_Number: "9290 8100 3390 7579", IFSC_Code: "962", Account_Type: "Savings", Transaction_Type: "Bill Payment", Transaction_Amount: "2300", Transaction_Status: "Completed" },
    { Customer_ID: "U102", Transaction_ID: "TXN3008", Account_Holder_Name: "Priya Nair", Account_Number: "9290 8100 3390 7579", IFSC_Code: "962", Account_Type: "Savings", Transaction_Type: "Fuel", Transaction_Amount: "1200", Transaction_Status: "Completed" },
    { Customer_ID: "U102", Transaction_ID: "TXN3009", Account_Holder_Name: "Priya Nair", Account_Number: "9290 8100 3390 7579", IFSC_Code: "962", Account_Type: "Savings", Transaction_Type: "Fuel", Transaction_Amount: "1200", Transaction_Status: "Completed" },
    { Customer_ID: "U102", Transaction_ID: "TXN3010", Account_Holder_Name: "Priya Nair", Account_Number: "9290 8100 3390 7579", IFSC_Code: "962", Account_Type: "Savings", Transaction_Type: "IMPS - Unknown Beneficiary", Transaction_Amount: "185000", Transaction_Status: "Failed" },

    // Arun Kumar U103
    { Customer_ID: "U103", Transaction_ID: "TXN3011", Account_Holder_Name: "Arun Kumar", Account_Number: "4701 7468 1453 8401", IFSC_Code: "676", Account_Type: "Savings", Transaction_Type: "Shopping", Transaction_Amount: "1200", Transaction_Status: "Completed" },
    { Customer_ID: "U103", Transaction_ID: "TXN3012", Account_Holder_Name: "Arun Kumar", Account_Number: "4701 7468 1453 8401", IFSC_Code: "676", Account_Type: "Savings", Transaction_Type: "Shopping", Transaction_Amount: "1750", Transaction_Status: "Completed" },
    { Customer_ID: "U103", Transaction_ID: "TXN3013", Account_Holder_Name: "Arun Kumar", Account_Number: "4701 7468 1453 8401", IFSC_Code: "676", Account_Type: "Savings", Transaction_Type: "Grocery", Transaction_Amount: "3200", Transaction_Status: "Completed" },
    { Customer_ID: "U103", Transaction_ID: "TXN3014", Account_Holder_Name: "Arun Kumar", Account_Number: "4701 7468 1453 8401", IFSC_Code: "676", Account_Type: "Savings", Transaction_Type: "Grocery", Transaction_Amount: "850", Transaction_Status: "Completed" },
    { Customer_ID: "U103", Transaction_ID: "TXN3015", Account_Holder_Name: "Arun Kumar", Account_Number: "4701 7468 1453 8401", IFSC_Code: "676", Account_Type: "Savings", Transaction_Type: "IMPS - Unknown Beneficiary", Transaction_Amount: "420000", Transaction_Status: "Failed" },

    // Sneha Reddy U104
    { Customer_ID: "U104", Transaction_ID: "TXN3016", Account_Holder_Name: "Sneha Reddy", Account_Number: "6100 3307 6661 9345", IFSC_Code: "189", Account_Type: "Current", Transaction_Type: "Fuel", Transaction_Amount: "2300", Transaction_Status: "Completed" },
    { Customer_ID: "U104", Transaction_ID: "TXN3017", Account_Holder_Name: "Sneha Reddy", Account_Number: "6100 3307 6661 9345", IFSC_Code: "189", Account_Type: "Current", Transaction_Type: "Bill Payment", Transaction_Amount: "3200", Transaction_Status: "Completed" },
    { Customer_ID: "U104", Transaction_ID: "TXN3018", Account_Holder_Name: "Sneha Reddy", Account_Number: "6100 3307 6661 9345", IFSC_Code: "189", Account_Type: "Current", Transaction_Type: "Grocery", Transaction_Amount: "1750", Transaction_Status: "Completed" },
    { Customer_ID: "U104", Transaction_ID: "TXN3019", Account_Holder_Name: "Sneha Reddy", Account_Number: "6100 3307 6661 9345", IFSC_Code: "189", Account_Type: "Current", Transaction_Type: "Grocery", Transaction_Amount: "3200", Transaction_Status: "Completed" },

    // Vikram Singh U105
    { Customer_ID: "U105", Transaction_ID: "TXN3020", Account_Holder_Name: "Vikram Singh", Account_Number: "1231 0077 2837 8326", IFSC_Code: "759", Account_Type: "Current", Transaction_Type: "Grocery", Transaction_Amount: "1200", Transaction_Status: "Completed" },
    { Customer_ID: "U105", Transaction_ID: "TXN3021", Account_Holder_Name: "Vikram Singh", Account_Number: "1231 0077 2837 8326", IFSC_Code: "759", Account_Type: "Current", Transaction_Type: "Fuel", Transaction_Amount: "3200", Transaction_Status: "Completed" },
    { Customer_ID: "U105", Transaction_ID: "TXN3022", Account_Holder_Name: "Vikram Singh", Account_Number: "1231 0077 2837 8326", IFSC_Code: "759", Account_Type: "Current", Transaction_Type: "Shopping", Transaction_Amount: "850", Transaction_Status: "Completed" },
    { Customer_ID: "U105", Transaction_ID: "TXN3023", Account_Holder_Name: "Vikram Singh", Account_Number: "1231 0077 2837 8326", IFSC_Code: "759", Account_Type: "Current", Transaction_Type: "Shopping", Transaction_Amount: "4500", Transaction_Status: "Completed" },

    // Ananya Iyer U106
    { Customer_ID: "U106", Transaction_ID: "TXN3024", Account_Holder_Name: "Ananya Iyer", Account_Number: "9081 7263 5410 2938", IFSC_Code: "452", Account_Type: "Current", Transaction_Type: "Grocery", Transaction_Amount: "1500", Transaction_Status: "Completed" },
    { Customer_ID: "U106", Transaction_ID: "TXN3025", Account_Holder_Name: "Ananya Iyer", Account_Number: "9081 7263 5410 2938", IFSC_Code: "452", Account_Type: "Current", Transaction_Type: "Utility Bill", Transaction_Amount: "2750", Transaction_Status: "Completed" },
    { Customer_ID: "U106", Transaction_ID: "TXN3026", Account_Holder_Name: "Ananya Iyer", Account_Number: "9081 7263 5410 2938", IFSC_Code: "452", Account_Type: "Current", Transaction_Type: "Shopping", Transaction_Amount: "5200", Transaction_Status: "Completed" },
    { Customer_ID: "U106", Transaction_ID: "TXN3027", Account_Holder_Name: "Ananya Iyer", Account_Number: "9081 7263 5410 2938", IFSC_Code: "452", Account_Type: "Current", Transaction_Type: "Fuel", Transaction_Amount: "980", Transaction_Status: "Completed" },

    // Karthik Rajan U107
    { Customer_ID: "U107", Transaction_ID: "TXN3028", Account_Holder_Name: "Karthik Rajan", Account_Number: "9081 7263 5410 2938", IFSC_Code: "452", Account_Type: "Current", Transaction_Type: "Grocery", Transaction_Amount: "1500", Transaction_Status: "Completed" },
    { Customer_ID: "U107", Transaction_ID: "TXN3029", Account_Holder_Name: "Karthik Rajan", Account_Number: "9081 7263 5410 2938", IFSC_Code: "452", Account_Type: "Current", Transaction_Type: "Utility Bill", Transaction_Amount: "2750", Transaction_Status: "Completed" },
    { Customer_ID: "U107", Transaction_ID: "TXN3030", Account_Holder_Name: "Karthik Rajan", Account_Number: "9081 7263 5410 2938", IFSC_Code: "452", Account_Type: "Current", Transaction_Type: "Shopping", Transaction_Amount: "5200", Transaction_Status: "Completed" },
    { Customer_ID: "U107", Transaction_ID: "TXN3031", Account_Holder_Name: "Karthik Rajan", Account_Number: "9081 7263 5410 2938", IFSC_Code: "452", Account_Type: "Current", Transaction_Type: "Fuel", Transaction_Amount: "980", Transaction_Status: "Completed" }
  ];

  // 2. Security dataset: login, device, network parameters
  const securityData = [
    // Rahul Sharma U101
    { Customer_ID: "U101", Transaction_ID: "TXN3001", Login_Date: "01-07-2026", Login_Time: "18:13", Location: "Coimbatore", Device_Information: "Windows PC", VPN_Used: "No", Firewall_Alert: "No" },
    { Customer_ID: "U101", Transaction_ID: "TXN3002", Login_Date: "03-07-2026", Login_Time: "11:02", Location: "Coimbatore", Device_Information: "Windows PC", VPN_Used: "No", Firewall_Alert: "No" },
    { Customer_ID: "U101", Transaction_ID: "TXN3003", Login_Date: "05-07-2026", Login_Time: "11:16", Location: "Coimbatore", Device_Information: "Windows PC", VPN_Used: "No", Firewall_Alert: "No" },
    { Customer_ID: "U101", Transaction_ID: "TXN3004", Login_Date: "07-07-2026", Login_Time: "09:53", Location: "Coimbatore", Device_Information: "Windows PC", VPN_Used: "No", Firewall_Alert: "No" },
    { Customer_ID: "U101", Transaction_ID: "TXN3005", Login_Date: "09-07-2026", Login_Time: "01:05", Location: "Lagos", Device_Information: "iPhone", VPN_Used: "Yes", Firewall_Alert: "Yes" },
    
    // Priya Nair U102
    { Customer_ID: "U102", Transaction_ID: "TXN3006", Login_Date: "01-07-2026", Login_Time: "12:00", Location: "Chennai", Device_Information: "Windows PC", VPN_Used: "No", Firewall_Alert: "No" },
    { Customer_ID: "U102", Transaction_ID: "TXN3007", Login_Date: "03-07-2026", Login_Time: "18:39", Location: "Chennai", Device_Information: "Windows PC", VPN_Used: "No", Firewall_Alert: "No" },
    { Customer_ID: "U102", Transaction_ID: "TXN3008", Login_Date: "05-07-2026", Login_Time: "16:53", Location: "Chennai", Device_Information: "Windows PC", VPN_Used: "No", Firewall_Alert: "No" },
    { Customer_ID: "U102", Transaction_ID: "TXN3009", Login_Date: "07-07-2026", Login_Time: "18:11", Location: "Chennai", Device_Information: "Windows PC", VPN_Used: "No", Firewall_Alert: "No" },
    { Customer_ID: "U102", Transaction_ID: "TXN3010", Login_Date: "09-07-2026", Login_Time: "03:52", Location: "Minsk", Device_Information: "MacBook", VPN_Used: "Yes", Firewall_Alert: "Yes" },

    // Arun Kumar U103
    { Customer_ID: "U103", Transaction_ID: "TXN3011", Login_Date: "01-07-2026", Login_Time: "18:10", Location: "Chennai", Device_Information: "iPhone", VPN_Used: "No", Firewall_Alert: "No" },
    { Customer_ID: "U103", Transaction_ID: "TXN3012", Login_Date: "03-07-2026", Login_Time: "20:43", Location: "Chennai", Device_Information: "iPhone", VPN_Used: "No", Firewall_Alert: "No" },
    { Customer_ID: "U103", Transaction_ID: "TXN3013", Login_Date: "05-07-2026", Login_Time: "15:26", Location: "Chennai", Device_Information: "iPhone", VPN_Used: "No", Firewall_Alert: "No" },
    { Customer_ID: "U103", Transaction_ID: "TXN3014", Login_Date: "07-07-2026", Login_Time: "09:02", Location: "Chennai", Device_Information: "iPhone", VPN_Used: "No", Firewall_Alert: "No" },
    { Customer_ID: "U103", Transaction_ID: "TXN3015", Login_Date: "09-07-2026", Login_Time: "02:45", Location: "Minsk", Device_Information: "Laptop", VPN_Used: "Yes", Firewall_Alert: "Yes" },

    // Sneha Reddy U104
    { Customer_ID: "U104", Transaction_ID: "TXN3016", Login_Date: "01-07-2026", Login_Time: "15:52", Location: "Chennai", Device_Information: "Laptop", VPN_Used: "No", Firewall_Alert: "No" },
    { Customer_ID: "U104", Transaction_ID: "TXN3017", Login_Date: "03-07-2026", Login_Time: "18:33", Location: "Chennai", Device_Information: "Laptop", VPN_Used: "No", Firewall_Alert: "No" },
    { Customer_ID: "U104", Transaction_ID: "TXN3018", Login_Date: "05-07-2026", Login_Time: "11:08", Location: "Chennai", Device_Information: "Laptop", VPN_Used: "No", Firewall_Alert: "No" },
    { Customer_ID: "U104", Transaction_ID: "TXN3019", Login_Date: "07-07-2026", Login_Time: "12:17", Location: "Chennai", Device_Information: "Laptop", VPN_Used: "No", Firewall_Alert: "No" },

    // Vikram Singh U105
    { Customer_ID: "U105", Transaction_ID: "TXN3020", Login_Date: "01-07-2026", Login_Time: "12:04", Location: "Coimbatore", Device_Information: "Android", VPN_Used: "No", Firewall_Alert: "No" },
    { Customer_ID: "U105", Transaction_ID: "TXN3021", Login_Date: "03-07-2026", Login_Time: "13:15", Location: "Coimbatore", Device_Information: "Android", VPN_Used: "No", Firewall_Alert: "No" },
    { Customer_ID: "U105", Transaction_ID: "TXN3022", Login_Date: "05-07-2026", Login_Time: "09:18", Location: "Coimbatore", Device_Information: "Android", VPN_Used: "No", Firewall_Alert: "No" },
    { Customer_ID: "U105", Transaction_ID: "TXN3023", Login_Date: "07-07-2026", Login_Time: "14:05", Location: "Coimbatore", Device_Information: "Android", VPN_Used: "No", Firewall_Alert: "No" },

    // Ananya Iyer U106
    { Customer_ID: "U106", Transaction_ID: "TXN3024", Login_Date: "01-07-2026", Login_Time: "10:51", Location: "Chennai", Device_Information: "MacBook", VPN_Used: "No", Firewall_Alert: "No" },
    { Customer_ID: "U106", Transaction_ID: "TXN3025", Login_Date: "03-07-2026", Login_Time: "14:40", Location: "Chennai", Device_Information: "MacBook", VPN_Used: "No", Firewall_Alert: "No" },
    { Customer_ID: "U106", Transaction_ID: "TXN3026", Login_Date: "05-07-2026", Login_Time: "17:32", Location: "Chennai", Device_Information: "MacBook", VPN_Used: "No", Firewall_Alert: "No" },
    { Customer_ID: "U106", Transaction_ID: "TXN3027", Login_Date: "07-07-2026", Login_Time: "19:10", Location: "Chennai", Device_Information: "MacBook", VPN_Used: "No", Firewall_Alert: "No" },

    // Karthik Rajan U107
    { Customer_ID: "U107", Transaction_ID: "TXN3028", Login_Date: "01-07-2026", Login_Time: "10:51", Location: "Chennai", Device_Information: "MacBook", VPN_Used: "No", Firewall_Alert: "No" },
    { Customer_ID: "U107", Transaction_ID: "TXN3029", Login_Date: "03-07-2026", Login_Time: "14:40", Location: "Chennai", Device_Information: "MacBook", VPN_Used: "No", Firewall_Alert: "No" },
    { Customer_ID: "U107", Transaction_ID: "TXN3030", Login_Date: "05-07-2026", Login_Time: "17:32", Location: "Chennai", Device_Information: "MacBook", VPN_Used: "No", Firewall_Alert: "No" },
    { Customer_ID: "U107", Transaction_ID: "TXN3031", Login_Date: "07-07-2026", Login_Time: "19:10", Location: "Chennai", Device_Information: "MacBook", VPN_Used: "No", Firewall_Alert: "No" }
  ];

  return {
    transactions,
    securityData
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
