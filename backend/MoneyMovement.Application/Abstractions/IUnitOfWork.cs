namespace MoneyMovement.Application.Abstractions;

/// <summary>
/// A transfer touches two aggregates (the debited Account and the Transfer
/// record) that must commit together or not at all. Application depends on
/// this abstraction to draw that transaction boundary without knowing it's
/// backed by an EF Core DbContext / Postgres transaction underneath.
/// </summary>
public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
