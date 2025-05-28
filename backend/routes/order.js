const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Cart = require('../models/cart');
const auth = require('../middleware/auth');

// POST - Crea ordine dal carrello
router.post('/checkout', auth, async (req, res) => {
    try {
        // Trova il carrello dell'utente
        const cart = await Cart.findOne({ user: req.user.userId })
            .populate('items.vinyl');

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Carrello vuoto' });
        }

        // Crea nuovo ordine
        const order = new Order({
            user: req.user.userId,
            items: cart.items.map(item => ({
                vinyl: item.vinyl._id,
                quantity: item.quantity,
                price: item.vinyl.price
            })),
            totalAmount: cart.items.reduce((total, item) => 
                total + (item.vinyl.price * item.quantity), 0),
            shippingAddress: req.body.shippingAddress
        });

        await order.save();

        // Svuota il carrello
        cart.items = [];
        cart.totalAmount = 0;
        await cart.save();

        // Popola i dettagli dell'ordine
        await order.populate('items.vinyl');

        res.status(201).json({
            message: 'Ordine creato con successo',
            order
        });
    } catch (error) {
        console.error('Checkout error:', error);
        res.status(500).json({ message: error.message });
    }
});

// GET - Lista ordini utente
router.get('/history', auth, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.userId })
            .populate('items.vinyl')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET - Dettaglio ordine
router.get('/:orderId', auth, async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.orderId,
            user: req.user.userId
        }).populate('items.vinyl');

        if (!order) {
            return res.status(404).json({ message: 'Ordine non trovato' });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;