using Microsoft.EntityFrameworkCore;
using MoneyMovement.Application.Abstractions;
using MoneyMovement.Domain;
using MoneyMovement.Infrastructure.Persistence;

namespace MoneyMovement.Infrastructure.Repositories;

public class EfAccountRepository : IAccountRepository
{
    private readonly MoneyMovementDbContext _db;

    public EfAccountRepository(MoneyMovementDbContext db)
    {
        _db = db;
    }

    public Task<Account?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        _db.Accounts.FirstOrDefaultAsync(a => a.Id == id, ct);
    
    public Task<List<Account>> GetByIdsAsync(List<Guid> ids, CancellationToken ct = default) =>
        _db.Accounts.Where(a => ids.Contains(a.Id)).ToListAsync(ct);
    
    public Task<Account?> GetByAccountNumberAsync(string accountNumber, CancellationToken ct = default) =>
        _db.Accounts.FirstOrDefaultAsync(a => a.AccountNumber == accountNumber, ct);

    public Task<List<Account>> GetAllForOwnerAsync(Guid ownerId, CancellationToken ct = default) =>
        _db.Accounts
            .Where(a => a.OwnerId == ownerId)
            .OrderBy(a => a.CreatedAt)
            .ToListAsync(ct);

    public async Task AddAsync(Account account, CancellationToken ct = default) =>
        await _db.Accounts.AddAsync(account, ct);

    public Task SaveAsync(Account account, CancellationToken ct = default)
    {
        // change is already tracked in unit of work
        // empty to satisfy interface and keep interface logic in Application layer services the same regardless of infra
        return Task.CompletedTask;
    }
}
