const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  crop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop',
    required: true
  },
  asker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  askerName: {
    type: String,
    required: true
  },
  questionText: {
    type: String,
    required: true
  },
  answers: [{
    responder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    responderName: {
      type: String
    },
    answerText: {
      type: String
    },
    isVerifiedBuyer: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.Question || mongoose.model('Question', QuestionSchema);
