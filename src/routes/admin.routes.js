const router = require('express').Router();
const adminController = require('../controllers/admin.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const v = require('../utils/validators/user.validator');

// All /admin routes require auth + admin role
router.use(authenticate, authorize('admin'));

router.post('/users/create-rep', validate(v.createRep), adminController.createRep);
router.post('/users/create-lecturer', validate(v.createLecturer), adminController.createLecturer);
router.get('/stats', adminController.getStats);
router.get('/level-corrections', adminController.listLevelCorrections);
router.patch('/level-corrections/:id', adminController.actionLevelCorrection);
router.patch('/users/:id/deactivate', adminController.deactivateUser);
router.delete('/announcements/:id', adminController.deleteAnnouncement);

module.exports = router;
