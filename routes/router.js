const express = require('express');
const router = express.Router();
const main = require("../controller/mainController");

// Route to render the index page
router.get('/', main.index);

// Route to handle file uploads
router.post('/save', main.save);

// Route to display saved music entries (not used anymore)
router.get('/saved', main.saved);
router.get('/song/:id', main.getSongById);

// Route to handle editing a song
router.get('/edit/:id', main.edit); // Get the edit form
router.post('/remove/:id', main.remove); // Handle removal

// router.post('/save-edit/:id', main.saveEdit);


module.exports = router;
