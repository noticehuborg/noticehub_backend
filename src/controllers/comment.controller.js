// controllers/comment.controller.js
import db from '../models/index.js';

const { Comment, User, Notification } = db;

// 🔹 helper: sanitize input
const sanitize = (text) => {
  if (!text) return '';
  return text.replace(/<[^>]*>/g, '').slice(0, 1000);
};

// 🔹 helper: build threaded tree
const buildTree = (comments) => {
  const map = {};
  const tree = [];

  comments.forEach(c => {
    c.replies = [];
    map[c.id] = c;
  });

  comments.forEach(c => {
    if (c.parent_id) {
      map[c.parent_id]?.replies.push(c);
    } else {
      tree.push(c);
    }
  });

  return tree;
};

// ✅ GET threaded comments
export const getComments = async (req, res, next) => {
  try {
    const { id } = req.params;

    const comments = await Comment.findAll({
      where: { announcement_id: id },
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'full_name']
      }],
      order: [['created_at', 'ASC']]
    });

    const plain = comments.map(c => c.toJSON());
    const tree = buildTree(plain);

    res.json({ success: true, data: tree });
  } catch (err) {
    next(err);
  }
};

// ✅ POST top-level comment
export const createComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    let { body, content } = req.body;

    body = sanitize(body || content);

    if (!body) return res.status(400).json({ success: false, message: 'Content is required' });

    const comment = await Comment.create({
      announcement_id: id,
      author_id: req.user.id,
      parent_id: null,
      body
    });

    res.status(201).json({ success: true, data: comment });
  } catch (err) {
    next(err);
  }
};

// ✅ POST reply
export const replyToComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    let { body, content } = req.body;

    const parent = await Comment.findByPk(id);
    if (!parent) return res.status(404).json({ success: false, message: 'Parent comment not found' });

    body = sanitize(body || content);
    if (!body) return res.status(400).json({ success: false, message: 'Content is required' });

    const reply = await Comment.create({
      announcement_id: parent.announcement_id,
      author_id: req.user.id,
      parent_id: parent.id,
      body
    });

    // 🔔 notify parent author
    if (parent.author_id !== req.user.id) {
      await Notification.create({
        user_id: parent.author_id,
        type: 'comment_reply',
        title: 'New reply',
        body: 'Someone replied to your comment',
        related_id: parent.id
      });
    }

    res.status(201).json({ success: true, data: reply });
  } catch (err) {
    next(err);
  }
};

// ✅ PATCH comment
export const updateComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    let { body, content } = req.body;

    const comment = await Comment.findByPk(id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    if (comment.author_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not allowed to edit this comment' });
    }

    comment.body = sanitize(body || content);
    await comment.save();

    res.json({ success: true, data: comment });
  } catch (err) {
    next(err);
  }
};

// ✅ DELETE comment (with replies)
export const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findByPk(id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    if (comment.author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not allowed to delete this comment' });
    }

    // delete children first (safe)
    await Comment.destroy({ where: { parent_id: id } });

    await comment.destroy();

    res.json({ success: true, message: 'Comment deleted successfully' });
  } catch (err) {
    next(err);
  }
};