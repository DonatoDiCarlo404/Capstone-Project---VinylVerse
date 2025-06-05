const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Comment = require('../models/Comment');
const auth = require('../middleware/auth'); 

// Registrazione
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Controlla se l'utente esiste già
    const userExists = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (userExists) {
      return res.status(400).json({ 
        message: 'Email o username già in uso' 
      });
    }

    // Hash della password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crea nuovo utente
    const user = new User({
      username,
      email,
      password: hashedPassword
    });

    await user.save();
    res.status(201).json({ message: 'Registrazione completata' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Trova l'utente
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Credenziali non valide' });
    }

    // Verifica password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Credenziali non valide' });
    }

    // Genera JWT token
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ 
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Profilo utente (protetto)
router.get('/profile', auth, async (req, res) => {
  try {
    // Qui implementeremo la protezione con middleware
    const user = await User.findById(req.user.userId)
      .select('-password')
      .populate('orderHistory.items.vinyl');
    
    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET - Recensioni utente
router.get('/profile/reviews', auth, async (req, res) => {
    try {
        const userReviews = await Comment.find({ user: req.user.userId })
            .populate('vinyl', 'title artist coverImage')
            .populate('user', 'username')
            .sort({ createdAt: -1 });

        const formattedReviews = userReviews.map(review => ({
            id: review._id,
            vinylTitle: review.vinyl.title,
            vinylArtist: review.vinyl.artist,
            vinylCover: review.vinyl.coverImage,
            rating: review.rating,
            comment: review.text,
            createdAt: review.createdAt
        }));

        res.json({
            count: formattedReviews.length,
            reviews: formattedReviews
        });
    } catch (error) {
        console.error('Get user reviews error:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;