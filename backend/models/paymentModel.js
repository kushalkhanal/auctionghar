

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
    index: true, // Index for faster lookups
  },
  pidx: {
    type: String,
    unique: true,
    sparse: true, // Sparse index allows null/undefined values for eSewa payments
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending',
    index: true, // Index for status queries
  },
  failureReason: {
    type: String,
    default: null,
  },
  failureDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },

  // Security enhancements
  encryptedDetails: {
    type: String, // Encrypted payment metadata
    default: null,
  },

  ipAddress: {
    type: String,
    required: true,
    index: true, // Index for IP-based queries
  },

  userAgent: {
    type: String,
    default: null,
  },

  verificationAttempts: {
    type: Number,
    default: 0,
  },

  lastVerificationAttempt: {
    type: Date,
    default: null,
  },

  fraudScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },

  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low',
  },

  securityFlags: [{
    type: String,
    enum: [
      'suspicious_ip',
      'high_velocity',
      'unusual_amount',
      'duplicate_attempt',
      'first_transaction',
      'multiple_failed_attempts',
      'high_value_transaction'
    ]
  }],
}, { timestamps: true });

// Compound indexes for efficient queries
paymentSchema.index({ userId: 1, status: 1, createdAt: -1 });
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ fraudScore: -1, createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);