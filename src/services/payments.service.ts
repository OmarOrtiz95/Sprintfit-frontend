import api from './api';

export const paymentsService = {
  async processNequiPayment(data: { phoneNumber: string; amountInCents: number; customerEmail: string; orderId: number }) {
    const response = await api.post('/payments/nequi', data);
    return response.data;
  },
  async getTransaction(transactionId: string) {
    const response = await api.get(`/payments/${transactionId}`);
    return response.data;
  }
};
