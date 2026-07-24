const dbManager = require('../utils/dbManager');
const { createNotification } = require('../utils/notificationHelper');
const socketManager = require('../utils/socketManager');

// @desc    Get all active auctions
// @route   GET /api/auctions
// @access  Public
const getActiveAuctions = async (req, res) => {
  try {
    const auctions = await dbManager.auctions.find({ status: 'active' });
    res.json(auctions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Place a bid on an auction
// @route   POST /api/auctions/:id/bid
// @access  Private/Buyer
const placeBid = async (req, res) => {
  const { amount } = req.body;
  const buyerId = req.user._id;

  try {
    const auction = await dbManager.auctions.findOne({ _id: req.params.id });
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    if (auction.status !== 'active') {
      return res.status(400).json({ message: 'Auction has already ended' });
    }

    if (new Date(auction.endTime) < new Date()) {
      // Auto close the auction if it expired
      return await resolveAuction(auction, res);
    }

    const bidAmount = Number(amount);
    const minBid = auction.highestBid > 0 ? auction.highestBid + 1 : auction.crop.price + 1;

    if (bidAmount < minBid) {
      return res.status(400).json({ message: `Bid must be at least Rs ${minBid}` });
    }

    // Check if buyer has enough funds
    const buyer = await dbManager.users.findById(buyerId);
    if (buyer.walletBalance < bidAmount) {
      return res.status(400).json({ message: `Insufficient wallet balance. You need at least Rs ${bidAmount}` });
    }

    // Process Outbid Refund: Refund previous highest bidder
    if (auction.highestBidder) {
      const prevBidder = await dbManager.users.findById(auction.highestBidder);
      if (prevBidder) {
        await dbManager.users.findByIdAndUpdate(auction.highestBidder, {
          walletBalance: prevBidder.walletBalance + auction.highestBid
        });
      }
    }

    // Deduct bid from new highest bidder
    await dbManager.users.findByIdAndUpdate(buyerId, {
      walletBalance: buyer.walletBalance - bidAmount
    });

    // Add bid to history
    const updatedAuction = await dbManager.auctions.findByIdAndUpdate(req.params.id, {
      $push: { bids: { buyer: buyerId, amount: bidAmount, timestamp: new Date().toISOString() } },
      highestBid: bidAmount,
      highestBidder: buyerId
    });

    // Fetch details for notifications
    const cropDetail = await dbManager.crops.findById(auction.crop._id || auction.crop);
    const farmerId = cropDetail.farmer._id || cropDetail.farmer;

    // Notify farmer of new bid
    await createNotification(
      farmerId,
      'New Auction Bid Placed',
      `Buyer ${buyer.name} placed a bid of ₹${bidAmount}/Quintal on ${cropDetail.name}.`,
      'auction',
      req.params.id
    );

    // Notify previous bidder if outbid
    if (auction.highestBidder && auction.highestBidder.toString() !== buyerId.toString()) {
      await createNotification(
        auction.highestBidder,
        'You have been Outbid!',
        `A higher bid of ₹${bidAmount}/Quintal was placed on ${cropDetail.name}.`,
        'auction',
        req.params.id
      );
    }

    // Broadcast new bid details in real time
    socketManager.broadcastToChannel(`auction:${req.params.id}`, {
      type: 'new_bid',
      highestBid: bidAmount,
      highestBidder: buyerId,
      highestBidderName: buyer.name,
      bidsCount: (auction.bids || []).length + 1
    });

    res.json({
      message: 'Bid placed successfully',
      highestBid: bidAmount,
      highestBidderName: buyer.name,
      walletBalance: buyer.walletBalance - bidAmount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Internal resolver for auctions
const resolveAuction = async (auction, res) => {
  try {
    if (!auction.highestBidder) {
      // No bids, just end it
      await dbManager.auctions.findByIdAndUpdate(auction._id, { status: 'ended' });
      return res.status(200).json({ message: 'Auction ended with no bidders.', status: 'ended' });
    }

    // We have a winner!
    const winnerId = auction.highestBidder;
    const bidAmount = auction.highestBid;
    
    // Mark auction as completed
    await dbManager.auctions.findByIdAndUpdate(auction._id, { status: 'completed' });
    
    // Mark crop as sold
    await dbManager.crops.findByIdAndUpdate(auction.crop._id || auction.crop, { status: 'sold' });

    // Pay the farmer
    const cropDetail = await dbManager.crops.findById(auction.crop._id || auction.crop);
    const farmerId = cropDetail.farmer._id || cropDetail.farmer;
    const farmer = await dbManager.users.findById(farmerId);
    await dbManager.users.findByIdAndUpdate(farmerId, {
      walletBalance: farmer.walletBalance + bidAmount
    });

    // Create delivery order
    const order = await dbManager.orders.create({
      buyer: winnerId,
      farmer: farmerId,
      crop: auction.crop._id || auction.crop,
      quantity: cropDetail.quantity,
      totalAmount: bidAmount,
      paymentStatus: 'paid', // Bid was pre-deducted
      paymentId: `PAY-AUC-${auction._id}`,
      deliveryStatus: 'processing',
      logistics: {
        partnerName: 'AgriExpress Logistics',
        vehicleNumber: 'KA-19-MH-4220',
        driverName: 'Ramesh Kumar',
        driverPhone: '+91 98765 43210',
        estimatedDelivery: new Date(Date.now() + 3600000 * 24 * 2).toISOString() // 2 days
      }
    });

    // Notify Buyer
    await createNotification(
      winnerId,
      'Auction Won! Order Confirmed',
      `Congratulations! You won the auction for ${cropDetail.name} at ₹${bidAmount}/Quintal.`,
      'auction',
      order._id
    );

    // Notify Farmer
    await createNotification(
      farmerId,
      'Auction Ended! Payment Received',
      `Your auction for ${cropDetail.name} resolved. ₹${bidAmount} credited to your wallet.`,
      'auction',
      order._id
    );

    // Broadcast resolved event
    socketManager.broadcastToChannel(`auction:${auction._id}`, {
      type: 'resolved',
      status: 'completed',
      winner: winnerId,
      amount: bidAmount,
      orderId: order._id
    });

    res.json({
      message: 'Auction resolved successfully. Winner announced!',
      winner: winnerId,
      amount: bidAmount,
      orderId: order._id,
      status: 'completed'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Force resolve an auction (Admin or cron trigger)
// @route   POST /api/auctions/:id/resolve
// @access  Private
const forceResolveAuction = async (req, res) => {
  try {
    const auction = await dbManager.auctions.findOne({ _id: req.params.id });
    if (!auction) return res.status(404).json({ message: 'Auction not found' });
    await resolveAuction(auction, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getActiveAuctions,
  placeBid,
  forceResolveAuction
};
