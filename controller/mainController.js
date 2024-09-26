// mainController.js
const product = require('../models/ProdModels');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/db'); // Include the correct DB configuration file

// Ensure the upload directories exist
const ensureDirExists = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

ensureDirExists('./uploads/pictures');
ensureDirExists('./uploads/music');

// Set up storage for file uploads using multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'pictures') {
            cb(null, './uploads/pictures');
        } else if (file.fieldname === 'music') {
            cb(null, './uploads/music');
        }
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

const main = {
    index: async (req, res) => {
        try {
            const allSongs = await product.findAll();
            res.render('index', { data: allSongs, currentSong: null, playlist: [] });
        } catch (err) {
            return res.status(500).send('Error retrieving data.');
        }
    },

    save: [
        upload.fields([{ name: 'pictures', maxCount: 1 }, { name: 'music', maxCount: 1 }]),
        async (req, res) => {
            const data = req.body;
            const songId = data.id;

            try {
                if (songId) {
                    const updatedData = {
                        title: data.title,
                        artist: data.artist,
                        lyrics: data.lyrics
                    };

                    const sql = 'UPDATE music_player SET title = ?, artist = ?, lyrics = ? WHERE id = ?';
                    const values = [updatedData.title, updatedData.artist, updatedData.lyrics, songId];

                    db.query(sql, values, (err) => {
                        if (err) {
                            console.error('Database update error:', err);
                            return res.status(500).send('Error updating the song.');
                        }
                        res.redirect('/');
                    });
                } else {
                    const pictureFilename = req.files.pictures ? path.basename(req.files.pictures[0].path) : null;
                    const musicFilename = req.files.music ? path.basename(req.files.music[0].path) : null;

                    data.pictures = pictureFilename;
                    data.music = musicFilename;

                    product.create(data, (err) => {
                        if (err) {
                            console.error('Database save error:', err);
                            return res.status(500).send('Error saving to database.');
                        }
                        res.redirect('/');
                    });
                }
            } catch (err) {
                console.error('Error processing request:', err);
                return res.status(500).send('Error processing request.');
            }
        }
    ],

    getSongById: async (req, res) => {
        const songId = req.params.id;

        try {
            const currentSong = await product.findById(songId);
            const allSongs = await product.findAll();
            const playlist = [currentSong];
            res.render('index', { data: allSongs, currentSong: currentSong, playlist: playlist });
        } catch (err) {
            return res.status(500).send('Error retrieving the song.');
        }
    },

    edit: async (req, res) => {
        const songId = req.params.id;

        try {
            const song = await product.findById(songId);
            res.render('edit', { song });
        } catch (err) {
            return res.status(500).send('Error retrieving the song.');
        }
    },

    update: [
        upload.fields([{ name: 'pictures', maxCount: 1 }, { name: 'music', maxCount: 1 }]),
        async (req, res) => {
            const songId = req.params.id;
            const data = req.body;
            try {
                const updatedData = {
                    title: data.title,
                    artist: data.artist,
                    lyrics: data.lyrics,
                    pictures: req.files.pictures ? path.basename(req.files.pictures[0].path) : data.oldPictures,
                    music: req.files.music ? path.basename(req.files.music[0].path) : data.oldMusic
                };

                const sql = 'UPDATE music_player SET title = ?, artist = ?, lyrics = ?, pictures = ?, music_path = ? WHERE id = ?';
                const values = [updatedData.title, updatedData.artist, updatedData.lyrics, updatedData.pictures, updatedData.music, songId];

                await new Promise((resolve, reject) => {
                    db.query(sql, values, (err) => {
                        if (err) return reject(err);
                        resolve();
                    });
                });

                res.redirect('/');
            } catch (err) {
                return res.status(500).send('Error updating the song.');
            }
        }
    ],

    remove: (req, res) => {
        const songId = req.params.id;
        const sql = 'DELETE FROM music_player WHERE id = ?';
        db.query(sql, [songId], (err) => {
            if (err) return res.status(500).send('Error removing the song.');
            res.redirect('/');
        });
    }
};

module.exports = main;
