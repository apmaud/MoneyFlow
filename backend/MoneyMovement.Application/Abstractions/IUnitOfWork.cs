namespace MoneyMovement.Application.Abstractions;

// Commit everything as one atomic unit, transfers cannot occur separately
// transfers must touch both debited Account, credited Account and Transfer record
public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
