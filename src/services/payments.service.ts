import api from './api';
import type { Payment } from '../types';

interface CardDetails {
  number: string;
  cvc: string;
  exp_month: string;
  exp_year: string;
}

export const paymentsService = {
  async processPayment(orderId: number, cardDetails?: CardDetails): Promise<Payment> {
    const { data } = await api.post<Payment>('/payments/process', {
      orderId,
      cardDetails,
    });
    return data;
  },
};
