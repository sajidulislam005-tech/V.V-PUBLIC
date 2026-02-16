const cloudinary = require('../config/cloudinary');
const fs = require('fs');

const uploadToCloudinary = async (file, folder, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: `stock-video/${folder}`,
      resource_type: 'auto',
      ...options
    });

    // Remove file from local storage
    fs.unlinkSync(file.path);

    return {
      url: result.secure_url,
      publicId: result.public_id,
      duration: result.duration,
      format: result.format,
      bytes: result.bytes
    };
  } catch (error) {
    // Remove file from local storage even if upload fails
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    throw error;
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
  }
};

module.exports = { uploadToCloudinary, deleteFromCloudinary };