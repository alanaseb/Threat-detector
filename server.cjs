process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const fs = require('fs');
const path = require('path');
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const val = parts.slice(1).join('=').trim().replace(/(^['"]|['"]$)/g, '');
        process.env[key] = val;
      }
    });
  }
} catch (e) {}

const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch(e) {}

const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const PORT = 3001;
const MONGO_URI = "mongodb+srv://pranethipranethi17_db_user:sOSXhisPDWQE8Xz6@cluster0.cwteyxc.mongodb.net/";
const DB_NAME = "finspark";

let db = null;
let client = null;
let dbConnected = false;
let connectionError = "";

// Baseline seeding datasets
const SEED_TRANSACTIONS = [
  { Customer_ID: "U101", Transaction_ID: "TXN3001", Account_Holder_Name: "Rahul Sharma", Account_Number: "8778 9328 7921 7421", IFSC_Code: "651", Account_Type: "Savings", Transaction_Type: "Grocery", Transaction_Amount: "2300", Transaction_Status: "Completed" },
  { Customer_ID: "U101", Transaction_ID: "TXN3002", Account_Holder_Name: "Rahul Sharma", Account_Number: "8778 9328 7921 7421", IFSC_Code: "651", Account_Type: "Savings", Transaction_Type: "Grocery", Transaction_Amount: "3200", Transaction_Status: "Completed" },
  { Customer_ID: "U101", Transaction_ID: "TXN3003", Account_Holder_Name: "Rahul Sharma", Account_Number: "8778 9328 7921 7421", IFSC_Code: "651", Account_Type: "Savings", Transaction_Type: "Fuel", Transaction_Amount: "1200", Transaction_Status: "Completed" },
  { Customer_ID: "U101", Transaction_ID: "TXN3004", Account_Holder_Name: "Rahul Sharma", Account_Number: "8778 9328 7921 7421", IFSC_Code: "651", Account_Type: "Savings", Transaction_Type: "Bill Payment", Transaction_Amount: "4500", Transaction_Status: "Completed" },
  { Customer_ID: "U101", Transaction_ID: "TXN3005", Account_Holder_Name: "Rahul Sharma", Account_Number: "8778 9328 7921 7421", IFSC_Code: "651", Account_Type: "Savings", Transaction_Type: "IMPS - Unknown Beneficiary", Transaction_Amount: "185000", Transaction_Status: "Failed" },
  { Customer_ID: "U102", Transaction_ID: "TXN3006", Account_Holder_Name: "Priya Nair", Account_Number: "9290 8100 3390 7579", IFSC_Code: "962", Account_Type: "Savings", Transaction_Type: "Shopping", Transaction_Amount: "4500", Transaction_Status: "Completed" },
  { Customer_ID: "U102", Transaction_ID: "TXN3007", Account_Holder_Name: "Priya Nair", Account_Number: "9290 8100 3390 7579", IFSC_Code: "962", Account_Type: "Savings", Transaction_Type: "Bill Payment", Transaction_Amount: "2300", Transaction_Status: "Completed" },
  { Customer_ID: "U102", Transaction_ID: "TXN3008", Account_Holder_Name: "Priya Nair", Account_Number: "9290 8100 3390 7579", IFSC_Code: "962", Account_Type: "Savings", Transaction_Type: "Fuel", Transaction_Amount: "1200", Transaction_Status: "Completed" },
  { Customer_ID: "U102", Transaction_ID: "TXN3009", Account_Holder_Name: "Priya Nair", Account_Number: "9290 8100 3390 7579", IFSC_Code: "962", Account_Type: "Savings", Transaction_Type: "Fuel", Transaction_Amount: "1200", Transaction_Status: "Completed" },
  { Customer_ID: "U102", Transaction_ID: "TXN3010", Account_Holder_Name: "Priya Nair", Account_Number: "9290 8100 3390 7579", IFSC_Code: "962", Account_Type: "Savings", Transaction_Type: "IMPS - Unknown Beneficiary", Transaction_Amount: "185000", Transaction_Status: "Failed" },
  { Customer_ID: "U103", Transaction_ID: "TXN3011", Account_Holder_Name: "Arun Kumar", Account_Number: "4701 7468 1453 8401", IFSC_Code: "676", Account_Type: "Savings", Transaction_Type: "Shopping", Transaction_Amount: "1200", Transaction_Status: "Completed" },
  { Customer_ID: "U103", Transaction_ID: "TXN3012", Account_Holder_Name: "Arun Kumar", Account_Number: "4701 7468 1453 8401", IFSC_Code: "676", Account_Type: "Savings", Transaction_Type: "Shopping", Transaction_Amount: "1750", Transaction_Status: "Completed" },
  { Customer_ID: "U103", Transaction_ID: "TXN3013", Account_Holder_Name: "Arun Kumar", Account_Number: "4701 7468 1453 8401", IFSC_Code: "676", Account_Type: "Savings", Transaction_Type: "Grocery", Transaction_Amount: "3200", Transaction_Status: "Completed" },
  { Customer_ID: "U103", Transaction_ID: "TXN3014", Account_Holder_Name: "Arun Kumar", Account_Number: "4701 7468 1453 8401", IFSC_Code: "676", Account_Type: "Savings", Transaction_Type: "Grocery", Transaction_Amount: "850", Transaction_Status: "Completed" },
  { Customer_ID: "U103", Transaction_ID: "TXN3015", Account_Holder_Name: "Arun Kumar", Account_Number: "4701 7468 1453 8401", IFSC_Code: "676", Account_Type: "Savings", Transaction_Type: "IMPS - Unknown Beneficiary", Transaction_Amount: "420000", Transaction_Status: "Failed" },
  { Customer_ID: "U104", Transaction_ID: "TXN3016", Account_Holder_Name: "Sneha Reddy", Account_Number: "6100 3307 6661 9345", IFSC_Code: "189", Account_Type: "Current", Transaction_Type: "Fuel", Transaction_Amount: "2300", Transaction_Status: "Completed" },
  { Customer_ID: "U104", Transaction_ID: "TXN3017", Account_Holder_Name: "Sneha Reddy", Account_Number: "6100 3307 6661 9345", IFSC_Code: "189", Account_Type: "Current", Transaction_Type: "Bill Payment", Transaction_Amount: "3200", Transaction_Status: "Completed" },
  { Customer_ID: "U104", Transaction_ID: "TXN3018", Account_Holder_Name: "Sneha Reddy", Account_Number: "6100 3307 6661 9345", IFSC_Code: "189", Account_Type: "Current", Transaction_Type: "Grocery", Transaction_Amount: "1750", Transaction_Status: "Completed" },
  { Customer_ID: "U104", Transaction_ID: "TXN3019", Account_Holder_Name: "Sneha Reddy", Account_Number: "6100 3307 6661 9345", IFSC_Code: "189", Account_Type: "Current", Transaction_Type: "Grocery", Transaction_Amount: "3200", Transaction_Status: "Completed" },
  { Customer_ID: "U105", Transaction_ID: "TXN3020", Account_Holder_Name: "Vikram Singh", Account_Number: "1231 0077 2837 8326", IFSC_Code: "759", Account_Type: "Current", Transaction_Type: "Grocery", Transaction_Amount: "1200", Transaction_Status: "Completed" },
  { Customer_ID: "U105", Transaction_ID: "TXN3021", Account_Holder_Name: "Vikram Singh", Account_Number: "1231 0077 2837 8326", IFSC_Code: "759", Account_Type: "Current", Transaction_Type: "Fuel", Transaction_Amount: "3200", Transaction_Status: "Completed" },
  { Customer_ID: "U105", Transaction_ID: "TXN3022", Account_Holder_Name: "Vikram Singh", Account_Number: "1231 0077 2837 8326", IFSC_Code: "759", Account_Type: "Current", Transaction_Type: "Shopping", Transaction_Amount: "850", Transaction_Status: "Completed" },
  { Customer_ID: "U105", Transaction_ID: "TXN3023", Account_Holder_Name: "Vikram Singh", Account_Number: "1231 0077 2837 8326", IFSC_Code: "759", Account_Type: "Current", Transaction_Type: "Shopping", Transaction_Amount: "4500", Transaction_Status: "Completed" },
  { Customer_ID: "U106", Transaction_ID: "TXN3024", Account_Holder_Name: "Ananya Iyer", Account_Number: "9081 7263 5410 2938", IFSC_Code: "452", Account_Type: "Current", Transaction_Type: "Grocery", Transaction_Amount: "1500", Transaction_Status: "Completed" },
  { Customer_ID: "U106", Transaction_ID: "TXN3025", Account_Holder_Name: "Ananya Iyer", Account_Number: "9081 7263 5410 2938", IFSC_Code: "452", Account_Type: "Current", Transaction_Type: "Utility Bill", Transaction_Amount: "2750", Transaction_Status: "Completed" },
  { Customer_ID: "U106", Transaction_ID: "TXN3026", Account_Holder_Name: "Ananya Iyer", Account_Number: "9081 7263 5410 2938", IFSC_Code: "452", Account_Type: "Current", Transaction_Type: "Shopping", Transaction_Amount: "5200", Transaction_Status: "Completed" },
  { Customer_ID: "U106", Transaction_ID: "TXN3027", Account_Holder_Name: "Ananya Iyer", Account_Number: "9081 7263 5410 2938", IFSC_Code: "452", Account_Type: "Current", Transaction_Type: "Fuel", Transaction_Amount: "980", Transaction_Status: "Completed" },
  { Customer_ID: "U107", Transaction_ID: "TXN3028", Account_Holder_Name: "Karthik Rajan", Account_Number: "9081 7263 5410 2938", IFSC_Code: "452", Account_Type: "Current", Transaction_Type: "Grocery", Transaction_Amount: "1500", Transaction_Status: "Completed" },
  { Customer_ID: "U107", Transaction_ID: "TXN3029", Account_Holder_Name: "Karthik Rajan", Account_Number: "9081 7263 5410 2938", IFSC_Code: "452", Account_Type: "Current", Transaction_Type: "Utility Bill", Transaction_Amount: "2750", Transaction_Status: "Completed" },
  { Customer_ID: "U107", Transaction_ID: "TXN3030", Account_Holder_Name: "Karthik Rajan", Account_Number: "9081 7263 5410 2938", IFSC_Code: "452", Account_Type: "Current", Transaction_Type: "Shopping", Transaction_Amount: "5200", Transaction_Status: "Completed" },
  { Customer_ID: "U107", Transaction_ID: "TXN3031", Account_Holder_Name: "Karthik Rajan", Account_Number: "9081 7263 5410 2938", IFSC_Code: "452", Account_Type: "Current", Transaction_Type: "Fuel", Transaction_Amount: "980", Transaction_Status: "Completed" }
];

