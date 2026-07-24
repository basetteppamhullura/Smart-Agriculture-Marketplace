const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { connectDB } = require('./config/db');
const dbManager = require('./utils/dbManager');
const socketManager = require('./utils/socketManager');

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
app.use('/api/mandi-prices', require('./routes/mandiRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/chats', require('./routes/chatRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/logistics', require('./routes/logisticsRoutes'));

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

    // 3. Create HTTP Server
    const server = http.createServer(app);

    // 4. Initialize WebSocket Server
    socketManager.init(server);

    // 5. Start listening
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
  }
};

startServer();
