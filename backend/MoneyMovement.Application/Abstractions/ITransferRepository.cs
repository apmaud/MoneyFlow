using MoneyMovement.Domain;

namespace MoneyMovement.Application.Abstractions;

public interface ITransferRepository
{
    Task<Transfer?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Transfer?> GetByIdempotencyKeyAsync(string idempotencyKey, CancellationToken ct = default);
    Task<List<Transfer>> GetHistoryForAccountAsync(Guid accountId, int page, int pageSize, CancellationToken ct = default);
    Task<List<Transfer>> GetHistoryForAccountsAsync(List<Guid> accountIds, int page, int pageSize, CancellationToken ct = default);
    Task AddAsync(Transfer transfer, CancellationToken ct = default);
    Task SaveAsync(Transfer transfer, CancellationToken ct = default);
}
