import api from './api';

export const cartService = {
  async getCart() {
    const { data } = await api.get('/cart');
    return data;
  },
  async addItem(productId: number, quantity: number, attributes?: any) {
    const { data } = await api.post('/cart/items', { productId, quantity, attributes });
    return data;
  },
  async updateQuantity(productId: number, quantity: number) {
    const { data } = await api.put(`/cart/items/${productId}`, { quantity });
    return data;
  },
  async removeItem(productId: number) {
    const { data } = await api.delete(`/cart/items/${productId}`);
    return data;
  },
  async clearCart() {
    const { data } = await api.delete('/cart');
    return data;
  }
};
