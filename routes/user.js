const express = require('express');
const bcrypt = require('bcrypt'); // For password hashing
const db = require('../db'); // Adjust the path to your database configuration
const router = express.Router();

// Profile route
router.get('/profile', async (req, res) => {
    const userId = req.session.userId;
    const userType = req.session.userType;

    if (!userId || !userType) {
        return res.redirect('/auth/login'); 
    }

    try {
        let userQuery, historyQuery, user, history;

        if (userType === 'fisher') {
            // Fetch fisher information
            userQuery = `
                SELECT 
                    FisherID AS id, 
                    Nombre AS username, 
                    Email AS email, 
                    NumeroTelefono AS phone, 
                    Localizacion AS location 
                FROM Fisher 
                WHERE FisherID = ?`;
            [user] = await db.query(userQuery, [userId]);

            // Fetch products listed by the fisher
            historyQuery = `
                SELECT 
                    ProductID, 
                    TipoDePescado, 
                    CAST(Precio AS DECIMAL(10, 2)) AS Precio, 
                    Fecha 
                FROM Product 
                WHERE FisherID = ? 
                ORDER BY Fecha DESC`;
            [history] = await db.query(historyQuery, [userId]);
        } else if (userType === 'restaurant') {
            // Fetch restaurant information
            userQuery = `
                SELECT 
                    RestaurantID AS id, 
                    Nombre AS username, 
                    Email AS email, 
                    NumeroTelefono AS phone, 
                    Localizacion AS location 
                FROM Restaurant 
                WHERE RestaurantID = ?`;
            [user] = await db.query(userQuery, [userId]);

            // Fetch products purchased by the restaurant
            historyQuery = `
                SELECT 
                    Product.TipoDePescado, 
                    CAST(Product.Precio AS DECIMAL(10, 2)) AS Precio, 
                    Product.Fecha AS PurchaseDate, 
                    Product.OrderID 
                FROM Product 
                WHERE Product.RestaurantID = ? 
                ORDER BY Product.Fecha DESC`;
            [history] = await db.query(historyQuery, [userId]);
        } else {
            return res.status(400).send('Invalid user type.');
        }

        if (user.length === 0) {
            return res.status(404).send('User not found.');
        }

        
        res.render('profile', { user: user[0], userType, history });
    } catch (err) {
        console.error('Error fetching profile data:', err);
        res.status(500).send('Failed to load profile.');
    }
});

// Change Username
router.post('/change-username', async (req, res) => {
    console.log('Session Data in /change-username:', req.session); // Log session data
    const { userId, userType } = req.session;
    const { username } = req.body;


    try {
        let query;
        if (userType === 'fisher') {
            query = 'UPDATE fisher SET Nombre = ? WHERE FisherID = ?';
        } else if (userType === 'restaurant') {
            query = 'UPDATE restaurant SET Nombre = ? WHERE FisherID = ?';
        } else {
            return res.status(400).send('Invalid user type.');
        }

        console.log('Query:', query);
        console.log('Parameters:', [username, userId]);

        await db.query(query, [username, userId]);
        res.status(200).send('Username updated successfully.');
    } catch (err) {
        console.error('Error updating username:', err);
        res.status(500).send('Failed to update username.');
    }
});

// Change Password
router.post('/change-password', async (req, res) => {
    const { userId, userType } = req.session;
    const { password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
        let query;
        if (userType === 'fisher') {
            query = 'UPDATE fisher SET password = ? WHERE FisherID = ?';
        } else if (userType === 'restaurant') {
            query = 'UPDATE restaurant SET password = ? WHERE FisherID = ?';
        } else {
            return res.status(400).send('Invalid user type.');
        }

        await db.query(query, [hashedPassword, userId]);
        res.status(200).send('Password updated successfully.');
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to update password.');
    }
});

// Delete Account
router.post('/delete-account', async (req, res) => {
    const { userId, userType } = req.session;

    try {
        let query;
        if (userType === 'fisher') {
            query = 'DELETE FROM fisher WHERE FisherID = ?';
        } else if (userType === 'restaurant') {
            query = 'DELETE FROM restaurant WHERE RestaurantID = ?';
        } else {
            return res.status(400).send('Invalid user type.');
        }

        // Delete the user from the database
        await db.query(query, [userId]);

        // Destroy the session and redirect to the products page
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                return res.status(500).send('Failed to log out.');
            }
            res.redirect('/products'); 
        });
    } catch (err) {
        console.error('Error deleting account:', err);
        res.status(500).send('Failed to delete account.');
    }
});

module.exports = router;