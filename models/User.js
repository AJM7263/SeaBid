const db = require('../server');

const User = {
    findByUsernameAndPassword: (username, password, callback) => {
        const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
        db.query(query, [username, password], (err, results) => {
            if (err) {
                return callback(err, null);
            }
            if (results.length > 0) {
                return callback(null, results[0]);
            } else {
                return callback(null, null);
            }
        });
    }
};

module.exports = User;