const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');

// Configure multer to save uploaded files to the "uploads" directory
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads')); // Save files to the "uploads" directory
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Use a unique filename
    }
});

const upload = multer({ storage });

function isAuthenticated(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    }
    res.status(401).send('You must be logged in to access this resource.');
}

// Fetch and display products
router.get('/', async (req, res) => {
    try {
        // Fetch only available products (RestaurantID is NULL)
        const query = 'SELECT * FROM Product WHERE RestaurantID IS NULL';
        const [products] = await db.query(query);
        res.render('products', { products }); // Render the products page with available products
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send('Failed to fetch products.');
    }
});

// Fetch a specific product by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params; // Extract the product ID from the URL

    try {
        // Fetch the product with the specified ID
        const query = 'SELECT * FROM Product WHERE ProductID = ?';
        const [products] = await db.query(query, [id]);

        if (products.length === 0) {
            return res.status(404).send('Product not found.');
        }

        const product = products[0]; // Get the first (and only) product
        res.render('product-details', { product }); // Render the product-details page with the product
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send('Failed to fetch product details.');
    }
});

// Add a new product with file upload
router.post('/', isAuthenticated, upload.single('image'), async (req, res) => {
    const { tipoDePescado, precio, descripcion, fecha, peso } = req.body;
    const image = req.file ? req.file.filename : null;

    // Retrieve fisherId from the session
    const fisherId = req.session.userId; // Assuming userId in the session corresponds to FisherID
    const userType = req.session.userType;

    // Ensure the logged-in user is a Fisher
    if (!fisherId || userType !== 'Fisher') {
        return res.status(403).send('Only fishers can add products.');
    }

    console.log('Request body:', req.body); // Log the request body
    console.log('Uploaded file:', req.file); // Log the uploaded file
    console.log('FisherID from session:', fisherId); // Log the FisherID from the session

    // Validate input
    if (!tipoDePescado || !precio || !descripcion || !fecha || !peso || !image) {
        return res.status(400).send('All fields are required.');
    }

    console.log('Received product data:', { tipoDePescado, precio, descripcion, fecha, peso, image, fisherId });

    // Save the product to the database
    const query = 'INSERT INTO Product (TipoDePescado, Precio, Descripcion, Fecha, Peso, Imagen, FisherID) VALUES (?, ?, ?, ?, ?, ?, ?)';
    try {
        const [results] = await db.execute(query, [tipoDePescado, precio, descripcion, fecha, peso, image, fisherId]);
        console.log('Product added successfully:', results);
        return res.redirect('/products'); // Redirect to the products page on success
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send('Failed to add product.');
    }
});

// DELETE route to delete a product
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`DELETE request received for product ID: ${req.params.id}`);

    try {
        // Execute DELETE query to remove the product from the database
        const [result] = await db.execute('DELETE FROM Product WHERE ProductID = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).send('Product not found.');
        }

        console.log(`Product with ID ${id} deleted successfully.`);
        res.redirect('/products'); // Redirect back to the products page
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send('Failed to delete product.');
    }
});

module.exports = router;