const mongoose = require('mongoose');

const downloadSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true
  },
  downloadType: {
    type: String,
    enum: ['free', 'premium'],
    required: true
  },
  ipAddress: String,
  userAgent: String,
  downloadedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Download', downloadSchema);