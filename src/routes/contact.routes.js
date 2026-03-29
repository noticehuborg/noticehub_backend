const router = require('express').Router();
const { submitContact } = require('../controllers/contact.controller');

// Public — no auth required
router.post('/', submitContact);

module.exports = router;
