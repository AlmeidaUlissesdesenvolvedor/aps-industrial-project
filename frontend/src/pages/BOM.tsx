import {
  useEffect,
  useState,
} from 'react';

import {
  Boxes,
  GitBranch,
  Layers3,
  RefreshCw,
  Route,
  TriangleAlert,
} from 'lucide-react';

import {
  getProducts,
  type Product,
} from '../services/productService';

import {
  getBOMItemsByProduct,
  getBOMTree,
  type BOMItem,
  type BOMTreeNode,
  type BOMTreeResponse,
} from '../services/bomService';


const BOM = () => {

  const [products, setProducts] =
    useState<Product[]>([]);

  const [
    selectedProductId,
    setSelectedProductId
  ] = useState<number>(0);

  const [treeData, setTreeData] =
    useState<BOMTreeResponse | null>(null);

  const [bomItems, setBomItems] =
    useState<BOMItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [apiError, setApiError] =
    useState(false);


  // =====================================================
  // CARREGAR PRODUTOS
  // =====================================================

  const loadProducts = async () => {

    try {

      const data =
        await getProducts();

      setProducts(data);

      if (
        data.length > 0 &&
        selectedProductId === 0
      ) {

        setSelectedProductId(
          data[0].id
        );

      }

    } catch (error) {

      console.error(
        'Erro ao carregar produtos:',
        error
      );

      setApiError(true);

    }

  };


  // =====================================================
  // CARREGAR ESTRUTURA BOM
  // =====================================================

  const loadBOM = async (
    productId: number
  ) => {

    if (!productId) {
      return;
    }

    try {

      setLoading(true);
      setApiError(false);

      const [
        treeResponse,
        itemsResponse
      ] = await Promise.all([

        getBOMTree(productId),

        getBOMItemsByProduct(
          productId
        ),

      ]);

      setTreeData(
        treeResponse
      );

      setBomItems(
        itemsResponse
      );

    } catch (error) {

      console.error(
        'Erro ao carregar BOM:',
        error
      );

      setApiError(true);

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    loadProducts();

  }, []);


  useEffect(() => {

    if (selectedProductId > 0) {

      loadBOM(
        selectedProductId
      );

    }

  }, [selectedProductId]);


  // =====================================================
  // LOCALIZAR INFORMAÇÕES DO MATERIAL
  // =====================================================

  const getMaterialData = (
    node: BOMTreeNode
  ) => {

    return bomItems.find(
      item =>
        item.componentId === node.id
    );

  };


  // =====================================================
  // ÁRVORE VISUAL
  // =====================================================

  const renderNode = (
    node: BOMTreeNode,
    depth = 0
  ) => {

    const material =
      getMaterialData(node);

    const isRoot =
      depth === 0;

    return (

      <div
        key={`${depth}-${node.id}-${node.name}`}
        style={{
          marginLeft:
            depth === 0
              ? 0
              : 36,
          marginTop: 12,
        }}
      >

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 13,

            border:
              isRoot
                ? '1px solid #bcd8ff'
                : '1px solid #e3e9f0',

            background:
              isRoot
                ? '#eef6ff'
                : '#ffffff',

            borderRadius: 9,

            padding:
              '14px 16px',

            boxShadow:
              '0 2px 8px rgba(17, 36, 58, 0.05)',
          }}
        >

          <div
            style={{
              width: 40,
              height: 40,

              display: 'grid',
              placeItems: 'center',

              borderRadius: 8,

              background:
                isRoot
                  ? '#1769e0'
                  : '#edf4ff',

              color:
                isRoot
                  ? '#ffffff'
                  : '#1769e0',

              flexShrink: 0,
            }}
          >

            {isRoot
              ? (
                <Layers3 size={20} />
              )
              : (
                <Boxes size={19} />
              )}

          </div>


          <div
            style={{
              flex: 1,
            }}
          >

            <span
              style={{
                display: 'block',

                color:
                  isRoot
                    ? '#1769e0'
                    : '#8090a3',

                fontSize: 10,

                fontWeight: 700,

                textTransform:
                  'uppercase',
              }}
            >

              {isRoot
                ? treeData?.productCode
                : material?.materialCode ??
                  'Material'}

            </span>


            <strong
              style={{
                display: 'block',

                color: '#25364b',

                fontSize: 14,

                marginTop: 2,
              }}
            >

              {node.name}

            </strong>

          </div>


          {!isRoot && (

            <div
              style={{
                textAlign: 'right',
              }}
            >

              <span
                style={{
                  display: 'block',

                  color: '#8a97a7',

                  fontSize: 10,
                }}
              >

                Quantidade

              </span>


              <strong
                style={{
                  color: '#26374c',

                  fontSize: 13,
                }}
              >

                {node.quantity}{' '}

                {material?.materialUnit ??
                  ''}

              </strong>

            </div>

          )}

        </div>


        {node.children?.map(
          child =>
            renderNode(
              child,
              depth + 1
            )
        )}

      </div>

    );

  };


  // =====================================================
  // INTERFACE
  // =====================================================

  return (

    <div className="products-page">

      {/* CABEÇALHO */}

      <div className="page-heading">

        <div>

          <h1>
            Estrutura BOM
          </h1>

          <p>
            Visualize a estrutura de materiais
            dos produtos utilizando uma
            representação em árvore.
          </p>

        </div>


        <button
          type="button"
          className="secondary-button"
          onClick={() =>
            loadBOM(
              selectedProductId
            )
          }
        >

          <RefreshCw size={16} />

          Atualizar

        </button>

      </div>


      {/* SELEÇÃO DO PRODUTO */}

      <section
        className="data-panel"
        style={{
          marginBottom: 20,
        }}
      >

        <div className="data-toolbar">

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              width: '100%',
            }}
          >

            <Layers3
              size={19}
              color="#1769e0"
            />


            <div
              style={{
                flex: 1,
              }}
            >

              <span
                style={{
                  display: 'block',
                  fontSize: 10,
                  color: '#8492a4',
                  marginBottom: 4,
                }}
              >

                PRODUTO

              </span>


              <select
                value={
                  selectedProductId
                }
                onChange={(
                  event
                ) =>
                  setSelectedProductId(
                    Number(
                      event.target.value
                    )
                  )
                }
                style={{
                  width: '100%',
                  maxWidth: 460,

                  height: 38,

                  border:
                    '1px solid #dce3eb',

                  borderRadius: 7,

                  padding:
                    '0 10px',

                  outline: 'none',

                  background:
                    '#ffffff',

                  color:
                    '#27364a',
                }}
              >

                <option value={0}>
                  Selecione um produto
                </option>

                {products.map(
                  product => (

                    <option
                      key={
                        product.id
                      }
                      value={
                        product.id
                      }
                    >

                      {product.code}
                      {' - '}
                      {product.name}

                    </option>

                  )
                )}

              </select>

            </div>

          </div>

        </div>

      </section>


      {/* ERRO */}

      {apiError ? (

        <section className="data-panel">

          <div className="empty-state">

            <div className="empty-state-icon warning">

              <TriangleAlert
                size={28}
              />

            </div>

            <h3>
              Não foi possível carregar
              a estrutura BOM
            </h3>

            <p>
              Verifique se a API está
              em execução.
            </p>

            <button
              className="secondary-button"
              type="button"
              onClick={() =>
                loadBOM(
                  selectedProductId
                )
              }
            >

              Tentar novamente

            </button>

          </div>

        </section>

      ) : loading ? (

        <section className="data-panel">

          <div className="loading-state">

            Carregando estrutura BOM...

          </div>

        </section>

      ) : treeData ? (

        <>

          {/* RESUMO */}

          <div
            style={{
              display: 'grid',

              gridTemplateColumns:
                'repeat(3, minmax(0, 1fr))',

              gap: 16,

              marginBottom: 20,
            }}
          >

            <div className="dashboard-panel">

              <span className="eyebrow">
                PRODUTO
              </span>

              <strong
                style={{
                  display: 'block',
                  fontSize: 18,
                  color: '#27364a',
                }}
              >

                {treeData.productCode}

              </strong>

              <span
                style={{
                  color: '#8390a1',
                  fontSize: 11,
                }}
              >

                {treeData.productName}

              </span>

            </div>


            <div className="dashboard-panel">

              <span className="eyebrow">
                COMPONENTES
              </span>

              <strong
                style={{
                  display: 'block',
                  fontSize: 22,
                  color: '#27364a',
                }}
              >

                {bomItems.length}

              </strong>

              <span
                style={{
                  color: '#8390a1',
                  fontSize: 11,
                }}
              >

                materiais na estrutura

              </span>

            </div>


            <div className="dashboard-panel">

              <span className="eyebrow">
                ESTRUTURA
              </span>

              <strong
                style={{
                  display: 'block',
                  fontSize: 18,
                  color: '#137c54',
                }}
              >

                Árvore

              </strong>

              <span
                style={{
                  color: '#8390a1',
                  fontSize: 11,
                }}
              >

                BOMTree / BOMTreeNode

              </span>

            </div>

          </div>


          {/* ÁRVORE */}

          <section
            className="data-panel"
            style={{
              marginBottom: 20,
            }}
          >

            <div className="data-toolbar">

              <div>

                <strong
                  style={{
                    color: '#26374c',
                    fontSize: 13,
                  }}
                >

                  Árvore do Produto

                </strong>

                <span
                  style={{
                    display: 'block',
                    color: '#8a97a7',
                    fontSize: 10,
                    marginTop: 3,
                  }}
                >

                  Relação hierárquica entre
                  produto e materiais.

                </span>

              </div>


              <GitBranch
                size={20}
                color="#1769e0"
              />

            </div>


            <div
              style={{
                padding: 20,
              }}
            >

              {renderNode(
                treeData.tree
              )}

            </div>

          </section>


          {/* TABELA BOM */}

          <section
            className="data-panel"
            style={{
              marginBottom: 20,
            }}
          >

            <div className="data-toolbar">

              <div>

                <strong
                  style={{
                    color: '#26374c',
                    fontSize: 13,
                  }}
                >

                  Componentes da BOM

                </strong>

                <span
                  style={{
                    display: 'block',
                    color: '#8a97a7',
                    fontSize: 10,
                    marginTop: 3,
                  }}
                >

                  Materiais associados ao produto.

                </span>

              </div>


              <span className="record-counter">

                {bomItems.length}{' '}
                componente
                {bomItems.length === 1
                  ? ''
                  : 's'}

              </span>

            </div>


            {bomItems.length === 0 ? (

              <div className="empty-state">

                <Boxes size={30} />

                <h3>
                  Nenhum componente
                  cadastrado
                </h3>

              </div>

            ) : (

              <div className="table-wrapper">

                <table className="aps-table">

                  <thead>

                    <tr>

                      <th>Código</th>

                      <th>Material</th>

                      <th>Quantidade</th>

                      <th>Unidade</th>

                    </tr>

                  </thead>


                  <tbody>

                    {bomItems.map(
                      item => (

                        <tr key={item.id}>

                          <td>

                            <span className="product-code">

                              {item.materialCode}

                            </span>

                          </td>


                          <td>

                            <strong className="table-primary-text">

                              {item.materialName}

                            </strong>

                          </td>


                          <td>

                            {item.quantity}

                          </td>


                          <td>

                            {item.materialUnit}

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </section>


          {/* PERCURSOS */}

          <div
            style={{
              display: 'grid',

              gridTemplateColumns:
                'repeat(2, minmax(0, 1fr))',

              gap: 20,
            }}
          >

            <section className="dashboard-panel">

              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  alignItems:
                    'center',
                  marginBottom: 12,
                }}
              >

                <Route
                  size={19}
                  color="#1769e0"
                />

                <div>

                  <strong
                    style={{
                      display: 'block',
                      color: '#26374c',
                      fontSize: 13,
                    }}
                  >

                    Percurso PreOrder

                  </strong>

                  <span
                    style={{
                      color: '#8a97a7',
                      fontSize: 10,
                    }}
                  >

                    Raiz antes dos filhos

                  </span>

                </div>

              </div>


              <div
                style={{
                  background:
                    '#f6f9fd',

                  border:
                    '1px solid #e5ebf2',

                  padding: 14,

                  borderRadius: 8,

                  color: '#536174',

                  fontSize: 12,
                }}
              >

                {
                  treeData
                    .traversals
                    .preOrder
                    .join(' → ')
                }

              </div>

            </section>


            <section className="dashboard-panel">

              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  alignItems:
                    'center',
                  marginBottom: 12,
                }}
              >

                <Route
                  size={19}
                  color="#7953d2"
                />

                <div>

                  <strong
                    style={{
                      display: 'block',
                      color: '#26374c',
                      fontSize: 13,
                    }}
                  >

                    Percurso PostOrder

                  </strong>

                  <span
                    style={{
                      color: '#8a97a7',
                      fontSize: 10,
                    }}
                  >

                    Filhos antes da raiz

                  </span>

                </div>

              </div>


              <div
                style={{
                  background:
                    '#f8f6fd',

                  border:
                    '1px solid #ebe4f7',

                  padding: 14,

                  borderRadius: 8,

                  color: '#536174',

                  fontSize: 12,
                }}
              >

                {
                  treeData
                    .traversals
                    .postOrder
                    .join(' → ')
                }

              </div>

            </section>

          </div>

        </>

      ) : null}

    </div>

  );

};

export default BOM;