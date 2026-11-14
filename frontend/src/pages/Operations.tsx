import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';

import {
  Clock3,
  Eye,
  Pencil,
  Plus,
  Search,
  Settings,
  Trash2,
  X,
} from 'lucide-react';

import {
  createOperation,
  deleteOperation,
  getOperations,
  getProductsForOperations,
  updateOperation,
  type Operation,
  type OperationFormData,
  type ProductOption,
} from '../services/operationService';

/*
 * Estado inicial do formulário.
 *
 * productId = 0 significa que nenhum produto
 * foi selecionado ainda.
 */
const initialForm: OperationFormData = {
  productId: 0,
  name: '',
  duration: 0,
};

const Operations = () => {
  /*
   * Lista de operações carregadas da API.
   */
  const [operations, setOperations] = useState<Operation[]>([]);

  /*
   * Lista de produtos utilizada no select do formulário.
   */
  const [products, setProducts] = useState<ProductOption[]>([]);

  /*
   * Texto digitado no campo de pesquisa.
   */
  const [search, setSearch] = useState('');

  /*
   * Estados utilizados para controlar carregamento
   * e salvamento.
   */
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /*
   * Armazena possíveis erros ao acessar a API.
   */
  const [error, setError] = useState('');

  /*
   * Controla a abertura do modal de cadastro/edição.
   */
  const [modalOpen, setModalOpen] = useState(false);

  /*
   * Controla o modal de visualização dos detalhes.
   */
  const [detailsOpen, setDetailsOpen] = useState(false);

  /*
   * Guarda a operação que está sendo editada.
   *
   * null = estamos cadastrando uma operação nova.
   */
  const [editingOperation, setEditingOperation] =
    useState<Operation | null>(null);

  /*
   * Guarda a operação selecionada para visualização.
   */
  const [selectedOperation, setSelectedOperation] =
    useState<Operation | null>(null);

  /*
   * Dados atualmente preenchidos no formulário.
   */
  const [form, setForm] =
    useState<OperationFormData>(initialForm);

  /*
   * Carrega operações e produtos ao mesmo tempo.
   *
   * Precisamos dos produtos porque cada operação
   * obrigatoriamente pertence a um produto.
   */
  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [operationsData, productsData] =
        await Promise.all([
          getOperations(),
          getProductsForOperations(),
        ]);

      setOperations(operationsData);
      setProducts(productsData);
    } catch (err) {
      console.error(err);

      setError(
        'Não foi possível carregar as operações. Verifique se a API está em execução.'
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * Executa loadData uma única vez
   * quando a página é carregada.
   */
  useEffect(() => {
    loadData();
  }, []);

  /*
   * Localiza um produto através do ID.
   *
   * Isso permite mostrar:
   *
   * PROD001 - Produto Teste APS
   *
   * em vez de simplesmente mostrar:
   *
   * Produto ID 1
   */
  const getProduct = (productId: number) => {
    return products.find(
      (product) => product.id === productId
    );
  };

  /*
   * Filtra as operações de acordo com
   * o campo de pesquisa.
   *
   * É possível pesquisar pelo:
   * - nome da operação
   * - código do produto
   * - nome do produto
   */
  const filteredOperations = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return operations;
    }

    return operations.filter((operation) => {
      const product = products.find(
        (item) => item.id === operation.productId
      );

      return (
        operation.name.toLowerCase().includes(value) ||
        product?.name.toLowerCase().includes(value) ||
        product?.code.toLowerCase().includes(value)
      );
    });
  }, [operations, products, search]);

  /*
   * Abre o formulário para cadastrar
   * uma nova operação.
   */
  const openCreateModal = () => {
    setEditingOperation(null);

    /*
     * Se houver produtos cadastrados,
     * selecionamos automaticamente o primeiro.
     */
    setForm({
      productId: products[0]?.id ?? 0,
      name: '',
      duration: 0,
    });

    setModalOpen(true);
  };

  /*
   * Abre o formulário preenchido com os dados
   * da operação escolhida.
   */
  const openEditModal = (operation: Operation) => {
    setEditingOperation(operation);

    setForm({
      productId: operation.productId,
      name: operation.name,
      duration: operation.duration,
    });

    setModalOpen(true);
  };

  /*
   * Abre o modal apenas para visualizar
   * os detalhes da operação.
   */
  const openDetails = (operation: Operation) => {
    setSelectedOperation(operation);
    setDetailsOpen(true);
  };

  /*
   * Fecha o formulário e limpa os dados.
   */
  const closeModal = () => {
    /*
     * Impede fechar enquanto uma operação
     * estiver sendo salva.
     */
    if (saving) {
      return;
    }

    setModalOpen(false);
    setEditingOperation(null);
    setForm(initialForm);
  };

  /*
   * Atualiza o estado do formulário sempre
   * que algum campo for alterado.
   */
  const handleChange = (
    event:
      | ChangeEvent<HTMLInputElement>
      | ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = event.target;

    /*
     * ProductId precisa ser convertido de
     * string para número.
     */
    if (name === 'productId') {
      setForm((current) => ({
        ...current,
        productId: Number(value),
      }));

      return;
    }

    /*
     * Duration também precisa ser número,
     * porque representa minutos.
     */
    if (name === 'duration') {
      setForm((current) => ({
        ...current,
        duration: Number(value),
      }));

      return;
    }

    /*
     * Para campos de texto, mantemos
     * diretamente o valor digitado.
     */
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  /*
   * Executado quando o usuário clica em
   * "Cadastrar Operação" ou "Salvar Alterações".
   */
  const handleSubmit = async (
    event: FormEvent
  ) => {
    /*
     * Evita que o navegador recarregue
     * a página ao enviar o formulário.
     */
    event.preventDefault();

    /*
     * Validação do produto.
     */
    if (form.productId <= 0) {
      alert('Selecione um produto.');
      return;
    }

    /*
     * Validação do nome.
     */
    if (!form.name.trim()) {
      alert('Informe o nome da operação.');
      return;
    }

    /*
     * Uma operação precisa ter duração maior que zero.
     */
    if (form.duration <= 0) {
      alert(
        'A duração da operação deve ser maior que zero.'
      );
      return;
    }

    try {
      setSaving(true);

      /*
       * Monta os dados que serão enviados para a API.
       */
      const data: OperationFormData = {
        productId: form.productId,
        name: form.name.trim(),
        duration: Number(form.duration),
      };

      /*
       * Se existe editingOperation:
       * estamos EDITANDO.
       *
       * Caso contrário:
       * estamos CADASTRANDO.
       */
      if (editingOperation) {
        await updateOperation(
          editingOperation.id,
          data
        );
      } else {
        await createOperation(data);
      }

      /*
       * Fecha e limpa o formulário
       * depois que a API responde com sucesso.
       */
      setModalOpen(false);
      setEditingOperation(null);
      setForm(initialForm);

      /*
       * Atualiza a tabela para mostrar
       * imediatamente os novos dados.
       */
      await loadData();
    } catch (err) {
      console.error(err);

      alert(
        'Não foi possível salvar a operação. Verifique os dados e tente novamente.'
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * Exclui uma operação.
   */
  const handleDelete = async (
    operation: Operation
  ) => {
    /*
     * Solicita confirmação antes da exclusão.
     */
    const confirmed = window.confirm(
      `Deseja realmente excluir a operação "${operation.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteOperation(operation.id);

      /*
       * Recarrega os dados após excluir.
       */
      await loadData();
    } catch (err) {
      console.error(err);

      alert(
        'Não foi possível excluir a operação.'
      );
    }
  };

  return (
    <div className="products-page">

      {/* Cabeçalho da página */}
      <div className="page-heading">
        <div>
          <h1>Operações</h1>

          <p>
            Gerencie as etapas necessárias para
            fabricação dos produtos.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={openCreateModal}

          /*
           * Não podemos cadastrar uma operação
           * se ainda não existir nenhum produto.
           */
          disabled={products.length === 0}
        >
          <Plus size={18} />
          Nova Operação
        </button>
      </div>

      {/* Painel principal */}
      <section className="data-panel">

        <div className="data-toolbar">

          {/* Campo de pesquisa */}
          <div className="table-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Buscar operação ou produto..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          {/* Quantidade encontrada */}
          <span>
            {filteredOperations.length}{' '}
            {filteredOperations.length === 1
              ? 'operação'
              : 'operações'}
          </span>

        </div>

        {/* Erro da API */}
        {error && (
          <div
            style={{
              padding: 16,
              color: '#b42318',
            }}
          >
            {error}
          </div>
        )}

        {/* Aviso caso ainda não exista produto */}
        {!loading &&
          products.length === 0 && (
            <div
              style={{
                padding: 16,
                color: '#8a5b00',
              }}
            >
              Cadastre pelo menos um produto antes
              de criar operações.
            </div>
          )}

        {loading ? (
          /*
           * Estado enquanto a API está respondendo.
           */
          <div
            style={{
              padding: 40,
              textAlign: 'center',
            }}
          >
            Carregando operações...
          </div>
        ) : filteredOperations.length === 0 ? (
          /*
           * Estado quando nenhuma operação existe.
           */
          <div className="empty-state">

            <div className="empty-state-icon">
              <Settings size={30} />
            </div>

            <h3>
              Nenhuma operação encontrada
            </h3>

            <p>
              Cadastre as etapas necessárias para
              fabricação dos seus produtos.
            </p>

          </div>
        ) : (
          /*
           * Tabela das operações.
           */
          <div
            style={{
              overflowX: 'auto',
            }}
          >
            <table className="aps-table">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>Produto</th>
                  <th>Operação</th>
                  <th>Duração</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>

                {filteredOperations.map(
                  (operation) => {
                    /*
                     * Busca informações do produto
                     * relacionado à operação.
                     */
                    const product =
                      getProduct(
                        operation.productId
                      );

                    return (
                      <tr key={operation.id}>

                        <td>
                          {operation.id}
                        </td>

                        <td>
                          {product ? (
                            <>
                              <strong>
                                {product.code}
                              </strong>

                              {' - '}

                              {product.name}
                            </>
                          ) : (
                            `Produto ${operation.productId}`
                          )}
                        </td>

                        <td>
                          <strong>
                            {operation.name}
                          </strong>
                        </td>

                        <td>
                          <span
                            style={{
                              display:
                                'inline-flex',
                              alignItems:
                                'center',
                              gap: 6,
                            }}
                          >
                            <Clock3
                              size={15}
                            />

                            {operation.duration}{' '}
                            min
                          </span>
                        </td>

                        <td>

                          <div
                            style={{
                              display: 'flex',
                              gap: 8,
                            }}
                          >

                            {/* Visualizar */}
                            <button
                              className="action-button view"
                              title="Visualizar"
                              onClick={() =>
                                openDetails(
                                  operation
                                )
                              }
                            >
                              <Eye size={16} />
                            </button>

                            {/* Editar */}
                            <button
                              className="action-button edit"
                              title="Editar"
                              onClick={() =>
                                openEditModal(
                                  operation
                                )
                              }
                            >
                              <Pencil
                                size={16}
                              />
                            </button>

                            {/* Excluir */}
                            <button
                              className="action-button delete"
                              title="Excluir"
                              onClick={() =>
                                handleDelete(
                                  operation
                                )
                              }
                            >
                              <Trash2
                                size={16}
                              />
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>
          </div>
        )}

      </section>

      {/* Modal de cadastro e edição */}
      {modalOpen && (
        <div className="modal-overlay">

          <div className="modal-card">

            <div className="modal-header">

              <div>
                <h2>
                  {editingOperation
                    ? 'Editar Operação'
                    : 'Nova Operação'}
                </h2>

                <p>
                  Informe o produto e os dados
                  da etapa produtiva.
                </p>
              </div>

              <button
                className="modal-close"
                type="button"
                onClick={closeModal}
              >
                <X size={20} />
              </button>

            </div>

            <form onSubmit={handleSubmit}>

              <div className="modal-body">

                {/* Produto */}
                <div className="form-group">

                  <label htmlFor="productId">
                    Produto
                  </label>

                  <select
                    id="productId"
                    name="productId"
                    value={form.productId}
                    onChange={handleChange}
                    required
                  >

                    <option value={0}>
                      Selecione um produto
                    </option>

                    {products.map(
                      (product) => (
                        <option
                          key={product.id}
                          value={product.id}
                        >
                          {product.code} -{' '}
                          {product.name}
                        </option>
                      )
                    )}

                  </select>

                </div>

                {/* Nome */}
                <div className="form-group">

                  <label htmlFor="name">
                    Nome da operação
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Ex.: Corte"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />

                </div>

                {/* Duração */}
                <div className="form-group">

                  <label htmlFor="duration">
                    Duração em minutos
                  </label>

                  <input
                    id="duration"
                    name="duration"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="Ex.: 15"
                    value={form.duration}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>

              {/* Botões do formulário */}
              <div className="modal-footer">

                <button
                  type="button"
                  className="btn btn-light"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving
                    ? 'Salvando...'
                    : editingOperation
                    ? 'Salvar Alterações'
                    : 'Cadastrar Operação'}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* Modal de visualização */}
      {detailsOpen &&
        selectedOperation && (
          <div className="modal-overlay">

            <div className="modal-card">

              <div className="modal-header">

                <div>
                  <h2>
                    Detalhes da Operação
                  </h2>

                  <p>
                    Informações da etapa
                    produtiva cadastrada.
                  </p>
                </div>

                <button
                  className="modal-close"
                  type="button"
                  onClick={() =>
                    setDetailsOpen(false)
                  }
                >
                  <X size={20} />
                </button>

              </div>

              <div className="modal-body">

                <div className="details-grid">

                  <div>
                    <span>ID</span>

                    <strong>
                      {selectedOperation.id}
                    </strong>
                  </div>

                  <div>
                    <span>Produto</span>

                    <strong>
                      {(() => {
                        const product =
                          getProduct(
                            selectedOperation.productId
                          );

                        return product
                          ? `${product.code} - ${product.name}`
                          : `Produto ${selectedOperation.productId}`;
                      })()}
                    </strong>
                  </div>

                  <div>
                    <span>Operação</span>

                    <strong>
                      {selectedOperation.name}
                    </strong>
                  </div>

                  <div>
                    <span>Duração</span>

                    <strong>
                      {selectedOperation.duration}{' '}
                      minutos
                    </strong>
                  </div>

                </div>

              </div>

            </div>

          </div>
        )}

    </div>
  );
};

export default Operations;