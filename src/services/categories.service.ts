import api from './api';
import type { Category } from '../types';

export const categoriesService = {
  async getAll(): Promise<Category[]> {
    const { data } = await api.get<Category[]>('/categories');
    return data;
  },

  async getById(id: number): Promise<Category> {
    const { data } = await api.get<Category>(`/categories/${id}`);
    return data;
  },

  async getBySlug(slug: string): Promise<Category> {
    const { data } = await api.get<Category>(`/categories/slug/${slug}`);
    return data;
  },

  async create(categoryData: { name: string; slug: string; parentId?: number | null }): Promise<Category> {
    const { data } = await api.post<Category>('/categories', categoryData);
    return data;
  },

  async update(id: number, categoryData: Partial<{ name: string; slug: string; parentId: number | null }>): Promise<Category> {
    const { data } = await api.patch<Category>(`/categories/${id}`, categoryData);
    return data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/categories/${id}`);
  }
};
