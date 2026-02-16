const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// @desc    Add to wishlist
// @route   POST /api/users/wishlist/:videoId
// @access  Private
router.post('/wishlist/:videoId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.wishlist.includes(req.params.videoId)) {
      // Remove from wishlist
      user.wishlist = user.wishlist.filter(
        id => id.toString() !== req.params.videoId
      );
    } else {
      // Add to wishlist
      user.wishlist.push(req.params.videoId);
    }

    await user.save();

    res.json({
      wishlist: user.wishlist,
      message: 'Wishlist updated'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Get user downloads
// @route   GET /api/users/downloads
// @access  Private
router.get('/downloads', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'downloads.video',
        populate: { path: 'uploadedBy', select: 'name' }
      });

    res.json(user.downloads);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;