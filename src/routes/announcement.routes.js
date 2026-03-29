const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const upload = require('../middleware/upload');
const validate = require('../middleware/validate');
const {
  createSchema,
  updateSchema,
  querySchema,
} = require('../utils/validators/announcement.validator');
const {
  getDeadlines,
  getFeed,
  searchAnnouncements,
  getMyPosts,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  publishAnnouncement,
  togglePin,
  deleteAnnouncement,
  getAttachments,
} = require('../controllers/announcement.controller');

router.use(authenticate);

// Static paths must come BEFORE /:id to avoid route conflicts
router.get('/deadlines', getDeadlines);
router.get('/search', searchAnnouncements);
router.get('/my-posts', getMyPosts);
router.get('/attachments', getAttachments);

router.get('/', getFeed);
router.post('/', authorize('course_rep', 'lecturer', 'admin'), upload.array('attachments', 5), createAnnouncement);

router.get('/:id', getAnnouncement);
router.patch('/:id', authorize('course_rep', 'lecturer', 'admin'), upload.array('attachments', 5), updateAnnouncement);
router.patch('/:id/publish', authorize('course_rep', 'lecturer', 'admin'), publishAnnouncement);
router.patch('/:id/pin', authorize('course_rep', 'lecturer', 'admin'), togglePin);
router.delete('/:id', authorize('course_rep', 'lecturer', 'admin'), deleteAnnouncement);

module.exports = router;
