// create web server
const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Load comments from file
function loadComments() {
    try {
        const data = fs.readFileSync('./comments.json', 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading comments file:', error);
        return [];
    }
}

// Save comments to file
function saveComments(comments) {
    try {
        fs.writeFileSync('./comments.json', JSON.stringify(comments, null, 2));
    } catch (error) {
        console.error('Error writing comments file:', error);
    }
}

// Get all comments
app.get('/comments', (req, res) => {
    const comments = loadComments();
    res.json(comments);
});

// Add a new comment
app.post('/comments', (req, res) => {
    const comments = loadComments();
    const { name, comment } = req.body;
    const newComment = { id: uuidv4(), name, comment };
    comments.push(newComment);
    saveComments(comments);
    res.status(201).json(newComment);
});

// Delete a comment by ID
app.delete('/comments/:id', (req, res) => {
    const comments = loadComments();
    const { id } = req.params;
    const updatedComments = comments.filter(comment => comment.id !== id);
    saveComments(updatedComments);
    res.status(204).send();
});

// Update a comment by ID
app.put('/comments/:id', (req, res) => {
    const comments = loadComments();
    const { id } = req.params;
    const { name, comment } = req.body;
    
    const updatedComments = comments.map(c =>
        c.id === id ? { ...c, name, comment } : c
    );
    
    saveComments(updatedComments);
    res.status(200).json({ id, name, comment });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});