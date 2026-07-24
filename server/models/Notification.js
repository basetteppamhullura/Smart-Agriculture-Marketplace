const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  msg: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['negotiation', 'auction', 'order', 'system', 'price_alert'],
    required: true
  },
  relatedId: {
    type: String,
    default: ''
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
