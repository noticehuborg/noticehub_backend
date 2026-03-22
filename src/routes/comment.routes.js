const express = require('express');
const {
  getComments,
  createComment,
  replyToComment,
  updateComment,
  deleteComment
} = require('../controllers/comment.controller');

const authenticate = require('../middleware/authenticate');

const router = express.Router();

// Comments for announcement
router.get('/announcements/:id/comments', authenticate, getComments);

// Create top-level comment
router.post('/announcements/:id/comments', authenticate, createComment);

// Reply
router.post('/comments/:id/reply', authenticate, replyToComment);

// Edit
router.patch('/comments/:id', authenticate, updateComment);

// Delete
router.delete('/comments/:id', authenticate, deleteComment);

module.exports = router;