import { useEffect, useMemo, useState } from 'react';
import {
  Eye,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
  Package,
  TriangleAlert,
} from 'lucide-react';

import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
  type Product,
} from '../services/productService';

interface ProductForm {
  code: string;
  name: string;
  description: string;
}

const initialForm: ProductForm = {
  code: '',
  name: '',
  description: '',
};

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [form, setForm] = useState<ProductForm>(initialForm);
  const [saving, setSaving] = useState(false);

  const loadProducts = async () => {
    try {
      setLoading(true);

      const data = await getProducts();

      setProducts(data);
      setApiError(false);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setApiError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const term = search.toLowerCase().trim();

    if (!term) {
      return products;
    }

    return products.filter((product) => {
      return (
        product.code.toLowerCase().includes(term) ||
        product.name.toLowerCase().includes(term) ||
        product.description?.toLowerCase().includes(term)
      );
    });
  }, [products, search]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);

    setForm({
      code: product.code,
      name: product.name,
      description: product.description ?? '',
    });

    setModalOpen(true);
  };

  const openDetails = (product: Product) => {
    setSelectedProduct(product);
    setDetailsOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditingProduct(null);
    setForm(initialForm);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.code.trim() || !form.name.trim()) {
      return;
    }

    try {
      setSaving(true);

      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          code: form.code.trim(),
          name: form.name.trim(),
          description: form.description.trim() || null,
        });
      } else {
        await createProduct({
          code: form.code.trim(),
          name: form.name.trim(),
          description: form.description.trim() || null,
        });
      }

      setModalOpen(false);
      setEditingProduct(null);
      setForm(initialForm);
      await loadProducts();
      
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      alert('Não foi possível salvar o produto.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product: Product) => {
    const confirmed = window.confirm(
      `Deseja realmente excluir o produto "${product.name}"?`,
    );

    if (!confirmed) return;

    try {
      await deleteProduct(product.id);
      await loadProducts();
    } catch (error) {
      console.error('Erro ao excluir produto:', error);

      alert(
        'Não foi possível excluir o produto. Ele pode estar relacionado a outros registros.',
      );
    }
  };

  return (
    <div className="products-page">
      <div className="page-heading">
        <div>
          <h1>Produtos</h1>
          <p>Cadastre e gerencie os produtos utilizados no planejamento industrial.</p>
        </div>

        <button
          className="primary-button"
          type="button"
          onClick={openCreateModal}
        >
          <Plus size={17} />
          Novo Produto
        </button>
      </div>

      <section className="data-panel">
        <div className="data-toolbar">
          <div className="table-search">
            <Search size={17} />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por código, nome ou descrição..."
            />
          </div>

          <span className="record-counter">
            {filteredProducts.length} produto
            {filteredProducts.length === 1 ? '' : 's'}
          </span>
        </div>

        {apiError ? (
          <div className="empty-state">
            <div className="empty-state-icon warning">
              <TriangleAlert size={28} />
            </div>

            <h3>API não conectada</h3>

            <p>
              Inicie o backend .NET para carregar e gerenciar os produtos.
            </p>

            <button
              className="secondary-button"
              type="button"
              onClick={loadProducts}
            >
              Tentar novamente
            </button>
          </div>
        ) : loading ? (
          <div className="loading-state">
            Carregando produtos...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Package size={30} />
            </div>

            <h3>Nenhum produto encontrado</h3>

            <p>
              Cadastre um produto para começar a estruturar o planejamento da
              produção.
            </p>

            <button
              className="primary-button"
              type="button"
              onClick={openCreateModal}
            >
              <Plus size={17} />
              Novo Produto
            </button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="aps-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Código</th>
                  <th>Nome</th>
                  <th>Descrição</th>
                  <th className="actions-column">Ações</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="id-cell">#{product.id}</td>

                    <td>
                      <span className="product-code">
                        {product.code}
                      </span>
                    </td>

                    <td>
                      <strong className="table-primary-text">
                        {product.name}
                      </strong>
                    </td>

                    <td className="description-cell">
                      {product.description || 'Sem descrição'}
                    </td>

                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          title="Visualizar"
                          className="action-button view"
                          onClick={() => openDetails(product)}
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          type="button"
                          title="Editar"
                          className="action-button edit"
                          onClick={() => openEditModal(product)}
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          title="Excluir"
                          className="action-button delete"
                          onClick={() => handleDelete(product)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modalOpen && (
        <div className="modal-backdrop">
          <div className="aps-modal">
            <div className="modal-header">
              <div>
                <span className="eyebrow">
                  {editingProduct ? 'EDIÇÃO' : 'CADASTRO'}
                </span>

                <h2>
                  {editingProduct ? 'Editar Produto' : 'Novo Produto'}
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
                  <label htmlFor="product-code">
                    Código <span>*</span>
                  </label>

                  <input
                    id="product-code"
                    type="text"
                    value={form.code}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        code: event.target.value,
                      })
                    }
                    placeholder="Ex.: PROD-001"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="product-name">
                    Nome <span>*</span>
                  </label>

                  <input
                    id="product-name"
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        name: event.target.value,
                      })
                    }
                    placeholder="Ex.: Produto A"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="product-description">
                    Descrição
                  </label>

                  <textarea
                    id="product-description"
                    rows={4}
                    value={form.description}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        description: event.target.value,
                      })
                    }
                    placeholder="Descreva o produto..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="secondary-button"
                  type="button"
                  onClick={closeModal}
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
                    : editingProduct
                      ? 'Salvar alterações'
                      : 'Salvar produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detailsOpen && selectedProduct && (
        <div className="modal-backdrop">
          <div className="aps-modal product-details-modal">
            <div className="modal-header">
              <div>
                <span className="eyebrow">PRODUTO</span>
                <h2>{selectedProduct.name}</h2>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => setDetailsOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="product-details-header">
                <div className="product-details-icon">
                  <Package size={30} />
                </div>

                <div>
                  <span>{selectedProduct.code}</span>
                  <strong>{selectedProduct.name}</strong>
                </div>
              </div>

              <div className="details-grid">
                <div>
                  <span>ID</span>
                  <strong>{selectedProduct.id}</strong>
                </div>

                <div>
                  <span>Código</span>
                  <strong>{selectedProduct.code}</strong>
                </div>

                <div className="full">
                  <span>Descrição</span>
                  <strong>
                    {selectedProduct.description || 'Sem descrição cadastrada.'}
                  </strong>
                </div>
              </div>

              <div className="relation-preview">
                <h3>Relacionamentos do Produto</h3>

                <p>
                  Posteriormente esta área exibirá a Estrutura BOM, Ordens de
                  Produção e Operações vinculadas ao produto.
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="secondary-button"
                type="button"
                onClick={() => setDetailsOpen(false)}
              >
                Fechar
              </button>

              <button
                className="primary-button"
                type="button"
                onClick={() => {
                  setDetailsOpen(false);
                  openEditModal(selectedProduct);
                }}
              >
                <Pencil size={16} />
                Editar Produto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;