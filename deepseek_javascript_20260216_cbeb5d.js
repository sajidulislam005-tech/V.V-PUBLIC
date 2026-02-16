const Video = require('../models/Video');
const Download = require('../models/Download');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryUpload');

// @desc    Get all videos with filters
// @route   GET /api/videos
// @access  Public
const getVideos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const { category, search, sort, premium } = req.query;

    // Build filter object
    let filter = {};

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (premium !== undefined) {
      filter.premium = premium === 'true';
    }

    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort object
    let sortOption = {};
    switch (sort) {
      case 'latest':
        sortOption = { createdAt: -1 };
        break;
      case 'popular':
        sortOption = { downloads: -1 };
        break;
      case 'trending':
        sortOption = { views: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    // Execute query
    const videos = await Video.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate('uploadedBy', 'name');

    const total = await Video.countDocuments(filter);

    res.json({
      videos,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single video
// @route   GET /api/videos/:id
// @access  Public
const getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('uploadedBy', 'name')
      .populate('likes', 'name');

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Increment views
    video.views += 1;
    await video.save();

    res.json(video);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Upload video (Admin only)
// @route   POST /api/videos
// @access  Private/Admin
const uploadVideo = async (req, res) => {
  try {
    const { title, description, category, premium, tags } = req.body;

    if (!req.files || !req.files.video || !req.files.thumbnail || !req.files.preview) {
      return res.status(400).json({ message: 'Please upload video, thumbnail and preview files' });
    }

    // Upload to Cloudinary
    const videoUpload = await uploadToCloudinary(req.files.video[0], 'videos', {
      resource_type: 'video'
    });

    const thumbnailUpload = await uploadToCloudinary(req.files.thumbnail[0], 'thumbnails');

    const previewUpload = await uploadToCloudinary(req.files.preview[0], 'previews', {
      resource_type: 'video',
      quality: '30',
      format: 'mp4'
    });

    // Create video document
    const video = await Video.create({
      title,
      description,
      category,
      premium: premium === 'true',
      tags: tags ? tags.split(',') : [],
      videoUrl: videoUpload.url,
      videoPublicId: videoUpload.publicId,
      thumbnail: thumbnailUpload.url,
      thumbnailPublicId: thumbnailUpload.publicId,
      previewVideoUrl: previewUpload.url,
      previewPublicId: previewUpload.publicId,
      duration: videoUpload.duration || 0,
      fileSize: videoUpload.bytes,
      format: videoUpload.format,
      uploadedBy: req.user._id
    });

    res.status(201).json(video);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Download video
// @route   POST /api/videos/:id/download
// @access  Private
const downloadVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Check if user can download
    if (video.premium && !req.user.isPremium && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Premium subscription required' });
    }

    // Increment download count
    video.downloads += 1;
    await video.save();

    // Record download
    await Download.create({
      user: req.user._id,
      video: video._id,
      downloadType: video.premium ? 'premium' : 'free',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Add to user's download history
    await req.user.updateOne({
      $push: {
        downloads: {
          video: video._id,
          downloadedAt: new Date()
        }
      }
    });

    res.json({
      message: 'Download recorded successfully',
      downloadUrl: video.videoUrl,
      premium: video.premium
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Like/Unlike video
// @route   POST /api/videos/:id/like
// @access  Private
const likeVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const alreadyLiked = video.likes.includes(req.user._id);

    if (alreadyLiked) {
      // Unlike
      video.likes = video.likes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      // Like
      video.likes.push(req.user._id);
    }

    await video.save();

    res.json({
      likes: video.likes.length,
      liked: !alreadyLiked
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get related videos
// @route   GET /api/videos/:id/related
// @access  Public
const getRelatedVideos = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const relatedVideos = await Video.find({
      _id: { $ne: video._id },
      category: video.category
    })
      .limit(6)
      .populate('uploadedBy', 'name');

    res.json(relatedVideos);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get trending videos
// @route   GET /api/videos/trending
// @access  Public
const getTrendingVideos = async (req, res) => {
  try {
    const trendingVideos = await Video.find()
      .sort({ downloads: -1, views: -1 })
      .limit(10)
      .populate('uploadedBy', 'name');

    res.json(trendingVideos);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getVideos,
  getVideoById,
  uploadVideo,
  downloadVideo,
  likeVideo,
  getRelatedVideos,
  getTrendingVideos
};