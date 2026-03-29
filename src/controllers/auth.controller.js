const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User, Program } = require('../models');
const { success, error } = require('../utils/response');
const emailService = require('../services/email.service');
const jwtConfig = require('../config/jwt');

const notificationService = require('../services/notification.service');

const generateOtp = () => Math.floor(1000 + Math.random() * 9000).toString();

const signTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, jwtConfig.accessSecret, {
    expiresIn: jwtConfig.accessExpiresIn,
  });
  const refreshToken = jwt.sign({ id: userId }, jwtConfig.refreshSecret, {
    expiresIn: jwtConfig.refreshExpiresIn,
  });
  return { accessToken, refreshToken };
};

// GET /auth/programs  (public — no auth required)
exports.getPrograms = async (req, res, next) => {
  try {
    const programs = await Program.findAll({
      where: { is_active: true },
      order: [['name', 'ASC']],
      attributes: ['id', 'name', 'short_name', 'max_level'],
    });

    const data = programs.map((p) => {
      const levels = [];
      for (let l = 100; l <= p.max_level; l += 100) {
        levels.push(String(l));
      }
      return {
        value: p.name,
        label: p.short_name || p.name,
        levels,
      };
    });

    return success(res, { programs: data });
  } catch (err) {
    next(err);
  }
};

// POST /auth/register
exports.register = async (req, res, next) => {
  try {
    const { full_name, email, password, program, level } = req.body;

    // Validate program exists
    const programRecord = await Program.findOne({ where: { name: program, is_active: true } });
    if (!programRecord) return error(res, 'Invalid program selected.', 400);

    // Validate level is within the program's allowed range
    const levelNum = parseInt(level, 10);
    if (
      isNaN(levelNum) ||
      levelNum < 100 ||
      levelNum > programRecord.max_level ||
      levelNum % 100 !== 0
    ) {
      return error(res, `Level ${level} is not valid for ${program}. Maximum level is ${programRecord.max_level}.`, 400);
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) return error(res, 'Email already registered', 409);

    const password_hash = await bcrypt.hash(password, 12);
    const otp_code = generateOtp();
    const otp_expires_at = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    const user = await User.create({
      full_name,
      email,
      password_hash,
      role: 'student',
      program,
      level,
      otp_code,
      otp_expires_at,
      level_updated_at: new Date(), // starts the 12-month progression clock
    });

    // In dev, log OTP to console so you can test without SMTP configured
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV] OTP for ${email}: ${otp_code}`);
    }

    // OTP is critical — await it so the user gets a proper error if SMTP is broken
    try {
      await emailService.sendOtp(email, otp_code);
    } catch (emailErr) {
      console.error('[Email] Failed to send OTP:', emailErr.message);
      return error(res, 'Account created but we could not send the verification email. Please use Resend OTP.', 500);
    }

    // Send welcome notification non-blocking
    notificationService.notifyWelcome(user.id);

    return success(res, null, 'Registration successful. Check your email for the OTP.', 201);
  } catch (err) {
    next(err);
  }
};

// POST /auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user || !user.is_active) return error(res, 'Invalid credentials', 401);
    if (!user.is_verified) return error(res, 'Account not verified. Please verify your OTP.', 403);

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return error(res, 'Invalid credentials', 401);

    const { accessToken, refreshToken } = signTokens(user.id);
    user.refresh_token_hash = await bcrypt.hash(refreshToken, 10);
    await user.save();

    // Eager-load courses for lecturers so the frontend has them immediately on login
    let courses = [];
    if (user.role === 'lecturer') {
      const { Course } = require('../models');
      await user.reload({
        include: [{ model: Course, as: 'courses', through: { attributes: [] }, where: { is_active: true }, required: false }],
      });
      courses = user.courses ?? [];
    }

    return success(res, {
      access_token: accessToken,
      refresh_token: refreshToken,
      must_reset_password: user.must_reset_password,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        program: user.program,
        level: user.level,
        avatar_url: user.avatar_url,
        position: user.position ?? null,
        courses,
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /auth/verify-otp
exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return error(res, 'User not found', 404);
    if (user.is_verified) return error(res, 'Account already verified', 400);
    if (!user.otp_code || user.otp_code !== otp) return error(res, 'Invalid OTP', 400);
    if (new Date() > user.otp_expires_at) return error(res, 'OTP has expired', 400);

    user.is_verified = true;
    user.otp_code = null;
    user.otp_expires_at = null;
    await user.save();

    return success(res, null, 'Account verified successfully');
  } catch (err) {
    next(err);
  }
};

// POST /auth/resend-otp
exports.resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return error(res, 'User not found', 404);
    if (user.is_verified) return error(res, 'Account already verified', 400);

    const otp_code = generateOtp();
    user.otp_code = otp_code;
    user.otp_expires_at = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV] Resend OTP for ${email}: ${otp_code}`);
    }
    try {
      await emailService.sendOtp(email, otp_code);
    } catch (emailErr) {
      console.error('[Email] Failed to resend OTP:', emailErr.message);
      return error(res, 'Could not send OTP email. Please try again shortly.', 500);
    }

    return success(res, null, 'OTP resent successfully');
  } catch (err) {
    next(err);
  }
};

