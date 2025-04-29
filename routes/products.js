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
        const formattedProducts = products.map(product => {
            return {
                ...product,
                Fecha: product.Fecha ? product.Fecha.toISOString().split('T')[0] : null // Format Fecha to YYYY-MM-DD
            };
        });
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
    const fisherId = req.session.userId;
    const userType = req.session.userType;

    //Console log test
    console.log('Session data:', req.session);
    console.log('Fisher ID:', fisherId); 
    console.log('User Type:', userType);
    // Check if the user is a fisher
    if (!fisherId || userType !== 'fisher') {
        return res.status(403).send('Only fishers can add products.');
    }

    try {
        const { TipoDePescado, Precio, Descripcion, Peso, Fecha } = req.body; 
        const Imagen = req.file ? req.file.filename : null;

        console.log('Request body:', req.body); // Debugging form data
        console.log('Uploaded file:', req.file); // Debugging uploaded file

        // Validate input
        if (!TipoDePescado || !Precio || !Descripcion || !Peso || !Fecha || !Imagen) {
            return res.status(400).send('All fields are required.');
        }

        const query = `
            INSERT INTO Product (FisherID, TipoDePescado, Precio, Descripcion, Peso, Imagen, Fecha)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        await db.query(query, [fisherId, TipoDePescado, Precio, Descripcion, Peso, Imagen, Fecha]);

        console.log('Product added successfully!'); //Console log test
        res.redirect('/products');
    } catch (err) {
        console.error('Error adding product:', err);
        res.status(500).send('Failed to add product.');
    }
});

// DELETE route to delete a product
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`DELETE request received for product ID: ${req.params.id}`); //TESTS

    try {
        const [result] = await db.execute('DELETE FROM Product WHERE ProductID = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).send('Product not found.');
        }

        console.log(`Product with ID ${id} deleted successfully.`); //Console log test
        res.redirect('/products'); 
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send('Failed to delete product.');
    }
});


module.exports = router;