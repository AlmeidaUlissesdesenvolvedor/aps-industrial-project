import api from './api';

export interface Product {
  id: number;
  code: string;
  name: string;
  description?: string | null;
}

export interface ProductRequest {
  id?: number;
  code: string;
  name: string;
  description?: string | null;
}

export const getProducts = async (): Promise<Product[]> => {
  const response = await api.get<Product[]>('/products');
  return response.data;
};

export const getProductById = async (id: number): Promise<Product> => {
  const response = await api.get<Product>(`/products/${id}`);
  return response.data;
};

export const createProduct = async (
  product: ProductRequest,
): Promise<Product> => {
  const response = await api.post<Product>('/products', product);
  return response.data;
};

export const updateProduct = async (
  id: number,
  product: ProductRequest,
): Promise<void> => {
  await api.put(`/products/${id}`, {
    ...product,
    id,
  });
};

export const deleteProduct = async (id: number): Promise<void> => {
  await api.delete(`/products/${id}`);
};