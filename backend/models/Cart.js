const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    vinyl: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vinyl',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 604800 // il carrello scade dopo 7 giorni di inattività
  }
});

// Metodo per calcolare il totale del carrello
cartSchema.methods.calculateTotal = async function() {
  let total = 0;
  await this.populate('items.vinyl');
  
  for (const item of this.items) {
    total += item.vinyl.price * item.quantity;
  }
  
  return total;
};

// Metodo per aggiungere un vinile al carrello
cartSchema.methods.addItem = function(vinylId, quantity = 1) {
  const existingItem = this.items.find(item => 
    item.vinyl.toString() === vinylId.toString()
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.items.push({ vinyl: vinylId, quantity });
  }
};

// Metodo per rimuovere un vinile dal carrello
cartSchema.methods.removeItem = function(vinylId) {
  this.items = this.items.filter(item => 
    item.vinyl.toString() !== vinylId.toString()
  );
};

module.exports = mongoose.model('Cart', cartSchema);