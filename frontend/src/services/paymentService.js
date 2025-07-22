import api from './api';

class PaymentService {
  async createPayment(planData) {
    try {
      const response = await api.post('/payments/create', planData);
      return response.data;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  async checkPaymentStatus(paymentId) {
    try {
      const response = await api.get(`/payments/status/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error('Error checking payment status:', error);
      throw error;
    }
  }

  async getPaymentHistory(wallet) {
    try {
      const response = await api.get(`/payments/history/${wallet}`);
      return response.data;
    } catch (error) {
      console.error('Error getting payment history:', error);
      throw error;
    }
  }

  // Redirect to payment URL
  redirectToPayment(paymentUrl) {
    window.location.href = paymentUrl;
  }

  // Handle payment success callback
  handlePaymentSuccess(paymentData) {
    // Store payment info in localStorage for confirmation page
    localStorage.setItem('lastPayment', JSON.stringify(paymentData));
    
    // Redirect to success page
    window.location.href = '/payment-success';
  }

  // Handle payment cancellation
  handlePaymentCancel() {
    // Redirect to cancel page
    window.location.href = '/payment-cancel';
  }

  // Get supported payment methods
  async getPaymentMethods() {
    try {
      const response = await api.get('/payments/methods');
      return response.data;
    } catch (error) {
      console.error('Error getting payment methods:', error);
      return [];
    }
  }

  // Calculate plan pricing with bonuses
  calculatePlanPricing(plan) {
    const basePrices = {
      'Basic': { price: 9.99, tokens: 50, bonus: 10 },
      'Intermedio': { price: 19.99, tokens: 120, bonus: 30 },
      'Premium': { price: 39.99, tokens: 300, bonus: 100 },
      'Unlimited': { price: 99.99, tokens: Infinity, bonus: 0 }
    };

    const planInfo = basePrices[plan];
    if (!planInfo) return null;

    return {
      ...planInfo,
      totalTokens: planInfo.tokens === Infinity ? Infinity : planInfo.tokens + planInfo.bonus,
      savings: planInfo.bonus > 0 ? `+${planInfo.bonus} bonus tokens` : null
    };
  }
}

export default new PaymentService();