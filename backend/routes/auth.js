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

    // Verifica se l'utente esiste già
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'Username o email già in uso'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crea nuovo utente
    const user = new User({
      username,
      email,
      password: hashedPassword
    });

    await user.save();

    // Genera token
    const token = jwt.sign(
      {
        id: user._id.toString(),
        username: user.username
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Utente registrato con successo',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    res.status(500).json({
      message: 'Errore durante la registrazione',
      error: error.message
    });
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
      {
        id: user._id.toString(),
        username: user.username
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Debug log
    console.log('Token generato per:', {
      id: user._id.toString(),
      username: user.username
    });

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
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate({
        path: 'orderHistory',
        populate: {
          path: 'items.vinyl',
          select: 'title artist imageUrl'
        }
      });

    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    const reviews = await Comment.find({ user: req.user.id });
    
    const populatedReviews = await Promise.all(reviews.map(async (review) => {
      try {
        const vinylResponse = await fetch(`http://localhost:3001/api/vinyl/${review.vinyl}`);
        if (!vinylResponse.ok) {
          throw new Error('Vinyl data not found');
        }
        
        const vinylData = await vinylResponse.json();
        console.log('Vinyl data fetched:', vinylData); // Debug log
        
        return {
          id: review._id,
          vinylTitle: vinylData.title || 'Vinile non disponibile',
          vinylArtist: vinylData.artists?.[0]?.name || vinylData.artist || 'Artista non disponibile', // Check both paths
          text: review.text,
          rating: review.rating,
          createdAt: review.createdAt
        };
      } catch (error) {
        console.error('Error fetching vinyl data:', error);
        return {
          id: review._id,
          vinylTitle: 'Vinile non disponibile',
          vinylArtist: 'Artista non disponibile',
          text: review.text,
          rating: review.rating,
          createdAt: review.createdAt
        };
      }
    }));

    // Debug log
    console.log('Populated reviews:', populatedReviews);

    res.json({
      profile: {
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        orderHistory: user.orderHistory || []
      },
      reviews: populatedReviews
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Errore del server' });
  }
});

module.exports = router;