const { Resource, User, Course } = require('../models');
const { streamUpload, deleteFile } = require('../services/file.service');
const { success, error } = require('../utils/response');

const RESOURCE_FOLDER = 'noticehub/resources';

// GET /resources
exports.getResources = async (req, res, next) => {
  try {
    const { type, level, mine } = req.query;
    const where = {};

    if (req.user.role === 'lecturer') {
      // Lecturers only ever see their own uploads
      where.author_id = req.user.id;
    } else if (mine === 'true') {
      // Course rep "My Uploads" view
      where.author_id = req.user.id;
    } else {
      // Students and course_rep default view — all resources for their program
      where.program = req.user.program;
    }

    if (type) where.type = type;
    if (level) where.level = parseInt(level);

    const resources = await Resource.findAll({
      where,
      include: [{ model: User, as: 'author', attributes: ['id', 'full_name'] }],
      order: [['created_at', 'DESC']],
    });

    return success(res, resources);
  } catch (err) {
    next(err);
  }
};

// POST /resources
exports.createResource = async (req, res, next) => {
  try {
    const { title, description, type, url, member_count, target_level, course_id } = req.body;

    // Resolve program + level — default to user's own program/level for course_rep
    let program = req.user.program;
    let level = req.user.level ?? null; // course_rep: use their own level by default

    if (req.user.role === 'lecturer') {
      if (!course_id) return error(res, 'Lecturers must select a course when uploading a resource', 400);
      const course = await Course.findByPk(course_id);
      if (!course) return error(res, 'Course not found', 404);
      program = course.program;
      level = parseInt(course.level);
    }

    let fileData = {};
    if (type === 'file') {
      if (!req.file) return error(res, 'File is required for type=file', 400);
      const uploaded = await streamUpload(req.file.buffer, RESOURCE_FOLDER);
      fileData = {
        file_url: uploaded.secure_url,
        public_id: uploaded.public_id,
        file_name: req.file.originalname,
        file_size_bytes: req.file.size,
      };
    }

    const resource = await Resource.create({
      title,
      description: description || null,
      type,
      url: type !== 'file' ? url : null,
      member_count: member_count || null,
      program,
      level,
      author_id: req.user.id,
      ...fileData,
    });

    return success(res, resource, 'Resource created', 201);
  } catch (err) {
    next(err);
  }
};

// PATCH /resources/:id
exports.updateResource = async (req, res, next) => {
  try {
    const resource = await Resource.findByPk(req.params.id);
    if (!resource) return error(res, 'Resource not found', 404);

    const isOwner = resource.author_id === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return error(res, 'Forbidden', 403);

    const { title, description, type, url, member_count, target_level } = req.body;
    const newType = type || resource.type;

    // file → link: delete old CDN file
    if (resource.type === 'file' && newType !== 'file') {
      if (resource.public_id) await deleteFile(resource.public_id).catch(() => {});
      resource.file_url = null;
      resource.public_id = null;
      resource.file_name = null;
      resource.file_size_bytes = null;
    }

    // link → file or replacing file
    if (newType === 'file' && req.file) {
      if (resource.public_id) await deleteFile(resource.public_id).catch(() => {});
      const uploaded = await streamUpload(req.file.buffer, RESOURCE_FOLDER);
      resource.file_url = uploaded.secure_url;
      resource.public_id = uploaded.public_id;
      resource.file_name = req.file.originalname;
      resource.file_size_bytes = req.file.size;
    }

    if (title !== undefined) resource.title = title;
    if (description !== undefined) resource.description = description;
    if (member_count !== undefined) resource.member_count = member_count;
    if (target_level !== undefined) resource.level = target_level ? parseInt(target_level) : null;
    resource.type = newType;
    resource.url = newType !== 'file' ? (url || resource.url) : null;

    await resource.save();
    return success(res, resource, 'Resource updated');
  } catch (err) {
    next(err);
  }
};

// DELETE /resources/:id
exports.deleteResource = async (req, res, next) => {
  try {
    const resource = await Resource.findByPk(req.params.id);
    if (!resource) return error(res, 'Resource not found', 404);

    const isOwner = resource.author_id === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return error(res, 'Forbidden', 403);

    if (resource.type === 'file' && resource.public_id) {
      await deleteFile(resource.public_id).catch(() => {});
    }

    await resource.destroy();
    return success(res, null, 'Resource deleted');
  } catch (err) {
    next(err);
  }
};
