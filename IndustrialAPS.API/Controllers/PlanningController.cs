using IndustrialAPS.API.DTOs;
using IndustrialAPS.Domain.Entities;
using IndustrialAPS.Domain.Services;
using IndustrialAPS.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IndustrialAPS.API.Controllers
{
    /*
     * ============================================================
     * PLANNING CONTROLLER
     * ============================================================
     *
     * Responsável pelo planejamento integrado da produção.
     *
     * O planejamento utiliza:
     *
     * - Produtos;
     * - BOM / Árvore;
     * - Materiais;
     * - Operações;
     * - Máquinas;
     * - Relacionamento Máquina x Operação;
     * - Grafo industrial;
     * - Dijkstra;
     * - Ordens de Produção.
     */
    [Route("api/[controller]")]
    [ApiController]
    public class PlanningController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly BOMService _bomService;
        private readonly GraphService _graphService;

        /*
         * Serviços utilizados pelo planejamento.
         *
         * ApplicationDbContext:
         * acesso ao banco de dados.
         *
         * BOMService:
         * construção e processamento da árvore BOM.
         *
         * GraphService:
         * construção e processamento do grafo industrial.
         */
        public PlanningController(
            ApplicationDbContext context,
            BOMService bomService,
            GraphService graphService
        )
        {
            _context = context;
            _bomService = bomService;
            _graphService = graphService;
        }

        // =========================================================
        // POST: api/planning/run
        //
        // Executa o planejamento integrado da produção.
        // =========================================================
        [HttpPost("run")]
        public async Task<IActionResult> RunPlanning(
            [FromBody] PlanningRequestDto request
        )
        {
            // =====================================================
            // 1. VALIDAR DADOS RECEBIDOS
            // =====================================================

            if (
                request == null ||
                request.ProductId <= 0 ||
                request.Quantity <= 0
            )
            {
                return BadRequest(
                    "Dados inválidos. Informe ProductId e Quantity."
                );
            }

            // =====================================================
            // 2. BUSCAR O PRODUTO
            // =====================================================

            var product = await _context.Products
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    product =>
                        product.Id == request.ProductId
                );

            if (product == null)
            {
                return NotFound(
                    $"Produto com ID {request.ProductId} não encontrado."
                );
            }

            // =====================================================
            // 3. BUSCAR A BOM DO PRODUTO
            // =====================================================
            //
            // Buscamos somente os itens pertencentes
            // ao produto que está sendo planejado.
            // =====================================================

            var bomItems = await _context.BOMItems
                .AsNoTracking()
                .Where(
                    item =>
                        item.ProductId == product.Id
                )
                .ToListAsync();

            /*
             * Carrega os materiais disponíveis.
             *
             * O BOMService utiliza essa lista para
             * construir a árvore do produto.
             */
            var materials = await _context.Materials
                .AsNoTracking()
                .ToListAsync();

            // =====================================================
            // 4. CONSTRUIR A ÁRVORE BOM
            // =====================================================

            var bomTree =
                _bomService.BuildBOMTree(
                    product,
                    bomItems,
                    materials
                );

            // =====================================================
            // 5. CALCULAR NECESSIDADE DE MATERIAIS
            // =====================================================
            //
            // Exemplo:
            //
            // BOM:
            // Produto -> 2 kg de aço
            //
            // Quantidade planejada:
            // 10 unidades
            //
            // Necessidade:
            // 20 kg de aço
            // =====================================================

            var materialRequirements =
                _bomService.CalculateMaterialRequirements(
                    bomTree,
                    request.Quantity
                );

            // =====================================================
            // 6. BUSCAR OPERAÇÕES DO PRODUTO
            // =====================================================

            var operations = await _context.Operations
                .AsNoTracking()
                .Where(
                    operation =>
                        operation.ProductId == product.Id
                )
                .OrderBy(
                    operation =>
                        operation.Id
                )
                .ToListAsync();

            /*
             * IDs das operações serão utilizados
             * para consultar Máquina x Operação.
             */
            var operationIds =
                operations
                    .Select(
                        operation =>
                            operation.Id
                    )
                    .ToList();

            // =====================================================
            // 7. BUSCAR RELACIONAMENTO MÁQUINA X OPERAÇÃO
            // =====================================================

            var machineOperations =
                await _context.MachineOperations
                    .AsNoTracking()
                    .Where(
                        relation =>
                            operationIds.Contains(
                                relation.OperationId
                            )
                    )
                    .ToListAsync();

            // =====================================================
            // 8. BUSCAR TODAS AS MÁQUINAS
            // =====================================================

            var machines = await _context.Machines
                .AsNoTracking()
                .ToListAsync();

            // =====================================================
            // 9. SELECIONAR MÁQUINA PARA CADA OPERAÇÃO
            // =====================================================
            //
            // Critério utilizado nesta versão:
            //
            // 1. Máquina precisa executar a operação.
            // 2. Máquina disponível tem prioridade.
            // 3. Maior capacidade tem prioridade.
            //
            // Esse critério mantém o planejamento simples,
            // porém já demonstra tomada de decisão automática.
            // =====================================================

            var operationPlan =
                operations
                    .Select(operation =>
                    {
                        /*
                         * Identifica quais máquinas
                         * executam essa operação.
                         */
                        var compatibleMachineIds =
                            machineOperations
                                .Where(
                                    relation =>
                                        relation.OperationId ==
                                        operation.Id
                                )
                                .Select(
                                    relation =>
                                        relation.MachineId
                                )
                                .ToList();

                        /*
                         * Recupera as máquinas compatíveis.
                         */
                        var compatibleMachines =
                            machines
                                .Where(
                                    machine =>
                                        compatibleMachineIds.Contains(
                                            machine.Id
                                        )
                                )

                                /*
                                 * Máquinas disponíveis
                                 * aparecem primeiro.
                                 */
                                .OrderBy(
                                    machine =>
                                        machine.Status ==
                                        MachineStatus.Available
                                            ? 0
                                            : 1
                                )

                                /*
                                 * Entre máquinas com mesmo status,
                                 * usamos maior capacidade.
                                 */
                                .ThenByDescending(
                                    machine =>
                                        machine.Capacity
                                )
                                .ToList();

                        /*
                         * Primeira máquina após a ordenação
                         * será escolhida automaticamente.
                         */
                        var selectedMachine =
                            compatibleMachines
                                .FirstOrDefault();

                        return new
                        {
                            OperationId =
                                operation.Id,

                            Operation =
                                operation.Name,

                            Duration =
                                operation.Duration,

                            /*
                             * Todas as máquinas que poderiam
                             * executar a operação.
                             */
                            CompatibleMachines =
                                compatibleMachines
                                    .Select(
                                        machine => new
                                        {
                                            machine.Id,
                                            machine.Code,
                                            machine.Name,

                                            Status =
                                                machine.Status
                                                    .ToString(),

                                            machine.Capacity
                                        }
                                    )
                                    .ToList(),

                            /*
                             * Máquina efetivamente escolhida
                             * pelo planejamento.
                             */
                            SelectedMachine =
                                selectedMachine == null
                                    ? null
                                    : new
                                    {
                                        selectedMachine.Id,
                                        selectedMachine.Code,
                                        selectedMachine.Name,

                                        Status =
                                            selectedMachine.Status
                                                .ToString(),

                                        selectedMachine.Capacity
                                    }
                        };
                    })
                    .ToList();

            // =====================================================
            // 10. BUSCAR CONEXÕES ENTRE MÁQUINAS
            // =====================================================

            var connections =
                await _context.MachineConnections
                    .AsNoTracking()
                    .ToListAsync();

            // =====================================================
            // 11. CONSTRUIR O GRAFO DA FÁBRICA
            // =====================================================
            //
            // Machine:
            // vértice
            //
            // MachineConnection:
            // aresta
            //
            // Weight:
            // peso da aresta
            // =====================================================

            var graph =
                _graphService.BuildGraph(
                    machines,
                    connections
                );

            // =====================================================
            // 12. IDENTIFICAR AS MÁQUINAS SELECIONADAS
            // =====================================================

            var selectedMachineIds =
                operationPlan
                    .Where(
                        item =>
                            item.SelectedMachine != null
                    )
                    .Select(
                        item =>
                            item.SelectedMachine!.Id
                    )
                    .ToList();

            // =====================================================
            // 13. CALCULAR ROTAS ENTRE MÁQUINAS
            // =====================================================
            //
            // Para cada par de máquinas consecutivas,
            // executamos Dijkstra para encontrar
            // o caminho de menor peso.
            // =====================================================

            var productionRoutes =
                new List<object>();

            for (
                var index = 0;
                index < selectedMachineIds.Count - 1;
                index++
            )
            {
                var fromMachineId =
                    selectedMachineIds[index];

                var toMachineId =
                    selectedMachineIds[index + 1];

                /*
                 * Se duas operações consecutivas forem
                 * executadas pela mesma máquina,
                 * não precisamos calcular deslocamento.
                 */
                if (
                    fromMachineId ==
                    toMachineId
                )
                {
                    continue;
                }

                /*
                 * Executa Dijkstra.
                 */
                var shortestPath =
                    _graphService.FindShortestPath(
                        graph,
                        fromMachineId,
                        toMachineId
                    );

                /*
                 * Armazena o resultado para o frontend.
                 */
                productionRoutes.Add(
                    new
                    {
                        FromMachineId =
                            fromMachineId,

                        ToMachineId =
                            toMachineId,

                        /*
                         * -1 significa que não existe
                         * caminho entre as máquinas.
                         */
                        TotalWeight =
                            shortestPath.TotalWeight,

                        Path =
                            shortestPath.Path
                                .Select(
                                    vertex => new
                                    {
                                        vertex.Id,
                                        vertex.Name
                                    }
                                )
                                .ToList()
                    }
                );
            }

            // =====================================================
            // 14. CRIAR ORDEM DE PRODUÇÃO
            // =====================================================

            var order =
                new ProductionOrder
                {
                    ProductId =
                        product.Id,

                    Quantity =
                        request.Quantity,

                    /*
                     * Caso o usuário não informe
                     * uma data limite, utilizamos
                     * sete dias como padrão.
                     */
                    DueDate =
                        request.DueDate ??
                        DateTime.Now.AddDays(7),

                    Status =
                        OrderStatus.Planned
                };

            _context.ProductionOrders.Add(
                order
            );

            await _context.SaveChangesAsync();

            // =====================================================
            // 15. GERAR ALERTAS DO PLANEJAMENTO
            // =====================================================
            //
            // Alertas não impedem a criação do planejamento.
            //
            // Servem para indicar cadastros incompletos.
            // =====================================================

            var warnings =
                new List<string>();

            /*
             * Produto sem BOM.
             */
            if (bomItems.Count == 0)
            {
                warnings.Add(
                    "O produto não possui itens cadastrados na BOM."
                );
            }

            /*
             * Produto sem operações.
             */
            if (operations.Count == 0)
            {
                warnings.Add(
                    "O produto não possui operações cadastradas."
                );
            }

            /*
             * Operação sem máquina compatível.
             */
            foreach (var item in operationPlan)
            {
                if (
                    item.SelectedMachine == null
                )
                {
                    warnings.Add(
                        $"A operação '{item.Operation}' não possui máquina compatível."
                    );
                }
            }

            /*
             * Verifica rotas inexistentes entre máquinas.
             */
            foreach (dynamic route in productionRoutes)
            {
                if (route.TotalWeight < 0)
                {
                    warnings.Add(
                        $"Não existe caminho no grafo entre as máquinas {route.FromMachineId} e {route.ToMachineId}."
                    );
                }
            }

            // =====================================================
            // 16. RETORNAR RESULTADO DO PLANEJAMENTO
            // =====================================================

            return Ok(
                new
                {
                    Message =
                        "Planejamento executado com sucesso!",

                    /*
                     * Dados principais da Ordem de Produção.
                     */
                    Order = new
                    {
                        OrderId =
                            order.Id,

                        ProductId =
                            product.Id,

                        ProductCode =
                            product.Code,

                        Product =
                            product.Name,

                        Quantity =
                            order.Quantity,

                        DueDate =
                            order.DueDate,

                        Status =
                            order.Status.ToString()
                    },

                    /*
                     * Necessidade calculada através
                     * da Árvore BOM.
                     */
                    MaterialsRequired =
                        materialRequirements,

                    /*
                     * Operações produtivas e
                     * máquinas escolhidas.
                     */
                    Operations =
                        operationPlan,

                    /*
                     * Informações gerais do Grafo.
                     */
                    FactoryGraph =
                        new
                        {
                            TotalMachines =
                                graph.Vertices.Count,

                            TotalConnections =
                                graph.Vertices.Sum(
                                    vertex =>
                                        vertex.Edges.Count
                                )
                        },

                    /*
                     * Caminhos calculados através
                     * do algoritmo de Dijkstra.
                     */
                    ProductionRoutes =
                        productionRoutes,

                    /*
                     * Alertas encontrados durante
                     * o planejamento.
                     */
                    Warnings =
                        warnings
                }
            );
        }

        // =========================================================
        // GET: api/planning/bom-tree/{productId}
        //
        // Retorna a árvore BOM de um produto.
        // =========================================================
        [HttpGet("bom-tree/{productId}")]
        public async Task<IActionResult> GetBOMTree(
            int productId
        )
        {
            // =====================================================
            // 1. BUSCAR O PRODUTO
            // =====================================================

            var product = await _context.Products
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    product =>
                        product.Id == productId
                );

            if (product == null)
            {
                return NotFound(
                    $"Produto com ID {productId} não encontrado."
                );
            }

            // =====================================================
            // 2. BUSCAR ITENS DA BOM
            // =====================================================

            var bomItems = await _context.BOMItems
                .AsNoTracking()
                .Where(
                    item =>
                        item.ProductId == productId
                )
                .ToListAsync();

            // =====================================================
            // 3. BUSCAR MATERIAIS
            // =====================================================

            var materials = await _context.Materials
                .AsNoTracking()
                .ToListAsync();

            // =====================================================
            // 4. CONSTRUIR ÁRVORE BOM
            // =====================================================

            var bomTree =
                _bomService.BuildBOMTree(
                    product,
                    bomItems,
                    materials
                );

            // =====================================================
            // 5. EXECUTAR PREORDER
            // =====================================================

            var preOrder =
                new List<string>();

            bomTree.Root.PreOrder(
                node =>
                {
                    preOrder.Add(
                        node.Name
                    );
                }
            );

            // =====================================================
            // 6. EXECUTAR POSTORDER
            // =====================================================

            var postOrder =
                new List<string>();

            bomTree.Root.PostOrder(
                node =>
                {
                    postOrder.Add(
                        node.Name
                    );
                }
            );

            // =====================================================
            // 7. RETORNAR ÁRVORE E PERCURSOS
            // =====================================================

            return Ok(
                new
                {
                    ProductId =
                        product.Id,

                    ProductCode =
                        product.Code,

                    ProductName =
                        product.Name,

                    Tree =
                        bomTree.Root,

                    Traversals =
                        new
                        {
                            PreOrder =
                                preOrder,

                            PostOrder =
                                postOrder
                        }
                }
            );
        }

        // =========================================================
        // GET: api/planning/{id}
        //
        // Consulta uma ordem de produção
        // criada pelo planejamento.
        // =========================================================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetPlanningResult(
            int id
        )
        {
            // =====================================================
            // BUSCAR ORDEM DE PRODUÇÃO
            // =====================================================

            var order =
                await _context.ProductionOrders

                    /*
                     * Carrega o produto associado.
                     */
                    .Include(
                        order =>
                            order.Product
                    )

                    /*
                     * Carrega a programação associada
                     * à ordem, caso exista.
                     */
                    .Include(
                        order =>
                            order.Schedules
                    )

                    .FirstOrDefaultAsync(
                        order =>
                            order.Id == id
                    );

            if (order == null)
            {
                return NotFound(
                    $"Ordem de produção com ID {id} não encontrada."
                );
            }

            // =====================================================
            // RETORNAR RESULTADO
            // =====================================================

            return Ok(
                new
                {
                    OrderId =
                        order.Id,

                    Product =
                        order.Product?.Name,

                    Quantity =
                        order.Quantity,

                    DueDate =
                        order.DueDate,

                    Status =
                        order.Status.ToString(),

                    /*
                     * Programações associadas à ordem.
                     *
                     * Nesta etapa ainda podem estar vazias,
                     * pois Schedules será nosso próximo módulo.
                     */
                    Schedules =
                        order.Schedules
                            .Select(
                                schedule => new
                                {
                                    schedule.Id,

                                    schedule.MachineId,

                                    schedule.OperationId,

                                    schedule.Start,

                                    schedule.End
                                }
                            )
                            .ToList()
                }
            );
        }
    }
}