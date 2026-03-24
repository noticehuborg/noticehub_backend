const streamifier = require('streamifier');
const cloudinary = require('../config/cloudinary');

/**
 * Uploads a file buffer to Cloudinary.
 * @param {Buffer} buffer - File buffer from multer memoryStorage
 * @param {string} folder - Cloudinary folder (e.g. 'noticehub/attachments')
 * @returns {Promise<object>} Cloudinary upload result { secure_url, public_id, ... }
 */
const streamUpload = (buffer, folder = 'noticehub') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder, resource_type: 'auto' }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

/**
 * Deletes a file from Cloudinary by its public_id.
 * @param {string} publicId - Cloudinary public_id
 */
const deleteFile = async (publicId) => {
  return cloudinary.uploader.destroy(publicId, { resource_type: 'raw' }).catch(() =>
    cloudinary.uploader.destroy(publicId)
  );
};

module.exports = { streamUpload, deleteFile };
