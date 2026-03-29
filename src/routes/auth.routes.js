const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/authenticate');
const v = require('../utils/validators/auth.validator');

router.get('/programs', authController.getPrograms);
router.post('/register', validate(v.register), authController.register);
router.post('/login', validate(v.login), authController.login);
router.post('/verify-otp', validate(v.verifyOtp), authController.verifyOtp);
router.post('/resend-otp', validate(v.resendOtp), authController.resendOtp);
router.post('/forgot-password', validate(v.forgotPassword), authController.forgotPassword);
router.post('/reset-password', validate(v.resetPassword), authController.resetPassword);
router.post('/new-password', authenticate, validate(v.newPassword), authController.newPassword);
router.post('/refresh', validate(v.refresh), authController.refresh);
router.post('/logout', authenticate, authController.logout);

module.exports = router;
