const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  duration: {
    type: String
  },
  position: {
    type: String
  }
});

const vinylSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  artist: {
    type: String,
    required: true,
    trim: true
  },
  genre: {
    type: [String],
    required: true
  },
  tracks: [trackSchema],
  price: {
    type: Number,
    required: true,
    min: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  coverImage: {
    type: String
  },
  releaseYear: {
    type: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Metodo per calcolare il rating medio
vinylSchema.methods.calculateAverageRating = function() {
  if (this.ratings.length === 0) return 0;
  
  const sum = this.ratings.reduce((acc, curr) => acc + curr.rating, 0);
  this.averageRating = sum / this.ratings.length;
  return this.averageRating;
};

module.exports = mongoose.model('Vinyl', vinylSchema);