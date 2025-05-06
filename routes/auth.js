const express = require('express');
const router = express.Router();
const db = require('../db'); // Import the database connection
const path = require('path'); // Import path module
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing

// Serve the login page
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html')); 
});

// Login route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        console.log('Login attempt:', { username, password }); 

        // Check if the user exists in fisher_users
        const [fisher] = await db.query('SELECT * FROM fisher WHERE Nombre = ?', [username]);
        console.log('Database result (fisher):', fisher);

        if (fisher.length > 0) {
            const isMatch = await bcrypt.compare(password, fisher[0].Password);
            console.log('Password match (fisher):', isMatch); 
            if (isMatch) {
                req.session.userId = fisher[0].FisherID;
                req.session.userType = 'fisher';
                return res.redirect('/');
            }
        }

        // Check if the user exists in restaurant_users
        const [restaurant] = await db.query('SELECT * FROM restaurant WHERE Nombre = ?', [username]);
        console.log('Database result (restaurant):', restaurant);

        if (restaurant.length > 0) {
            const isMatch = await bcrypt.compare(password, restaurant[0].Password);
            console.log('Password match (restaurant):', isMatch);
            if (isMatch) {
                req.session.userId = restaurant[0].RestaurantID;
                req.session.userType = 'restaurant';
                return res.redirect('/');
            }
        }

        res.status(401).send('Invalid username or password.');
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).send('Server error.');
    }
});

router.get('/register', (req, res) => {
    const isLoggedIn = !!req.session.userId; 
    res.render('register', { isLoggedIn }); 
});

router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/register.html')); 
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
        res.redirect('/auth/login'); 
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
        res.redirect('/auth/login'); 
    });
});
module.exports = router;