const SEED_SECURITY = [
  { Customer_ID: "U101", Transaction_ID: "TXN3001", Login_Date: "01-07-2026", Login_Time: "18:13", Location: "Coimbatore", Device_Information: "Windows PC", VPN_Used: "No", Firewall_Alert: "No" },
  { Customer_ID: "U101", Transaction_ID: "TXN3002", Login_Date: "03-07-2026", Login_Time: "11:02", Location: "Coimbatore", Device_Information: "Windows PC", VPN_Used: "No", Firewall_Alert: "No" },
  { Customer_ID: "U101", Transaction_ID: "TXN3003", Login_Date: "05-07-2026", Login_Time: "11:16", Location: "Coimbatore", Device_Information: "Windows PC", VPN_Used: "No", Firewall_Alert: "No" },
  { Customer_ID: "U101", Transaction_ID: "TXN3004", Login_Date: "07-07-2026", Login_Time: "09:53", Location: "Coimbatore", Device_Information: "Windows PC", VPN_Used: "No", Firewall_Alert: "No" },
  { Customer_ID: "U101", Transaction_ID: "TXN3005", Login_Date: "09-07-2026", Login_Time: "01:05", Location: "Lagos", Device_Information: "iPhone", VPN_Used: "Yes", Firewall_Alert: "Yes" },
  { Customer_ID: "U102", Transaction_ID: "TXN3006", Login_Date: "01-07-2026", Login_Time: "12:00", Location: "Chennai", Device_Information: "Windows PC", VPN_Used: "No", Firewall_Alert: "No" },
  { Customer_ID: "U102", Transaction_ID: "TXN3007", Login_Date: "03-07-2026", Login_Time: "18:39", Location: "Chennai", Device_Information: "Windows PC", VPN_Used: "No", Firewall_Alert: "No" },
  { Customer_ID: "U102", Transaction_ID: "TXN3008", Login_Date: "05-07-2026", Login_Time: "16:53", Location: "Chennai", Device_Information: "Windows PC", VPN_Used: "No", Firewall_Alert: "No" },
  { Customer_ID: "U102", Transaction_ID: "TXN3009", Login_Date: "07-07-2026", Login_Time: "18:11", Location: "Chennai", Device_Information: "Windows PC", VPN_Used: "No", Firewall_Alert: "No" },
  { Customer_ID: "U102", Transaction_ID: "TXN3010", Login_Date: "09-07-2026", Login_Time: "03:52", Location: "Minsk", Device_Information: "MacBook", VPN_Used: "Yes", Firewall_Alert: "Yes" },
  { Customer_ID: "U103", Transaction_ID: "TXN3011", Login_Date: "01-07-2026", Login_Time: "18:10", Location: "Chennai", Device_Information: "iPhone", VPN_Used: "No", Firewall_Alert: "No" },
  { Customer_ID: "U103", Transaction_ID: "TXN3012", Login_Date: "03-07-2026", Login_Time: "20:43", Location: "Chennai", Device_Information: "iPhone", VPN_Used: "No", Firewall_Alert: "No" },
  { Customer_ID: "U103", Transaction_ID: "TXN3013", Login_Date: "05-07-2026", Login_Time: "15:26", Location: "Chennai", Device_Information: "iPhone", VPN_Used: "No", Firewall_Alert: "No" },
  { Customer_ID: "U103", Transaction_ID: "TXN3014", Login_Date: "07-07-2026", Login_Time: "09:02", Location: "Chennai", Device_Information: "iPhone", VPN_Used: "No", Firewall_Alert: "No" },
  { Customer_ID: "U103", Transaction_ID: "TXN3015", Login_Date: "09-07-2026", Login_Time: "02:45", Location: "Minsk", Device_Information: "Laptop", VPN_Used: "Yes", Firewall_Alert: "Yes" },
  { Customer_ID: "U104", Transaction_ID: "TXN3016", Login_Date: "01-07-2026", Login_Time: "15:52", Location: "Chennai", Device_Information: "Laptop", VPN_Used: "No", Firewall_Alert: "No" },
  { Customer_ID: "U104", Transaction_ID: "TXN3017", Login_Date: "03-07-2026", Login_Time: "18:33", Location: "Chennai", Device_Information: "Laptop", VPN_Used: "No", Firewall_Alert: "No" },
  { Customer_ID: "U104", Transaction_ID: "TXN3018", Login_Date: "05-07-2026", Login_Time: "11:08", Location: "Chennai", Device_Information: "Laptop", VPN_Used: "No", Firewall_Alert: "No" },
  { Customer_ID: "U104", Transaction_ID: "TXN3019", Login_Date: "07-07-2026", Login_Time: "12:17", Location: "Chennai", Device_Information: "Laptop", VPN_Used: "No", Firewall_Alert: "No" },
  { Customer_ID: "U105", Transaction_ID: "TXN3020", Login_Date: "01-07-2026", Login_Time: "12:04", Location: "Coimbatore", Device_Information: "Android", VPN_Used: "No", Firewall_Alert: "No" },
  { Customer_ID: "U105", Transaction_ID: "TXN3021", Login_Date: "03-07-2026", Login_Time: "13:15", Location: "Coimbatore", Device_Information: "Android", VPN_Used: "No", Firewall_Alert: "No" },
  { Customer_ID: "U105", Transaction_ID: "TXN3022", Login_Date: "05-07-2026", Login_Time: "09:18", Location: "Coimbatore", Device_Information: "Android", VPN_Used: "No", Firewall_Alert: "No" },
  { Customer_ID: "U105", Transaction_ID: "TXN3023", Login_Date: "07-07-2026", Login_Time: "14:05", Location: "Coimbatore", Device_Information: "Android", VPN_Used: "No", Firewall_Alert: "No" },
  { Customer_ID: "U106", Transaction_ID: "TXN3024", Login_Date: "01-07-2026", Login_Time: "10:51", Location: "Chennai", Device_Information: "MacBook", VPN_Used: "No", Firewall_Alert: "No" },
  { Customer_ID: "U106", Transaction_ID: "TXN3025", Login_Date: "03-07-2026", Login_Time: "14:40", Location: "Chennai", Device_Information: "MacBook", VPN_Used: "No", Firewall_Alert: "No" },
  { Customer_ID: "U106", Transaction_ID: "TXN3026", Login_Date: "05-07-2026", Login_Time: "17:32", Location: "Chennai", Device_Information: "MacBook", VPN_Used: "No", Firewall_Alert: "No" },
  { Customer_ID: "U106", Transaction_ID: "TXN3027", Login_Date: "07-07-2026", Login_Time: "19:10", Location: "Chennai", Device_Information: "MacBook", VPN_Used: "No", Firewall_Alert: "No" },
  { Customer_ID: "U107", Transaction_ID: "TXN3028", Login_Date: "01-07-2026", Login_Time: "10:51", Location: "Chennai", Device_Information: "MacBook", VPN_Used: "No", Firewall_Alert: "No" },
  { Customer_ID: "U107", Transaction_ID: "TXN3029", Login_Date: "03-07-2026", Login_Time: "14:40", Location: "Chennai", Device_Information: "MacBook", VPN_Used: "No", Firewall_Alert: "No" },
  { Customer_ID: "U107", Transaction_ID: "TXN3030", Login_Date: "05-07-2026", Login_Time: "17:32", Location: "Chennai", Device_Information: "MacBook", VPN_Used: "No", Firewall_Alert: "No" },
  { Customer_ID: "U107", Transaction_ID: "TXN3031", Login_Date: "07-07-2026", Login_Time: "19:10", Location: "Chennai", Device_Information: "MacBook", VPN_Used: "No", Firewall_Alert: "No" }
];

