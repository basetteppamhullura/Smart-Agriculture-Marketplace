const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

let isConnected = false;
let useLocalMock = false;

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_agriculture';
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000 // 3 seconds timeout
    });
    console.log('MongoDB connected successfully.');
    isConnected = true;
  } catch (err) {
    console.warn('\n========================================================================');
    console.warn('WARNING: MongoDB connection failed.');
    console.warn('Falling back to a local JSON-based database at server/data/*.json.');
    console.warn('No MongoDB service setup is required to test the application.');
    console.warn('========================================================================\n');
    useLocalMock = true;
    
    // Ensure mock DB directory exists
    const dbDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir);
    }
  }
};

module.exports = { 
  connectDB, 
  isConnected: () => isConnected, 
  useLocalMock: () => useLocalMock 
};
