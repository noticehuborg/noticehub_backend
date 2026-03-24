const { Op } = require('sequelize');
const { Announcement, Attachment, AnnouncementView, Comment, User } = require('../models');
const { streamUpload, deleteFile } = require('../services/file.service');
const notificationService = require('../services/notification.service');
const { success, error } = require('../utils/response');

const MAX_ATTACHMENTS = 5;
const ATTACHMENT_FOLDER = 'noticehub/attachments';

// ─── Helpers ────────────────────────────────────────────────────────────────

const uploadFiles = async (files, announcementId) => {
  const results = [];
  for (const file of files) {
    const uploaded = await streamUpload(file.buffer, ATTACHMENT_FOLDER);
    results.push({
      announcement_id: announcementId,
      file_url: uploaded.secure_url,
      public_id: uploaded.public_id,
      file_name: file.originalname,
      file_type: file.mimetype,
      file_size: file.size,
    });
  }
  return results;
};

const deleteAttachments = async (attachments) => {
  await Promise.allSettled(
    attachments.map((a) => (a.public_id ? deleteFile(a.public_id) : Promise.resolve()))
  );
};

const withCommentCount = async (announcement) => {
  const count = await Comment.count({ where: { announcement_id: announcement.id } });
  return { ...announcement.toJSON(), comment_count: count };
};

// ─── Feed ────────────────────────────────────────────────────────────────────

const getFeed = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Announcement.findAndCountAll({
      where: {
        program: req.user.program,
        level: req.user.level,
        status: 'published',
      },
      include: [
        { model: User, as: 'author', attributes: ['id', 'full_name', 'avatar_url'] },
        { model: Attachment, as: 'attachments' },
      ],
      order: [
        ['is_pinned', 'DESC'],
        ['pinned_at', 'DESC NULLS LAST'],
        ['created_at', 'DESC'],
      ],
      limit: parseInt(limit),
      offset,
    });

    return success(res, {
      announcements: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
    });
  } catch (err) {
    next(err);
  }
};

// ─── Search ──────────────────────────────────────────────────────────────────

const searchAnnouncements = async (req, res, next) => {
  try {
    const { search, category, sort = 'newest', page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      program: req.user.program,
      level: req.user.level,
      status: 'published',
    };

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { body: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (category) {
      where.category = category;
    }

    const orderMap = {
      newest: [['created_at', 'DESC']],
      oldest: [['created_at', 'ASC']],
      deadline: [['deadline', 'ASC NULLS LAST']],
    };
    const order = orderMap[sort] || orderMap.newest;

    const { count, rows } = await Announcement.findAndCountAll({
      where,
      include: [
        { model: User, as: 'author', attributes: ['id', 'full_name', 'avatar_url'] },
        { model: Attachment, as: 'attachments' },
      ],
      order,
      limit: parseInt(limit),
      offset,
    });

    return success(res, {
      announcements: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
    });
  } catch (err) {
    next(err);
  }
};

// ─── My Posts ────────────────────────────────────────────────────────────────

const getMyPosts = async (req, res, next) => {
  try {
    const { status, pinned, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = { author_id: req.user.id };

    if (status && status !== 'all') {
      where.status = status;
    }
    if (pinned === 'true') {
      where.is_pinned = true;
    }

    const { count, rows } = await Announcement.findAndCountAll({
      where,
      include: [{ model: Attachment, as: 'attachments' }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    const data = await Promise.all(rows.map(withCommentCount));

    return success(res, {
      announcements: data,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
    });
  } catch (err) {
    next(err);
  }
};

// ─── Single Announcement ─────────────────────────────────────────────────────

const getAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findByPk(req.params.id, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'full_name', 'avatar_url'] },
        { model: Attachment, as: 'attachments' },
      ],
    });

    if (!announcement) {
      return error(res, 'Announcement not found', 404);
    }

    // Track view — ignore conflict (user already viewed)
    await AnnouncementView.findOrCreate({
      where: { announcement_id: announcement.id, user_id: req.user.id },
    });

    const data = await withCommentCount(announcement);
    return success(res, data);
  } catch (err) {
    next(err);
  }
};

// ─── Create ──────────────────────────────────────────────────────────────────