const SEED_PROFILES = [
  { Customer_ID: "U101", Name: "Rahul Sharma", Normal_Device: "Windows PC", Normal_Location: "Coimbatore", Account_Number: "8778 9328 7921 7421", IFSC_Code: "651", Account_Type: "Savings", Avg_Amount: 2800.00 },
  { Customer_ID: "U102", Name: "Priya Nair", Normal_Device: "Windows PC", Normal_Location: "Chennai", Account_Number: "9290 8100 3390 7579", IFSC_Code: "962", Account_Type: "Savings", Avg_Amount: 2300.00 },
  { Customer_ID: "U103", Name: "Arun Kumar", Normal_Device: "iPhone", Normal_Location: "Chennai", Account_Number: "4701 7468 1453 8401", IFSC_Code: "676", Account_Type: "Savings", Avg_Amount: 1750.00 },
  { Customer_ID: "U104", Name: "Sneha Reddy", Normal_Device: "Laptop", Normal_Location: "Chennai", Account_Number: "6100 3307 6661 9345", IFSC_Code: "189", Account_Type: "Current", Avg_Amount: 2600.00 },
  { Customer_ID: "U105", Name: "Vikram Singh", Normal_Device: "Android", Normal_Location: "Coimbatore", Account_Number: "1231 0077 2837 8326", IFSC_Code: "759", Account_Type: "Current", Avg_Amount: 2400.00 },
  { Customer_ID: "U106", Name: "Ananya Iyer", Normal_Device: "MacBook", Normal_Location: "Chennai", Account_Number: "9081 7263 5410 2938", IFSC_Code: "452", Account_Type: "Current", Avg_Amount: 2600.00 },
  { Customer_ID: "U107", Name: "Karthik Rajan", Normal_Device: "MacBook", Normal_Location: "Chennai", Account_Number: "9081 7263 5410 2938", IFSC_Code: "452", Account_Type: "Current", Avg_Amount: 2600.00 }
];

