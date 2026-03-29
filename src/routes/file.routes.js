const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const upload = require('../middleware/upload');
const { uploadFiles, deleteUploadedFile } = require('../controllers/file.controller');

router.use(authenticate);

router.post('/upload', upload.array('files', 5), uploadFiles);
router.delete('/:fileId(*)', deleteUploadedFile);

module.exports = router;
