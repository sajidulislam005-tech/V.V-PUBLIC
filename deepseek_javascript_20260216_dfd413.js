const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getVideos,
  deleteVideo,
  getStats
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

router.use(protect, admin);

router.get('/stats', getStats);
router.route('/users')
  .get(getUsers);
router.route('/users/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);
router.route('/videos')
  .get(getVideos);
router.route('/videos/:id')
  .delete(deleteVideo);

module.exports = router;