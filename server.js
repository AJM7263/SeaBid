const express = require('express'); //Express framework to create the server and handle routes
const app = express(); //initialize the app
const path = require('path'); //Allows working with file a directory paths
const methodOverride = require('method-override'); //Allows the use of PUT and DELETE in forms
const session = require('express-session'); //Manager of user sessions
const productsRoute = require('./routes/products'); //Route for products
const ordersRoute = require('./routes/orders'); //Route for orders
const authRoute = require('./routes/auth'); //Route for authentication
const userRoutes = require('./routes/user'); // Import the user routes
const db = require('./db'); // Ensure this is imported if not already

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method')); 
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(session({
    secret: 'your-secret-key', // Replace with a strong secret key
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if using HTTPS
}));

app.use(methodOverride((req, res) => {
    if (req.body && req.body._method) {
        console.log(`Original method: ${req.method}, _method: ${req.body._method}`);
        return req.body._method; // Override the method
    }
}));

// Routes
app.use('/user', userRoutes); 
app.use('/products', productsRoute);
app.use('/orders', ordersRoute);
app.use('/auth', authRoute);

// Render products.ejs as the default page
app.get('/', async (req, res) => {
    try {
        // Fetch products from the database
        const [products] = await db.query('SELECT * FROM Product WHERE RestaurantID IS NULL');
        res.render('products', { products }); // Render the products.ejs template with the fetched products
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).send('Failed to load products.');
    }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});