const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost', // Replace with your database host
    user: 'root',      // Replace with your database username
    password: 'password',      // Replace with your database password
    database: 'FisherRestaurantDB', // Replace with your database name
});

module.exports = pool;