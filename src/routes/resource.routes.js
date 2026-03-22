const express = require('express');
const router = express.Router();
const validate = require('../middleware/validate');

const authenticate = require('../middleware/authenticate');
const upload = require('../middleware/upload');
const validateResource = require('../validators/resource.validator');
const {
  getResources,
  createResource,
  updateResource,
  deleteResource,
} = require('../controllers/resource.controller');

// ✅ GET resources
router.get('/resources', authenticate, getResources);

// ✅ CREATE resource
router.post(
  '/resources',
  authenticate,
  upload.single('file'),
  validate(validateResource.createResourceSchema),
  createResource
);

// ✅ UPDATE resource
router.patch(
  '/resources/:id',
  authenticate,
  upload.single('file'),
  updateResource
);

// ✅ DELETE resource
router.delete('/resources/:id', authenticate, deleteResource);

module.exports = router;