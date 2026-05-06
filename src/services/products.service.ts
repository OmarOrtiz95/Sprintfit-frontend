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

  async create(productData: any, imageFiles: File[]): Promise<Product> {
    const formData = new FormData();
    
    // Add product data fields
    Object.entries(productData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    // Add image files
    imageFiles.forEach(file => {
      formData.append('images', file);
    });

    const { data } = await api.post<Product>('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  async update(id: number, productData: any, imageFiles: File[] = [], existingImages: string[] = []): Promise<Product> {
    const formData = new FormData();
    
    // Add product data fields
    Object.entries(productData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    // Add existing images to keep
    formData.append('existingImages', JSON.stringify(existingImages));

    // Add new image files
    imageFiles.forEach(file => {
      formData.append('images', file);
    });

    const { data } = await api.patch<Product>(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/products/${id}`);
  }
};
