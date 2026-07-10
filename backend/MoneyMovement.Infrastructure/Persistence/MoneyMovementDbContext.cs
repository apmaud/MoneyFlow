using Microsoft.EntityFrameworkCore;
using MoneyMovement.Application.Abstractions;
using MoneyMovement.Domain;

namespace MoneyMovement.Infrastructure.Persistence;

// INHERITS DBCONTEXT and IMPLEMENTS IUnitOfWork, saves as one atomic transaction
public class MoneyMovementDbContext : DbContext, IUnitOfWork
{
    public DbSet<Account> Accounts => Set<Account>();
    public DbSet<Transfer> Transfers => Set<Transfer>();
    public DbSet<User> Users => Set<User>();

    public MoneyMovementDbContext(DbContextOptions<MoneyMovementDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(MoneyMovementDbContext).Assembly);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            return await base.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException ex)
        {
            throw new ConcurrencyConflictException(
                "One or more accounts were modified by another transfer before this one could commit.", ex);
        }
        catch (DbUpdateException ex) when (IsIdempotencyKeyViolation(ex))
        {
            var pendingTransfer = ChangeTracker.Entries<Transfer>()
                .FirstOrDefault(e => e.State == EntityState.Added)
                ?.Entity;

            if (pendingTransfer is not null)
            {
                var winner = await Transfers.FirstOrDefaultAsync(
                    t => t.IdempotencyKey == pendingTransfer.IdempotencyKey, cancellationToken);

                if (winner is not null)
                    throw new DuplicateTransferException(winner.Id);
            }

            throw new ConcurrencyConflictException("A duplicate transfer was detected but the original could not be located.", ex);
        }
    }
    
    // 23505 for Postgres specifically for a unique-constraint violation
    private static bool IsIdempotencyKeyViolation(DbUpdateException ex) =>
        ex.InnerException is Npgsql.PostgresException pgEx && pgEx.SqlState == "23505";
}



