import { useEffect, useMemo, useState } from 'react';

import {
  Boxes,
  Eye,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
  TriangleAlert,
} from 'lucide-react';

import {
  materialService,
  type Material,
  type MaterialFormData,
} from '../services/materialService';

const initialForm: MaterialFormData = {
  code: '',
  name: '',
  unit: '',
  stock: 0,
};

const Materials = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [editingMaterial, setEditingMaterial] =
    useState<Material | null>(null);

  const [selectedMaterial, setSelectedMaterial] =
    useState<Material | null>(null);

  const [form, setForm] =
    useState<MaterialFormData>(initialForm);

  const [saving, setSaving] = useState(false);

  const loadMaterials = async () => {
    try {
      setLoading(true);

      const data = await materialService.getAll();

      setMaterials(data);
      setApiError(false);
    } catch (error) {
      console.error('Erro ao carregar materiais:', error);

      setApiError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  const filteredMaterials = useMemo(() => {
    const term = search.toLowerCase().trim();

    if (!term) {
      return materials;
    }

    return materials.filter((material) => {
      return (
        material.code.toLowerCase().includes(term) ||
        material.name.toLowerCase().includes(term) ||
        material.unit.toLowerCase().includes(term)
      );
    });
  }, [materials, search]);

  const openCreateModal = () => {
    setEditingMaterial(null);

    setForm(initialForm);

    setModalOpen(true);
  };

  const openEditModal = (material: Material) => {
    setEditingMaterial(material);

    setForm({
      code: material.code,
      name: material.name,
      unit: material.unit,
      stock: material.stock,
    });

    setModalOpen(true);
  };

  const openDetails = (material: Material) => {
    setSelectedMaterial(material);

    setDetailsOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);

    setEditingMaterial(null);

    setForm(initialForm);
  };

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (
      !form.code.trim() ||
      !form.name.trim() ||
      !form.unit.trim()
    ) {
      return;
    }

    try {
      setSaving(true);

      const payload: MaterialFormData = {
        code: form.code.trim(),
        name: form.name.trim(),
        unit: form.unit.trim(),
        stock: Number(form.stock),
      };

      if (editingMaterial) {
        await materialService.update(
          editingMaterial.id,
          payload
        );
      } else {
        await materialService.create(payload);
      }

      setModalOpen(false);
      setEditingMaterial(null);
      setForm(initialForm);

      await loadMaterials();
    } catch (error) {
      console.error(
        'Erro ao salvar material:',
        error
      );

      alert(
        'Não foi possível salvar o material.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (
    material: Material
  ) => {
    const confirmed = window.confirm(
      `Deseja realmente excluir o material "${material.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await materialService.remove(
        material.id
      );

      await loadMaterials();
    } catch (error) {
      console.error(
        'Erro ao excluir material:',
        error
      );

      alert(
        'Não foi possível excluir o material. Ele pode estar vinculado a uma estrutura BOM.'
      );
    }
  };

  return (
    <div className="products-page">

      {/* CABEÇALHO */}

      <div className="page-heading">
        <div>
          <h1>Materiais</h1>

          <p>
            Cadastre e gerencie os materiais
            utilizados na produção industrial.
          </p>
        </div>

        <button
          className="primary-button"
          type="button"
          onClick={openCreateModal}
        >
          <Plus size={17} />

          Novo Material
        </button>
      </div>

      {/* PAINEL PRINCIPAL */}

      <section className="data-panel">

        {/* BARRA DE BUSCA */}

        <div className="data-toolbar">

          <div className="table-search">

            <Search size={17} />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Buscar por código, nome ou unidade..."
            />

          </div>

          <span className="record-counter">

            {filteredMaterials.length}{' '}
            material
            {filteredMaterials.length === 1
              ? ''
              : 'is'}

          </span>

        </div>

        {/* ERRO DE API */}

        {apiError ? (

          <div className="empty-state">

            <div className="empty-state-icon warning">

              <TriangleAlert size={28} />

            </div>

            <h3>
              API não conectada
            </h3>

            <p>
              Inicie o backend .NET para
              carregar e gerenciar os
              materiais.
            </p>

            <button
              className="secondary-button"
              type="button"
              onClick={loadMaterials}
            >
              Tentar novamente
            </button>

          </div>

        ) : loading ? (

          <div className="loading-state">

            Carregando materiais...

          </div>

        ) : filteredMaterials.length === 0 ? (

          <div className="empty-state">

            <div className="empty-state-icon">

              <Boxes size={30} />

            </div>

            <h3>
              Nenhum material encontrado
            </h3>

            <p>
              Cadastre um material para
              utilizá-lo na estrutura de
              produção.
            </p>

            <button
              className="primary-button"
              type="button"
              onClick={openCreateModal}
            >
              <Plus size={17} />

              Novo Material
            </button>

          </div>

        ) : (

          /* TABELA */

          <div className="table-wrapper">

            <table className="aps-table">

              <thead>

                <tr>

                  <th>ID</th>

                  <th>Código</th>

                  <th>Nome</th>

                  <th>Unidade</th>

                  <th>Estoque</th>

                  <th className="actions-column">
                    Ações
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredMaterials.map(
                  (material) => (

                    <tr key={material.id}>

                      <td className="id-cell">
                        #{material.id}
                      </td>

                      <td>

                        <span className="product-code">

                          {material.code}

                        </span>

                      </td>

                      <td>

                        <strong className="table-primary-text">

                          {material.name}

                        </strong>

                      </td>

                      <td>
                        {material.unit}
                      </td>

                      <td>

                        {material.stock.toLocaleString(
                          'pt-BR',
                          {
                            minimumFractionDigits:
                              0,
                            maximumFractionDigits:
                              2,
                          }
                        )}

                      </td>

                      <td>

                        <div className="table-actions">

                          <button
                            type="button"
                            title="Visualizar"
                            className="action-button view"
                            onClick={() =>
                              openDetails(
                                material
                              )
                            }
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            type="button"
                            title="Editar"
                            className="action-button edit"
                            onClick={() =>
                              openEditModal(
                                material
                              )
                            }
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            title="Excluir"
                            className="action-button delete"
                            onClick={() =>
                              handleDelete(
                                material
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

      {/* MODAL CADASTRO / EDIÇÃO */}

      {modalOpen && (

        <div className="modal-backdrop">

          <div className="aps-modal">

            <div className="modal-header">

              <div>

                <span className="eyebrow">

                  {editingMaterial
                    ? 'EDIÇÃO'
                    : 'CADASTRO'}

                </span>

                <h2>

                  {editingMaterial
                    ? 'Editar Material'
                    : 'Novo Material'}

                </h2>

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

                <div className="form-group">

                  <label htmlFor="material-code">

                    Código <span>*</span>

                  </label>

                  <input
                    id="material-code"
                    type="text"
                    value={form.code}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        code:
                          event.target.value,
                      })
                    }
                    placeholder="Ex.: MAT001"
                    required
                  />

                </div>

                <div className="form-group">

                  <label htmlFor="material-name">

                    Nome <span>*</span>

                  </label>

                  <input
                    id="material-name"
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        name:
                          event.target.value,
                      })
                    }
                    placeholder="Ex.: Chapa de Aço"
                    required
                  />

                </div>

                <div className="form-group">

                  <label htmlFor="material-unit">

                    Unidade <span>*</span>

                  </label>

                  <input
                    id="material-unit"
                    type="text"
                    value={form.unit}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        unit:
                          event.target.value,
                      })
                    }
                    placeholder="Ex.: kg"
                    required
                  />

                </div>

                <div className="form-group">

                  <label htmlFor="material-stock">

                    Estoque <span>*</span>

                  </label>

                  <input
                    id="material-stock"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.stock}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        stock: Number(
                          event.target.value
                        ),
                      })
                    }
                    required
                  />

                </div>

              </div>

              <div className="modal-footer">

                <button
                  className="secondary-button"
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancelar
                </button>

                <button
                  className="primary-button"
                  type="submit"
                  disabled={saving}
                >
                  {saving
                    ? 'Salvando...'
                    : editingMaterial
                      ? 'Salvar alterações'
                      : 'Salvar material'}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* MODAL DE DETALHES */}

      {detailsOpen &&
        selectedMaterial && (

          <div className="modal-backdrop">

            <div className="aps-modal product-details-modal">

              <div className="modal-header">

                <div>

                  <span className="eyebrow">
                    MATERIAL
                  </span>

                  <h2>
                    {selectedMaterial.name}
                  </h2>

                </div>

                <button
                  type="button"
                  className="modal-close"
                  onClick={() =>
                    setDetailsOpen(false)
                  }
                >
                  <X size={20} />
                </button>

              </div>

              <div className="modal-body">

                <div className="product-details-header">

                  <div className="product-details-icon">

                    <Boxes size={30} />

                  </div>

                  <div>

                    <span>
                      {selectedMaterial.code}
                    </span>

                    <strong>
                      {selectedMaterial.name}
                    </strong>

                  </div>

                </div>

                <div className="details-grid">

                  <div>

                    <span>ID</span>

                    <strong>
                      {selectedMaterial.id}
                    </strong>

                  </div>

                  <div>

                    <span>Código</span>

                    <strong>
                      {selectedMaterial.code}
                    </strong>

                  </div>

                  <div>

                    <span>Unidade</span>

                    <strong>
                      {selectedMaterial.unit}
                    </strong>

                  </div>

                  <div>

                    <span>Estoque</span>

                    <strong>
                      {selectedMaterial.stock.toLocaleString(
                        'pt-BR'
                      )}
                    </strong>

                  </div>

                </div>

                <div className="relation-preview">

                  <h3>
                    Relacionamentos do Material
                  </h3>

                  <p>
                    Esta área exibirá os produtos
                    e estruturas BOM que utilizam
                    este material.
                  </p>

                </div>

              </div>

              <div className="modal-footer">

                <button
                  className="secondary-button"
                  type="button"
                  onClick={() =>
                    setDetailsOpen(false)
                  }
                >
                  Fechar
                </button>

                <button
                  className="primary-button"
                  type="button"
                  onClick={() => {
                    setDetailsOpen(false);

                    openEditModal(
                      selectedMaterial
                    );
                  }}
                >
                  <Pencil size={16} />

                  Editar Material
                </button>

              </div>

            </div>

          </div>

        )}

    </div>
  );
};

export default Materials;