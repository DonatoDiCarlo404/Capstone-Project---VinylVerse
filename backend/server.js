const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Importazione dei modelli
require('./models/User');
require('./models/Vinyl');
require('./models/Artist');
require('./models/Comment');
require('./models/Order');
require('./models/Cart');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Importazione delle rotte
const authRoutes = require('./routes/auth');
const vinylRoutes = require('./routes/vinyl');

// Rotte
app.use('/api/auth', authRoutes);
app.use('/api/vinyls', vinylRoutes);

// Connessione MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connesso a MongoDB'))
  .catch(err => console.error('Errore connessione MongoDB:', err));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server attivo sulla porta ${PORT}`);
});