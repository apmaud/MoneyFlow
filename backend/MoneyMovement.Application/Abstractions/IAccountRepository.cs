using MoneyMovement.Domain;
namespace MoneyMovement.Application.Abstractions;

public interface IAccountRepository
{
    Task<Account?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<List<Account>> GetByIdsAsync(List<Guid> ids, CancellationToken ct = default);
    Task<Account?> GetByAccountNumberAsync(string accountNumber, CancellationToken ct = default);
    Task<List<Account>> GetAllForOwnerAsync(Guid ownerId, CancellationToken ct = default);
    Task AddAsync(Account account, CancellationToken ct = default);
    Task SaveAsync(Account account, CancellationToken ct = default);
}
