import api from './api';

/*
 * ============================================================
 * TIPOS DO MÓDULO DE PLANEJAMENTO
 * ============================================================
 */

/*
 * Produto utilizado no select da tela de Planejamento.
 */
export interface PlanningProduct {
  id: number;
  code: string;
  name: string;
  description?: string;
}

/*
 * Dados enviados para:
 *
 * POST /api/planning/run
 */
export interface PlanningRequest {
  productId: number;
  quantity: number;
  dueDate?: string | null;
}

/*
 * Máquina retornada pelo planejamento.
 */
export interface PlannedMachine {
  id: number;
  code: string;
  name: string;
  status: string;
  capacity: number;
}

/*
 * Operação do produto e máquinas capazes
 * de executá-la.
 */
export interface PlannedOperation {
  operationId: number;
  operation: string;
  duration: number;

  compatibleMachines: PlannedMachine[];

  selectedMachine: PlannedMachine | null;
}

/*
 * Vértice pertencente a um caminho
 * calculado pelo Dijkstra.
 */
export interface PlanningRouteVertex {
  id: number;
  name: string;
}

/*
 * Caminho entre duas máquinas.
 */
export interface ProductionRoute {
  fromMachineId: number;
  toMachineId: number;

  /*
   * Valor -1 significa que não existe
   * caminho entre as máquinas.
   */
  totalWeight: number;

  path: PlanningRouteVertex[];
}

/*
 * Ordem criada pelo planejamento.
 */
export interface PlanningOrder {
  orderId: number;
  productId: number;
  productCode: string;
  product: string;
  quantity: number;
  dueDate: string;
  status: string;
}

/*
 * Informações resumidas do Grafo.
 */
export interface PlanningGraphSummary {
  totalMachines: number;
  totalConnections: number;
}

/*
 * Resultado completo retornado pelo backend.
 *
 * materialsRequired permanece flexível porque
 * sua estrutura é gerada pelo BOMService.
 */
export interface PlanningResult {
  message: string;

  order: PlanningOrder;

  materialsRequired:
    | Record<string, unknown>
    | unknown[]
    | null;

  operations: PlannedOperation[];

  factoryGraph: PlanningGraphSummary;

  productionRoutes: ProductionRoute[];

  warnings: string[];
}

/*
 * ============================================================
 * PRODUTOS
 * ============================================================
 *
 * O Planejamento precisa carregar os produtos para
 * permitir que o usuário escolha qual será produzido.
 */
export const getPlanningProducts =
  async (): Promise<PlanningProduct[]> => {
    const response = await api.get('/products');

    return response.data;
  };

/*
 * ============================================================
 * EXECUTAR PLANEJAMENTO
 * ============================================================
 */
export const runPlanning = async (
  request: PlanningRequest
): Promise<PlanningResult> => {
  const response = await api.post(
    '/planning/run',
    request
  );

  return response.data;
};