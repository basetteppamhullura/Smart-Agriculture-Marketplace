const dbManager = require('../utils/dbManager');
const { createNotification } = require('../utils/notificationHelper');
const socketManager = require('../utils/socketManager');

// @desc    Get active shipments
// @route   GET /api/logistics/shipments
// @access  Private
const getShipments = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const role = req.user.role;

    const query = {};
    const shipments = await dbManager.logistics.find(query);

    // Filter shipments where order belongs to participant
    const filtered = shipments.filter(ship => {
      if (!ship.order) return false;
      const buyerId = ship.order.buyer ? ship.order.buyer.toString() : '';
      const farmerId = ship.order.farmer ? ship.order.farmer.toString() : '';
      return role === 'buyer' ? buyerId === userId : farmerId === userId;
    });

    res.json(filtered);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update logistics status (Dispatched -> In-Transit -> Delivered)
// @route   PUT /api/logistics/:id/status
// @access  Private/Farmer
const updateShipmentStatus = async (req, res) => {
  const { status, description } = req.body;
  if (!status) return res.status(400).json({ message: 'Logistics status required' });

  try {
    const shipment = await dbManager.logistics.findById(req.params.id);
    if (!shipment) return res.status(404).json({ message: 'Logistics shipment not found' });

    const updated = await dbManager.logistics.findByIdAndUpdate(req.params.id, {
      status,
      $push: {
        timeline: {
          status,
          description: description || `Logistics status updated to ${status}.`,
          timestamp: new Date().toISOString()
        }
      }
    });

    // Also update associated order deliveryStatus
    if (shipment.order) {
      const orderId = shipment.order._id ? shipment.order._id.toString() : shipment.order.toString();
      await dbManager.orders.findByIdAndUpdate(orderId, {
        deliveryStatus: status
      });

      // Notify Buyer of shipment updates
      const orderDetail = await dbManager.orders.findById(orderId);
      const buyerId = orderDetail.buyer._id ? orderDetail.buyer._id.toString() : orderDetail.buyer.toString();
      
      await createNotification(
        buyerId,
        'Logistics Timeline Update',
        `Your crop shipment is now: ${status.toUpperCase()}.`,
        'order',
        orderId
      );
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getShipments,
  updateShipmentStatus
};
