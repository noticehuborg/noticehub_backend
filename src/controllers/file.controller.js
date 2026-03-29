const { streamUpload, deleteFile } = require('../services/file.service');
const { success, error } = require('../utils/response');

const FILE_FOLDER = 'noticehub/attachments';

const uploadFiles = async (req, res, next) => {
  try {
    const files = req.files || [];

    if (files.length === 0) {
      return error(res, 'No files provided', 400);
    }

    const uploaded = [];
    for (const file of files) {
      const result = await streamUpload(file.buffer, FILE_FOLDER);
      uploaded.push({
        fileId: result.public_id,
        fileUrl: result.secure_url,
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
      });
    }

    return success(res, uploaded, 'Files uploaded', 201);
  } catch (err) {
    next(err);
  }
};

const deleteUploadedFile = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    // fileId may contain slashes (Cloudinary public_id with folder prefix)
    await deleteFile(decodeURIComponent(fileId));
    return success(res, null, 'File deleted');
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadFiles, deleteUploadedFile };
