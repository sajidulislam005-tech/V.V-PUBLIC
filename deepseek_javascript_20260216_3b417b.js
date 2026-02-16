import API from './api';

export const paymentService = {
  createPaymentIntent: async (planType) => {
    const response = await API.post('/payments/create-payment-intent', { planType });
    return response.data;
  },

  confirmPayment: async (paymentIntentId) => {
    const response = await API.post('/payments/success', { paymentIntentId });
    return response.data;
  }
};