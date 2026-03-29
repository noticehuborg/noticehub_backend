const { Comment, User, Announcement } = require('../models');
const notificationService = require('../services/notification.service');
const { success, error } = require('../utils/response');

const sanitize = (text) => {
  if (!text) return '';
  return text.replace(/<[^>]*>/g, '').slice(0, 1000);
};

const buildTree = (comments) => {
  const map = {};
  const tree = [];

  comments.forEach((c) => {
    c.replies = [];
    map[c.id] = c;
  });

  comments.forEach((c) => {
    if (c.parent_id) {
      if (map[c.parent_id]) map[c.parent_id].replies.push(c);
    } else {
      tree.push(c);
    }
  });

  return tree;
};

// GET /announcements/:id/comments
exports.getComments = async (req, res, next) => {
  try {
    const comments = await Comment.findAll({
      where: { announcement_id: req.params.id },
      include: [{ model: User, as: 'author', attributes: ['id', 'full_name', 'avatar_url', 'role'] }],
      order: [['created_at', 'ASC']],
    });

    const tree = buildTree(comments.map((c) => c.toJSON()));
    return success(res, tree);
  } catch (err) {
    next(err);
  }
};

// POST /announcements/:id/comments
exports.createComment = async (req, res, next) => {
  try {
    const body = sanitize(req.body.body || req.body.content);
    if (!body) return error(res, 'Comment body is required', 400);

    const announcement = await Announcement.findByPk(req.params.id);
    if (!announcement) return error(res, 'Announcement not found', 404);

    const comment = await Comment.create({
      announcement_id: req.params.id,
      author_id: req.user.id,
      parent_id: null,
      body,
    });

    const withAuthor = await Comment.findByPk(comment.id, {
      include: [{ model: User, as: 'author', attributes: ['id', 'full_name', 'avatar_url', 'role'] }],
    });

    // Notify the announcement author of the new comment (non-blocking)
    notificationService.notifyNewComment(announcement, req.user);

    return success(res, withAuthor, 'Comment posted', 201);
  } catch (err) {
    next(err);
  }
};

// POST /comments/:id/reply
exports.replyToComment = async (req, res, next) => {
  try {
    const parent = await Comment.findByPk(req.params.id);
    if (!parent) return error(res, 'Parent comment not found', 404);

    const body = sanitize(req.body.body || req.body.content);
    if (!body) return error(res, 'Reply body is required', 400);

    const reply = await Comment.create({
      announcement_id: parent.announcement_id,
      author_id: req.user.id,
      parent_id: parent.id,
      body,
    });

    notificationService.notifyReply(parent, req.user);

    const withAuthor = await Comment.findByPk(reply.id, {
      include: [{ model: User, as: 'author', attributes: ['id', 'full_name', 'avatar_url', 'role'] }],
    });

    return success(res, withAuthor, 'Reply posted', 201);
  } catch (err) {
    next(err);
  }
};

// PATCH /comments/:id
exports.updateComment = async (req, res, next) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) return error(res, 'Comment not found', 404);
    if (comment.author_id !== req.user.id) return error(res, 'Forbidden', 403);

    const body = sanitize(req.body.body || req.body.content);
    if (!body) return error(res, 'Comment body is required', 400);

    comment.body = body;
    await comment.save();

    return success(res, comment, 'Comment updated');
  } catch (err) {
    next(err);
  }
};

// DELETE /comments/:id
exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) return error(res, 'Comment not found', 404);

    const isAuthor = comment.author_id === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isAuthor && !isAdmin) return error(res, 'Forbidden', 403);

    await Comment.destroy({ where: { parent_id: comment.id } });
    await comment.destroy();

    return success(res, null, 'Comment deleted');
  } catch (err) {
    next(err);
  }
};
