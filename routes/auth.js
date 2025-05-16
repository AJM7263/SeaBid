const express = require('express');
const router = express.Router();
const db = require('../db'); // Import the database connection
const path = require('path'); // Import path module
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing

// GET /login route
router.get('/login', (req, res) => {
    res.render('login', { message: null }); // Pass null for message by default
});

// POST /login route
router.post('/login', async (req, res) => {
    const { username, password, userType } = req.body;

    console.log('Login attempt:', { username, userType });

    try {
        let user;
        if (userType === 'Fisher') {
            [user] = await db.query('SELECT * FROM Fisher WHERE Nombre = ?', [username]);
        } else if (userType === 'Restaurant') {
            [user] = await db.query('SELECT * FROM Restaurant WHERE Nombre = ?', [username]);
        } else {
            console.log('Invalid user type selected.');
            return res.render('login', { message: 'Invalid user type selected.' });
        }

        console.log('User found:', user);

        if (user.length > 0) {
            const isMatch = await bcrypt.compare(password, user[0].Password);
            console.log('Password match:', isMatch);

            if (isMatch) {
                req.session.userId = user[0].FisherID || user[0].RestaurantID;
                req.session.userType = userType.toLowerCase();
                console.log('Login successful. Redirecting...');
                return res.redirect('/');
            }
        }

        console.log('Invalid username or password.');
        res.render('login', { message: 'Invalid username or password.' });
    } catch (err) {
        console.error('Error during login:', err);
        res.render('login', { message: 'Server error. Please try again later.' });
    }
});

router.get('/register', (req, res) => {
    const isLoggedIn = !!req.session.userId; 
    res.render('register', { isLoggedIn }); 
});

router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/register.ejs')); 
});

// Register route
router.post('/register', async (req, res) => {
    const { username, password, email, numeroTelefono, localizacion, userType } = req.body;

    if (!username || !password || !email || !userType) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        let query;
        if (userType === 'Fisher') {
            query = 'INSERT INTO Fisher (Nombre, Password, Email, NumeroTelefono, Localizacion) VALUES (?, ?, ?, ?, ?)';
        } else if (userType === 'Restaurant') {
            query = 'INSERT INTO Restaurant (Nombre, Password, Email, NumeroTelefono, Localizacion) VALUES (?, ?, ?, ?, ?)';
        } else {
            return res.status(400).json({ success: false, message: 'Invalid user type.' });
        }

        await db.query(query, [username, hashedPassword, email, numeroTelefono, localizacion]);
        res.json({ success: true, message: 'Registration successful!' });
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
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