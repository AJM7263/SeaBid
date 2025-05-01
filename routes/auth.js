const express = require('express');
const router = express.Router();
const db = require('../db'); // Import the database connection
const path = require('path'); // Import path module
const bcrypt = require('bcryptjs'); // Import bcrypt for password hashing

// Serve the login page
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html')); // Serve the login.html file
});

// Login route
router.post('/login', async (req, res) => {
    const { username, password, userType } = req.body;

    try {
        if (userType === 'fisher') {
            // Check if the user exists in the fisher table
            const [fisher] = await db.query('SELECT * FROM fisher WHERE Nombre = ?', [username]);
            if (fisher.length > 0) {
                const isMatch = await bcrypt.compare(password, fisher[0].Password);
                if (isMatch) {
                    req.session.userId = fisher[0].FisherID; // Set userId
                    req.session.userType = 'fisher'; // Set userType to 'fisher'
                    console.log('Logged in as fisher:', req.session);
                    return res.redirect('/products');
                }
            }
        } else if (userType === 'restaurant') {
            // Check if the user exists in the restaurant table
            const [restaurant] = await db.query('SELECT * FROM restaurant WHERE Nombre = ?', [username]);
            if (restaurant.length > 0) {
                const isMatch = await bcrypt.compare(password, restaurant[0].Password);
                if (isMatch) {
                    req.session.userId = restaurant[0].RestaurantID; // Set userId
                    req.session.userType = 'restaurant'; // Set userType to 'restaurant'
                    console.log('Logged in as restaurant:', req.session);
                    return res.redirect('/products');
                }
            }
        }

        // If no match is found
        res.status(401).send('Invalid username or password.');
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).send('Server error.');
    }
});

// Register route
router.post('/register', async (req, res) => {
    const { username, password, email, numeroTelefono, localizacion, userType } = req.body;

    if (!username || !password || !email || !userType) {
        return res.status(400).json({ message: 'Username, password, email, and user type are required.' });
    }

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        let query;
        if (userType === 'fisher') {
            query = 'INSERT INTO Fisher (Nombre, Password, Email, NumeroTelefono, Localizacion) VALUES (?, ?, ?, ?, ?)';
        } else if (userType === 'restaurant') {
            query = 'INSERT INTO Restaurant (Nombre, Password, Email, NumeroTelefono, Localizacion) VALUES (?, ?, ?, ?, ?)';
        } else {
            return res.status(400).send('Invalid user type.');
        }

        // Save the user to the database
        await db.query(query, [username, hashedPassword, email, numeroTelefono, localizacion]);
        console.log(`${userType} registered successfully: ${username}, ${email}`);
        res.redirect('/auth/login'); // Redirect to the login page
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});


router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Failed to log out.');
        }
        res.redirect('/auth/login'); // Redirect to the login page after logout
    });
});
module.exports = router;