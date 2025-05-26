const mongoose = require('mongoose');

const orderHistorySchema = new mongoose.Schema({
  orderId: String,
  date: { type: Date, default: Date.now },
  items: [{
    vinyl: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vinyl'
    },
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  }
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  orderHistory: [orderHistorySchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);