import api from './api';

export interface BOMTreeNode {
  id: number;
  name: string;
  quantity: number;
  children: BOMTreeNode[];
}

export interface BOMTreeResponse {
  productId: number;
  productCode: string;
  productName: string;

  tree: BOMTreeNode;

  traversals: {
    preOrder: string[];
    postOrder: string[];
  };
}

export interface BOMItem {
  id: number;

  productId: number;
  productName: string;

  componentId: number;

  materialName: string;
  materialCode: string;
  materialUnit: string;

  quantity: number;
}

export const getBOMTree = async (
  productId: number
): Promise<BOMTreeResponse> => {
  const response = await api.get(
    `/planning/bom-tree/${productId}`
  );

  return response.data;
};

export const getBOMItemsByProduct = async (
  productId: number
): Promise<BOMItem[]> => {
  const response = await api.get(
    `/bomitems/product/${productId}`
  );

  return response.data;
};