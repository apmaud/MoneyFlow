using MoneyMovement.Application.Abstractions;

namespace MoneyMovement.Tests.Fakes;

public class FakeClock : IClock
{
    public DateTime UtcNow { get; set; } = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);
}

/// <summary>
/// The fakes above already apply their changes synchronously on every call,
/// so there's nothing to batch — this exists purely so TransferService's
/// constructor signature doesn't change between tests and production.
/// </summary>
public class FakeUnitOfWork : IUnitOfWork
{
    public Task<int> SaveChangesAsync(CancellationToken ct = default) => Task.FromResult(0);
}
