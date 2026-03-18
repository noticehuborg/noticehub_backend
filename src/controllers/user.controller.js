const bcrypt = require('bcryptjs');
const { User, LevelCorrectionRequest } = require('../models');
const { success, error } = require('../utils/response');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/upload.service');
const { Op } = require('sequelize');

const SAFE_ATTRIBUTES = {
  exclude: ['password_hash', 'refresh_token_hash', 'otp_code', 'otp_expires_at', 'password_reset_token', 'password_reset_expires_at'],
};

// GET /users/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: SAFE_ATTRIBUTES });
    return success(res, { user });
  } catch (err) {
    next(err);
  }
};

// PATCH /users/me
exports.updateMe = async (req, res, next) => {
  try {
    if (!req.file && !req.body.full_name) {
      return error(res, 'Provide full_name or an avatar file', 400);
    }
    const user = await User.findByPk(req.user.id);
    if (req.body.full_name) user.full_name = req.body.full_name;

    if (req.file) {
      if (user.avatar_url) {
        // Extract public_id from previous Cloudinary URL and delete it
        // Cloudinary URLs: https://res.cloudinary.com/<cloud>/image/upload/v.../folder/public_id.ext
        // We store this separately — for now just upload new avatar
      }
      const result = await uploadToCloudinary(req.file.buffer, 'noticehub/avatars');
      user.avatar_url = result.secure_url;
    }

    await user.save();
    const updated = await User.findByPk(user.id, { attributes: SAFE_ATTRIBUTES });
    return success(res, { user: updated }, 'Profile updated');
  } catch (err) {
    next(err);
  }
};

// PATCH /users/me/password
exports.changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;
    const user = await User.findByPk(req.user.id);

    const valid = await bcrypt.compare(current_password, user.password_hash);
    if (!valid) return error(res, 'Current password is incorrect', 400);

    user.password_hash = await bcrypt.hash(new_password, 12);
    await user.save();
    return success(res, null, 'Password changed successfully');
  } catch (err) {
    next(err);
  }
};

// POST /users/me/level-correction
exports.requestLevelCorrection = async (req, res, next) => {
  try {
    const { requested_level, reason } = req.body;
    const user = req.user;

    if (user.level === requested_level) {
      return error(res, 'Requested level is the same as your current level', 400);
    }

    const pending = await LevelCorrectionRequest.findOne({
      where: { user_id: user.id, status: 'pending' },
    });
    if (pending) return error(res, 'You already have a pending level correction request', 409);

    const request = await LevelCorrectionRequest.create({
      user_id: user.id,
      current_level: user.level,
      requested_level,
      reason,
    });

    return success(res, { request }, 'Level correction request submitted', 201);
  } catch (err) {
    next(err);
  }
};

// GET /users  (admin)
exports.listUsers = async (req, res, next) => {
  try {
    const { role, program, level, is_active, search, page = 1, limit = 20 } = req.query;
    const where = {};

    if (role) where.role = role;
    if (program) where.program = program;
    if (level) where.level = level;
    if (is_active !== undefined) where.is_active = is_active === 'true';
    if (search) {
      where[Op.or] = [
        { full_name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: SAFE_ATTRIBUTES,
      limit: parseInt(limit, 10),
      offset,
      order: [['created_at', 'DESC']],
    });

    return success(res, { users, total: count, page: parseInt(page, 10), limit: parseInt(limit, 10) });
  } catch (err) {
    next(err);
  }
};

// GET /users/:id  (admin)
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, { attributes: SAFE_ATTRIBUTES });
    if (!user) return error(res, 'User not found', 404);
    return success(res, { user });
  } catch (err) {
    next(err);
  }
};

// PATCH /users/:id  (admin)
exports.adminUpdateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return error(res, 'User not found', 404);

    const fields = ['full_name', 'email', 'role', 'program', 'level', 'is_active'];
    fields.forEach((f) => { if (req.body[f] !== undefined) user[f] = req.body[f]; });

    await user.save();
    const updated = await User.findByPk(user.id, { attributes: SAFE_ATTRIBUTES });
    return success(res, { user: updated }, 'User updated');
  } catch (err) {
    next(err);
  }
};

// DELETE /users/:id  (admin — soft deactivate)
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
