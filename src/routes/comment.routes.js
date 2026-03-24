const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const { getComments, createComment, replyToComment, updateComment, deleteComment } = require('../controllers/comment.controller');

// Mounted at /api — routes span two base paths
router.get('/announcements/:id/comments', authenticate, getComments);
router.post('/announcements/:id/comments', authenticate, createComment);
router.post('/comments/:id/reply', authenticate, replyToComment);
router.patch('/comments/:id', authenticate, updateComment);
router.delete('/comments/:id', authenticate, deleteComment);

module.exports = router;
