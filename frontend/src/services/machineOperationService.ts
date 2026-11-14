// Importa a instância do Axios configurada no projeto.
// Ela já contém a baseURL da API:
// http://localhost:5237/api
import api from './api';

/*
 * Representa uma associação entre uma máquina
 * e uma operação retornada pelo backend.
 *
 * Exemplo:
 *
 * {
 *   machineId: 1,
 *   operationId: 2,
 *   machineName: "Torno CNC",
 *   operationName: "Corte"
 * }
 */
export interface MachineOperation {
  machineId: number;
  operationId: number;
  machineName: string;
  operationName: string;
}

/*
 * Estrutura enviada ao backend ao criar
 * uma nova associação Máquina x Operação.
 */
export interface MachineOperationFormData {
  machineId: number;
  operationId: number;
}

/*
 * GET /api/machineoperations
 *
 * Retorna todas as associações cadastradas.
 */
export const getMachineOperations = async (): Promise<
  MachineOperation[]
> => {
  const response = await api.get('/machineoperations');

  return response.data;
};

/*
 * GET /api/machineoperations/{machineId}/{operationId}
 *
 * Busca uma associação específica utilizando
 * a chave composta MachineId + OperationId.
 */
export const getMachineOperation = async (
  machineId: number,
  operationId: number
): Promise<MachineOperation> => {
  const response = await api.get(
    `/machineoperations/${machineId}/${operationId}`
  );

  return response.data;
};

/*
 * POST /api/machineoperations
 *
 * Cria uma nova associação entre uma máquina
 * e uma operação.
 *
 * O backend já verifica:
 * - se a máquina existe;
 * - se a operação existe;
 * - se a associação já foi cadastrada.
 */
export const createMachineOperation = async (
  data: MachineOperationFormData
): Promise<void> => {
  await api.post('/machineoperations', data);
};

/*
 * DELETE /api/machineoperations/{machineId}/{operationId}
 *
 * Remove uma associação existente.
 *
 * Como MachineOperation utiliza uma chave composta,
 * precisamos enviar os dois IDs para identificar
 * corretamente o relacionamento.
 */
export const deleteMachineOperation = async (
  machineId: number,
  operationId: number
): Promise<void> => {
  await api.delete(
    `/machineoperations/${machineId}/${operationId}`
  );
};