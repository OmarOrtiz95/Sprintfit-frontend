import api from './api';
import type { Order } from '../types';

interface CreateOrderItem {
  productId: number;
  quantity: number;
}

interface CreateOrderData {
  shippingAddress: string;
  phone?: string;
  items: CreateOrderItem[];
}

export const ordersService = {
  async create(orderData: CreateOrderData): Promise<Order> {
    const { data } = await api.post<Order>('/orders', orderData);
    return data;
  },

  async getMyOrders(): Promise<Order[]> {
    const { data } = await api.get<Order[]>('/orders/my-orders');
    return data;
  },

  async getById(id: number): Promise<Order> {
    const { data } = await api.get<Order>(`/orders/${id}`);
    return data;
  },

  async getAll(): Promise<Order[]> {
    const { data } = await api.get<Order[]>('/orders');
    return data;
  },

  async updateStatus(id: number, status: string): Promise<Order> {
    const { data } = await api.patch<Order>(`/orders/${id}/status`, { status });
    return data;
  },
};
