const router = require('express').Router();
const userController = require('../controllers/user.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { upload } = require('../services/upload.service');
const v = require('../utils/validators/user.validator');

// All /users routes require auth
router.use(authenticate);

// Own profile
router.get('/me', userController.getMe);
router.patch('/me', upload.single('avatar'), validate(v.updateMe), userController.updateMe);
router.patch('/me/password', validate(v.changePassword), userController.changePassword);
router.post('/me/level-correction', validate(v.levelCorrectionRequest), userController.requestLevelCorrection);

// Lecturer course assignments
router.get('/me/courses', userController.getMyCourses);
router.post('/me/courses', userController.addMyCourse);
router.delete('/me/courses/:courseId', userController.removeMyCourse);

// Admin-only user management
router.get('/', authorize('admin'), userController.listUsers);
router.get('/:id', authorize('admin'), userController.getUserById);
router.patch('/:id', authorize('admin'), validate(v.adminUpdateUser), userController.adminUpdateUser);
router.delete('/:id', authorize('admin'), userController.deactivateUser);

module.exports = router;
