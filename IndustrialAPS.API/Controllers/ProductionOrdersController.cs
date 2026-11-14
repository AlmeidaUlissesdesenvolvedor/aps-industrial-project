using IndustrialAPS.Domain.Entities;
using IndustrialAPS.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IndustrialAPS.API.Controllers
{
    /*
     * Controller responsável pelas Ordens de Produção.
     *
     * Importante:
     *
     * Não retornamos diretamente as entidades completas
     * com suas propriedades de navegação.
     *
     * Isso evita ciclos de serialização como:
     *
     * ProductionOrder
     *      -> Product
     *          -> ProductionOrders
     *              -> Product
     *                  -> ...
     */
    [Route("api/[controller]")]
    [ApiController]
    public class ProductionOrdersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProductionOrdersController(
            ApplicationDbContext context
        )
        {
            _context = context;
        }

        // =========================================================
        // GET: api/productionorders
        //
        // Retorna todas as Ordens de Produção.
        // =========================================================
        [HttpGet]
        public async Task<IActionResult> GetProductionOrders()
        {
            /*
             * Utilizamos projeção com Select.
             *
             * Assim retornamos apenas os campos necessários
             * para o frontend e evitamos referência circular.
             */
            var orders =
                await _context.ProductionOrders
                    .AsNoTracking()

                    .OrderByDescending(
                        order => order.Id
                    )

                    .Select(
                        order => new
                        {
                            order.Id,

                            order.ProductId,

                            order.Quantity,

                            order.DueDate,

                            order.Status,

                            /*
                             * Retornamos somente informações
                             * básicas do Produto.
                             */
                            Product = new
                            {
                                order.Product.Id,

                                order.Product.Code,

                                order.Product.Name,

                                order.Product.Description
                            }
                        }
                    )
                    .ToListAsync();

            return Ok(orders);
        }

        // =========================================================
        // GET: api/productionorders/5
        //
        // Consulta uma Ordem de Produção específica.
        // =========================================================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetProductionOrder(
            int id
        )
        {
            var order =
                await _context.ProductionOrders
                    .AsNoTracking()

                    .Where(
                        order =>
                            order.Id == id
                    )

                    .Select(
                        order => new
                        {
                            order.Id,

                            order.ProductId,

                            order.Quantity,

                            order.DueDate,

                            order.Status,

                            Product = new
                            {
                                order.Product.Id,

                                order.Product.Code,

                                order.Product.Name,

                                order.Product.Description
                            },

                            /*
                             * Incluímos a Programação da ordem,
                             * mas somente com os campos necessários.
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
                        }
                    )
                    .FirstOrDefaultAsync();

            if (order == null)
            {
                return NotFound(
                    $"Ordem de Produção com ID {id} não encontrada."
                );
            }

            return Ok(order);
        }

        // =========================================================
        // POST: api/productionorders
        //
        // Permite cadastrar uma Ordem de Produção manualmente.
        //
        // Atualmente o Planejamento também cria ordens
        // diretamente através do banco.
        // =========================================================
        [HttpPost]
        public async Task<IActionResult> PostProductionOrder(
            ProductionOrder order
        )
        {
            /*
             * Verifica se o Produto informado existe.
             */
            var productExists =
                await _context.Products.AnyAsync(
                    product =>
                        product.Id ==
                        order.ProductId
                );

            if (!productExists)
            {
                return BadRequest(
                    $"Produto com ID {order.ProductId} não encontrado."
                );
            }

            /*
             * Não utilizamos objetos de navegação recebidos
             * pelo frontend.
             */
            var newOrder =
                new ProductionOrder
                {
                    ProductId =
                        order.ProductId,

                    Quantity =
                        order.Quantity,

                    DueDate =
                        order.DueDate,

                    Status =
                        order.Status
                };

            _context.ProductionOrders.Add(
                newOrder
            );

            await _context.SaveChangesAsync();

            /*
             * Retorna somente dados simples,
             * evitando novamente referência circular.
             */
            return CreatedAtAction(
                nameof(GetProductionOrder),
                new
                {
                    id = newOrder.Id
                },
                new
                {
                    newOrder.Id,

                    newOrder.ProductId,

                    newOrder.Quantity,

                    newOrder.DueDate,

                    newOrder.Status
                }
            );
        }

        // =========================================================
        // PUT: api/productionorders/5
        //
        // Atualiza uma Ordem de Produção.
        // =========================================================
        [HttpPut("{id}")]
        public async Task<IActionResult> PutProductionOrder(
            int id,
            ProductionOrder order
        )
        {
            /*
             * Busca a ordem existente.
             */
            var existingOrder =
                await _context.ProductionOrders
                    .FindAsync(id);

            if (existingOrder == null)
            {
                return NotFound(
                    $"Ordem de Produção com ID {id} não encontrada."
                );
            }

            /*
             * Verifica se o Produto informado existe.
             */
            var productExists =
                await _context.Products.AnyAsync(
                    product =>
                        product.Id ==
                        order.ProductId
                );

            if (!productExists)
            {
                return BadRequest(
                    $"Produto com ID {order.ProductId} não encontrado."
                );
            }

            /*
             * Atualizamos somente os campos permitidos.
             */
            existingOrder.ProductId =
                order.ProductId;

            existingOrder.Quantity =
                order.Quantity;

            existingOrder.DueDate =
                order.DueDate;

            existingOrder.Status =
                order.Status;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // =========================================================
        // DELETE: api/productionorders/5
        //
        // Remove uma Ordem de Produção.
        // =========================================================
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProductionOrder(
            int id
        )
        {
            var order =
                await _context.ProductionOrders
                    .FindAsync(id);

            if (order == null)
            {
                return NotFound(
                    $"Ordem de Produção com ID {id} não encontrada."
                );
            }

            _context.ProductionOrders.Remove(
                order
            );

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}