using IndustrialAPS.API.DTOs;
using IndustrialAPS.Domain.Entities;
using IndustrialAPS.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IndustrialAPS.API.Controllers
{
    /*
     * Controller responsável pelas conexões entre máquinas.
     *
     * Cada máquina representa um vértice do Grafo.
     * Cada MachineConnection representa uma aresta.
     */
    [Route("api/[controller]")]
    [ApiController]
    public class MachineConnectionsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MachineConnectionsController(
            ApplicationDbContext context
        )
        {
            _context = context;
        }

        /*
         * GET: api/machineconnections
         *
         * Retorna todas as conexões existentes,
         * incluindo os dados das máquinas de origem
         * e destino.
         */
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>>
            GetMachineConnections()
        {
            var connections = await _context
                .MachineConnections
                .AsNoTracking()
                .Select(connection => new
                {
                    connection.Id,

                    connection.FromMachineId,

                    FromMachine = new
                    {
                        connection.FromMachine.Id,
                        connection.FromMachine.Code,
                        connection.FromMachine.Name
                    },

                    connection.ToMachineId,

                    ToMachine = new
                    {
                        connection.ToMachine.Id,
                        connection.ToMachine.Code,
                        connection.ToMachine.Name
                    },

                    connection.Weight
                })
                .ToListAsync();

            return Ok(connections);
        }

        /*
         * GET: api/machineconnections/5
         *
         * Retorna uma conexão específica.
         */
        [HttpGet("{id}")]
        public async Task<ActionResult<object>>
            GetMachineConnection(int id)
        {
            var connection = await _context
                .MachineConnections
                .AsNoTracking()
                .Where(connection =>
                    connection.Id == id
                )
                .Select(connection => new
                {
                    connection.Id,

                    connection.FromMachineId,

                    FromMachine = new
                    {
                        connection.FromMachine.Id,
                        connection.FromMachine.Code,
                        connection.FromMachine.Name
                    },

                    connection.ToMachineId,

                    ToMachine = new
                    {
                        connection.ToMachine.Id,
                        connection.ToMachine.Code,
                        connection.ToMachine.Name
                    },

                    connection.Weight
                })
                .FirstOrDefaultAsync();

            if (connection == null)
            {
                return NotFound(
                    $"Conexão com ID {id} não encontrada."
                );
            }

            return Ok(connection);
        }

        /*
         * POST: api/machineconnections
         *
         * Cria uma nova aresta entre duas máquinas.
         */
        [HttpPost]
        public async Task<IActionResult>
            PostMachineConnection(
                MachineConnectionDto dto
            )
        {
            /*
             * O peso precisa ser positivo para permitir
             * o uso correto em algoritmos como Dijkstra.
             */
            if (dto.Weight <= 0)
            {
                return BadRequest(
                    "O peso da conexão deve ser maior que zero."
                );
            }

            /*
             * Uma máquina não pode se conectar
             * diretamente a ela mesma.
             */
            if (
                dto.FromMachineId ==
                dto.ToMachineId
            )
            {
                return BadRequest(
                    "A máquina de origem e destino devem ser diferentes."
                );
            }

            /*
             * Valida a máquina de origem.
             */
            var fromMachine =
                await _context.Machines.FindAsync(
                    dto.FromMachineId
                );

            if (fromMachine == null)
            {
                return BadRequest(
                    $"Máquina de origem com ID {dto.FromMachineId} não encontrada."
                );
            }

            /*
             * Valida a máquina de destino.
             */
            var toMachine =
                await _context.Machines.FindAsync(
                    dto.ToMachineId
                );

            if (toMachine == null)
            {
                return BadRequest(
                    $"Máquina de destino com ID {dto.ToMachineId} não encontrada."
                );
            }

            /*
             * Impede duplicação da mesma conexão.
             *
             * Exemplo que não deve acontecer:
             *
             * MAQ001 -> MAQ002
             * MAQ001 -> MAQ002
             */
            var connectionExists =
                await _context
                    .MachineConnections
                    .AnyAsync(connection =>
                        connection.FromMachineId ==
                            dto.FromMachineId &&
                        connection.ToMachineId ==
                            dto.ToMachineId
                    );

            if (connectionExists)
            {
                return BadRequest(
                    "Esta conexão já está cadastrada."
                );
            }

            /*
             * Cria a entidade que será persistida
             * no SQL Server.
             */
            var connection =
                new MachineConnection
                {
                    FromMachineId =
                        dto.FromMachineId,

                    ToMachineId =
                        dto.ToMachineId,

                    Weight =
                        dto.Weight
                };

            _context.MachineConnections.Add(
                connection
            );

            await _context.SaveChangesAsync();

            /*
             * Retorna somente os dados necessários.
             *
             * Evitamos retornar a entidade completa,
             * pois ela possui propriedades de navegação.
             */
            return CreatedAtAction(
                nameof(GetMachineConnection),
                new { id = connection.Id },
                new
                {
                    connection.Id,

                    connection.FromMachineId,

                    FromMachine = new
                    {
                        fromMachine.Id,
                        fromMachine.Code,
                        fromMachine.Name
                    },

                    connection.ToMachineId,

                    ToMachine = new
                    {
                        toMachine.Id,
                        toMachine.Code,
                        toMachine.Name
                    },

                    connection.Weight
                }
            );
        }

        /*
         * PUT: api/machineconnections/5
         *
         * Atualiza uma conexão existente.
         */
        [HttpPut("{id}")]
        public async Task<IActionResult>
            PutMachineConnection(
                int id,
                MachineConnectionDto dto
            )
        {
            /*
             * Busca a conexão no banco.
             */
            var connection =
                await _context
                    .MachineConnections
                    .FindAsync(id);

            if (connection == null)
            {
                return NotFound(
                    $"Conexão com ID {id} não encontrada."
                );
            }

            /*
             * Validação do peso.
             */
            if (dto.Weight <= 0)
            {
                return BadRequest(
                    "O peso da conexão deve ser maior que zero."
                );
            }

            /*
             * Impede conexão da máquina com ela mesma.
             */
            if (
                dto.FromMachineId ==
                dto.ToMachineId
            )
            {
                return BadRequest(
                    "A máquina de origem e destino devem ser diferentes."
                );
            }

            /*
             * Verifica se as duas máquinas existem.
             */
            var fromExists =
                await _context.Machines.AnyAsync(
                    machine =>
                        machine.Id ==
                        dto.FromMachineId
                );

            if (!fromExists)
            {
                return BadRequest(
                    $"Máquina de origem com ID {dto.FromMachineId} não encontrada."
                );
            }

            var toExists =
                await _context.Machines.AnyAsync(
                    machine =>
                        machine.Id ==
                        dto.ToMachineId
                );

            if (!toExists)
            {
                return BadRequest(
                    $"Máquina de destino com ID {dto.ToMachineId} não encontrada."
                );
            }

            /*
             * Verifica se outra conexão igual
             * já existe.
             */
            var duplicate =
                await _context
                    .MachineConnections
                    .AnyAsync(item =>
                        item.Id != id &&
                        item.FromMachineId ==
                            dto.FromMachineId &&
                        item.ToMachineId ==
                            dto.ToMachineId
                    );

            if (duplicate)
            {
                return BadRequest(
                    "Esta conexão já está cadastrada."
                );
            }

            /*
             * Atualiza somente os campos permitidos.
             */
            connection.FromMachineId =
                dto.FromMachineId;

            connection.ToMachineId =
                dto.ToMachineId;

            connection.Weight =
                dto.Weight;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        /*
         * DELETE: api/machineconnections/5
         *
         * Remove uma aresta do Grafo.
         */
        [HttpDelete("{id}")]
        public async Task<IActionResult>
            DeleteMachineConnection(int id)
        {
            var connection =
                await _context
                    .MachineConnections
                    .FindAsync(id);

            if (connection == null)
            {
                return NotFound(
                    $"Conexão com ID {id} não encontrada."
                );
            }

            _context.MachineConnections.Remove(
                connection
            );

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}