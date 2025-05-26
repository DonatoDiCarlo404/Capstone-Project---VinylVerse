const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  biography: {
    type: String,
    trim: true
  },
  image: {
    type: String
  },
  discography: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vinyl'
  }],
  genres: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Metodo per aggiungere un vinile alla discografia
artistSchema.methods.addVinyl = function(vinylId) {
  if (!this.discography.includes(vinylId)) {
    this.discography.push(vinylId);
  }
};

module.exports = mongoose.model('Artist', artistSchema);