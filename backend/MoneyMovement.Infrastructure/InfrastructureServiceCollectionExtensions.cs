using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MoneyMovement.Application.Abstractions;
using MoneyMovement.Infrastructure.Persistence;
using MoneyMovement.Infrastructure.Repositories;
using MoneyMovement.Infrastructure.Security;
using MoneyMovement.Infrastructure.Time;

namespace MoneyMovement.Infrastructure;

// Infra has its own wiring method so API project doesn't know internal details
public static class InfrastructureServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<MoneyMovementDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("Default")));

        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<MoneyMovementDbContext>());
        services.AddScoped<IAccountRepository, EfAccountRepository>();
        services.AddScoped<ITransferRepository, EfTransferRepository>();
        services.AddScoped<IUserRepository, EfUserRepository>();

        services.AddSingleton<IClock, SystemClock>();
        services.AddSingleton<IPasswordHasher, BCryptPasswordHasher>();
        services.AddSingleton<ITokenService, JwtTokenService>();

        return services;
    }
}