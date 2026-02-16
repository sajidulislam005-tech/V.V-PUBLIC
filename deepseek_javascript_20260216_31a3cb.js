const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: [
      'Nature',
      'Technology',
      'Business',
      'People',
      'Animals',
      'Sports',
      'Food',
      'Travel',
      'Music',
      'Animation',
      'Abstract',
      'Other'
    ]
  },
  thumbnail: {
    type: String,
    required: [true, 'Please provide a thumbnail']
  },
  thumbnailPublicId: {
    type: String,
    required: true
  },
  videoUrl: {
    type: String,
    required: [true, 'Please provide a video URL']
  },
  videoPublicId: {
    type: String,
    required: true
  },
  previewVideoUrl: {
    type: String,
    required: true
  },
  previewPublicId: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  resolution: {
    type: String,
    enum: ['SD', 'HD', 'Full HD', '4K'],
    default: 'HD'
  },
  fileSize: {
    type: Number,
    required: true
  },
  format: {
    type: String,
    default: 'mp4'
  },
  premium: {
    type: Boolean,
    default: false
  },
  downloads: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for search functionality
videoSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Video', videoSchema);