// Memory databases in case MongoDB remains blocked
let memoryTransactions = [...SEED_TRANSACTIONS];
let memorySecurityData = [...SEED_SECURITY];
let memoryProfiles = [...SEED_PROFILES];

// Connect to MongoDB Atlas
async function connectToMongo() {
  try {
    console.log("Connecting to MongoDB Atlas Cluster...");
    client = new MongoClient(MONGO_URI, { serverSelectionTimeoutMS: 2000, connectTimeoutMS: 2000 });
    await client.connect();
    
    db = client.db(DB_NAME);
    dbConnected = true;
    connectionError = "";
    console.log("Connected to MongoDB Database: " + DB_NAME);

    // Verify and seed collections
    const transactionsCol = db.collection("transactions");
    const securityCol = db.collection("security_data");
    const profilesCol = db.collection("user_profiles");

    const tCount = await transactionsCol.countDocuments();
    if (tCount === 0) {
      console.log("Seeding transaction logs...");
      await transactionsCol.insertMany(SEED_TRANSACTIONS);
    }

    const sCount = await securityCol.countDocuments();
    if (sCount === 0) {
      console.log("Seeding security telemetry logs...");
      await securityCol.insertMany(SEED_SECURITY);
    }

    const pCount = await profilesCol.countDocuments();
    if (pCount === 0) {
      console.log("Seeding user profile definitions...");
      await profilesCol.insertMany(SEED_PROFILES);
    }

  } catch (err) {
    dbConnected = false;
    connectionError = err.message;
    console.error("MongoDB Atlas connection failed: ", err.message);
    console.log("Operating in local database fallback (Simulation Mode).");
  }
}

