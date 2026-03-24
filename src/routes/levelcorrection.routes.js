const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const { getMyLevelCorrections } = require('../controllers/levelcorrection.controller');

router.get('/me/level-corrections', authenticate, getMyLevelCorrections);

module.exports = router;
