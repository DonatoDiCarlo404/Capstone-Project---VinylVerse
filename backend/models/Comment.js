const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vinyl: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vinyl',
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

// Middleware per aggiornare il rating medio del vinile dopo un nuovo commento
commentSchema.post('save', async function() {
  const Vinyl = mongoose.model('Vinyl');
  const vinyl = await Vinyl.findById(this.vinyl);
  if (vinyl) {
    await vinyl.calculateAverageRating();
    await vinyl.save();
  }
});

module.exports = mongoose.model('Comment', commentSchema);