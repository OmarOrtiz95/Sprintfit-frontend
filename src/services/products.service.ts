import api from './api';
import type { Product } from '../types';

export const productsService = {
  async getAll(): Promise<Product[]> {
    const { data } = await api.get<Product[]>('/products');
    return data;
  },

  async getById(id: number): Promise<Product> {
    const { data } = await api.get<Product>(`/products/${id}`);
    return data;
  },

  async getByCategoryId(categoryId: number): Promise<Product[]> {
    const products = await this.getAll();
    return products.filter(p => p.categoryId === categoryId);
  },

  async create(productData: any): Promise<Product> {
    const { data } = await api.post<Product>('/products', productData);
    return data;
  },

  async update(id: number, productData: any): Promise<Product> {
    const { data } = await api.patch<Product>(`/products/${id}`, productData);
    return data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/products/${id}`);
  }
};
