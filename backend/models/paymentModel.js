

const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, 
  },

  paymentType: {
    type: String,
    required: true,
    default: 'wallet_load', 
  },

  amount: {
    type: Number,
    required: true,
  },
  transaction_uuid: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending',
  },
  failureReason: {
    type: String,
    default: null,
  },
  failureDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);