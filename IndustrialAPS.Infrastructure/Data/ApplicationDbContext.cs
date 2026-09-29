using IndustrialAPS.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace IndustrialAPS.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(
            DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Product> Products { get; set; }
        public DbSet<Material> Materials { get; set; }
        public DbSet<BOMItem> BOMItems { get; set; }
        public DbSet<Machine> Machines { get; set; }
        public DbSet<MachineConnection> MachineConnections { get; set; }
        public DbSet<Operation> Operations { get; set; }
        public DbSet<MachineOperation> MachineOperations { get; set; }
        public DbSet<ProductionOrder> ProductionOrders { get; set; }
        public DbSet<Schedule> Schedules { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // -------------------------
            // ÍNDICES ÚNICOS
            // -------------------------

            modelBuilder.Entity<Product>()
                .HasIndex(p => p.Code)
                .IsUnique();

            modelBuilder.Entity<Material>()
                .HasIndex(m => m.Code)
                .IsUnique();

            modelBuilder.Entity<Machine>()
                .HasIndex(m => m.Code)
                .IsUnique();


            // -------------------------
            // PRECISÃO DOS DECIMAIS
            // -------------------------

            modelBuilder.Entity<BOMItem>()
                .Property(b => b.Quantity)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Material>()
                .Property(m => m.Stock)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Machine>()
                .Property(m => m.Capacity)
                .HasPrecision(18, 2);

            modelBuilder.Entity<MachineConnection>()
                .Property(mc => mc.Weight)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Operation>()
                .Property(o => o.Duration)
                .HasPrecision(18, 2);

            modelBuilder.Entity<ProductionOrder>()
                .Property(po => po.Quantity)
                .HasPrecision(18, 2);


            // -------------------------
            // MACHINE OPERATION N:N
            // -------------------------

            modelBuilder.Entity<MachineOperation>()
                .HasKey(mo => new
                {
                    mo.MachineId,
                    mo.OperationId
                });


            // -------------------------
            // CONEXÕES ENTRE MÁQUINAS
            // -------------------------

            modelBuilder.Entity<MachineConnection>()
                .HasOne(mc => mc.FromMachine)
                .WithMany(m => m.Connections)
                .HasForeignKey(mc => mc.FromMachineId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<MachineConnection>()
                .HasOne(mc => mc.ToMachine)
                .WithMany()
                .HasForeignKey(mc => mc.ToMachineId)
                .OnDelete(DeleteBehavior.Restrict);


            // -------------------------
            // SCHEDULE
            // -------------------------

            modelBuilder.Entity<Schedule>()
                .HasOne(s => s.Order)
                .WithMany(o => o.Schedules)
                .HasForeignKey(s => s.OrderId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Schedule>()
                .HasOne(s => s.Operation)
                .WithMany(o => o.Schedules)
                .HasForeignKey(s => s.OperationId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Schedule>()
                .HasOne(s => s.Machine)
                .WithMany(m => m.Schedules)
                .HasForeignKey(s => s.MachineId)
                .OnDelete(DeleteBehavior.Restrict);


            // -------------------------
            // BOM
            // -------------------------

            modelBuilder.Entity<BOMItem>()
                .HasOne(b => b.Material)
                .WithMany(m => m.BOMItems)
                .HasForeignKey(b => b.ComponentId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}