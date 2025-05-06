const express = require('express');
const router = express.Router();
const db = require('../db'); 

function isAuthenticated(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    }
    res.status(401).send('You must be logged in to access this resource.');
}

router.post('/', isAuthenticated, async (req, res) => {
    const { product_id } = req.body;

    if (!req.session || !req.session.userId) {
        return res.status(401).send('You must be logged in to place an order.');
    }

    const userId = req.session.userId;
    const userType = req.session.userType; 

    if (userType !== 'restaurant') {
        return res.status(403).send('Only restaurants can place orders.');
    }

    if (!product_id) {
        return res.status(400).send('Product ID is required.');
    }

    try {
        const productQuery = 'SELECT * FROM Product WHERE ProductID = ? AND RestaurantID IS NULL';
        const [products] = await db.query(productQuery, [product_id]);

        if (products.length === 0) {
            return res.status(404).send('Product not found or already ordered.');
        }

        // Generate a shorter OrderID (timestamp in seconds)
        const orderId = Math.floor(Date.now() / 1000);
        const updateProductQuery = 'UPDATE Product SET OrderID = ?, RestaurantID = ? WHERE ProductID = ?';
        await db.query(updateProductQuery, [orderId, userId, product_id]);
        console.log(`Product ID ${product_id} assigned to Restaurant ID ${userId} with Order ID ${orderId}.`);

        res.redirect('/products');
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send('Failed to place order.');
    }
});

module.exports = router;