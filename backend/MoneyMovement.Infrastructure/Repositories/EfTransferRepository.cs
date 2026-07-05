using Microsoft.EntityFrameworkCore;
using MoneyMovement.Application.Abstractions;
using MoneyMovement.Domain;
using MoneyMovement.Infrastructure.Persistence;

namespace MoneyMovement.Infrastructure.Repositories;

public class EfTransferRepository : ITransferRepository
{
    private readonly MoneyMovementDbContext _db;

    public EfTransferRepository(MoneyMovementDbContext db)
    {
        _db = db;
    }

    public Task<Transfer?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        _db.Transfers.FirstOrDefaultAsync(t => t.Id == id, ct);

    public Task<Transfer?> GetByIdempotencyKeyAsync(string idempotencyKey, CancellationToken ct = default) =>
        _db.Transfers.FirstOrDefaultAsync(t => t.IdempotencyKey == idempotencyKey, ct);

    public Task<List<Transfer>> GetHistoryForAccountAsync(Guid accountId, int page, int pageSize, CancellationToken ct = default) =>
        _db.Transfers
            .Where(t => t.FromAccountId == accountId || t.ToAccountId == accountId)
            .OrderByDescending(t => t.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);
    
    public Task<List<Transfer>> GetHistoryForAccountsAsync(List<Guid> accountIds, int page, int pageSize, CancellationToken ct = default) =>
        _db.Transfers
            .Where(t => accountIds.Contains(t.FromAccountId) || accountIds.Contains(t.ToAccountId))
            .OrderByDescending(t => t.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

    public async Task AddAsync(Transfer transfer, CancellationToken ct = default) =>
        await _db.Transfers.AddAsync(transfer, ct);

    public Task SaveAsync(Transfer transfer, CancellationToken ct = default)
    {
        // change is already tracked in unit of work
        // empty to satisfy interface and keep interface logic in Application layer services the same regardless of infra
        return Task.CompletedTask;
    }
}
