// router.js
const express = require('express');
const router = express.Router();
const main = require('../controller/mainController');

// Route to render the index page
router.get('/', main.index);

// Route to handle file uploads and editing
router.post('/save', main.save);
router.post('/save-edit/:id', main.update); // Update song with new route

// Route to display saved music entries
router.get('/song/:id', main.getSongById);

// Route to handle editing a song
router.get('/edit/:id', main.edit); // Get the edit form
router.post('/remove/:id', main.remove); // Handle removal

module.exports = router;