// POST /auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    // Always respond 200 to avoid email enumeration
    if (!user) return success(res, null, 'If that email exists, a reset link has been sent.');

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.password_reset_token = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.password_reset_expires_at = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV] Password reset URL for ${email}: ${resetUrl}`);
    }
    try {
      await emailService.sendPasswordReset(email, resetUrl);
    } catch (emailErr) {
      console.error('[Email] Failed to send password reset:', emailErr.message);
      // Still return 200 — don't reveal whether the email exists or SMTP is broken
    }

    return success(res, null, 'If that email exists, a reset link has been sent.');
  } catch (err) {
    next(err);
  }
};

// POST /auth/reset-password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({ where: { password_reset_token: hashedToken } });

    if (!user || new Date() > user.password_reset_expires_at) {
      return error(res, 'Token is invalid or has expired', 400);
    }

    user.password_hash = await bcrypt.hash(password, 12);
    user.password_reset_token = null;
    user.password_reset_expires_at = null;
    user.refresh_token_hash = null; // invalidate any active session
    await user.save();

    return success(res, null, 'Password reset successful');
  } catch (err) {
    next(err);
  }
};

// POST /auth/new-password  (forced reset for course reps on first login)
exports.newPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const user = await User.findByPk(req.user.id);

    user.password_hash = await bcrypt.hash(password, 12);
    user.must_reset_password = false;
    user.refresh_token_hash = null; // invalidate old temp session

    const { accessToken, refreshToken } = signTokens(user.id);
    user.refresh_token_hash = await bcrypt.hash(refreshToken, 10);
    await user.save();

    return success(res, { access_token: accessToken, refresh_token: refreshToken }, 'Password updated successfully');
  } catch (err) {
    next(err);
  }
};

// POST /auth/refresh
exports.refresh = async (req, res, next) => {
  try {
    const { refresh_token } = req.body;

    let payload;
    try {
      payload = jwt.verify(refresh_token, jwtConfig.refreshSecret);
    } catch {
      return error(res, 'Invalid or expired refresh token', 401);
    }

    const user = await User.findByPk(payload.id);
    if (!user || !user.refresh_token_hash || !user.is_active) {
      return error(res, 'Invalid session', 401);
    }

    const valid = await bcrypt.compare(refresh_token, user.refresh_token_hash);
    if (!valid) return error(res, 'Invalid refresh token', 401);

    const { accessToken, refreshToken: newRefreshToken } = signTokens(user.id);
    user.refresh_token_hash = await bcrypt.hash(newRefreshToken, 10);
    await user.save();

    return success(res, { access_token: accessToken, refresh_token: newRefreshToken });
  } catch (err) {
    next(err);
  }
};

// POST /auth/logout
exports.logout = async (req, res, next) => {
  try {
    req.user.refresh_token_hash = null;
    await req.user.save();
    return success(res, null, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
};
