import { useEffect, useMemo, useState } from 'react';
import {
  Eye,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
  Factory,
} from 'lucide-react';

import {
  createMachine,
  deleteMachine,
  getMachines,
  updateMachine,
  type Machine,
  type MachineFormData,
} from '../services/machineService';

const initialForm: MachineFormData = {
  code: '',
  name: '',
  status: 0,
  capacity: 0,
};

const statusLabels: Record<number, string> = {
  0: 'Disponível',
  1: 'Em manutenção',
  2: 'Ocupada',
  3: 'Offline',
};

const Machines = () => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [editingMachine, setEditingMachine] =
    useState<Machine | null>(null);

  const [selectedMachine, setSelectedMachine] =
    useState<Machine | null>(null);

  const [form, setForm] =
    useState<MachineFormData>(initialForm);

  const loadMachines = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await getMachines();
      setMachines(data);
    } catch (err) {
      console.error(err);
      setError(
        'Não foi possível carregar as máquinas. Verifique se a API está em execução.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMachines();
  }, []);

  const filteredMachines = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return machines;
    }

    return machines.filter((machine) => {
      return (
        machine.code.toLowerCase().includes(value) ||
        machine.name.toLowerCase().includes(value) ||
        statusLabels[machine.status]
          ?.toLowerCase()
          .includes(value)
      );
    });
  }, [machines, search]);

  const openCreateModal = () => {
    setEditingMachine(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEditModal = (machine: Machine) => {
    setEditingMachine(machine);

    setForm({
      code: machine.code,
      name: machine.name,
      status: machine.status,
      capacity: machine.capacity,
    });

    setModalOpen(true);
  };

  const openDetails = (machine: Machine) => {
    setSelectedMachine(machine);
    setDetailsOpen(true);
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setEditingMachine(null);
    setForm(initialForm);
  };

  const handleChange = (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = event.target;

    if (name === 'capacity') {
      setForm((current) => ({
        ...current,
        capacity: Number(value),
      }));

      return;
    }

    if (name === 'status') {
      setForm((current) => ({
        ...current,
        status: Number(value),
      }));

      return;
    }

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!form.code.trim()) {
      alert('Informe o código da máquina.');
      return;
    }

    if (!form.name.trim()) {
      alert('Informe o nome da máquina.');
      return;
    }

    if (form.capacity < 0) {
      alert('A capacidade não pode ser negativa.');
      return;
    }

    try {
      setSaving(true);

      const data: MachineFormData = {
        code: form.code.trim(),
        name: form.name.trim(),
        status: form.status,
        capacity: Number(form.capacity),
      };

      if (editingMachine) {
        await updateMachine(
          editingMachine.id,
          data
        );
      } else {
        await createMachine(data);
      }

      setModalOpen(false);
      setEditingMachine(null);
      setForm(initialForm);

      await loadMachines();
    } catch (err) {
      console.error(err);

      alert(
        'Não foi possível salvar a máquina. Verifique os dados e tente novamente.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (
    machine: Machine
  ) => {
    const confirmed = window.confirm(
      `Deseja realmente excluir a máquina "${machine.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteMachine(machine.id);
      await loadMachines();
    } catch (err) {
      console.error(err);

      alert(
        'Não foi possível excluir a máquina.'
      );
    }
  };

  return (
    <div className="products-page">

      <div className="page-heading">
        <div>
          <h1>Máquinas</h1>
          <p>
            Cadastro e gerenciamento dos recursos
            produtivos da fábrica.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={openCreateModal}
        >
          <Plus size={18} />
          Nova Máquina
        </button>
      </div>

      <section className="data-panel">

        <div className="data-toolbar">

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
            {filteredMachines.length}{' '}
            {filteredMachines.length === 1
              ? 'máquina'
              : 'máquinas'}
          </span>

        </div>

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
          <div
            style={{
              padding: 40,
              textAlign: 'center',
            }}
          >
            Carregando máquinas...
          </div>
        ) : filteredMachines.length === 0 ? (
          <div className="empty-state">

            <div className="empty-state-icon">
              <Factory size={30} />
            </div>

            <h3>Nenhuma máquina encontrada</h3>

            <p>
              Cadastre uma máquina para iniciar
              o gerenciamento dos recursos
              produtivos.
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
                  <th>Código</th>
                  <th>Máquina</th>
                  <th>Status</th>
                  <th>Capacidade</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>

                {filteredMachines.map(
                  (machine) => (
                    <tr key={machine.id}>

                      <td>
                        {machine.id}
                      </td>

                      <td>
                        <strong>
                          {machine.code}
                        </strong>
                      </td>

                      <td>
                        {machine.name}
                      </td>

                      <td>
                        <span
                          style={{
                            fontWeight: 600,
                          }}
                        >
                          {statusLabels[
                            machine.status
                          ] ?? 'Desconhecido'}
                        </span>
                      </td>

                      <td>
                        {machine.capacity}
                      </td>

                      <td>

                        <div
                          style={{
                            display: 'flex',
                            gap: 8,
                          }}
                        >

                          <button
                            className="action-button view"
                            title="Visualizar"
                            onClick={() =>
                              openDetails(
                                machine
                              )
                            }
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            className="action-button edit"
                            title="Editar"
                            onClick={() =>
                              openEditModal(
                                machine
                              )
                            }
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            className="action-button delete"
                            title="Excluir"
                            onClick={() =>
                              handleDelete(
                                machine
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

      {modalOpen && (
        <div className="modal-overlay">

          <div className="modal-card">

            <div className="modal-header">

              <div>
                <h2>
                  {editingMachine
                    ? 'Editar Máquina'
                    : 'Nova Máquina'}
                </h2>

                <p>
                  Informe os dados do recurso
                  produtivo.
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

            <form
              onSubmit={handleSubmit}
            >

              <div className="modal-body">

                <div className="form-group">

                  <label htmlFor="code">
                    Código
                  </label>

                  <input
                    id="code"
                    name="code"
                    type="text"
                    placeholder="Ex.: MAQ001"
                    value={form.code}
                    onChange={handleChange}
                    required
                  />

                </div>

                <div className="form-group">

                  <label htmlFor="name">
                    Nome da máquina
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Ex.: Torno CNC"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />

                </div>

                <div className="form-group">

                  <label htmlFor="status">
                    Status
                  </label>

                  <select
                    id="status"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option value={0}>
                      Disponível
                    </option>

                    <option value={1}>
                      Em manutenção
                    </option>

                    <option value={2}>
                      Ocupada
                    </option>

                    <option value={3}>
                      Offline
                    </option>
                  </select>

                </div>

                <div className="form-group">

                  <label htmlFor="capacity">
                    Capacidade
                  </label>

                  <input
                    id="capacity"
                    name="capacity"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.capacity}
                    onChange={handleChange}
                    required
                  />

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
                    : editingMachine
                    ? 'Salvar Alterações'
                    : 'Cadastrar Máquina'}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {detailsOpen &&
        selectedMachine && (
          <div className="modal-overlay">

            <div className="modal-card">

              <div className="modal-header">

                <div>
                  <h2>
                    Detalhes da Máquina
                  </h2>

                  <p>
                    Informações cadastradas
                    no sistema.
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
                      {selectedMachine.id}
                    </strong>
                  </div>

                  <div>
                    <span>Código</span>
                    <strong>
                      {selectedMachine.code}
                    </strong>
                  </div>

                  <div>
                    <span>Máquina</span>
                    <strong>
                      {selectedMachine.name}
                    </strong>
                  </div>

                  <div>
                    <span>Status</span>
                    <strong>
                      {statusLabels[
                        selectedMachine
                          .status
                      ] ??
                        'Desconhecido'}
                    </strong>
                  </div>

                  <div>
                    <span>Capacidade</span>
                    <strong>
                      {
                        selectedMachine.capacity
                      }
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

export default Machines;