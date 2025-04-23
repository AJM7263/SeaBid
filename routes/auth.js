const express = require('express');
const router = express.Router();
const db = require('../db'); // Import the database connection
const path = require('path'); // Import path module
const bcrypt = require('bcryptjs'); // Import bcrypt for password hashing
const { userInfo } = require('os');

// Serve the login page
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html')); // Serve the login.html file
});

// Login route
router.post('/login', async (req, res) => {
    const { username, password } = req.body; // Use username from the request body

    try {
        // Check if the user exists in fisher_users
        const [fisher] = await db.query('SELECT * FROM fisher WHERE Nombre = ?', [username]); // Use username here
        if (fisher.length > 0) {
            const isMatch = await bcrypt.compare(password, fisher[0].Password);
            if (isMatch) {
                req.session.userId = fisher[0].id; // Set userId
                req.session.userType = 'fisher'; // Set userType
                console.log('Session after login:', req.session); // Log session data
                return res.redirect('/products'); // Redirect to the products page after successful login
            }
        }

        // Check if the user exists in restaurant_users
        const [restaurant] = await db.query('SELECT * FROM restaurant WHERE Nombre = ?', [username]); // Use username here
        if (restaurant.length > 0) {
            const isMatch = await bcrypt.compare(password, restaurant[0].Password);
            if (isMatch) {
                req.session.userId = restaurant[0].id; // Set userId
                req.session.userType = 'restaurant'; // Set userType
                console.log('Session after login:', req.session); // Log session data
                return res.redirect('/products'); // Redirect to the products page after successful login
            }
        }

        res.status(401).send('Invalid username or password.');
    } catch (err) {
        console.error(err);
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
        if (userType === 'Fisher') {
            query = 'INSERT INTO Fisher (Nombre, Password, Email, NumeroTelefono, Localizacion) VALUES (?, ?, ?, ?, ?)';
        } else if (userType === 'Restaurant') {
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

module.exports = router;