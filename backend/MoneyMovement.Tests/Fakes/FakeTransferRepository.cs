using MoneyMovement.Application.Abstractions;
using MoneyMovement.Domain;

namespace MoneyMovement.Tests.Fakes;

public class FakeTransferRepository : ITransferRepository
{
    private readonly Dictionary<Guid, Transfer> _transfers = new();

    public Task<Transfer?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        Task.FromResult(_transfers.GetValueOrDefault(id));

    public Task<Transfer?> GetByIdempotencyKeyAsync(string idempotencyKey, CancellationToken ct = default) =>
        Task.FromResult(_transfers.Values.FirstOrDefault(t => t.IdempotencyKey == idempotencyKey));

    public Task<List<Transfer>> GetHistoryForAccountAsync(Guid accountId, int page, int pageSize, CancellationToken ct = default) =>
        Task.FromResult(_transfers.Values
            .Where(t => t.FromAccountId == accountId || t.ToAccountId == accountId)
            .OrderByDescending(t => t.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList());

    public Task AddAsync(Transfer transfer, CancellationToken ct = default)
    {
        _transfers[transfer.Id] = transfer;
        return Task.CompletedTask;
    }

    public Task SaveAsync(Transfer transfer, CancellationToken ct = default)
    {
        _transfers[transfer.Id] = transfer;
        return Task.CompletedTask;
    }
}
