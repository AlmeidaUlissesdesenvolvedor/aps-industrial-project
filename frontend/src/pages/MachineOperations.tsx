import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from 'react';

import {
  Link2,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';

// Serviço responsável pelas associações Máquina x Operação.
import {
  createMachineOperation,
  deleteMachineOperation,
  getMachineOperations,
  type MachineOperation,
} from '../services/machineOperationService';

// Reutilizamos o serviço de máquinas que já criamos anteriormente.
import {
  getMachines,
  type Machine,
} from '../services/machineService';

// Reutilizamos também o serviço de operações.
import {
  getOperations,
  type Operation,
} from '../services/operationService';

/*
 * Página responsável por gerenciar o relacionamento
 * entre máquinas e operações.
 *
 * Exemplo:
 *
 * Torno CNC
 *      ↓
 *    Corte
 *
 * Essa relação será importante posteriormente para
 * o módulo de planejamento descobrir quais máquinas
 * conseguem executar cada operação.
 */
const MachineOperations = () => {
  /*
   * Associações já cadastradas.
   */
  const [associations, setAssociations] = useState<
    MachineOperation[]
  >([]);

  /*
   * Máquinas disponíveis para seleção.
   */
  const [machines, setMachines] = useState<Machine[]>([]);

  /*
   * Operações disponíveis para seleção.
   */
  const [operations, setOperations] = useState<Operation[]>(
    []
  );

  /*
   * IDs selecionados no formulário.
   *
   * Valor 0 significa que nada foi selecionado.
   */
  const [machineId, setMachineId] = useState(0);
  const [operationId, setOperationId] = useState(0);

  /*
   * Campo de pesquisa da tabela.
   */
  const [search, setSearch] = useState('');

  /*
   * Estados de carregamento e salvamento.
   */
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /*
   * Mensagem de erro exibida caso alguma
   * comunicação com a API falhe.
   */
  const [error, setError] = useState('');

  /*
   * Carrega:
   *
   * 1. Associações existentes
   * 2. Máquinas
   * 3. Operações
   *
   * As três consultas são executadas em paralelo
   * utilizando Promise.all para evitar esperas
   * desnecessárias.
   */
  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [
        associationData,
        machineData,
        operationData,
      ] = await Promise.all([
        getMachineOperations(),
        getMachines(),
        getOperations(),
      ]);

      setAssociations(associationData);
      setMachines(machineData);
      setOperations(operationData);
    } catch (err) {
      console.error(err);

      setError(
        'Não foi possível carregar as associações. Verifique se a API está em execução.'
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * Executa a carga inicial assim que
   * a página é aberta.
   */
  useEffect(() => {
    loadData();
  }, []);

  /*
   * Filtra a tabela pelo nome da máquina
   * ou pelo nome da operação.
   */
  const filteredAssociations = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return associations;
    }

    return associations.filter((association) => {
      return (
        association.machineName
          .toLowerCase()
          .includes(value) ||
        association.operationName
          .toLowerCase()
          .includes(value)
      );
    });
  }, [associations, search]);

  /*
   * Busca uma máquina pelo ID.
   *
   * Utilizamos isso para mostrar código e nome
   * no formulário e na interface.
   */
  const findMachine = (id: number) => {
    return machines.find(
      (machine) => machine.id === id
    );
  };

  /*
   * Busca uma operação pelo ID.
   */
  const findOperation = (id: number) => {
    return operations.find(
      (operation) => operation.id === id
    );
  };

  /*
   * Cria uma nova associação.
   */
  const handleSubmit = async (
    event: FormEvent
  ) => {
    // Evita que o formulário recarregue a página.
    event.preventDefault();

    /*
     * Validação da máquina.
     */
    if (machineId <= 0) {
      alert('Selecione uma máquina.');
      return;
    }

    /*
     * Validação da operação.
     */
    if (operationId <= 0) {
      alert('Selecione uma operação.');
      return;
    }

    try {
      setSaving(true);

      /*
       * Envia os dois IDs para o backend.
       *
       * O controller verificará automaticamente
       * se a relação já existe.
       */
      await createMachineOperation({
        machineId,
        operationId,
      });

      /*
       * Limpa o formulário após salvar.
       */
      setMachineId(0);
      setOperationId(0);

      /*
       * Recarrega os dados para mostrar
       * imediatamente a nova associação.
       */
      await loadData();
    } catch (err: any) {
      console.error(err);

      /*
       * O backend retorna uma mensagem específica
       * quando a associação já existe.
       *
       * Tentamos mostrar essa mensagem ao usuário.
       */
      const backendMessage =
        err?.response?.data;

      if (typeof backendMessage === 'string') {
        alert(backendMessage);
      } else {
        alert(
          'Não foi possível criar a associação.'
        );
      }
    } finally {
      setSaving(false);
    }
  };

  /*
   * Remove uma associação Máquina x Operação.
   */
  const handleDelete = async (
    association: MachineOperation
  ) => {
    const confirmed = window.confirm(
      `Deseja remover a associação entre "${association.machineName}" e "${association.operationName}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      /*
       * Como a chave é composta, enviamos
       * MachineId e OperationId.
       */
      await deleteMachineOperation(
        association.machineId,
        association.operationId
      );

      /*
       * Atualiza a tabela após excluir.
       */
      await loadData();
    } catch (err) {
      console.error(err);

      alert(
        'Não foi possível remover a associação.'
      );
    }
  };

  return (
    <div className="products-page">

      {/* Cabeçalho */}
      <div className="page-heading">
        <div>
          <h1>Máquinas × Operações</h1>

          <p>
            Defina quais máquinas são capazes de
            executar cada operação produtiva.
          </p>
        </div>
      </div>

      {/*
       * Painel utilizado para criar
       * uma nova associação.
       */}
      <section
        className="data-panel"
        style={{
          marginBottom: 24,
        }}
      >

        <div
          style={{
            padding: 24,
          }}
        >

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 20,
            }}
          >
            <Link2 size={21} />

            <div>
              <h3
                style={{
                  margin: 0,
                }}
              >
                Nova Associação
              </h3>

              <p
                style={{
                  margin: 0,
                  marginTop: 4,
                  color: '#667085',
                }}
              >
                Relacione uma operação à máquina
                que pode executá-la.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 16,
                alignItems: 'end',
              }}
            >

              {/* Seleção da máquina */}
              <div className="form-group">

                <label htmlFor="machineId">
                  Máquina
                </label>

                <select
                  id="machineId"
                  value={machineId}
                  onChange={(event) =>
                    setMachineId(
                      Number(event.target.value)
                    )
                  }
                  required
                >
                  <option value={0}>
                    Selecione uma máquina
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

              {/* Seleção da operação */}
              <div className="form-group">

                <label htmlFor="operationId">
                  Operação
                </label>

                <select
                  id="operationId"
                  value={operationId}
                  onChange={(event) =>
                    setOperationId(
                      Number(event.target.value)
                    )
                  }
                  required
                >
                  <option value={0}>
                    Selecione uma operação
                  </option>

                  {operations.map((operation) => (
                    <option
                      key={operation.id}
                      value={operation.id}
                    >
                      {operation.name} -{' '}
                      {operation.duration} min
                    </option>
                  ))}
                </select>

              </div>

              {/* Botão de associação */}
              <div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    saving ||
                    machines.length === 0 ||
                    operations.length === 0
                  }
                >
                  <Plus size={18} />

                  {saving
                    ? 'Associando...'
                    : 'Associar'}
                </button>
              </div>

            </div>

          </form>

          {/*
           * Mostra um resumo da combinação
           * selecionada antes de salvar.
           */}
          {machineId > 0 &&
            operationId > 0 && (
              <div
                style={{
                  marginTop: 20,
                  padding: 16,
                  borderRadius: 8,
                  background: '#f8fafc',
                  border: '1px solid #e4e7ec',
                }}
              >
                <strong>
                  Associação selecionada:
                </strong>

                <div
                  style={{
                    marginTop: 6,
                  }}
                >
                  {findMachine(machineId)?.name}

                  {' → '}

                  {findOperation(operationId)?.name}
                </div>
              </div>
            )}

        </div>

      </section>

      {/* Lista das associações existentes */}
      <section className="data-panel">

        <div className="data-toolbar">

          {/* Pesquisa */}
          <div className="table-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Buscar máquina ou operação..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          <span>
            {filteredAssociations.length}{' '}
            {filteredAssociations.length === 1
              ? 'associação'
              : 'associações'}
          </span>

        </div>

        {/* Erro na comunicação */}
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

        {loading ? (
          /*
           * Estado de carregamento.
           */
          <div
            style={{
              padding: 40,
              textAlign: 'center',
            }}
          >
            Carregando associações...
          </div>
        ) : filteredAssociations.length === 0 ? (
          /*
           * Estado vazio.
           */
          <div className="empty-state">

            <div className="empty-state-icon">
              <Link2 size={30} />
            </div>

            <h3>
              Nenhuma associação cadastrada
            </h3>

            <p>
              Relacione uma máquina a uma operação
              utilizando o formulário acima.
            </p>

          </div>
        ) : (
          /*
           * Tabela das associações.
           */
          <div
            style={{
              overflowX: 'auto',
            }}
          >

            <table className="aps-table">

              <thead>
                <tr>
                  <th>Máquina</th>
                  <th>Operação</th>
                  <th>Relação</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>

                {filteredAssociations.map(
                  (association) => {
                    /*
                     * Recuperamos os dados completos
                     * para mostrar código, duração etc.
                     */
                    const machine =
                      findMachine(
                        association.machineId
                      );

                    const operation =
                      findOperation(
                        association.operationId
                      );

                    return (
                      <tr
                        key={`${association.machineId}-${association.operationId}`}
                      >

                        <td>
                          <strong>
                            {machine?.code ??
                              `ID ${association.machineId}`}
                          </strong>

                          {' - '}

                          {
                            association.machineName
                          }
                        </td>

                        <td>
                          <strong>
                            {
                              association.operationName
                            }
                          </strong>

                          {operation && (
                            <>
                              {' '}
                              ({operation.duration}{' '}
                              min)
                            </>
                          )}
                        </td>

                        <td>
                          <span
                            style={{
                              display:
                                'inline-flex',
                              alignItems:
                                'center',
                              gap: 6,
                              fontWeight: 600,
                            }}
                          >
                            <Link2 size={15} />
                            Associada
                          </span>
                        </td>

                        <td>

                          {/* Remove a associação */}
                          <button
                            className="action-button delete"
                            title="Remover associação"
                            onClick={() =>
                              handleDelete(
                                association
                              )
                            }
                          >
                            <Trash2 size={16} />
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

      </section>

    </div>
  );
};

export default MachineOperations;