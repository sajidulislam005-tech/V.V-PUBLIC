const stripe = require('../config/stripe');
const User = require('../models/User');
const Payment = require('../models/Payment');

// @desc    Create payment intent
// @route   POST /api/payments/create-payment-intent
// @access  Private
const createPaymentIntent = async (req, res) => {
  try {
    const { planType } = req.body;

    // Set price based on plan
    const amount = planType === 'yearly' ? 9999 : 999; // $99.99 or $9.99
    const currency = 'usd';

    // Create or get Stripe customer
    let customerId = req.user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: req.user.name,
        metadata: {
          userId: req.user._id.toString()
        }
      });
      customerId = customer.id;

      // Update user with Stripe customer ID
      await User.findByIdAndUpdate(req.user._id, { stripeCustomerId: customerId });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: customerId,
      metadata: {
        userId: req.user._id.toString(),
        planType
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount,
      currency
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Handle successful payment
// @route   POST /api/payments/success
// @access  Private
const paymentSuccess = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment not successful' });
    }

    const { userId, planType } = paymentIntent.metadata;

    // Calculate expiry date
    const expiresAt = new Date();
    if (planType === 'yearly') {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }

    // Create payment record
    await Payment.create({
      user: userId,
      stripePaymentId: paymentIntent.id,
      stripeCustomerId: paymentIntent.customer,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: 'completed',
      paymentMethod: paymentIntent.payment_method_types[0],
      planType,
      expiresAt
    });

    // Update user premium status
    await User.findByIdAndUpdate(userId, {
      isPremium: true,
      premiumExpiry: expiresAt
    });

    res.json({ message: 'Payment successful, premium activated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Handle Stripe webhook
// @route   POST /api/payments/webhook
// @access  Public
const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      // Handle successful payment
      console.log('PaymentIntent was successful!');
      break;
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('Payment failed:', failedPayment.id);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

module.exports = {
  createPaymentIntent,
  paymentSuccess,
  stripeWebhook
};