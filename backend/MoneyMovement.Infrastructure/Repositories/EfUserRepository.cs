using Microsoft.EntityFrameworkCore;
using MoneyMovement.Application.Abstractions;
using MoneyMovement.Domain;
using MoneyMovement.Infrastructure.Persistence;

namespace MoneyMovement.Infrastructure.Repositories;

public class EfUserRepository : IUserRepository
{
    private readonly MoneyMovementDbContext _db;

    public EfUserRepository(MoneyMovementDbContext db)
    {
        _db = db;
    }

    public Task<User?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        _db.Users.FirstOrDefaultAsync(u => u.Id == id, ct);

    public Task<User?> GetByEmailAsync(string email, CancellationToken ct = default) =>
        _db.Users.FirstOrDefaultAsync(u => u.Email == email, ct);

    public async Task AddAsync(User user, CancellationToken ct = default) =>
        await _db.Users.AddAsync(user, ct);
}