const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const {
  getNotifications,
  markOneRead,
  markAllRead,
  deleteNotification,
} = require('../controllers/notification.controller');

router.use(authenticate);

router.get('/', getNotifications);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markOneRead);
router.delete('/:id', deleteNotification);

module.exports = router;