connectToMongo();

// Endpoint for checking DB Connection health status
app.get('/api/db-status', (req, res) => {
  res.json({
    connected: dbConnected,
    database: DB_NAME,
    error: connectionError
  });
});

// Endpoint for Transactions
app.get('/api/transactions', async (req, res) => {
  if (dbConnected) {
    try {
      const data = await db.collection("transactions").find({}).toArray();
      return res.json(data);
    } catch (e) {
      console.error("Error reading transactions from MongoDB (falling back to memory):", e.message);
    }
  }
  res.json(memoryTransactions);
});

// Endpoint for Security Telemetry
app.get('/api/securityData', async (req, res) => {
  if (dbConnected) {
    try {
      const data = await db.collection("security_data").find({}).toArray();
      return res.json(data);
    } catch (e) {
      console.error("Error reading security data from MongoDB (falling back to memory):", e.message);
    }
  }
  res.json(memorySecurityData);
});

// Endpoint for User Profiles
app.get('/api/userProfiles', async (req, res) => {
  if (dbConnected) {
    try {
      const data = await db.collection("user_profiles").find({}).toArray();
      return res.json(data);
    } catch (e) {
      console.error("Error reading user profiles from MongoDB (falling back to memory):", e.message);
    }
  }
  res.json(memoryProfiles);
});

