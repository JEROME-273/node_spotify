const product = require('../models/ProdModels');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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
            cb(null, './uploads/pictures'); // Save pictures in the 'pictures' subfolder
        } else if (file.fieldname === 'music') {
            cb(null, './uploads/music'); // Save music in the 'music' subfolder
        }
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); // Generate a unique filename
    }
});

const upload = multer({ storage: storage });

const main = {
    index: async (req, res) => {
        try {
            // Fetch all entries from the database using the promise-based model
            const allSongs = await product.findAll(); // allSongs contains all the song data from the database
            
            // Render the index view with all saved entries and an empty playlist initially
            res.render('index', { data: allSongs, currentSong: null, playlist: [] });
        } catch (err) {
            return res.status(500).send("Error retrieving data.");
        }
    },

    save: [
        upload.fields([{ name: 'pictures', maxCount: 1 }, { name: 'music', maxCount: 1 }]),
        (req, res) => {
            if (!req.files || !req.files.pictures || !req.files.music) {
                return res.status(400).send("Pictures or music files were not uploaded correctly.");
            }

            const data = req.body;

            // Extract just the filenames
            const pictureFilename = path.basename(req.files.pictures[0].path);
            const musicFilename = path.basename(req.files.music[0].path);

            // Store filenames with the correct paths in data object
            data.pictures = pictureFilename; // Store only the filename
            data.music = musicFilename; // Store only the filename

            // Log the data being saved
            console.log("Data being saved:", data);

            // Save data to the database
            product.create(data, (err) => {
                if (err) {
                    return res.status(500).send("Error saving to database.");
                }
                
                // Redirect to the homepage after successful creation
                res.redirect('/');
            });
        }
    ],

    saved: (req, res) => {
        // Fetch all entries from the database
        product.findAll((err, results) => {
            if (err) {
                return res.status(500).send("Error retrieving data.");
            }
            // Render the save view with all saved entries
            res.render('save', { data: results });
        });
    },

    getSongById: async (req, res) => {
        const songId = req.params.id;
    
        try {
            // Fetch the specific song by id from the database
            const currentSong = await new Promise((resolve, reject) => {
                product.findById(songId, (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            });
    
            // Fetch all entries to keep the playlist updated
            const allSongs = await product.findAll();

            // Include the currently playing song in the playlist
            const playlist = [currentSong];

            // Render the index with the selected song and the playlist containing the current song
            res.render('index', { data: allSongs, currentSong: currentSong, playlist: playlist });
        } catch (err) {
            return res.status(500).send("Error retrieving the song.");
        }
    },

    remove: async (req, res) => {
        const songId = req.params.id;
    
        try {
            // Delete the song from the database
            await new Promise((resolve, reject) => {
                const sql = `DELETE FROM music_player WHERE id = ?`;
                    db.query(sql, [songId], (err) => {
                        if (err) return reject(err);
                        resolve();
                    });
            });
    
            // Redirect back to the index page after deletion
            res.redirect('/');
        } catch (err) {
            return res.status(500).send("Error deleting the song.");
        }
    },


    edit: async (req, res) => {
        const songId = req.params.id;
    
        try {
            const currentSong = await product.findById(songId);
            res.render('edit', { song: currentSong });
        } catch (err) {
            console.error(err); // Log the error for debugging
            return res.status(500).send("Error retrieving the song for editing.");
        }
    },
    

    saveEdit: [
        upload.fields([{ name: 'pictures', maxCount: 1 }, { name: 'music', maxCount: 1 }]),
        async (req, res) => {
            const songId = req.params.id;
            const data = req.body;
    
            try {
                const existingSong = await product.findById(songId); // Ensure the song exists
    
                // Update picture and music only if new files were uploaded
                data.pictures = req.files.pictures ? path.basename(req.files.pictures[0].path) : existingSong.pictures;
                data.music = req.files.music ? path.basename(req.files.music[0].path) : existingSong.music_path;
    
                const sql = `UPDATE music_player SET title = ?, artist = ?, pictures = ?, music_path = ?, lyrics = ? WHERE id = ?`;
                const values = [data.title, data.artist, data.pictures, data.music, data.lyrics, songId];
    
                await new Promise((resolve, reject) => {
                    db.query(sql, values, (err) => {
                        if (err) return reject(err); // Reject on error
                        resolve(); // Resolve if no error
                    });
                });
    
                res.redirect('/'); // Redirect after successful update
            } catch (err) {
                console.error(err); // Log the error for debugging
                return res.status(500).send("Error updating the song."); // Send error response
            }
        }
    ],
    
    

    
}

module.exports = main;
