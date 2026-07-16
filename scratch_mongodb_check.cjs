process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://pranethipranethi17_db_user:sOSXhisPDWQE8Xz6@cluster0.cwteyxc.mongodb.net/";
const client = new MongoClient(uri);

async function run() {
  try {
    console.log("Connecting to MongoDB Atlas Cluster...");
    await client.connect();
    console.log("Connected successfully!");

    // List all databases
    const adminDb = client.db().admin();
    const dbsList = await adminDb.listDatabases();
    console.log("\nDatabases in Cluster:");
    
    for (let dbInfo of dbsList.databases) {
      console.log(`- ${dbInfo.name}`);
      const db = client.db(dbInfo.name);
      const collections = await db.listCollections().toArray();
      
      for (let col of collections) {
        console.log(`   * Collection: ${col.name}`);
        // Fetch a sample document
        const sample = await db.collection(col.name).findOne({});
        console.log(`     Sample Doc:`, JSON.stringify(sample, null, 2));
      }
    }

  } catch (err) {
    console.error("Database connection/query error:", err);
  } finally {
    await client.close();
    console.log("\nConnection closed.");
  }
}

run();
