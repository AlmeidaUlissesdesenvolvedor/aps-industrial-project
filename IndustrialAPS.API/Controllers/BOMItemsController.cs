using IndustrialAPS.API.DTOs;
using IndustrialAPS.Domain.Entities;
using IndustrialAPS.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IndustrialAPS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BOMItemsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BOMItemsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/bomitems
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetBOMItems()
        {
            var items = await _context.BOMItems
                .AsNoTracking()
                .Select(b => new
                {
                    b.Id,
                    b.ProductId,
                    ProductName = b.Product.Name,
                    b.ComponentId,
                    MaterialName = b.Material.Name,
                    MaterialCode = b.Material.Code,
                    MaterialUnit = b.Material.Unit,
                    b.Quantity
                })
                .ToListAsync();

            return Ok(items);
        }

        // GET: api/bomitems/5
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetBOMItem(int id)
        {
            var bomItem = await _context.BOMItems
                .AsNoTracking()
                .Where(b => b.Id == id)
                .Select(b => new
                {
                    b.Id,
                    b.ProductId,
                    ProductName = b.Product.Name,
                    b.ComponentId,
                    MaterialName = b.Material.Name,
                    MaterialCode = b.Material.Code,
                    MaterialUnit = b.Material.Unit,
                    b.Quantity
                })
                .FirstOrDefaultAsync();

            if (bomItem == null)
            {
                return NotFound(
                    $"Item BOM com ID {id} não encontrado."
                );
            }

            return Ok(bomItem);
        }

        // GET: api/bomitems/product/1
        [HttpGet("product/{productId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetBOMByProduct(
            int productId
        )
        {
            var productExists = await _context.Products
                .AnyAsync(p => p.Id == productId);

            if (!productExists)
            {
                return NotFound(
                    $"Produto com ID {productId} não encontrado."
                );
            }

            var items = await _context.BOMItems
                .AsNoTracking()
                .Where(b => b.ProductId == productId)
                .Select(b => new
                {
                    b.Id,
                    b.ProductId,
                    ProductName = b.Product.Name,
                    b.ComponentId,
                    MaterialName = b.Material.Name,
                    MaterialCode = b.Material.Code,
                    MaterialUnit = b.Material.Unit,
                    b.Quantity
                })
                .ToListAsync();

            return Ok(items);
        }

        // POST: api/bomitems
        [HttpPost]
        public async Task<IActionResult> PostBOMItem(BOMItemDto dto)
        {
            if (dto.Quantity <= 0)
            {
                return BadRequest(
                    "A quantidade deve ser maior que zero."
                );
            }

            var product = await _context.Products
                .FindAsync(dto.ProductId);

            if (product == null)
            {
                return BadRequest(
                    $"Produto com ID {dto.ProductId} não encontrado."
                );
            }

            var material = await _context.Materials
                .FindAsync(dto.ComponentId);

            if (material == null)
            {
                return BadRequest(
                    $"Material com ID {dto.ComponentId} não encontrado."
                );
            }

            var alreadyExists = await _context.BOMItems
                .AnyAsync(b =>
                    b.ProductId == dto.ProductId &&
                    b.ComponentId == dto.ComponentId
                );

            if (alreadyExists)
            {
                return BadRequest(
                    "Este material já está cadastrado na BOM deste produto."
                );
            }

            var bomItem = new BOMItem
            {
                ProductId = dto.ProductId,
                ComponentId = dto.ComponentId,
                Quantity = dto.Quantity
            };

            _context.BOMItems.Add(bomItem);

            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetBOMItem),
                new { id = bomItem.Id },
                new
                {
                    bomItem.Id,
                    bomItem.ProductId,
                    ProductName = product.Name,
                    bomItem.ComponentId,
                    MaterialName = material.Name,
                    MaterialCode = material.Code,
                    MaterialUnit = material.Unit,
                    bomItem.Quantity
                }
            );
        }

        // PUT: api/bomitems/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutBOMItem(
            int id,
            BOMItemDto dto
        )
        {
            if (dto.Quantity <= 0)
            {
                return BadRequest(
                    "A quantidade deve ser maior que zero."
                );
            }

            var bomItem = await _context.BOMItems
                .FindAsync(id);

            if (bomItem == null)
            {
                return NotFound(
                    $"Item BOM com ID {id} não encontrado."
                );
            }

            var productExists = await _context.Products
                .AnyAsync(p => p.Id == dto.ProductId);

            if (!productExists)
            {
                return BadRequest(
                    $"Produto com ID {dto.ProductId} não encontrado."
                );
            }

            var materialExists = await _context.Materials
                .AnyAsync(m => m.Id == dto.ComponentId);

            if (!materialExists)
            {
                return BadRequest(
                    $"Material com ID {dto.ComponentId} não encontrado."
                );
            }

            var duplicate = await _context.BOMItems
                .AnyAsync(b =>
                    b.Id != id &&
                    b.ProductId == dto.ProductId &&
                    b.ComponentId == dto.ComponentId
                );

            if (duplicate)
            {
                return BadRequest(
                    "Este material já está cadastrado na BOM deste produto."
                );
            }

            bomItem.ProductId = dto.ProductId;
            bomItem.ComponentId = dto.ComponentId;
            bomItem.Quantity = dto.Quantity;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/bomitems/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBOMItem(int id)
        {
            var bomItem = await _context.BOMItems
                .FindAsync(id);

            if (bomItem == null)
            {
                return NotFound(
                    $"Item BOM com ID {id} não encontrado."
                );
            }

            _context.BOMItems.Remove(bomItem);

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}