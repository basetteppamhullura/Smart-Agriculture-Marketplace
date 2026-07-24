const mongoose = require('mongoose');

const LogisticsSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  driverName: {
    type: String,
    required: true
  },
  driverPhone: {
    type: String,
    required: true
  },
  vehicleNumber: {
    type: String,
    required: true
  },
  partnerName: {
    type: String,
    required: true
  },
  estimatedDelivery: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['assigned', 'dispatched', 'in-transit', 'delivered'],
    default: 'assigned'
  },
  timeline: [
    {
      status: {
        type: String,
        required: true
      },
      description: {
        type: String,
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.Logistics || mongoose.model('Logistics', LogisticsSchema);
