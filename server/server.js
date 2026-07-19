const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const dbManager = require('./utils/dbManager');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/crops', require('./routes/cropRoutes'));
app.use('/api/auctions', require('./routes/auctionRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/negotiations', require('./routes/negotiationRoutes'));

// Basic health check
app.get('/health', (req, res) => {
  res.json({ status: 'active', timestamp: new Date() });
});

// Port configuration
const PORT = process.env.PORT || 5000;

// Initialize Database & Server
const startServer = async () => {
  try {
    // 1. Connect database (Mongoose or fallback to JSON files)
    await connectDB();
    
    // 2. Seed database if empty
    await dbManager.seed();

    // 3. Start listening
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
  }
};

startServer();
