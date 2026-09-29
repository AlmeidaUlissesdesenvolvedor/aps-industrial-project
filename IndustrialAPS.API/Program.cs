using IndustrialAPS.Domain.Services;
using IndustrialAPS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Controllers
builder.Services.AddControllers();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Serviços de domínio
builder.Services.AddScoped<BOMService>();
builder.Services.AddScoped<GraphService>();

// Banco de dados
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")
    ));

// CORS - permite comunicação com o frontend React
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

// Swagger em desenvolvimento
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// CORS deve vir antes de Authorization / Controllers
app.UseCors("Frontend");

// Como estamos rodando localmente em HTTP,
// não precisamos forçar HTTPS nesta fase.
// app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();