const { Notification } = require('../models');
const { Op } = require('sequelize');
const { success, error } = require('../utils/response');

/**
 * GET /api/notifications
 * Returns the logged-in user's notifications, paginated by created_at DESC.
 * Supports ?status=unread filter.
 */
const getNotifications = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = { user_id: req.user.id };
    if (status === 'unread') {
      where.is_read = false;
    }

    const { count, rows } = await Notification.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    const unreadCount = await Notification.count({
      where: { user_id: req.user.id, is_read: false },
    });

    return success(res, {
      notifications: rows,
      unreadCount,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/notifications/:id/read
 * Marks a single notification as read.
 */
const markOneRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });

    if (!notification) {
      return error(res, 'Notification not found', 404);
    }

    notification.is_read = true;
    await notification.save();

    return success(res, notification, 'Notification marked as read');
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/notifications/read-all
 * Marks all notifications of the logged-in user as read.
 */
const markAllRead = async (req, res, next) => {
  try {
    await Notification.update(
      { is_read: true },
      { where: { user_id: req.user.id, is_read: false } }
    );

    return success(res, null, 'All notifications marked as read');
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/notifications/:id
 * Deletes a single notification owned by the logged-in user.
 */
const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });

    if (!notification) {
      return error(res, 'Notification not found', 404);
    }

    await notification.destroy();

    return success(res, null, 'Notification deleted');
  } catch (err) {
    next(err);
  }
};

module.exports = { getNotifications, markOneRead, markAllRead, deleteNotification };
