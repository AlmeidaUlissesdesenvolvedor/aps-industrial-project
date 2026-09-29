import api from './api';

export interface Material {
  id: number;
  code: string;
  name: string;
  unit: string;
  stock: number;
}

export interface MaterialFormData {
  code: string;
  name: string;
  unit: string;
  stock: number;
}

export const materialService = {
  async getAll(): Promise<Material[]> {
    const response = await api.get('/materials');
    return response.data;
  },

  async getById(id: number): Promise<Material> {
    const response = await api.get(`/materials/${id}`);
    return response.data;
  },

  async create(data: MaterialFormData): Promise<Material> {
    const response = await api.post('/materials', data);
    return response.data;
  },

  async update(id: number, data: MaterialFormData): Promise<void> {
    await api.put(`/materials/${id}`, {
      id,
      ...data,
    });
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/materials/${id}`);
  },
};