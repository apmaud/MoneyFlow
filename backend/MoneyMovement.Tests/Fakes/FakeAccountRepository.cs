using MoneyMovement.Application.Abstractions;
using MoneyMovement.Domain;

namespace MoneyMovement.Tests.Fakes;

/// <summary>
/// A plain in-memory dictionary standing in for IAccountRepository. No EF
/// Core, no database — this is what makes TransferService unit-testable in
/// milliseconds instead of needing a real Postgres instance.
/// </summary>
public class FakeAccountRepository : IAccountRepository
{
    private readonly Dictionary<Guid, Account> _accounts = new();

    public void Seed(Account account) => _accounts[account.Id] = account;

    public Task<Account?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        Task.FromResult(_accounts.GetValueOrDefault(id));

    public Task<List<Account>> GetAllAsync(CancellationToken ct = default) =>
        Task.FromResult(_accounts.Values.ToList());

    public Task AddAsync(Account account, CancellationToken ct = default)
    {
        _accounts[account.Id] = account;
        return Task.CompletedTask;
    }

    public Task SaveAsync(Account account, CancellationToken ct = default)
    {
        _accounts[account.Id] = account;
        return Task.CompletedTask;
    }
}