// Endpoint for Ingesting uploaded CSV datasets
app.post('/api/ingest', async (req, res) => {
  const { transactions, securityData } = req.body;
  if (!transactions || !securityData) {
    return res.status(400).json({ error: "Missing transactions or securityData streams." });
  }

  // Sanitize data (adding generated IDs if missing)
  const sanitizedTxns = transactions.map(t => ({
    Customer_ID: t.Customer_ID || "U999",
    Transaction_ID: t.Transaction_ID || `TXN${Math.floor(Math.random()*9000)+1000}`,
    Account_Holder_Name: t.Account_Holder_Name || "Unknown",
    Account_Number: t.Account_Number || "Unknown",
    IFSC_Code: t.IFSC_Code || "000",
    Account_Type: t.Account_Type || "Savings",
    Transaction_Type: t.Transaction_Type || "Transfer",
    Transaction_Amount: t.Transaction_Amount || "0",
    Transaction_Status: t.Transaction_Status || "Completed"
  }));

  const sanitizedSec = securityData.map(s => ({
    Customer_ID: s.Customer_ID || "U999",
    Transaction_ID: s.Transaction_ID || `TXN${Math.floor(Math.random()*9000)+1000}`,
    Login_Date: s.Login_Date || "01-07-2026",
    Login_Time: s.Login_Time || "12:00",
    Location: s.Location || "Chennai",
    Device_Information: s.Device_Information || "Windows PC",
    VPN_Used: s.VPN_Used || "No",
    Firewall_Alert: s.Firewall_Alert || "No"
  }));

  if (dbConnected) {
    try {
      // Overwrite database collections
      await db.collection("transactions").deleteMany({});
      await db.collection("transactions").insertMany(sanitizedTxns);

      await db.collection("security_data").deleteMany({});
      await db.collection("security_data").insertMany(sanitizedSec);

      return res.json({ success: true, message: "Saved to MongoDB database cluster successfully!" });
    } catch (e) {
      console.error("Error writing ingested datasets to MongoDB:", e);
    }
  }

  // Memory fallback
  memoryTransactions = sanitizedTxns;
  memorySecurityData = sanitizedSec;
  res.json({ success: true, message: "Server connection offline; loaded into server cache memory." });
});

