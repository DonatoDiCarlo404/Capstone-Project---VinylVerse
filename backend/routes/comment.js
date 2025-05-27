const express = require('express');
const router = express.Router();
const Comment = require('../models/comment');
const auth = require('../middleware/auth');

// POST - Aggiungi commento a un vinile
router.post('/:vinylId', auth, async (req, res) => {
    try {
        const comment = new Comment({
            user: req.user.userId,
            vinyl: req.params.vinylId,
            text: req.body.text,
            rating: req.body.rating
        });

        await comment.save();

        // Popola i dati utente nel commento per la risposta
        await comment.populate('user', 'username');

        res.status(201).json(comment);
    } catch (error) {
        console.error('Comment error:', error);
        res.status(500).json({ message: error.message });
    }
});

// GET - Ottieni commenti per un vinile specifico
router.get('/vinyl/:vinylId', async (req, res) => {
    try {
        const comments = await Comment.find({ vinyl: req.params.vinylId })
            .populate('user', 'username')
            .sort({ createdAt: -1 });

        res.json(comments);
    } catch (error) {
        console.error('Get comments error:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;