const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vinyl: {
    type: String,  // Changed from ObjectId to String for Discogs IDs
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Remove any pre-save hooks that might be trying to validate the vinyl ID
commentSchema.pre('save', function(next) {
  // Add any other validations here if needed
  next();
});

module.exports = mongoose.model('Comment', commentSchema);