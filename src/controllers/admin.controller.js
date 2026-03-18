const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { User, Announcement, LevelCorrectionRequest } = require('../models');
const { success, error } = require('../utils/response');
const emailService = require('../services/email.service');

const SAFE_ATTRIBUTES = {
  exclude: ['password_hash', 'refresh_token_hash', 'otp_code', 'otp_expires_at', 'password_reset_token', 'password_reset_expires_at'],
};

// POST /admin/users/create-rep
exports.createRep = async (req, res, next) => {
  try {
    const { full_name, email, program, level } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) return error(res, 'Email already registered', 409);

    // Generate a temp password
    const tempPassword = crypto.randomBytes(8).toString('hex');
    const password_hash = await bcrypt.hash(tempPassword, 12);

    const rep = await User.create({
      full_name,
      email,
      password_hash,
      role: 'course_rep',
      program,
      level,
      is_verified: true,
      must_reset_password: true,
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV] Rep credentials for ${email} — temp password: ${tempPassword}`);
    }
    emailService.sendRepCredentials(email, full_name, tempPassword).catch((err) => {
      console.error('[Email] Failed to send rep credentials:', err.message);
    });

    const created = await User.findByPk(rep.id, { attributes: SAFE_ATTRIBUTES });
    return success(res, { user: created }, 'Course rep created and credentials emailed', 201);
  } catch (err) {
    next(err);
  }
};

// GET /admin/stats
exports.getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalAnnouncements, pendingCorrections] = await Promise.all([
      User.count({ where: { is_active: true } }),
      Announcement.count(),
      LevelCorrectionRequest.count({ where: { status: 'pending' } }),
    ]);

    return success(res, { totalUsers, totalAnnouncements, pendingCorrections });
  } catch (err) {
    next(err);
  }
};

// GET /admin/level-corrections
exports.listLevelCorrections = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const { count, rows } = await LevelCorrectionRequest.findAndCountAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'full_name', 'email', 'program', 'level'] }],
      limit: parseInt(limit, 10),
      offset,
      order: [['created_at', 'DESC']],
    });

    return success(res, { requests: rows, total: count, page: parseInt(page, 10), limit: parseInt(limit, 10) });
  } catch (err) {
    next(err);
  }
};

// PATCH /admin/level-corrections/:id
exports.actionLevelCorrection = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return error(res, 'Status must be approved or rejected', 400);
    }

    const request = await LevelCorrectionRequest.findByPk(req.params.id, {
      include: [{ model: User, as: 'user' }],
    });
    if (!request) return error(res, 'Request not found', 404);
    if (request.status !== 'pending') return error(res, 'Request already actioned', 400);

    request.status = status;
    request.actioned_by = req.user.id;
    request.actioned_at = new Date();
    await request.save();

    if (status === 'approved') {
      await request.user.update({ level: request.requested_level });
    }

    return success(res, { request }, `Level correction ${status}`);
  } catch (err) {
    next(err);
  }
};

// PATCH /admin/users/:id/deactivate
exports.deactivateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return error(res, 'User not found', 404);

    user.is_active = false;
    await user.save();
    return success(res, null, 'User deactivated');
  } catch (err) {
    next(err);
  }
};

// DELETE /admin/announcements/:id  — stub (actual implementation belongs to Dev 2)
exports.deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findByPk(req.params.id);
    if (!announcement) return error(res, 'Announcement not found', 404);
    await announcement.destroy();
    return success(res, null, 'Announcement deleted');
  } catch (err) {
    next(err);
  }
};
