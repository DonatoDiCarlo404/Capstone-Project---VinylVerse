const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Importazione dei modelli
require('./models/artist');
require('./models/vinyl');
require('./models/user');
require('./models/comment');
require('./models/order');
require('./models/cart');

// Error Middleware
const errorHandler = require('./middleware/error');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Importazione delle rotte
const authRoutes = require('./routes/auth');
const vinylRoutes = require('./routes/vinyl');
const artistRoutes = require('./routes/artist');
const commentRoutes = require('./routes/comment');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/order');


// Rotte
app.use('/api/auth', authRoutes);
app.use('/api/vinyls', vinylRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Middleware per la gestione degli errori
app.use(errorHandler);

// Connessione MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connesso a MongoDB'))
  .catch(err => console.error('Errore connessione MongoDB:', err));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server attivo sulla porta ${PORT}`);
});