const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const auth = require('../middleware/auth');

// Rotta pubblica - Ottenere i commenti di un vinile
router.get('/vinyl/:id', async (req, res) => {
  try {
    const comments = await Comment.find({ vinyl: req.params.id })
      .populate('user', 'username')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    console.error('Errore nel recupero commenti:', error);
    res.status(500).json({ message: 'Errore nel recupero dei commenti' });
  }
});

// Rotte protette - Richiedono autenticazione
router.post('/', auth, async (req, res) => {
  try {
    const { vinylId, text, rating } = req.body;

    const comment = new Comment({
      user: req.user.id,
      vinyl: vinylId.toString(), 
      text,
      rating: rating || 5
    });

    const savedComment = await comment.save();
    const populatedComment = await Comment.findById(savedComment._id)
      .populate('user', 'username');

    res.status(201).json(populatedComment);
  } catch (error) {
    console.error('Errore completo:', error);
    res.status(500).json({ 
      message: 'Errore aggiunta commento',
      error: error.message
    });
  }
});

// Modifica commento - solo proprietario
router.put('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findOne({ 
      _id: req.params.id,
      user: req.user.id 
    });
    
    if (!comment) {
      return res.status(404).json({ message: 'Commento non trovato o non autorizzato' });
    }

    comment.text = req.body.text; // <-- Cambiato da content a text
    if (req.body.rating) comment.rating = req.body.rating;
    
    await comment.save();

    // Popola l'utente prima di inviare la risposta
    const updatedComment = await Comment.findById(comment._id)
      .populate('user', 'username');
    
    res.json(updatedComment);
  } catch (error) {
    console.error('Errore modifica commento:', error);
    res.status(500).json({ message: 'Errore modifica commento' });
  }
});

// Elimina commento - solo proprietario
router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findOneAndDelete({ 
      _id: req.params.id,
      user: req.user.id 
    });
    
    if (!comment) {
      return res.status(404).json({ message: 'Commento non trovato o non autorizzato' });
    }

    res.json({ message: 'Commento eliminato con successo' });
  } catch (error) {
    res.status(500).json({ message: 'Errore eliminazione commento' });
  }
});

module.exports = router;