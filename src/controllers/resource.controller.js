// controllers/resource.controller.js
import fs from 'fs';
import path from 'path';
import db from '../models/index.js';
const { Resource, User } = db;

// 🔹 helper: check ownership
const isOwnerOrAdmin = (resource, user) => {
  return resource.author_id === user.id || user.role === 'admin';
};

// ✅ GET /resources
export const getResources = async (req, res, next) => {
  try {
    const { type, level } = req.query;

    const where = {
      program: req.user.program, // 🔒 lock to user's program
    };
    if (type) where.type = type;
    if (level) where.level = level;

    const resources = await Resource.findAll({
      where,
      order: [['created_at', 'DESC']],
      include: [
        {
          association: 'author',
          attributes: ['id', 'full_name'],
        },
      ],
    });

    res.json({ success: true, data: resources });
  } catch (err) {
    next(err);
  }
};

// ✅ POST /resources
export const createResource = async (req, res, next) => {
  try {
    const { title, description, type, level } = req.body;

    let fileData = {};
    if (type === 'file') {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'File is required' });
      }

      fileData = {
        file_url: `/uploads/${req.file.filename}`,
        public_id: req.file.filename,
        file_name: req.file.originalname,
        file_size_bytes: req.file.size,
      };
    }

    const resource = await Resource.create({
      title,
      description,
      type,
      url: type !== 'file' ? req.body.url : null,
      ...fileData,
      program: req.user.program,
      level: level || null, // ✅ FIXED
      author_id: req.user.id,
    });

    res.status(201).json({ success: true, data: resource });
  } catch (err) {
    next(err);
  }
};

// ✅ PATCH /resources/:id
export const updateResource = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resource = await Resource.findByPk(id);

    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });
    if (!isOwnerOrAdmin(resource, req.user)) return res.status(403).json({ success: false, message: 'Not allowed' });

    const { type } = req.body;

    // 🔄 handle type change
    if (type && type !== resource.type) {
      // file → link
      if (resource.type === 'file') {
        const filePath = path.join('uploads', resource.public_id);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        resource.file_url = null;
        resource.public_id = null;
        resource.file_name = null;
        resource.file_size_bytes = null;
      }

      // link → file
      if (type === 'file') {
        if (!req.file) return res.status(400).json({ success: false, message: 'File is required' });

        resource.file_url = `/uploads/${req.file.filename}`;
        resource.public_id = req.file.filename;
        resource.file_name = req.file.originalname;
        resource.file_size_bytes = req.file.size;
      }
    }

    // 🔄 update fields
    resource.title = req.body.title || resource.title;
    resource.description = req.body.description || resource.description;
    resource.type = type || resource.type;
    resource.url = resource.type !== 'file' ? req.body.url : null;

    await resource.save();

    res.json({ success: true, data: resource });
  } catch (err) {
    next(err);
  }
};

// ✅ DELETE /resources/:id
export const deleteResource = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resource = await Resource.findByPk(id);

    if (!resource) return res.status(404).json({ success: false, message: 'Not found' });
    if (!isOwnerOrAdmin(resource, req.user)) return res.status(403).json({ success: false, message: 'Not allowed' });

    // 🔥 delete local file if type is file
    if (resource.type === 'file') {
      const filePath = path.join('uploads', resource.public_id);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await resource.destroy();

    res.json({ success: true, message: 'Resource deleted' });
  } catch (err) {
    next(err);
  }
};