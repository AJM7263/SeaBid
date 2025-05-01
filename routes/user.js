const express = require('express');
const bcrypt = require('bcrypt'); // For password hashing
const db = require('../db'); // Adjust the path to your database configuration
const router = express.Router();

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

    console.log('Session data:', req.session); // Log session data
    console.log('User ID:', userId); // Log userId
    console.log('User Type:', userType); // Log userType

    try {
        let query;
        const normalizedUserType = userType.toLowerCase(); // Normalize userType to lowercase

        if (normalizedUserType === 'fisher') {
            query = 'DELETE FROM fisher WHERE FisherID = ?';
        } else if (normalizedUserType === 'restaurant') {
            query = 'DELETE FROM restaurant WHERE RestaurantID = ?';
        } else {
            console.log('Invalid user type:', userType);
            return res.status(400).send('Invalid user type.');
        }

        console.log('Executing query:', query); // Log the query
        console.log('Query parameters:', [userId]); // Log the query parameters

        const [result] = await db.query(query, [userId]);

        console.log('Query result:', result); // Log the result of the query

        if (result.affectedRows === 0) {
            console.log('No rows affected. User not found.');
            return res.status(404).send('User not found.');
        }

        res.redirect('/auth/login'); // Destroy the session after deleting the account
        res.status(200).send('Account deleted successfully.');
    } catch (err) {
        console.error('Error deleting account:', err);
        res.status(500).send('Failed to delete account.');
    }
});

module.exports = router;