// Endpoint for Groq Explainable AI Generation
app.post('/api/generate-explanation', async (req, res) => {
  const { assessment } = req.body;
  if (!assessment) {
    return res.status(400).json({ error: "Missing assessment object." });
  }

  const authHeader = req.headers.authorization || "";
  const apiKey = authHeader.replace(/^Bearer\s+/i, "").trim() || process.env.VITE_GROQ_API_KEY || "";

  if (!apiKey) {
    return res.status(400).json({ error: "Missing Groq API Key. Please configure it in .env or settings." });
  }

  try {
    const prompt = `
      You are Quantum Sentinel AI, a leading cyber threat correlation engine for a tier-1 banking Security Operations Center (SOC).
      Analyze the following correlated threat assessment and write a professional, detailed explainable AI explanation (approx. 150-200 words).
      
      Transaction Details:
      - Transaction ID: ${assessment.transactionId}
      - User: ${assessment.userName} (${assessment.userId})
      - Role: ${assessment.userRole}
      - Amount: ₹${parseFloat(assessment.amount).toLocaleString()}
      - Timestamp: ${assessment.timestamp}
      - Device: ${assessment.device}
      - Location: ${assessment.country} (IP: ${assessment.ipAddress})
      
      UEBA Baseline Profile:
      - Normal Device: ${assessment.profile.normalDevice}
      - Normal IP: ${assessment.profile.normalIp}
      - Normal Location: ${assessment.profile.normalLocation}
      - Normal Avg Txn: ₹${assessment.profile.avgTransactionAmount}
      - Normal Login Hours: ${assessment.profile.typicalLoginTime}
      
      Security Assessment:
      - Risk Score: ${assessment.riskScore}%
      - Risk Level: ${assessment.riskLevel}
      - Threat Classification: ${assessment.threatClassification}
      - Recommended SOC Action: ${assessment.recommendedAction}
      - Triggered Indicators: ${JSON.stringify(assessment.indicators)}

      Provide your analysis in clean Markdown containing:
      1. **Threat Classification & Risk Summary**: Summarize what occurred and why the risk score is what it is.
      2. **Correlated Indicators Breakdown**: Call out how the login activity and transaction data correlate (e.g. failed logins, device change, impossible travel).
      3. **Recommended Actions**: Explain the reasoning for the recommended SOC action (e.g. Freeze Account vs MFA).
    `;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are an expert banking cybersecurity analyst correlation bot." },
          { role: "user", content: prompt }
        ],
        temperature: 0.2
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`HTTP ${response.status} from Groq: ${errText}`);
    }

    const resData = await response.json();
    const explanationText = resData.choices?.[0]?.message?.content || "No explanation returned from AI.";
    res.json({ explanation: explanationText });

  } catch (err) {
    console.error("Groq API Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint for Groq AI Copilot Chat
app.post('/api/copilot-chat', async (req, res) => {
  const { userMessage, chatHistory, allAssessments } = req.body;

  const authHeader = req.headers.authorization || "";
  const apiKey = authHeader.replace(/^Bearer\s+/i, "").trim() || process.env.VITE_GROQ_API_KEY || "";

  if (!apiKey) {
    return res.status(400).json({ error: "Missing Groq API Key. Please configure it in .env or settings." });
  }

  try {
    const threatSummaries = (allAssessments || [])
      .filter(t => t.riskScore > 30)
      .map(t => `- TXN ID: ${t.transactionId}, User: ${t.userName}, Amount: ₹${t.amount}, Risk: ${t.riskScore}% (${t.threatClassification}), Device: ${t.device}, Location: ${t.country}`)
      .join('\n');

    const formattedHistory = (chatHistory || []).map(h => 
      `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.text}`
    ).join('\n');

    const prompt = `
      You are Quantum Sentinel AI Security Copilot, a highly knowledgeable virtual security analyst assisting a bank's SOC team.
      
      Here is the current security dashboard context:
      ${threatSummaries || "No active alerts or suspicious transactions at this time."}
      
      Conversation History:
      ${formattedHistory}
      
      New User Message: ${userMessage}
      
      Provide a helpful, precise, and concise response using professional cybersecurity terminology (max 150 words). If the user asks about a specific transaction or user, look up its details in the context.
    `;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are a cyber security advisor assistant bot." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`HTTP ${response.status} from Groq: ${errText}`);
    }

    const resData = await response.json();
    const reply = resData.choices?.[0]?.message?.content || "No reply returned from AI.";
    res.json({ reply });

  } catch (err) {
    console.error("Groq Copilot Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});
