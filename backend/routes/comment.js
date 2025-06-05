const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
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

// PUT - Aggiorna/Modifica un commento
router.put('/:commentId', auth, async (req, res) => {
    try {
        const comment = await Comment.findOne({
            _id: req.params.commentId,
            user: req.user.userId
        });

        if (!comment) {
            return res.status(404).json({ 
                message: 'Commento non trovato o non autorizzato alla modifica' 
            });
        }

        // Aggiorna solo i campi forniti
        if (req.body.text) comment.text = req.body.text;
        if (req.body.rating) comment.rating = req.body.rating;

        await comment.save();
        await comment.populate('user', 'username');

        res.json(comment);
    } catch (error) {
        console.error('Update comment error:', error);
        res.status(500).json({ message: error.message });
    }
});

// DELETE - Rimuovi un commento
router.delete('/:commentId', auth, async (req, res) => {
    try {
        const comment = await Comment.findOne({
            _id: req.params.commentId,
            user: req.user.userId
        });

        if (!comment) {
            return res.status(404).json({ 
                message: 'Commento non trovato o non autorizzato alla cancellazione' 
            });
        }

        await comment.deleteOne();

        res.json({ message: 'Commento eliminato con successo' });

    } catch (error) {
        console.log('Delete comment error:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;