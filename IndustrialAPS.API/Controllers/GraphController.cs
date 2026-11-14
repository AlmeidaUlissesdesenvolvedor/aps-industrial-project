using IndustrialAPS.Domain.Services;
using IndustrialAPS.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IndustrialAPS.API.Controllers
{
    /*
     * Controller responsável por disponibilizar
     * o Grafo da fábrica através da API.
     *
     * Estrutura utilizada:
     *
     * Machine           -> Vértice
     * MachineConnection -> Aresta
     * Weight            -> Peso da aresta
     *
     * Os algoritmos propriamente ditos ficam
     * no projeto IndustrialAPS.Domain.
     */
    [Route("api/[controller]")]
    [ApiController]
    public class GraphController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly GraphService _graphService;

        /*
         * Recebemos o banco de dados e o serviço
         * responsável pela construção do grafo.
         */
        public GraphController(
            ApplicationDbContext context,
            GraphService graphService
        )
        {
            _context = context;
            _graphService = graphService;
        }

        /*
         * =====================================================
         * GET: api/graph
         * =====================================================
         *
         * Retorna a estrutura completa do grafo.
         *
         * Esse endpoint será utilizado pelo React
         * para desenhar visualmente:
         *
         * MAQ001 ----5----> MAQ002 ----3----> MAQ003
         */
        [HttpGet]
        public async Task<IActionResult> GetGraph()
        {
            /*
             * Carrega todas as máquinas.
             */
            var machines = await _context
                .Machines
                .AsNoTracking()
                .ToListAsync();

            /*
             * Carrega todas as conexões.
             */
            var connections = await _context
                .MachineConnections
                .AsNoTracking()
                .ToListAsync();

            /*
             * Monta o grafo utilizando o GraphService.
             */
            var graph = _graphService.BuildGraph(
                machines,
                connections
            );

            /*
             * Retornamos uma estrutura simplificada.
             *
             * Não retornamos Vertex e Edge diretamente
             * para evitar problemas de referência circular.
             */
            var result = new
            {
                vertices = graph.Vertices.Select(vertex => new
                {
                    id = vertex.Id,
                    name = vertex.Name
                }),

                edges = connections.Select(connection => new
                {
                    id = connection.Id,

                    fromMachineId =
                        connection.FromMachineId,

                    toMachineId =
                        connection.ToMachineId,

                    weight =
                        connection.Weight
                })
            };

            return Ok(result);
        }

        /*
         * =====================================================
         * GET: api/graph/bfs/1
         * =====================================================
         *
         * Executa Busca em Largura a partir
         * de uma determinada máquina.
         *
         * Exemplo:
         *
         * GET /api/graph/bfs/1
         */
        [HttpGet("bfs/{startMachineId}")]
        public async Task<IActionResult> BFS(
            int startMachineId
        )
        {
            var machines = await _context
                .Machines
                .AsNoTracking()
                .ToListAsync();

            var connections = await _context
                .MachineConnections
                .AsNoTracking()
                .ToListAsync();

            /*
             * Verifica se a máquina inicial existe.
             */
            var startMachine = machines.FirstOrDefault(
                machine =>
                    machine.Id == startMachineId
            );

            if (startMachine == null)
            {
                return NotFound(
                    $"Máquina com ID {startMachineId} não encontrada."
                );
            }

            /*
             * Constrói o grafo.
             */
            var graph = _graphService.BuildGraph(
                machines,
                connections
            );

            /*
             * Executa BFS.
             */
            var traversal =
                _graphService.GetReachableMachines(
                    graph,
                    startMachineId
                );

            /*
             * Retorna a ordem em que
             * os vértices foram visitados.
             */
            return Ok(
                new
                {
                    algorithm = "BFS",

                    startMachineId,

                    traversal = traversal.Select(
                        vertex => new
                        {
                            id = vertex.Id,
                            name = vertex.Name
                        }
                    )
                }
            );
        }

        /*
         * =====================================================
         * GET: api/graph/dfs/1
         * =====================================================
         *
         * Executa Busca em Profundidade.
         */
        [HttpGet("dfs/{startMachineId}")]
        public async Task<IActionResult> DFS(
            int startMachineId
        )
        {
            var machines = await _context
                .Machines
                .AsNoTracking()
                .ToListAsync();

            var connections = await _context
                .MachineConnections
                .AsNoTracking()
                .ToListAsync();

            /*
             * Confirma que a máquina inicial existe.
             */
            var startMachine = machines.FirstOrDefault(
                machine =>
                    machine.Id == startMachineId
            );

            if (startMachine == null)
            {
                return NotFound(
                    $"Máquina com ID {startMachineId} não encontrada."
                );
            }

            /*
             * Monta o grafo.
             */
            var graph = _graphService.BuildGraph(
                machines,
                connections
            );

            /*
             * Executa DFS.
             */
            var traversal =
                _graphService.GetDepthFirstTraversal(
                    graph,
                    startMachineId
                );

            return Ok(
                new
                {
                    algorithm = "DFS",

                    startMachineId,

                    traversal = traversal.Select(
                        vertex => new
                        {
                            id = vertex.Id,
                            name = vertex.Name
                        }
                    )
                }
            );
        }

        /*
         * =====================================================
         * GET:
         * api/graph/dijkstra?fromMachineId=1&toMachineId=3
         * =====================================================
         *
         * Executa o algoritmo de Dijkstra para encontrar
         * o caminho de menor peso entre duas máquinas.
         */
        [HttpGet("dijkstra")]
        public async Task<IActionResult> Dijkstra(
            [FromQuery] int fromMachineId,
            [FromQuery] int toMachineId
        )
        {
            /*
             * Origem e destino precisam ser diferentes.
             */
            if (fromMachineId == toMachineId)
            {
                return BadRequest(
                    "A máquina de origem e destino devem ser diferentes."
                );
            }

            var machines = await _context
                .Machines
                .AsNoTracking()
                .ToListAsync();

            var connections = await _context
                .MachineConnections
                .AsNoTracking()
                .ToListAsync();

            /*
             * Verifica se a máquina de origem existe.
             */
            var fromMachine = machines.FirstOrDefault(
                machine =>
                    machine.Id == fromMachineId
            );

            if (fromMachine == null)
            {
                return NotFound(
                    $"Máquina de origem com ID {fromMachineId} não encontrada."
                );
            }

            /*
             * Verifica se a máquina de destino existe.
             */
            var toMachine = machines.FirstOrDefault(
                machine =>
                    machine.Id == toMachineId
            );

            if (toMachine == null)
            {
                return NotFound(
                    $"Máquina de destino com ID {toMachineId} não encontrada."
                );
            }

            /*
             * Constrói o grafo.
             */
            var graph = _graphService.BuildGraph(
                machines,
                connections
            );

            /*
             * Executa Dijkstra.
             */
            var result =
                _graphService.FindShortestPath(
                    graph,
                    fromMachineId,
                    toMachineId
                );

            /*
             * TotalWeight = -1 significa que
             * não existe caminho entre as máquinas.
             */
            if (
                result.TotalWeight < 0 ||
                result.Path.Count == 0
            )
            {
                return NotFound(
                    "Não existe caminho entre as máquinas informadas."
                );
            }

            /*
             * Retorna o caminho encontrado
             * e o custo/peso total.
             */
            return Ok(
                new
                {
                    algorithm = "Dijkstra",

                    fromMachineId,

                    toMachineId,

                    path = result.Path.Select(
                        vertex => new
                        {
                            id = vertex.Id,
                            name = vertex.Name
                        }
                    ),

                    totalWeight =
                        result.TotalWeight
                }
            );
        }
    }
}