/*
 * Serviço responsável pela comunicação entre o frontend
 * e os endpoints de conexões entre máquinas.
 *
 * Essas conexões serão utilizadas posteriormente
 * para construir o Grafo da fábrica.
 */

import api from './api';

/*
 * Estrutura simplificada de uma máquina que pode
 * ser retornada dentro de uma conexão pelo backend.
 */
export interface ConnectionMachine {
  id: number;
  code: string;
  name: string;
  status?: number;
  capacity?: number;
}

/*
 * Representa uma conexão entre duas máquinas.
 *
 * Exemplo:
 *
 * Torno CNC ---- peso 5 ----> Fresadora
 *
 * FromMachine = origem
 * ToMachine   = destino
 */
export interface MachineConnection {
  id: number;

  fromMachineId: number;
  toMachineId: number;

  /*
   * O peso poderá representar distância,
   * tempo ou custo entre as máquinas.
   *
   * Posteriormente esse valor será utilizado
   * principalmente pelo algoritmo de Dijkstra.
   */
  weight: number;

  /*
   * O backend utiliza Include() para carregar
   * as máquinas de origem e destino.
   *
   * Por isso essas propriedades podem vir
   * junto da resposta da API.
   */
  fromMachine?: ConnectionMachine;
  toMachine?: ConnectionMachine;
}

/*
 * Estrutura utilizada para cadastrar
 * ou editar uma conexão.
 */
export interface MachineConnectionFormData {
  fromMachineId: number;
  toMachineId: number;
  weight: number;
}

/*
 * GET /api/machineconnections
 *
 * Busca todas as conexões cadastradas.
 */
export const getMachineConnections = async (): Promise<
  MachineConnection[]
> => {
  const response = await api.get('/machineconnections');

  return response.data;
};

/*
 * GET /api/machineconnections/{id}
 *
 * Busca uma conexão específica.
 */
export const getMachineConnectionById = async (
  id: number
): Promise<MachineConnection> => {
  const response = await api.get(
    `/machineconnections/${id}`
  );

  return response.data;
};

/*
 * POST /api/machineconnections
 *
 * Cadastra uma nova aresta do Grafo.
 *
 * O backend atual recebe uma MachineConnection,
 * portanto enviamos também id = 0.
 *
 * As propriedades de navegação FromMachine
 * e ToMachine não precisam ser enviadas.
 */
export const createMachineConnection = async (
  data: MachineConnectionFormData
): Promise<MachineConnection> => {
  /*
 * O backend utiliza MachineConnectionDto,
 * portanto enviamos somente origem, destino e peso.
 */
const response = await api.post(
  '/machineconnections',
  data
);

  return response.data;
};

/*
 * PUT /api/machineconnections/{id}
 *
 * Atualiza origem, destino ou peso
 * de uma conexão existente.
 */
export const updateMachineConnection = async (
  id: number,
  data: MachineConnectionFormData
): Promise<void> => {
  await api.put(`/machineconnections/${id}`, {
    id,
    ...data,
  });
};

/*
 * DELETE /api/machineconnections/{id}
 *
 * Remove uma conexão do banco.
 */
export const deleteMachineConnection = async (
  id: number
): Promise<void> => {
  await api.delete(`/machineconnections/${id}`);
};