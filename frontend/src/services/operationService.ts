// Importa a instância do Axios já configurada com a URL da nossa API.
// Exemplo de baseURL:
// http://localhost:5237/api
import api from './api';

/*
 * Representa uma operação retornada pelo backend.
 *
 * Exemplo:
 * {
 *   id: 1,
 *   productId: 1,
 *   name: "Corte",
 *   duration: 15
 * }
 */
export interface Operation {
  id: number;
  productId: number;
  name: string;
  duration: number;
}

/*
 * Dados utilizados no formulário para cadastrar
 * ou editar uma operação.
 *
 * O ID não é enviado porque é gerado pelo banco.
 */
export interface OperationFormData {
  productId: number;
  name: string;
  duration: number;
}

/*
 * Estrutura mínima de Produto necessária
 * para preencher o campo de seleção da operação.
 */
export interface ProductOption {
  id: number;
  code: string;
  name: string;
}

/*
 * GET /api/operations
 *
 * Busca todas as operações cadastradas.
 */
export const getOperations = async (): Promise<Operation[]> => {
  const response = await api.get('/operations');

  return response.data;
};

/*
 * GET /api/operations/{id}
 *
 * Busca uma operação específica pelo ID.
 */
export const getOperationById = async (
  id: number
): Promise<Operation> => {
  const response = await api.get(`/operations/${id}`);

  return response.data;
};

/*
 * POST /api/operations
 *
 * Cadastra uma nova operação.
 *
 * O backend valida se o ProductId informado
 * realmente corresponde a um produto existente.
 */
export const createOperation = async (
  data: OperationFormData
): Promise<Operation> => {
  const response = await api.post('/operations', data);

  return response.data;
};

/*
 * PUT /api/operations/{id}
 *
 * Atualiza uma operação existente.
 */
export const updateOperation = async (
  id: number,
  data: OperationFormData
): Promise<void> => {
  await api.put(`/operations/${id}`, data);
};

/*
 * DELETE /api/operations/{id}
 *
 * Remove uma operação do banco.
 */
export const deleteOperation = async (
  id: number
): Promise<void> => {
  await api.delete(`/operations/${id}`);
};

/*
 * GET /api/products
 *
 * Também precisamos buscar os produtos
 * para que o usuário possa escolher a qual
 * produto a operação pertence.
 */
export const getProductsForOperations = async (): Promise<
  ProductOption[]
> => {
  const response = await api.get('/products');

  return response.data;
};