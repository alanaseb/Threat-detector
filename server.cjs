process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
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
const DB_NAME = "threat_detection";

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

// Memory databases in case MongoDB remains blocked
let memoryTransactions = [...SEED_TRANSACTIONS];
let memorySecurityData = [...SEED_SECURITY];

// Connect to MongoDB Atlas
async function connectToMongo() {
  try {
    console.log("Connecting to MongoDB Atlas Cluster...");
    client = new MongoClient(MONGO_URI);
    await client.connect();
    
    db = client.db(DB_NAME);
    dbConnected = true;
    connectionError = "";
    console.log("Connected to MongoDB Database: " + DB_NAME);

    // Verify and seed collections
    const transactionsCol = db.collection("transactions");
    const securityCol = db.collection("security_data");

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
      console.error("Error reading transactions from MongoDB:", e);
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
      console.error("Error reading security data from MongoDB:", e);
    }
  }
  res.json(memorySecurityData);
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

app.listen(PORT, () => {
  console.log(`Backend correlation server listening on port ${PORT}`);
});
