const db = require('../config/db'); // Ensure this is your database connection file

const product = {
    create: (data, callback) => {
        const sql = `INSERT INTO music_player (title, artist, pictures, music_path, lyrics) VALUES (?, ?, ?, ?, ?)`;
        const values = [data.title, data.artist, data.pictures, data.music, data.lyrics];
        db.query(sql, values, callback);
    },

    findByTitle: (title, callback) => {
        const sql = `SELECT * FROM music_player WHERE title = ?`;
        db.query(sql, [title], callback);
    },

    findAll: () => {
        const sql = `SELECT * FROM music_player`;
        return new Promise((resolve, reject) => {
            db.query(sql, (err, results) => {
                if (err) {
                    return reject(err);
                }
                resolve(results);
            });
        });
    },
    findById: (id) => {
        const sql = `SELECT * FROM music_player WHERE id = ?`;
        return new Promise((resolve, reject) => {
            db.query(sql, [id], (err, result) => {
                if (err) {
                    return reject(err);
                }
                if (result.length === 0) {
                    return reject(new Error('No song found'));
                }
                resolve(result[0]); // Return the first result (since id is unique)
            });
        });
    }
    
};

module.exports = product;
