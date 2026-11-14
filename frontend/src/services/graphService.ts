import api from './api';

/*
 * ============================================================
 * TIPOS UTILIZADOS PELO GRAFO
 * ============================================================
 *
 * Esses tipos representam exatamente os dados retornados
 * pelo GraphController do backend.
 */

/*
 * Representa uma máquina dentro do Grafo.
 *
 * No backend:
 * Machine -> Vertex
 */
export interface GraphVertex {
  id: number;
  name: string;
}

/*
 * Representa uma conexão entre duas máquinas.
 *
 * No backend:
 * MachineConnection -> Edge
 */
export interface GraphEdge {
  id: number;
  fromMachineId: number;
  toMachineId: number;
  weight: number;
}

/*
 * Estrutura completa retornada por:
 *
 * GET /api/graph
 */
export interface GraphData {
  vertices: GraphVertex[];
  edges: GraphEdge[];
}

/*
 * Resultado utilizado tanto pelo BFS
 * quanto pelo DFS.
 */
export interface GraphTraversalResult {
  algorithm: string;
  startMachineId: number;
  traversal: GraphVertex[];
}

/*
 * Resultado do algoritmo de Dijkstra.
 */
export interface DijkstraResult {
  algorithm: string;

  fromMachineId: number;

  toMachineId: number;

  /*
   * Caminho encontrado pelo algoritmo.
   *
   * Exemplo:
   *
   * Torno CNC
   *    ↓
   * Fresadora CNC
   *    ↓
   * Estação de Montagem
   */
  path: GraphVertex[];

  /*
   * Soma dos pesos das arestas
   * do menor caminho encontrado.
   */
  totalWeight: number;
}

/*
 * ============================================================
 * BUSCAR GRAFO COMPLETO
 * ============================================================
 *
 * Retorna:
 *
 * - vértices;
 * - arestas;
 * - pesos.
 */
export const getGraph = async (): Promise<GraphData> => {
  const response = await api.get('/graph');

  return response.data;
};

/*
 * ============================================================
 * BFS - BUSCA EM LARGURA
 * ============================================================
 *
 * Recebe o ID da máquina inicial.
 */
export const executeBFS = async (
  startMachineId: number
): Promise<GraphTraversalResult> => {
  const response = await api.get(
    `/graph/bfs/${startMachineId}`
  );

  return response.data;
};

/*
 * ============================================================
 * DFS - BUSCA EM PROFUNDIDADE
 * ============================================================
 *
 * Recebe o ID da máquina inicial.
 */
export const executeDFS = async (
  startMachineId: number
): Promise<GraphTraversalResult> => {
  const response = await api.get(
    `/graph/dfs/${startMachineId}`
  );

  return response.data;
};

/*
 * ============================================================
 * DIJKSTRA - MENOR CAMINHO
 * ============================================================
 *
 * Calcula o caminho de menor peso
 * entre duas máquinas.
 */
export const executeDijkstra = async (
  fromMachineId: number,
  toMachineId: number
): Promise<DijkstraResult> => {
  const response = await api.get(
    '/graph/dijkstra',
    {
      params: {
        fromMachineId,
        toMachineId,
      },
    }
  );

  return response.data;
};