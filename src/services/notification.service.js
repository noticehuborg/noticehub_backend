const { Notification, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Fan-out a notification to all eligible users for an announcement.
 * Eligible: students and course_reps with the same program and level.
 * Does NOT notify the announcement author.
 * Non-blocking — failures do not propagate to the caller.
 */
const fanOut = async (announcement, type) => {
  try {
    const recipients = await User.findAll({
      where: {
        role: { [Op.in]: ['student', 'course_rep'] },
        program: announcement.program,
        level: announcement.level,
        is_active: true,
        id: { [Op.ne]: announcement.author_id }, // don't notify the author
      },
      attributes: ['id'],
    });

    if (!recipients.length) return;

    const title =
      type === 'deadline_warning'
        ? `Deadline soon: ${announcement.title}`
        : `New announcement: ${announcement.title}`;

    const body =
      type === 'deadline_warning'
        ? `The deadline for "${announcement.title}" is within 3 days.`
        : announcement.body
        ? announcement.body.slice(0, 200)
        : null;

    const rows = recipients.map((r) => ({
      user_id: r.id,
      type,
      title,
      body,
      reference_id: announcement.id,
    }));

    await Promise.all(rows.map((row) => Notification.create(row)));
  } catch (err) {
    console.error('[notificationService.fanOut] Error:', err.message);
  }
};

/**
 * Notify the author of a parent comment that someone replied.
 * Only fires if the replier is not the same person as the parent author.
 * Non-blocking.
 */
const notifyReply = async (parentComment, replier) => {
  try {
    if (parentComment.author_id === replier.id) return;

    await Notification.create({
      user_id: parentComment.author_id,
      type: 'comment_reply',
      title: 'Someone replied to your comment',
      body: `${replier.full_name} replied to your comment.`,
      reference_id: parentComment.id,
    });
  } catch (err) {
    console.error('[notificationService.notifyReply] Error:', err.message);
  }
};

/**
 * Notify the announcement author that someone commented on their post.
 * Only fires if the commenter is not the author.
 * Non-blocking.
 */
const notifyNewComment = async (announcement, commenter) => {
  try {
    if (announcement.author_id === commenter.id) return;

    await Notification.create({
      user_id: announcement.author_id,
      type: 'comment_reply',
      title: `New comment on "${announcement.title}"`,
      body: `${commenter.full_name} commented on your announcement.`,
      reference_id: announcement.id,
    });
  } catch (err) {
    console.error('[notificationService.notifyNewComment] Error:', err.message);
  }
};

/**
 * Send a welcome notification to a newly registered user.
 * Non-blocking.
 */
const notifyWelcome = async (userId) => {
  try {
    await Notification.create({
      user_id: userId,
      type: 'welcome',
      title: 'Welcome to NoticeHub!',
      body: 'Your account has been created. Stay up to date with announcements from your course rep.',
    });
  } catch (err) {
    console.error('[notificationService.notifyWelcome] Error:', err.message);
  }
};

module.exports = { fanOut, notifyReply, notifyNewComment, notifyWelcome };
