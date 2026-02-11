const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.USE_REDIS = 'false';

beforeAll(async () => {
  // Start in-memory MongoDB server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  process.env.MONGODB_URI = mongoUri; // Set env for app to use memory DB
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    bufferCommands: true,
    bufferTimeoutMS: 30000,
    serverSelectionTimeoutMS: 30000,
    maxPoolSize: 10,
    minPoolSize: 1,
    maxIdleTimeMS: 30000,
  });

  // Ensure connection is ready
  await mongoose.connection.db.admin().ping();

  // Wait for connection to be fully ready
  while (mongoose.connection.readyState !== 1) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}, 30000);

afterAll(async () => {
  // Clean up and disconnect
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  await mongoServer.stop();
}, 30000);

beforeEach(async () => {
  // Clear collections
  const { collections } = mongoose.connection;
  const collectionNames = Object.keys(collections);
  await Promise.all(collectionNames.map(name => collections[name].deleteMany({})));
}, 30000);
