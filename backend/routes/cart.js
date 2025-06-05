const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const auth = require('../middleware/auth');

// GET - Ottieni carrello utente
router.get('/', auth, async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user.userId })
            .populate('items.vinyl');
        
        if (!cart) {
            cart = new Cart({ user: req.user.userId, items: [] });
            await cart.save();
        }

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST - Aggiungi al carrello
router.post('/add', auth, async (req, res) => {
    try {
        const { vinylId, quantity = 1 } = req.body;
        let cart = await Cart.findOne({ user: req.user.userId });

        if (!cart) {
            cart = new Cart({ user: req.user.userId, items: [] });
        }

        const itemIndex = cart.items.findIndex(item => 
            item.vinyl.toString() === vinylId
        );

        if (itemIndex > -1) {
            // Aggiorna quantità se il vinile è già nel carrello
            cart.items[itemIndex].quantity += quantity;
        } else {
            // Aggiungi nuovo item
            cart.items.push({ vinyl: vinylId, quantity });
        }

        await cart.save();
        await cart.populate('items.vinyl');

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE - Rimuovi dal carrello
router.delete('/remove/:vinylId', auth, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.userId });
        
        if (!cart) {
            return res.status(404).json({ message: 'Carrello non trovato' });
        }

        cart.items = cart.items.filter(item => 
            item.vinyl.toString() !== req.params.vinylId
        );

        await cart.save();
        await cart.populate('items.vinyl');

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;