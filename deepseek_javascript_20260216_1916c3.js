const express = require('express');
const router = express.Router();
const {
  createPaymentIntent,
  paymentSuccess,
  stripeWebhook
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/create-payment-intent', protect, createPaymentIntent);
router.post('/success', protect, paymentSuccess);
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

module.exports = router;