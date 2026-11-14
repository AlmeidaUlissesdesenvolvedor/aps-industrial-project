import {
  useEffect,
  useState,
} from 'react';

import axios from 'axios';

import {
  AlertTriangle,
  Boxes,
  CalendarDays,
  CheckCircle2,
  Factory,
  GitBranch,
  Play,
  Route,
  Settings,
} from 'lucide-react';

import {
  getPlanningProducts,
  runPlanning,
} from '../services/planningService';

import type {
  PlanningProduct,
  PlanningResult,
} from '../services/planningService';

/*
 * ============================================================
 * PÁGINA DE PLANEJAMENTO DA PRODUÇÃO
 * ============================================================
 *
 * Esta tela integra:
 *
 * Produto
 *   ↓
 * BOM / Materiais
 *   ↓
 * Operações
 *   ↓
 * Máquinas compatíveis
 *   ↓
 * Grafo
 *   ↓
 * Dijkstra
 *   ↓
 * Ordem de Produção
 */
const Planning = () => {
  /*
   * Produtos disponíveis para planejamento.
   */
  const [
    products,
    setProducts,
  ] = useState<PlanningProduct[]>([]);

  /*
   * Produto selecionado.
   */
  const [
    productId,
    setProductId,
  ] = useState<number>(0);

  /*
   * Quantidade que será produzida.
   */
  const [
    quantity,
    setQuantity,
  ] = useState<number>(1);

  /*
   * Data desejada para conclusão.
   *
   * É opcional porque o backend já utiliza
   * 7 dias como padrão quando ela não é informada.
   */
  const [
    dueDate,
    setDueDate,
  ] = useState<string>('');

  /*
   * Resultado retornado pelo planejamento.
   */
  const [
    result,
    setResult,
  ] = useState<PlanningResult | null>(
    null
  );

  /*
   * Estados visuais da página.
   */
  const [
    loading,
    setLoading,
  ] = useState<boolean>(true);

  const [
    processing,
    setProcessing,
  ] = useState<boolean>(false);

  const [
    error,
    setError,
  ] = useState<string>('');

  /*
   * ========================================================
   * CARREGAMENTO INICIAL
   * ========================================================
   */
  useEffect(() => {
    loadProducts();
  }, []);

  /*
   * Busca os produtos cadastrados na API.
   */
  const loadProducts = async () => {
    try {
      setLoading(true);

      const data =
        await getPlanningProducts();

      setProducts(data);

      /*
       * Selecionamos automaticamente
       * o primeiro produto disponível.
       */
      if (data.length > 0) {
        setProductId(
          data[0].id
        );
      }
    } catch (error) {
      console.error(
        'Erro ao carregar produtos:',
        error
      );

      setError(
        'Não foi possível carregar os produtos.'
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ========================================================
   * EXECUTAR PLANEJAMENTO
   * ========================================================
   */
  const handleRunPlanning = async () => {
    setError('');

    /*
     * Validações básicas antes de enviar
     * os dados para o backend.
     */
    if (!productId) {
      setError(
        'Selecione um produto.'
      );

      return;
    }

    if (quantity <= 0) {
      setError(
        'A quantidade deve ser maior que zero.'
      );

      return;
    }

    try {
      setProcessing(true);

      /*
       * Limpamos o resultado anterior.
       */
      setResult(null);

      /*
       * Quando existe uma data selecionada,
       * enviamos um DateTime compatível
       * com o backend .NET.
       */
      const formattedDueDate =
        dueDate
          ? `${dueDate}T18:00:00`
          : null;

      const planningResult =
        await runPlanning({
          productId,
          quantity,
          dueDate:
            formattedDueDate,
        });

      setResult(
        planningResult
      );
    } catch (error) {
      console.error(
        'Erro ao executar planejamento:',
        error
      );

      /*
       * Quando possível, exibimos a mensagem
       * enviada pelo próprio backend.
       */
      if (
        axios.isAxiosError(error)
      ) {
        const responseData =
          error.response?.data;

        if (
          typeof responseData ===
          'string'
        ) {
          setError(responseData);
        } else {
          setError(
            responseData?.message ??
              responseData?.title ??
              'Não foi possível executar o planejamento.'
          );
        }
      } else {
        setError(
          'Não foi possível executar o planejamento.'
        );
      }
    } finally {
      setProcessing(false);
    }
  };

  /*
   * ========================================================
   * MATERIAIS
   * ========================================================
   *
   * O BOMService pode retornar uma estrutura
   * baseada em objeto/dicionário.
   *
   * Essa função permite apresentar os dados
   * sem deixar a página dependente de uma
   * implementação específica.
   */
  const renderMaterials = () => {
    if (
      !result?.materialsRequired
    ) {
      return (
        <p className="text-muted mb-0">
          Nenhum material calculado.
        </p>
      );
    }

    /*
     * Caso venha como array.
     */
    if (
      Array.isArray(
        result.materialsRequired
      )
    ) {
      if (
        result.materialsRequired
          .length === 0
      ) {
        return (
          <p className="text-muted mb-0">
            Nenhum material calculado.
          </p>
        );
      }

      return (
        <div className="d-flex flex-column gap-2">
          {result.materialsRequired.map(
            (material, index) => (
              <div
                key={index}
                className="border rounded p-3 bg-light"
              >
                {typeof material ===
                'object'
                  ? JSON.stringify(
                      material
                    )
                  : String(material)}
              </div>
            )
          )}
        </div>
      );
    }

    /*
     * Caso venha como objeto/dicionário.
     */
    if (
      typeof result.materialsRequired ===
      'object'
    ) {
      const entries =
        Object.entries(
          result.materialsRequired
        );

      if (entries.length === 0) {
        return (
          <p className="text-muted mb-0">
            Nenhum material calculado.
          </p>
        );
      }

      return (
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>
                  Material
                </th>

                <th className="text-end">
                  Quantidade
                </th>
              </tr>
            </thead>

            <tbody>
              {entries.map(
                ([name, value]) => (
                  <tr key={name}>
                    <td>
                      {name}
                    </td>

                    <td className="text-end fw-semibold">
                      {typeof value ===
                      'object'
                        ? JSON.stringify(
                            value
                          )
                        : String(value)}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      );
    }

    return null;
  };

  /*
   * Tela apresentada enquanto os produtos
   * estão sendo carregados.
   */
  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center py-5">

          <div
            className="spinner-border"
            role="status"
          />

          <p className="text-muted mt-3">
            Carregando planejamento...
          </p>

        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">

      {/* ==================================================
          CABEÇALHO
         ================================================== */}
      <div className="mb-4">

        <h2 className="fw-bold mb-1">
          <Route
            size={28}
            className="me-2"
          />

          Planejamento da Produção
        </h2>

        <p className="text-muted mb-0">
          Integração entre produto, BOM,
          operações, máquinas e grafo
          industrial.
        </p>

      </div>

      {/* ==================================================
          FORMULÁRIO
         ================================================== */}
      <div className="card border-0 shadow-sm mb-4">

        <div className="card-header bg-white border-0 py-3">

          <h5 className="fw-semibold mb-0">
            Dados do Planejamento
          </h5>

        </div>

        <div className="card-body">

          {error && (
            <div
              className="alert alert-danger"
              role="alert"
            >
              <AlertTriangle
                size={18}
                className="me-2"
              />

              {error}
            </div>
          )}

          <div className="row g-3">

            {/* Produto */}
            <div className="col-lg-5">

              <label className="form-label fw-semibold">
                Produto
              </label>

              <select
                className="form-select"
                value={productId}
                onChange={event =>
                  setProductId(
                    Number(
                      event.target.value
                    )
                  )
                }
              >
                {products.length ===
                0 ? (
                  <option value={0}>
                    Nenhum produto cadastrado
                  </option>
                ) : (
                  products.map(
                    product => (
                      <option
                        key={product.id}
                        value={product.id}
                      >
                        {product.code} -{' '}
                        {product.name}
                      </option>
                    )
                  )
                )}
              </select>

            </div>

            {/* Quantidade */}
            <div className="col-lg-3">

              <label className="form-label fw-semibold">
                Quantidade
              </label>

              <input
                type="number"
                min="1"
                step="1"
                className="form-control"
                value={quantity}
                onChange={event =>
                  setQuantity(
                    Number(
                      event.target.value
                    )
                  )
                }
              />

            </div>

            {/* Prazo */}
            <div className="col-lg-4">

              <label className="form-label fw-semibold">
                Data limite
              </label>

              <div className="input-group">

                <span className="input-group-text">
                  <CalendarDays
                    size={17}
                  />
                </span>

                <input
                  type="date"
                  className="form-control"
                  value={dueDate}
                  onChange={event =>
                    setDueDate(
                      event.target.value
                    )
                  }
                />

              </div>

            </div>

          </div>

          <div className="d-flex justify-content-end mt-4">

            <button
              type="button"
              className="btn btn-primary px-4"
              disabled={
                processing ||
                products.length === 0
              }
              onClick={
                handleRunPlanning
              }
            >
              <Play
                size={17}
                className="me-2"
              />

              {processing
                ? 'Processando...'
                : 'Executar Planejamento'}
            </button>

          </div>

        </div>
      </div>

      {/* ==================================================
          RESULTADO
         ================================================== */}
      {result && (
        <>
          {/* Resumo */}
          <div className="row g-3 mb-4">

            <div className="col-md-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">

                  <small className="text-muted">
                    Ordem
                  </small>

                  <h3 className="fw-bold mb-0">
                    #{result.order.orderId}
                  </h3>

                  <small className="text-muted">
                    {result.order.status}
                  </small>

                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">

                  <small className="text-muted">
                    Quantidade
                  </small>

                  <h3 className="fw-bold mb-0">
                    {result.order.quantity}
                  </h3>

                  <small className="text-muted">
                    unidades planejadas
                  </small>

                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">

                  <small className="text-muted">
                    Máquinas
                  </small>

                  <h3 className="fw-bold mb-0">
                    {
                      result.factoryGraph
                        .totalMachines
                    }
                  </h3>

                  <small className="text-muted">
                    disponíveis no grafo
                  </small>

                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">

                  <small className="text-muted">
                    Conexões
                  </small>

                  <h3 className="fw-bold mb-0">
                    {
                      result.factoryGraph
                        .totalConnections
                    }
                  </h3>

                  <small className="text-muted">
                    arestas do grafo
                  </small>

                </div>
              </div>
            </div>

          </div>

          {/* Ordem criada */}
          <div className="card border-0 shadow-sm mb-4">

            <div className="card-body">

              <div className="d-flex align-items-start gap-3">

                <div className="text-success">
                  <CheckCircle2
                    size={30}
                  />
                </div>

                <div>

                  <h5 className="fw-bold mb-1">
                    Planejamento concluído
                  </h5>

                  <p className="text-muted mb-2">
                    {result.message}
                  </p>

                  <strong>
                    {
                      result.order
                        .productCode
                    }{' '}
                    -{' '}
                    {
                      result.order
                        .product
                    }
                  </strong>

                </div>

              </div>

            </div>
          </div>

          <div className="row g-4">

            {/* Materiais */}
            <div className="col-xl-5">

              <div className="card border-0 shadow-sm h-100">

                <div className="card-header bg-white border-0 py-3">

                  <h5 className="fw-semibold mb-0">
                    <Boxes
                      size={19}
                      className="me-2"
                    />

                    Materiais Necessários
                  </h5>

                </div>

                <div className="card-body">
                  {renderMaterials()}
                </div>

              </div>

            </div>

            {/* Operações */}
            <div className="col-xl-7">

              <div className="card border-0 shadow-sm h-100">

                <div className="card-header bg-white border-0 py-3">

                  <h5 className="fw-semibold mb-0">
                    <Settings
                      size={19}
                      className="me-2"
                    />

                    Operações Planejadas
                  </h5>

                </div>

                <div className="card-body">

                  {result.operations.length ===
                  0 ? (
                    <p className="text-muted mb-0">
                      Nenhuma operação cadastrada
                      para este produto.
                    </p>
                  ) : (
                    <div className="table-responsive">

                      <table className="table align-middle">

                        <thead>
                          <tr>
                            <th>
                              Operação
                            </th>

                            <th>
                              Duração
                            </th>

                            <th>
                              Máquina escolhida
                            </th>

                            <th>
                              Capacidade
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {result.operations.map(
                            operation => (
                              <tr
                                key={
                                  operation.operationId
                                }
                              >
                                <td className="fw-semibold">
                                  {
                                    operation.operation
                                  }
                                </td>

                                <td>
                                  {
                                    operation.duration
                                  }{' '}
                                  min
                                </td>

                                <td>
                                  {operation
                                    .selectedMachine ? (
                                    <>
                                      <Factory
                                        size={15}
                                        className="me-1"
                                      />

                                      {
                                        operation
                                          .selectedMachine
                                          .code
                                      }{' '}
                                      -{' '}
                                      {
                                        operation
                                          .selectedMachine
                                          .name
                                      }
                                    </>
                                  ) : (
                                    <span className="text-danger">
                                      Nenhuma máquina
                                    </span>
                                  )}
                                </td>

                                <td>
                                  {operation
                                    .selectedMachine
                                    ?.capacity ??
                                    '-'}
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>

                      </table>

                    </div>
                  )}

                </div>
              </div>

            </div>

          </div>

          {/* Rotas do Grafo */}
          <div className="card border-0 shadow-sm mt-4">

            <div className="card-header bg-white border-0 py-3">

              <h5 className="fw-semibold mb-0">
                <GitBranch
                  size={19}
                  className="me-2"
                />

                Fluxo entre Máquinas
              </h5>

            </div>

            <div className="card-body">

              {result.productionRoutes
                .length === 0 ? (
                <p className="text-muted mb-0">
                  Não foi necessário calcular
                  deslocamento entre máquinas.
                </p>
              ) : (
                <div className="d-flex flex-column gap-3">

                  {result.productionRoutes.map(
                    (route, index) => (
                      <div
                        key={index}
                        className="border rounded p-3"
                      >

                        <div className="d-flex justify-content-between flex-wrap gap-2">

                          <div>

                            {route.path.length >
                            0 ? (
                              route.path.map(
                                (
                                  vertex,
                                  pathIndex
                                ) => (
                                  <span
                                    key={
                                      vertex.id
                                    }
                                  >
                                    <span className="badge bg-primary p-2">
                                      {
                                        vertex.name
                                      }
                                    </span>

                                    {pathIndex <
                                      route.path
                                        .length -
                                        1 && (
                                      <strong className="mx-2">
                                        →
                                      </strong>
                                    )}
                                  </span>
                                )
                              )
                            ) : (
                              <span className="text-danger">
                                Caminho não encontrado
                              </span>
                            )}

                          </div>

                          <div>

                            <small className="text-muted">
                              Peso
                            </small>

                            <strong className="ms-2">
                              {
                                route.totalWeight
                              }
                            </strong>

                          </div>

                        </div>

                      </div>
                    )
                  )}

                </div>
              )}

            </div>
          </div>

          {/* Alertas */}
          {result.warnings.length > 0 && (
            <div className="card border-warning shadow-sm mt-4">

              <div className="card-header bg-warning-subtle">

                <h5 className="mb-0">
                  <AlertTriangle
                    size={19}
                    className="me-2"
                  />

                  Alertas do Planejamento
                </h5>

              </div>

              <div className="card-body">

                <ul className="mb-0">
                  {result.warnings.map(
                    (warning, index) => (
                      <li key={index}>
                        {warning}
                      </li>
                    )
                  )}
                </ul>

              </div>
            </div>
          )}

        </>
      )}

    </div>
  );
};

export default Planning;