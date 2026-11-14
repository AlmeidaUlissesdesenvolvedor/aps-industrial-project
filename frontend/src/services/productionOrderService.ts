import api from './api';

/*
 * ============================================================
 * TIPOS DO MÓDULO DE ORDENS DE PRODUÇÃO
 * ============================================================
 */

/*
 * Produto retornado juntamente com a Ordem de Produção.
 */
export interface ProductionOrderProduct {
  id: number;
  code: string;
  name: string;
  description?: string;
}

/*
 * Status utilizado pelo enum OrderStatus no backend.
 *
 * Por padrão, enums .NET são serializados numericamente.
 *
 * 0 = Created
 * 1 = Planned
 * 2 = InProduction
 * 3 = Completed
 * 4 = Delayed
 */
export type ProductionOrderStatus =
  | 0
  | 1
  | 2
  | 3
  | 4;

/*
 * Ordem de Produção retornada pela API.
 */
export interface ProductionOrder {
  id: number;

  productId: number;

  quantity: number;

  dueDate: string;

  status:
    | ProductionOrderStatus
    | string;

  product?: ProductionOrderProduct;

  schedules?: unknown[];
}

/*
 * ============================================================
 * GET - LISTAR ORDENS
 * ============================================================
 *
 * Endpoint:
 *
 * GET /api/productionorders
 */
export const getProductionOrders =
  async (): Promise<ProductionOrder[]> => {
    const response = await api.get(
      '/productionorders'
    );

    return response.data;
  };

/*
 * ============================================================
 * GET - BUSCAR ORDEM POR ID
 * ============================================================
 */
export const getProductionOrder =
  async (
    id: number
  ): Promise<ProductionOrder> => {
    const response = await api.get(
      `/productionorders/${id}`
    );

    return response.data;
  };

/*
 * ============================================================
 * DELETE - EXCLUIR ORDEM
 * ============================================================
 */
export const deleteProductionOrder =
  async (
    id: number
  ): Promise<void> => {
    await api.delete(
      `/productionorders/${id}`
    );
  };