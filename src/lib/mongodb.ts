import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  console.warn('MONGODB_URI not found in environment variables. Please add it to .env.local');
  // Don't throw error immediately, let the connect function handle it
}

const uri = process.env.MONGODB_URI;
const options = {
  serverApi: {
    version: '1' as const,
    strict: true,
    deprecationErrors: true,
  }
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!uri) {
  // If no MongoDB URI is provided, create a mock connection that will fail gracefully
  clientPromise = Promise.reject(new Error('MONGODB_URI not configured'));
} else if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function connect() {
  try {
    const client = await clientPromise;
    const db = client.db('resume-ai');
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error('Failed to connect to database');
  }
}

export default clientPromise;