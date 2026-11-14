import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Factory,
  Package,
  Search,
  Trash2,
} from 'lucide-react';

import {
  deleteProductionOrder,
  getProductionOrders,
} from '../services/productionOrderService';

import type {
  ProductionOrder,
} from '../services/productionOrderService';

/*
 * ============================================================
 * PÁGINA DE ORDENS DE PRODUÇÃO
 * ============================================================
 *
 * As ordens apresentadas nesta página podem ser criadas
 * automaticamente pelo módulo de Planejamento.
 *
 * Fluxo:
 *
 * Planejamento
 *      ↓
 * ProductionOrder
 *      ↓
 * Ordens de Produção
 *      ↓
 * Programação / Schedule
 */
const ProductionOrders = () => {
  /*
   * Lista completa de ordens.
   */
  const [
    orders,
    setOrders,
  ] = useState<ProductionOrder[]>([]);

  /*
   * Controle de carregamento.
   */
  const [
    loading,
    setLoading,
  ] = useState<boolean>(true);

  /*
   * Campo utilizado para pesquisa.
   */
  const [
    search,
    setSearch,
  ] = useState<string>('');

  /*
   * Mensagem de erro da página.
   */
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
    loadOrders();
  }, []);

  /*
   * Busca as Ordens de Produção diretamente da API.
   */
  const loadOrders = async () => {
    try {
      setLoading(true);
      setError('');

      const data =
        await getProductionOrders();

      setOrders(data);
    } catch (error) {
      console.error(
        'Erro ao carregar ordens:',
        error
      );

      setError(
        'Não foi possível carregar as Ordens de Produção.'
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ========================================================
   * CONVERTER STATUS
   * ========================================================
   *
   * O backend utiliza:
   *
   * Created      = 0
   * Planned      = 1
   * InProduction = 2
   * Completed    = 3
   * Delayed      = 4
   */
  const getStatusInfo = (
    status: number | string
  ) => {
    /*
     * Caso a API futuramente passe a retornar
     * o nome do enum em vez do número,
     * essa função continuará funcionando.
     */
    const normalized =
      typeof status === 'string'
        ? status.toLowerCase()
        : status;

    switch (normalized) {
      case 0:
      case 'created':
        return {
          label: 'Criada',
          className:
            'bg-secondary-subtle text-secondary',
        };

      case 1:
      case 'planned':
        return {
          label: 'Planejada',
          className:
            'bg-primary-subtle text-primary',
        };

      case 2:
      case 'inproduction':
        return {
          label: 'Em Produção',
          className:
            'bg-warning-subtle text-warning-emphasis',
        };

      case 3:
      case 'completed':
        return {
          label: 'Concluída',
          className:
            'bg-success-subtle text-success',
        };

      case 4:
      case 'delayed':
        return {
          label: 'Atrasada',
          className:
            'bg-danger-subtle text-danger',
        };

      default:
        return {
          label: String(status),
          className:
            'bg-light text-dark',
        };
    }
  };

  /*
   * Formata o prazo para o padrão brasileiro.
   */
  const formatDate = (
    date: string
  ) => {
    if (!date) {
      return '-';
    }

    return new Intl.DateTimeFormat(
      'pt-BR',
      {
        dateStyle: 'short',
      }
    ).format(
      new Date(date)
    );
  };

  /*
   * ========================================================
   * PESQUISA
   * ========================================================
   */
  const filteredOrders =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      if (!normalizedSearch) {
        return orders;
      }

      return orders.filter(
        order => {
          const productName =
            order.product?.name ?? '';

          const productCode =
            order.product?.code ?? '';

          return (
            String(order.id).includes(
              normalizedSearch
            ) ||
            productName
              .toLowerCase()
              .includes(
                normalizedSearch
              ) ||
            productCode
              .toLowerCase()
              .includes(
                normalizedSearch
              )
          );
        }
      );
    }, [orders, search]);

  /*
   * ========================================================
   * INDICADORES
   * ========================================================
   */

  /*
   * Total de ordens planejadas.
   */
  const plannedCount =
    orders.filter(
      order =>
        order.status === 1 ||
        String(order.status)
          .toLowerCase() ===
          'planned'
    ).length;

  /*
   * Total de ordens em produção.
   */
  const productionCount =
    orders.filter(
      order =>
        order.status === 2 ||
        String(order.status)
          .toLowerCase() ===
          'inproduction'
    ).length;

  /*
   * Total de ordens concluídas.
   */
  const completedCount =
    orders.filter(
      order =>
        order.status === 3 ||
        String(order.status)
          .toLowerCase() ===
          'completed'
    ).length;

  /*
   * ========================================================
   * EXCLUIR ORDEM
   * ========================================================
   */
  const handleDelete = async (
    order: ProductionOrder
  ) => {
    const confirmed =
      window.confirm(
        `Deseja realmente excluir a Ordem #${order.id}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteProductionOrder(
        order.id
      );

      /*
       * Atualizamos a tela sem precisar
       * recarregar toda a aplicação.
       */
      setOrders(
        currentOrders =>
          currentOrders.filter(
            currentOrder =>
              currentOrder.id !==
              order.id
          )
      );
    } catch (error) {
      console.error(
        'Erro ao excluir ordem:',
        error
      );

      alert(
        'Não foi possível excluir a Ordem de Produção.'
      );
    }
  };

  /*
   * ========================================================
   * CARREGAMENTO
   * ========================================================
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
            Carregando Ordens de Produção...
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
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">

        <div>

          <h2 className="fw-bold mb-1">

            <ClipboardList
              size={28}
              className="me-2"
            />

            Ordens de Produção

          </h2>

          <p className="text-muted mb-0">
            Acompanhamento das ordens
            geradas pelo planejamento industrial.
          </p>

        </div>

      </div>

      {/* ==================================================
          ERRO
         ================================================== */}
      {error && (
        <div className="alert alert-danger">

          <AlertCircle
            size={18}
            className="me-2"
          />

          {error}

        </div>
      )}

      {/* ==================================================
          INDICADORES
         ================================================== */}
      <div className="row g-3 mb-4">

        {/* Total */}
        <div className="col-md-3">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <small className="text-muted">
                Total de Ordens
              </small>

              <h3 className="fw-bold mb-0">
                {orders.length}
              </h3>

              <small className="text-muted">
                ordens cadastradas
              </small>

            </div>

          </div>

        </div>

        {/* Planejadas */}
        <div className="col-md-3">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <small className="text-muted">
                Planejadas
              </small>

              <h3 className="fw-bold text-primary mb-0">
                {plannedCount}
              </h3>

              <small className="text-muted">
                aguardando produção
              </small>

            </div>

          </div>

        </div>

        {/* Em Produção */}
        <div className="col-md-3">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <small className="text-muted">
                Em Produção
              </small>

              <h3 className="fw-bold mb-0">
                {productionCount}
              </h3>

              <small className="text-muted">
                execução atual
              </small>

            </div>

          </div>

        </div>

        {/* Concluídas */}
        <div className="col-md-3">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <small className="text-muted">
                Concluídas
              </small>

              <h3 className="fw-bold text-success mb-0">
                {completedCount}
              </h3>

              <small className="text-muted">
                produção finalizada
              </small>

            </div>

          </div>

        </div>

      </div>

      {/* ==================================================
          LISTAGEM
         ================================================== */}
      <div className="card border-0 shadow-sm">

        <div className="card-header bg-white border-0 py-3">

          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">

            <div>

              <h5 className="fw-semibold mb-0">
                Lista de Ordens
              </h5>

              <small className="text-muted">
                Ordens criadas manualmente ou pelo Planejamento.
              </small>

            </div>

            {/* Pesquisa */}
            <div
              className="input-group"
              style={{
                maxWidth: '320px',
              }}
            >

              <span className="input-group-text bg-white">

                <Search size={17} />

              </span>

              <input
                type="text"
                className="form-control"
                placeholder="Buscar ordem ou produto..."
                value={search}
                onChange={event =>
                  setSearch(
                    event.target.value
                  )
                }
              />

            </div>

          </div>

        </div>

        <div className="card-body p-0">

          {filteredOrders.length ===
          0 ? (

            <div className="text-center py-5">

              <ClipboardList
                size={42}
                className="text-muted mb-3"
              />

              <h5>
                Nenhuma Ordem de Produção
              </h5>

              <p className="text-muted mb-0">
                Execute um planejamento para
                gerar uma nova ordem.
              </p>

            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead className="table-light">

                  <tr>

                    <th>
                      Ordem
                    </th>

                    <th>
                      Produto
                    </th>

                    <th>
                      Quantidade
                    </th>

                    <th>
                      Prazo
                    </th>

                    <th>
                      Status
                    </th>

                    <th className="text-end">
                      Ações
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredOrders.map(
                    order => {
                      const statusInfo =
                        getStatusInfo(
                          order.status
                        );

                      return (
                        <tr key={order.id}>

                          {/* ID */}
                          <td>

                            <strong>
                              #{order.id}
                            </strong>

                          </td>

                          {/* Produto */}
                          <td>

                            <div className="d-flex align-items-center gap-2">

                              <Package
                                size={17}
                                className="text-primary"
                              />

                              <div>

                                <div className="fw-semibold">

                                  {order.product
                                    ?.name ??
                                    `Produto #${order.productId}`}

                                </div>

                                {order.product
                                  ?.code && (

                                  <small className="text-muted">

                                    {
                                      order
                                        .product
                                        .code
                                    }

                                  </small>

                                )}

                              </div>

                            </div>

                          </td>

                          {/* Quantidade */}
                          <td>

                            <strong>
                              {order.quantity}
                            </strong>

                          </td>

                          {/* Prazo */}
                          <td>

                            <CalendarDays
                              size={16}
                              className="me-1 text-muted"
                            />

                            {formatDate(
                              order.dueDate
                            )}

                          </td>

                          {/* Status */}
                          <td>

                            <span
                              className={
                                `badge ${statusInfo.className}`
                              }
                            >
                              {
                                statusInfo.label
                              }
                            </span>

                          </td>

                          {/* Ações */}
                          <td className="text-end">

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              title="Excluir Ordem"
                              onClick={() =>
                                handleDelete(
                                  order
                                )
                              }
                            >

                              <Trash2
                                size={16}
                              />

                            </button>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

      {/* ==================================================
          INFORMAÇÃO DO FLUXO
         ================================================== */}
      <div className="card border-0 shadow-sm mt-4">

        <div className="card-body">

          <div className="d-flex align-items-center gap-3">

            <Factory
              size={28}
              className="text-primary"
            />

            <div>

              <h6 className="fw-bold mb-1">
                Fluxo de Produção
              </h6>

              <small className="text-muted">

                Planejamento
                {' → '}
                Ordem de Produção
                {' → '}
                Programação
                {' → '}
                Produção
                {' → '}
                Conclusão

              </small>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default ProductionOrders;