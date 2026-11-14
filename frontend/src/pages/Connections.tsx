import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';

import {
  ArrowRight,
  GitBranch,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';

/*
 * Serviço responsável pelas conexões do Grafo.
 */
import {
  createMachineConnection,
  deleteMachineConnection,
  getMachineConnections,
  updateMachineConnection,
  type MachineConnection,
  type MachineConnectionFormData,
} from '../services/machineConnectionService';

/*
 * Reutilizamos o serviço de máquinas já existente.
 *
 * Assim não duplicamos lógica para buscar
 * as máquinas cadastradas.
 */
import {
  getMachines,
  type Machine,
} from '../services/machineService';

/*
 * Estado inicial do formulário.
 *
 * Valor 0 significa que nenhuma máquina
 * foi selecionada.
 */
const initialForm: MachineConnectionFormData = {
  fromMachineId: 0,
  toMachineId: 0,
  weight: 1,
};

const Connections = () => {
  /*
   * Lista de conexões existentes no banco.
   */
  const [connections, setConnections] = useState<
    MachineConnection[]
  >([]);

  /*
   * Lista de máquinas cadastradas.
   *
   * Será utilizada nos selects de origem
   * e destino.
   */
  const [machines, setMachines] = useState<Machine[]>([]);

  /*
   * Pesquisa textual.
   */
  const [search, setSearch] = useState('');

  /*
   * Controle de carregamento e salvamento.
   */
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /*
   * Mensagem de erro de comunicação com a API.
   */
  const [error, setError] = useState('');

  /*
   * Controla abertura do modal.
   */
  const [modalOpen, setModalOpen] = useState(false);

  /*
   * Quando possui valor, indica que estamos
   * editando uma conexão existente.
   *
   * Quando é null, estamos criando uma nova.
   */
  const [editingConnection, setEditingConnection] =
    useState<MachineConnection | null>(null);

  /*
   * Valores atuais do formulário.
   */
  const [form, setForm] =
    useState<MachineConnectionFormData>(initialForm);

  /*
   * Carrega simultaneamente:
   *
   * - conexões;
   * - máquinas.
   */
  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [connectionsData, machinesData] =
        await Promise.all([
          getMachineConnections(),
          getMachines(),
        ]);

      setConnections(connectionsData);
      setMachines(machinesData);
    } catch (err) {
      console.error(err);

      setError(
        'Não foi possível carregar as conexões. Verifique se a API está em execução.'
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * Executado uma vez quando a página abre.
   */
  useEffect(() => {
    loadData();
  }, []);

  /*
   * Localiza uma máquina pelo ID.
   *
   * É útil porque mesmo que a API não envie
   * os objetos FromMachine e ToMachine completos,
   * ainda conseguimos mostrar código e nome.
   */
  const getMachine = (id: number) => {
    return machines.find(
      (machine) => machine.id === id
    );
  };

  /*
   * Retorna o nome mais amigável possível
   * para uma máquina da conexão.
   */
  const getMachineLabel = (
    connection: MachineConnection,
    type: 'from' | 'to'
  ) => {
    const id =
      type === 'from'
        ? connection.fromMachineId
        : connection.toMachineId;

    /*
     * Primeiro tenta utilizar a máquina retornada
     * diretamente pela API.
     */
    const apiMachine =
      type === 'from'
        ? connection.fromMachine
        : connection.toMachine;

    if (apiMachine) {
      return `${apiMachine.code} - ${apiMachine.name}`;
    }

    /*
     * Caso o backend não envie a navegação,
     * utilizamos a lista de máquinas carregada.
     */
    const machine = getMachine(id);

    if (machine) {
      return `${machine.code} - ${machine.name}`;
    }

    return `Máquina ${id}`;
  };

  /*
   * Filtra conexões utilizando:
   *
   * - nome da origem;
   * - nome do destino;
   * - código da origem;
   * - código do destino.
   */
  const filteredConnections = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return connections;
    }

    return connections.filter((connection) => {
      const fromMachine = getMachine(
        connection.fromMachineId
      );

      const toMachine = getMachine(
        connection.toMachineId
      );

      const fromText =
        `${fromMachine?.code ?? ''} ${
          fromMachine?.name ?? ''
        }`.toLowerCase();

      const toText =
        `${toMachine?.code ?? ''} ${
          toMachine?.name ?? ''
        }`.toLowerCase();

      return (
        fromText.includes(value) ||
        toText.includes(value)
      );
    });
  }, [connections, machines, search]);

  /*
   * Abre o formulário para criar
   * uma nova conexão.
   */
  const openCreateModal = () => {
    setEditingConnection(null);

    setForm({
      fromMachineId: machines[0]?.id ?? 0,
      toMachineId: machines[1]?.id ?? 0,
      weight: 1,
    });

    setModalOpen(true);
  };

  /*
   * Abre o formulário preenchido para edição.
   */
  const openEditModal = (
    connection: MachineConnection
  ) => {
    setEditingConnection(connection);

    setForm({
      fromMachineId: connection.fromMachineId,
      toMachineId: connection.toMachineId,
      weight: connection.weight,
    });

    setModalOpen(true);
  };

  /*
   * Fecha o formulário.
   */
  const closeModal = () => {
    /*
     * Evita fechar enquanto uma requisição
     * de salvamento estiver em andamento.
     */
    if (saving) {
      return;
    }

    setModalOpen(false);
    setEditingConnection(null);
    setForm(initialForm);
  };

  /*
   * Atualiza o formulário.
   */
  const handleChange = (
    event:
      | ChangeEvent<HTMLSelectElement>
      | ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;

    /*
     * Todos os campos desta entidade
     * são numéricos.
     */
    setForm((current) => ({
      ...current,
      [name]: Number(value),
    }));
  };

  /*
   * Cria ou atualiza uma conexão.
   */
  const handleSubmit = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    /*
     * Uma máquina de origem precisa existir.
     */
    if (form.fromMachineId <= 0) {
      alert('Selecione a máquina de origem.');
      return;
    }

    /*
     * Uma máquina de destino precisa existir.
     */
    if (form.toMachineId <= 0) {
      alert('Selecione a máquina de destino.');
      return;
    }

    /*
     * Não faz sentido uma máquina criar
     * uma conexão com ela mesma.
     */
    if (
      form.fromMachineId === form.toMachineId
    ) {
      alert(
        'A máquina de origem e destino devem ser diferentes.'
      );

      return;
    }

    /*
     * Para utilizarmos a conexão em algoritmos
     * como Dijkstra, trabalharemos inicialmente
     * apenas com pesos positivos.
     */
    if (form.weight <= 0) {
      alert(
        'O peso da conexão deve ser maior que zero.'
      );

      return;
    }

    /*
     * Evita cadastrar a mesma conexão duas vezes
     * pelo frontend.
     *
     * Exemplo:
     *
     * MAQ001 -> MAQ002
     * MAQ001 -> MAQ002
     */
    const duplicatedConnection =
      connections.some((connection) => {
        return (
          connection.id !==
            editingConnection?.id &&
          connection.fromMachineId ===
            form.fromMachineId &&
          connection.toMachineId ===
            form.toMachineId
        );
      });

    if (duplicatedConnection) {
      alert(
        'Esta conexão entre as máquinas já está cadastrada.'
      );

      return;
    }

    try {
      setSaving(true);

      /*
       * Se editingConnection possui valor,
       * atualizamos uma conexão existente.
       *
       * Caso contrário, criamos uma nova.
       */
      if (editingConnection) {
        await updateMachineConnection(
          editingConnection.id,
          form
        );
      } else {
        await createMachineConnection(form);
      }

      /*
       * Limpa e fecha o formulário.
       */
      setModalOpen(false);
      setEditingConnection(null);
      setForm(initialForm);

      /*
       * Atualiza os dados da página.
       */
      await loadData();
    } catch (err) {
      console.error(err);

      alert(
        'Não foi possível salvar a conexão. Verifique os dados e tente novamente.'
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * Exclui uma conexão.
   */
  const handleDelete = async (
    connection: MachineConnection
  ) => {
    const confirmed = window.confirm(
      `Deseja excluir a conexão "${getMachineLabel(
        connection,
        'from'
      )}" → "${getMachineLabel(
        connection,
        'to'
      )}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteMachineConnection(
        connection.id
      );

      /*
       * Recarrega a lista depois da exclusão.
       */
      await loadData();
    } catch (err) {
      console.error(err);

      alert(
        'Não foi possível excluir a conexão.'
      );
    }
  };

  return (
    <div className="products-page">

      {/* =====================================================
          CABEÇALHO
         ===================================================== */}

      <div className="page-heading">

        <div>
          <h1>Conexões entre Máquinas</h1>

          <p>
            Defina as ligações utilizadas para
            construir o grafo da fábrica.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={openCreateModal}

          /*
           * Precisamos de pelo menos duas máquinas
           * para criar uma conexão.
           */
          disabled={machines.length < 2}
        >
          <Plus size={18} />
          Nova Conexão
        </button>

      </div>

      {/* =====================================================
          EXPLICAÇÃO DO GRAFO
         ===================================================== */}

      <section
        className="data-panel"
        style={{
          marginBottom: 24,
        }}
      >
        <div
          style={{
            padding: 20,
            display: 'flex',
            gap: 14,
            alignItems: 'center',
          }}
        >

          <GitBranch size={28} />

          <div>
            <strong>
              Estrutura de Grafo
            </strong>

            <p
              style={{
                margin: '4px 0 0',
                color: '#667085',
              }}
            >
              Cada máquina representa um vértice.
              Cada conexão representa uma aresta e
              seu peso poderá ser utilizado pelos
              algoritmos do sistema.
            </p>
          </div>

        </div>
      </section>

      {/* =====================================================
          LISTAGEM DAS CONEXÕES
         ===================================================== */}

      <section className="data-panel">

        <div className="data-toolbar">

          {/* Pesquisa */}
          <div className="table-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Buscar máquina..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          <span>
            {filteredConnections.length}{' '}
            {filteredConnections.length === 1
              ? 'conexão'
              : 'conexões'}
          </span>

        </div>

        {/* Mensagem de erro */}
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

        {/* Precisamos de duas máquinas */}
        {!loading && machines.length < 2 && (
          <div
            style={{
              padding: 16,
              color: '#8a5b00',
            }}
          >
            Cadastre pelo menos duas máquinas
            para criar uma conexão.
          </div>
        )}

        {loading ? (
          <div
            style={{
              padding: 40,
              textAlign: 'center',
            }}
          >
            Carregando conexões...
          </div>
        ) : filteredConnections.length === 0 ? (
          /*
           * Estado vazio.
           */
          <div className="empty-state">

            <div className="empty-state-icon">
              <GitBranch size={30} />
            </div>

            <h3>
              Nenhuma conexão encontrada
            </h3>

            <p>
              Cadastre conexões entre máquinas
              para formar o grafo da fábrica.
            </p>

          </div>
        ) : (
          <div
            style={{
              overflowX: 'auto',
            }}
          >

            <table className="aps-table">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>Origem</th>
                  <th></th>
                  <th>Destino</th>
                  <th>Peso</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>

                {filteredConnections.map(
                  (connection) => (
                    <tr key={connection.id}>

                      <td>
                        {connection.id}
                      </td>

                      <td>
                        <strong>
                          {getMachineLabel(
                            connection,
                            'from'
                          )}
                        </strong>
                      </td>

                      {/* Representação visual da direção */}
                      <td>
                        <ArrowRight size={18} />
                      </td>

                      <td>
                        <strong>
                          {getMachineLabel(
                            connection,
                            'to'
                          )}
                        </strong>
                      </td>

                      <td>
                        {connection.weight}
                      </td>

                      <td>

                        <div
                          style={{
                            display: 'flex',
                            gap: 8,
                          }}
                        >

                          {/* Editar */}
                          <button
                            className="action-button edit"
                            title="Editar conexão"
                            onClick={() =>
                              openEditModal(
                                connection
                              )
                            }
                          >
                            <Pencil size={16} />
                          </button>

                          {/* Excluir */}
                          <button
                            className="action-button delete"
                            title="Excluir conexão"
                            onClick={() =>
                              handleDelete(
                                connection
                              )
                            }
                          >
                            <Trash2 size={16} />
                          </button>

                        </div>

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>
        )}

      </section>

      {/* =====================================================
          MODAL DE CADASTRO / EDIÇÃO
         ===================================================== */}

      {modalOpen && (
        <div className="modal-overlay">

          <div className="modal-card">

            <div className="modal-header">

              <div>
                <h2>
                  {editingConnection
                    ? 'Editar Conexão'
                    : 'Nova Conexão'}
                </h2>

                <p>
                  Defina origem, destino e peso
                  da ligação.
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeModal}
              >
                <X size={20} />
              </button>

            </div>

            <form onSubmit={handleSubmit}>

              <div className="modal-body">

                {/* Máquina de origem */}
                <div className="form-group">

                  <label htmlFor="fromMachineId">
                    Máquina de origem
                  </label>

                  <select
                    id="fromMachineId"
                    name="fromMachineId"
                    value={form.fromMachineId}
                    onChange={handleChange}
                    required
                  >

                    <option value={0}>
                      Selecione a origem
                    </option>

                    {machines.map((machine) => (
                      <option
                        key={machine.id}
                        value={machine.id}
                      >
                        {machine.code} -{' '}
                        {machine.name}
                      </option>
                    ))}

                  </select>

                </div>

                {/* Máquina de destino */}
                <div className="form-group">

                  <label htmlFor="toMachineId">
                    Máquina de destino
                  </label>

                  <select
                    id="toMachineId"
                    name="toMachineId"
                    value={form.toMachineId}
                    onChange={handleChange}
                    required
                  >

                    <option value={0}>
                      Selecione o destino
                    </option>

                    {machines.map((machine) => (
                      <option
                        key={machine.id}
                        value={machine.id}
                      >
                        {machine.code} -{' '}
                        {machine.name}
                      </option>
                    ))}

                  </select>

                </div>

                {/* Peso da aresta */}
                <div className="form-group">

                  <label htmlFor="weight">
                    Peso da conexão
                  </label>

                  <input
                    id="weight"
                    name="weight"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.weight}
                    onChange={handleChange}
                    required
                  />

                  <small
                    style={{
                      display: 'block',
                      marginTop: 6,
                      color: '#667085',
                    }}
                  >
                    Representa distância, tempo ou
                    custo utilizado pelo grafo.
                  </small>

                </div>

              </div>

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
                    : editingConnection
                    ? 'Salvar Alterações'
                    : 'Cadastrar Conexão'}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
};

export default Connections;