const createAnnouncement = async (req, res, next) => {
  try {
    const files = req.files || [];

    if (files.length > MAX_ATTACHMENTS) {
      return error(res, `Maximum ${MAX_ATTACHMENTS} attachments allowed`, 400);
    }

    const { title, body, category, status = 'draft', deadline, useful_links } = req.body;

    // For course_rep: lock program and level from JWT; ignore any client-supplied values
    let program, level;
    if (req.user.role === 'course_rep') {
      program = req.user.program;
      level = req.user.level;
    } else {
      program = req.body.program;
      level = req.body.level;
    }

    const announcement = await Announcement.create({
      author_id: req.user.id,
      title,
      body,
      category,
      program,
      level,
      status,
      deadline: deadline || null,
      useful_links: useful_links ? JSON.parse(useful_links) : [],
    });

    // Upload attachments
    if (files.length > 0) {
      const attachmentRows = await uploadFiles(files, announcement.id);
      await Attachment.bulkCreate(attachmentRows);
    }

    // Fan-out notification if publishing immediately
    if (status === 'published') {
      notificationService.fanOut(announcement, 'new_announcement');
    }

    const data = await Announcement.findByPk(announcement.id, {
      include: [{ model: Attachment, as: 'attachments' }],
    });

    return success(res, data, 'Announcement created', 201);
  } catch (err) {
    next(err);
  }
};

// ─── Update ──────────────────────────────────────────────────────────────────

const updateAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findByPk(req.params.id, {
      include: [{ model: Attachment, as: 'attachments' }],
    });

    if (!announcement) {
      return error(res, 'Announcement not found', 404);
    }

    const isAuthor = announcement.author_id === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isAuthor && !isAdmin) {
      return error(res, 'Forbidden', 403);
    }

    const { title, body, category, deadline, useful_links, remove_attachment_ids } = req.body;
    const files = req.files || [];

    // Remove specific attachments
    if (remove_attachment_ids) {
      const ids = Array.isArray(remove_attachment_ids) ? remove_attachment_ids : [remove_attachment_ids];
      const toRemove = announcement.attachments.filter((a) => ids.includes(a.id));
      await deleteAttachments(toRemove);
      await Attachment.destroy({ where: { id: ids, announcement_id: announcement.id } });
    }

    const remainingCount = announcement.attachments.length - (remove_attachment_ids ? remove_attachment_ids.length : 0);
    if (remainingCount + files.length > MAX_ATTACHMENTS) {
      return error(res, `Maximum ${MAX_ATTACHMENTS} attachments allowed`, 400);
    }

    // Upload new attachments
    if (files.length > 0) {
      const attachmentRows = await uploadFiles(files, announcement.id);
      await Attachment.bulkCreate(attachmentRows);
    }

    await announcement.update({
      ...(title !== undefined && { title }),
      ...(body !== undefined && { body }),
      ...(category !== undefined && { category }),
      ...(deadline !== undefined && { deadline: deadline || null }),
      ...(useful_links !== undefined && { useful_links: JSON.parse(useful_links) }),
    });

    const data = await Announcement.findByPk(announcement.id, {
      include: [{ model: Attachment, as: 'attachments' }],
    });
    return success(res, data, 'Announcement updated');
  } catch (err) {
    next(err);
  }
};

// ─── Publish ─────────────────────────────────────────────────────────────────

const publishAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findByPk(req.params.id);

    if (!announcement) {
      return error(res, 'Announcement not found', 404);
    }

    const isAuthor = announcement.author_id === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isAuthor && !isAdmin) {
      return error(res, 'Forbidden', 403);
    }

    if (announcement.status === 'published') {
      return error(res, 'Announcement is already published', 400);
    }

    await announcement.update({ status: 'published' });

    notificationService.fanOut(announcement, 'new_announcement');

    return success(res, announcement, 'Announcement published');
  } catch (err) {
    next(err);
  }
};

// ─── Pin ─────────────────────────────────────────────────────────────────────

const togglePin = async (req, res, next) => {
  try {
    const announcement = await Announcement.findByPk(req.params.id);

    if (!announcement) {
      return error(res, 'Announcement not found', 404);
    }

    const isAuthor = announcement.author_id === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isAuthor && !isAdmin) {
      return error(res, 'Forbidden', 403);
    }

    const newPinned = !announcement.is_pinned;
    await announcement.update({
      is_pinned: newPinned,
      pinned_at: newPinned ? new Date() : null,
    });

    return success(res, announcement, newPinned ? 'Announcement pinned' : 'Announcement unpinned');
  } catch (err) {
    next(err);
  }
};

// ─── Delete ──────────────────────────────────────────────────────────────────

const deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findByPk(req.params.id, {
      include: [{ model: Attachment, as: 'attachments' }],
    });

    if (!announcement) {
      return error(res, 'Announcement not found', 404);
    }

    const isAuthor = announcement.author_id === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isAuthor && !isAdmin) {
      return error(res, 'Forbidden', 403);
    }

    // Delete all attachments from Cloudinary first
    await deleteAttachments(announcement.attachments);

    await announcement.destroy();

    return success(res, null, 'Announcement deleted');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getFeed,
  searchAnnouncements,
  getMyPosts,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  publishAnnouncement,
  togglePin,
  deleteAnnouncement,
};
