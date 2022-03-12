// mongodb.js

const { MongoClient } = require("mongodb");
import "dotenv/config";

const uri = process.env.MONGODB_URI;

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your Mongo URI to .env.local");
}

const client = new MongoClient(uri);

// Database Name
const dbName = process.env.MONGO_DB;

async function main() {
  // Use connect method to connect to the server
  await client.connect();
  console.log("Connected successfully to server");
  const db = client.db(dbName);
  return db;
  // const collection = db.collection("");

  // the following code examples can be pasted here...
}

module.exports = { main };

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
