/*
 * Hooks do React utilizados nesta página.
 */
import {
  useEffect,
  useMemo,
  useState,
} from 'react';

/*
 * Ícones utilizados na interface do Grafo.
 */
import {
  Activity,
  GitBranch,
  Play,
  Route,
  Search,
} from 'lucide-react';

/*
 * Funções que fazem chamadas para a API do Grafo.
 */
import {
  executeBFS,
  executeDFS,
  executeDijkstra,
  getGraph,
} from '../services/graphService';

/*
 * Tipos utilizados apenas pelo TypeScript.
 */
import type {
  DijkstraResult,
  GraphData,
  GraphTraversalResult,
} from '../services/graphService';
/*
 * ============================================================
 * PÁGINA DE VISUALIZAÇÃO DO GRAFO INDUSTRIAL
 * ============================================================
 *
 * Nesta página:
 *
 * - máquinas são representadas por vértices;
 * - conexões são representadas por arestas;
 * - pesos aparecem sobre as conexões;
 * - BFS pode ser executado;
 * - DFS pode ser executado;
 * - Dijkstra calcula o menor caminho.
 */
const Graph = () => {
  /*
   * Dados completos do grafo.
   */
  const [graph, setGraph] =
    useState<GraphData>({
      vertices: [],
      edges: [],
    });

  /*
   * Máquina utilizada como ponto inicial
   * para BFS e DFS.
   */
  const [
    startMachineId,
    setStartMachineId,
  ] = useState<number>(0);

  /*
   * Origem e destino utilizados
   * pelo algoritmo de Dijkstra.
   */
  const [
    fromMachineId,
    setFromMachineId,
  ] = useState<number>(0);

  const [
    toMachineId,
    setToMachineId,
  ] = useState<number>(0);

  /*
   * Resultado de BFS ou DFS.
   */
  const [
    traversalResult,
    setTraversalResult,
  ] =
    useState<GraphTraversalResult | null>(
      null
    );

  /*
   * Resultado do Dijkstra.
   */
  const [
    dijkstraResult,
    setDijkstraResult,
  ] =
    useState<DijkstraResult | null>(
      null
    );

  /*
   * Estado visual de carregamento.
   */
  const [loading, setLoading] =
    useState<boolean>(true);

  /*
   * Indica se algum algoritmo
   * está sendo processado.
   */
  const [
    processing,
    setProcessing,
  ] = useState<boolean>(false);

  /*
   * ========================================================
   * CARREGAMENTO INICIAL
   * ========================================================
   */
  useEffect(() => {
    loadGraph();
  }, []);

  /*
   * Busca o Grafo diretamente do backend.
   */
  const loadGraph = async () => {
    try {
      setLoading(true);

      const data = await getGraph();

      setGraph(data);

      /*
       * Selecionamos valores iniciais automaticamente
       * para facilitar os testes.
       */
      if (data.vertices.length > 0) {
        const firstMachine =
          data.vertices[0];

        setStartMachineId(
          firstMachine.id
        );

        setFromMachineId(
          firstMachine.id
        );

        /*
         * Se existir mais de uma máquina,
         * utilizamos a última como destino.
         */
        if (
          data.vertices.length > 1
        ) {
          setToMachineId(
            data.vertices[
              data.vertices.length - 1
            ].id
          );
        }
      }
    } catch (error) {
      console.error(
        'Erro ao carregar grafo:',
        error
      );

      alert(
        'Não foi possível carregar o grafo.'
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ========================================================
   * BFS
   * ========================================================
   */
  const handleBFS = async () => {
    if (!startMachineId) {
      return;
    }

    try {
      setProcessing(true);

      /*
       * Limpa o resultado anterior
       * do Dijkstra.
       */
      setDijkstraResult(null);

      const result =
        await executeBFS(
          startMachineId
        );

      setTraversalResult(result);
    } catch (error) {
      console.error(
        'Erro ao executar BFS:',
        error
      );

      alert(
        'Não foi possível executar o BFS.'
      );
    } finally {
      setProcessing(false);
    }
  };

  /*
   * ========================================================
   * DFS
   * ========================================================
   */
  const handleDFS = async () => {
    if (!startMachineId) {
      return;
    }

    try {
      setProcessing(true);

      setDijkstraResult(null);

      const result =
        await executeDFS(
          startMachineId
        );

      setTraversalResult(result);
    } catch (error) {
      console.error(
        'Erro ao executar DFS:',
        error
      );

      alert(
        'Não foi possível executar o DFS.'
      );
    } finally {
      setProcessing(false);
    }
  };

  /*
   * ========================================================
   * DIJKSTRA
   * ========================================================
   */
  const handleDijkstra = async () => {
    /*
     * Origem e destino precisam existir.
     */
    if (
      !fromMachineId ||
      !toMachineId
    ) {
      return;
    }

    /*
     * Evita calcular um caminho
     * da máquina para ela mesma.
     */
    if (
      fromMachineId ===
      toMachineId
    ) {
      alert(
        'Selecione máquinas diferentes para origem e destino.'
      );

      return;
    }

    try {
      setProcessing(true);

      /*
       * Limpamos BFS/DFS para destacar
       * somente o caminho mínimo.
       */
      setTraversalResult(null);

      const result =
        await executeDijkstra(
          fromMachineId,
          toMachineId
        );

      setDijkstraResult(result);
    } catch (error) {
      console.error(
        'Erro ao executar Dijkstra:',
        error
      );

      alert(
        'Não foi possível encontrar um caminho entre as máquinas selecionadas.'
      );
    } finally {
      setProcessing(false);
    }
  };

  /*
   * ========================================================
   * POSICIONAMENTO DOS VÉRTICES
   * ========================================================
   *
   * Os vértices são distribuídos automaticamente
   * em formato circular dentro do SVG.
   *
   * Assim evitamos depender de bibliotecas externas.
   */
  const vertexPositions = useMemo(
    () => {
      const positions =
        new Map<
          number,
          {
            x: number;
            y: number;
          }
        >();

      const total =
        graph.vertices.length;

      /*
       * Centro do desenho SVG.
       */
      const centerX = 400;
      const centerY = 220;

      /*
       * Raio utilizado para distribuir
       * as máquinas.
       */
      const radius =
        total <= 3 ? 150 : 170;

      graph.vertices.forEach(
        (vertex, index) => {
          /*
           * Faz o primeiro vértice começar
           * na parte superior do círculo.
           */
          const angle =
            (2 *
              Math.PI *
              index) /
              total -
            Math.PI / 2;

          positions.set(
            vertex.id,
            {
              x:
                centerX +
                radius *
                  Math.cos(
                    angle
                  ),

              y:
                centerY +
                radius *
                  Math.sin(
                    angle
                  ),
            }
          );
        }
      );

      return positions;
    },
    [graph.vertices]
  );

  /*
   * ========================================================
   * DESTAQUE DO DIJKSTRA
   * ========================================================
   *
   * Descobre quais arestas fazem parte
   * do menor caminho.
   */
  const dijkstraEdges = useMemo(
    () => {
      const result =
        new Set<string>();

      if (
        !dijkstraResult ||
        dijkstraResult.path.length < 2
      ) {
        return result;
      }

      for (
        let index = 0;
        index <
        dijkstraResult.path.length - 1;
        index++
      ) {
        const current =
          dijkstraResult.path[index];

        const next =
          dijkstraResult.path[
            index + 1
          ];

        result.add(
          `${current.id}-${next.id}`
        );
      }

      return result;
    },
    [dijkstraResult]
  );

  /*
   * Indica se determinado vértice
   * faz parte do resultado atual.
   */
  const isVertexHighlighted = (
    vertexId: number
  ) => {
    if (dijkstraResult) {
      return dijkstraResult.path.some(
        vertex =>
          vertex.id === vertexId
      );
    }

    if (traversalResult) {
      return traversalResult.traversal.some(
        vertex =>
          vertex.id === vertexId
      );
    }

    return false;
  };

  /*
   * Tela apresentada enquanto
   * o backend está sendo consultado.
   */
  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center py-5">
          <div
            className="spinner-border"
            role="status"
          />

          <p className="mt-3 text-muted">
            Carregando grafo industrial...
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
          <GitBranch
            size={28}
            className="me-2"
          />

          Grafo Industrial
        </h2>

        <p className="text-muted mb-0">
          Visualização das máquinas,
          conexões e algoritmos de busca.
        </p>
      </div>

      {/* ==================================================
          INDICADORES
          ================================================== */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <small className="text-muted">
                Vértices
              </small>

              <h3 className="fw-bold mb-0">
                {
                  graph.vertices
                    .length
                }
              </h3>

              <small className="text-muted">
                Máquinas cadastradas
              </small>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <small className="text-muted">
                Arestas
              </small>

              <h3 className="fw-bold mb-0">
                {graph.edges.length}
              </h3>

              <small className="text-muted">
                Conexões cadastradas
              </small>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <small className="text-muted">
                Algoritmos
              </small>

              <h3 className="fw-bold mb-0">
                3
              </h3>

              <small className="text-muted">
                BFS, DFS e Dijkstra
              </small>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* ==================================================
            DESENHO DO GRAFO
            ================================================== */}
        <div className="col-xl-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="mb-0 fw-semibold">
                Estrutura da fábrica
              </h5>
            </div>

            <div className="card-body">
              {graph.vertices.length ===
              0 ? (
                <div className="text-center py-5 text-muted">
                  Nenhuma máquina
                  cadastrada.
                </div>
              ) : (
                <div
                  style={{
                    overflowX:
                      'auto',
                  }}
                >
                  <svg
                    viewBox="0 0 800 440"
                    width="100%"
                    style={{
                      minWidth:
                        '650px',
                      minHeight:
                        '440px',
                    }}
                  >
                    {/* Marcador responsável
                        pela seta das conexões */}
                    <defs>
                      <marker
                        id="arrow"
                        markerWidth="10"
                        markerHeight="10"
                        refX="9"
                        refY="3"
                        orient="auto"
                        markerUnits="strokeWidth"
                      >
                        <path
                          d="M0,0 L0,6 L9,3 z"
                          fill="#64748b"
                        />
                      </marker>

                      <marker
                        id="arrowHighlighted"
                        markerWidth="10"
                        markerHeight="10"
                        refX="9"
                        refY="3"
                        orient="auto"
                        markerUnits="strokeWidth"
                      >
                        <path
                          d="M0,0 L0,6 L9,3 z"
                          fill="#0d6efd"
                        />
                      </marker>
                    </defs>

                    {/* ===============================
                        ARESTAS
                        =============================== */}
                    {graph.edges.map(
                      edge => {
                        const source =
                          vertexPositions.get(
                            edge.fromMachineId
                          );

                        const destination =
                          vertexPositions.get(
                            edge.toMachineId
                          );

                        if (
                          !source ||
                          !destination
                        ) {
                          return null;
                        }

                        const highlighted =
                          dijkstraEdges.has(
                            `${edge.fromMachineId}-${edge.toMachineId}`
                          );

                        /*
                         * Calcula um pequeno deslocamento
                         * para a linha não entrar no centro
                         * dos círculos.
                         */
                        const dx =
                          destination.x -
                          source.x;

                        const dy =
                          destination.y -
                          source.y;

                        const length =
                          Math.sqrt(
                            dx * dx +
                              dy * dy
                          );

                        const offset = 48;

                        const startX =
                          source.x +
                          (dx /
                            length) *
                            offset;

                        const startY =
                          source.y +
                          (dy /
                            length) *
                            offset;

                        const endX =
                          destination.x -
                          (dx /
                            length) *
                            offset;

                        const endY =
                          destination.y -
                          (dy /
                            length) *
                            offset;

                        const middleX =
                          (startX +
                            endX) /
                          2;

                        const middleY =
                          (startY +
                            endY) /
                          2;

                        return (
                          <g
                            key={
                              edge.id
                            }
                          >
                            <line
                              x1={
                                startX
                              }
                              y1={
                                startY
                              }
                              x2={
                                endX
                              }
                              y2={
                                endY
                              }
                              stroke={
                                highlighted
                                  ? '#0d6efd'
                                  : '#64748b'
                              }
                              strokeWidth={
                                highlighted
                                  ? 4
                                  : 2
                              }
                              markerEnd={
                                highlighted
                                  ? 'url(#arrowHighlighted)'
                                  : 'url(#arrow)'
                              }
                            />

                            {/* Fundo do peso */}
                            <circle
                              cx={
                                middleX
                              }
                              cy={
                                middleY
                              }
                              r="17"
                              fill="white"
                              stroke="#dee2e6"
                            />

                            {/* Peso da aresta */}
                            <text
                              x={
                                middleX
                              }
                              y={
                                middleY +
                                5
                              }
                              textAnchor="middle"
                              fontSize="13"
                              fontWeight="700"
                              fill="#212529"
                            >
                              {
                                edge.weight
                              }
                            </text>
                          </g>
                        );
                      }
                    )}

                    {/* ===============================
                        VÉRTICES
                        =============================== */}
                    {graph.vertices.map(
                      vertex => {
                        const position =
                          vertexPositions.get(
                            vertex.id
                          );

                        if (!position) {
                          return null;
                        }

                        const highlighted =
                          isVertexHighlighted(
                            vertex.id
                          );

                        return (
                          <g
                            key={
                              vertex.id
                            }
                          >
                            <circle
                              cx={
                                position.x
                              }
                              cy={
                                position.y
                              }
                              r="46"
                              fill={
                                highlighted
                                  ? '#0d6efd'
                                  : '#ffffff'
                              }
                              stroke={
                                highlighted
                                  ? '#0d6efd'
                                  : '#334155'
                              }
                              strokeWidth="3"
                            />

                            <text
                              x={
                                position.x
                              }
                              y={
                                position.y -
                                5
                              }
                              textAnchor="middle"
                              fontSize="12"
                              fontWeight="700"
                              fill={
                                highlighted
                                  ? '#ffffff'
                                  : '#212529'
                              }
                            >
                              MAQ
                              {
                                vertex.id
                              }
                            </text>

                            <text
                              x={
                                position.x
                              }
                              y={
                                position.y +
                                14
                              }
                              textAnchor="middle"
                              fontSize="10"
                              fill={
                                highlighted
                                  ? '#ffffff'
                                  : '#495057'
                              }
                            >
                              {
                                vertex.name
                              }
                            </text>
                          </g>
                        );
                      }
                    )}
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ==================================================
            PAINEL DE ALGORITMOS
            ================================================== */}
        <div className="col-xl-4">
          {/* BFS / DFS */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="mb-0 fw-semibold">
                <Search
                  size={19}
                  className="me-2"
                />

                Busca no Grafo
              </h5>
            </div>

            <div className="card-body">
              <label className="form-label fw-semibold">
                Máquina inicial
              </label>

              <select
                className="form-select mb-3"
                value={
                  startMachineId
                }
                onChange={event =>
                  setStartMachineId(
                    Number(
                      event.target
                        .value
                    )
                  )
                }
              >
                {graph.vertices.map(
                  vertex => (
                    <option
                      key={
                        vertex.id
                      }
                      value={
                        vertex.id
                      }
                    >
                      {vertex.name}
                    </option>
                  )
                )}
              </select>

              <div className="d-grid gap-2">
                <button
                  className="btn btn-outline-primary"
                  onClick={
                    handleBFS
                  }
                  disabled={
                    processing
                  }
                >
                  <Play
                    size={17}
                    className="me-2"
                  />

                  Executar BFS
                </button>

                <button
                  className="btn btn-outline-dark"
                  onClick={
                    handleDFS
                  }
                  disabled={
                    processing
                  }
                >
                  <Activity
                    size={17}
                    className="me-2"
                  />

                  Executar DFS
                </button>
              </div>
            </div>
          </div>

          {/* Dijkstra */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="mb-0 fw-semibold">
                <Route
                  size={19}
                  className="me-2"
                />

                Menor Caminho
              </h5>
            </div>

            <div className="card-body">
              <label className="form-label fw-semibold">
                Origem
              </label>

              <select
                className="form-select mb-3"
                value={
                  fromMachineId
                }
                onChange={event =>
                  setFromMachineId(
                    Number(
                      event.target
                        .value
                    )
                  )
                }
              >
                {graph.vertices.map(
                  vertex => (
                    <option
                      key={
                        vertex.id
                      }
                      value={
                        vertex.id
                      }
                    >
                      {vertex.name}
                    </option>
                  )
                )}
              </select>

              <label className="form-label fw-semibold">
                Destino
              </label>

              <select
                className="form-select mb-3"
                value={
                  toMachineId
                }
                onChange={event =>
                  setToMachineId(
                    Number(
                      event.target
                        .value
                    )
                  )
                }
              >
                {graph.vertices.map(
                  vertex => (
                    <option
                      key={
                        vertex.id
                      }
                      value={
                        vertex.id
                      }
                    >
                      {vertex.name}
                    </option>
                  )
                )}
              </select>

              <div className="d-grid">
                <button
                  className="btn btn-primary"
                  onClick={
                    handleDijkstra
                  }
                  disabled={
                    processing
                  }
                >
                  <Route
                    size={17}
                    className="me-2"
                  />

                  Calcular menor caminho
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================
          RESULTADO BFS / DFS
          ================================================== */}
      {traversalResult && (
        <div className="card border-0 shadow-sm mt-4">
          <div className="card-body">
            <h5 className="fw-bold">
              Resultado{' '}
              {
                traversalResult.algorithm
              }
            </h5>

            <p className="text-muted mb-2">
              Ordem de visita das
              máquinas:
            </p>

            <div className="d-flex flex-wrap align-items-center gap-2">
              {traversalResult.traversal.map(
                (vertex, index) => (
                  <div
                    key={
                      vertex.id
                    }
                    className="d-flex align-items-center gap-2"
                  >
                    <span className="badge bg-primary fs-6 p-2">
                      {
                        vertex.name
                      }
                    </span>

                    {index <
                      traversalResult
                        .traversal
                        .length -
                        1 && (
                      <span className="fw-bold">
                        →
                      </span>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          RESULTADO DIJKSTRA
          ================================================== */}
      {dijkstraResult && (
        <div className="card border-0 shadow-sm mt-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
              <div>
                <h5 className="fw-bold mb-1">
                  Menor caminho
                </h5>

                <p className="text-muted mb-3">
                  Resultado calculado
                  pelo algoritmo de
                  Dijkstra.
                </p>

                <div className="d-flex flex-wrap align-items-center gap-2">
                  {dijkstraResult.path.map(
                    (
                      vertex,
                      index
                    ) => (
                      <div
                        key={
                          vertex.id
                        }
                        className="d-flex align-items-center gap-2"
                      >
                        <span className="badge bg-primary fs-6 p-2">
                          {
                            vertex.name
                          }
                        </span>

                        {index <
                          dijkstraResult
                            .path
                            .length -
                            1 && (
                          <span className="fw-bold">
                            →
                          </span>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="text-end">
                <small className="text-muted d-block">
                  Peso total
                </small>

                <span className="display-6 fw-bold text-primary">
                  {
                    dijkstraResult.totalWeight
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Graph;