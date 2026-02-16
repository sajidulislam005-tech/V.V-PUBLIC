const express = require('express');
const router = express.Router();
const {
  getVideos,
  getVideoById,
  uploadVideo,
  downloadVideo,
  likeVideo,
  getRelatedVideos,
  getTrendingVideos
} = require('../controllers/videoController');
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { validateVideo } = require('../middleware/validation');

router.route('/')
  .get(getVideos)
  .post(
    protect,
    admin,
    upload.fields([
      { name: 'video', maxCount: 1 },
      { name: 'thumbnail', maxCount: 1 },
      { name: 'preview', maxCount: 1 }
    ]),
    validateVideo,
    uploadVideo
  );

router.get('/trending', getTrendingVideos);
router.get('/:id', getVideoById);
router.get('/:id/related', getRelatedVideos);
router.post('/:id/download', protect, downloadVideo);
router.post('/:id/like', protect, likeVideo);

module.exports = router;