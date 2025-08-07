const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.hdemiyo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let templatesCollection = null;

async function connectDB(name) {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
    const db = client.db("templatehearth");
    templatesCollection = db.collection(name);
    console.log("✅ Connected to MongoDB");
  }
}

// ✅ Lazy getter
async function getTemplatesCollection(name) {
  await connectDB(name);
  if (!templatesCollection) {
    throw new Error("❌ Database not connected yet. Call connectDB() first.");
  }
  return templatesCollection;
}

module.exports = {
  connectDB,
  getTemplatesCollection,
};
