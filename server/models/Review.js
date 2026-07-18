const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  crop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop',
    required: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  buyerName: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  sentiment: {
    type: String,
    enum: ['Good', 'Average', 'Bad'],
    required: true
  },
  comment: {
    type: String,
    required: true
  },
  recommend: {
    type: Boolean,
    default: true
  },
  images: [{
    type: String
  }],
  purchaseDate: {
    type: Date,
    required: true
  },
  likes: [{
    type: String // user ids who liked
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.Review || mongoose.model('Review', ReviewSchema);
