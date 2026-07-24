const dbManager = require('../utils/dbManager');
const { createNotification } = require('../utils/notificationHelper');
const socketManager = require('../utils/socketManager');

// @desc    Process wallet payment and generate escrow order + logistics pickup
// @route   POST /api/payments/charge
// @access  Private/Buyer
const chargePayment = async (req, res) => {
  const { cropId, quantity } = req.body;
  const buyerId = req.user._id;

  try {
    const crop = await dbManager.crops.findById(cropId);
    if (!crop) return res.status(404).json({ message: 'Crop listing not found' });
    if (crop.status !== 'available') return res.status(400).json({ message: 'Crop is no longer available' });

    const buyQty = Number(quantity);
    if (buyQty > crop.quantity) {
      return res.status(400).json({ message: `Only ${crop.quantity} Quintals available.` });
    }

    const totalCost = crop.price * buyQty;

    // Wallet balance check
    const buyer = await dbManager.users.findById(buyerId);
    if (buyer.walletBalance < totalCost) {
      return res.status(400).json({ message: `Insufficient wallet balance. You need ₹${totalCost.toLocaleString()}` });
    }

    const farmerId = crop.farmer._id || crop.farmer;
    const farmer = await dbManager.users.findById(farmerId);

    // Settle wallets
    await dbManager.users.findByIdAndUpdate(buyerId, { walletBalance: buyer.walletBalance - totalCost });
    await dbManager.users.findByIdAndUpdate(farmerId, { walletBalance: farmer.walletBalance + totalCost });

    // Deduct stock
    const remainingQty = crop.quantity - buyQty;
    const newStatus = remainingQty === 0 ? 'sold' : 'available';
    await dbManager.crops.findByIdAndUpdate(cropId, { quantity: remainingQty, status: newStatus });

    // Generate Order
    const order = await dbManager.orders.create({
      buyer: buyerId,
      farmer: farmerId,
      crop: cropId,
      quantity: buyQty,
      totalAmount: totalCost,
      paymentStatus: 'paid',
      paymentId: `PAY-ESC-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      deliveryStatus: 'processing',
      logistics: {
        partnerName: 'AgriExpress Logistics',
        vehicleNumber: 'KA-19-MH-4220',
        driverName: 'Ramesh Kumar',
        driverPhone: '+91 98765 43210',
        estimatedDelivery: new Date(Date.now() + 3600000 * 24 * 3).toISOString()
      }
    });

    // Create Payment database log
    const payment = await dbManager.payments.create({
      buyer: buyerId,
      farmer: farmerId,
      order: order._id,
      amount: totalCost,
      paymentStatus: 'success',
      transactionId: order.paymentId
    });

    // Create Logistics timeline database log
    const logistics = await dbManager.logistics.create({
      order: order._id,
      driverName: 'Ramesh Kumar',
      driverPhone: '+91 98765 43210',
      vehicleNumber: 'KA-19-MH-4220',
      partnerName: 'AgriExpress Logistics',
      estimatedDelivery: new Date(Date.now() + 3600000 * 24 * 3).toISOString(),
      status: 'assigned',
      timeline: [
        { status: 'assigned', description: 'Logistics cargo driver assigned.', timestamp: new Date().toISOString() }
      ]
    });

    // Send notifications to buyer and farmer
    await createNotification(
      buyerId,
      'Order Confirmed & Escrow Settled',
      `Your escrow payment of ₹${totalCost.toLocaleString()} was successful! Driver assigned.`,
      'order',
      order._id
    );

    await createNotification(
      farmerId,
      'New Bulk Order Paid',
      `Buyer ${buyer.name} bought ${buyQty} Quintals of ${crop.name}. ₹${totalCost.toLocaleString()} credited.`,
      'order',
      order._id
    );

    res.status(201).json({
      message: 'Escrow payment processed successfully',
      payment,
      order,
      logistics
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { chargePayment };
