const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connessione al Database MongoDB
mongoose.connect(process.env.MONGODB_URI) 
   .then(() => console.log('Connected to MongoDB'))
   .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.get('/test', (req, res) => {
   res.json({ message: 'Server connesso' });
}) 

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
   console.log(`Server is running on port ${PORT}`);
});