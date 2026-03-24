const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const upload = require('../middleware/upload');
const validate = require('../middleware/validate');
const { createResourceSchema } = require('../validators/resource.validator');
const { getResources, createResource, updateResource, deleteResource } = require('../controllers/resource.controller');

router.get('/', authenticate, getResources);
router.post('/', authenticate, authorize('course_rep', 'admin'), upload.single('file'), validate(createResourceSchema), createResource);
router.patch('/:id', authenticate, authorize('course_rep', 'admin'), upload.single('file'), updateResource);
router.delete('/:id', authenticate, authorize('course_rep', 'admin'), deleteResource);

module.exports = router;
