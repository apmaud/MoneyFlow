using Microsoft.EntityFrameworkCore;
using MoneyMovement.Domain;
using MoneyMovement.Infrastructure.Persistence;
using MoneyMovement.Infrastructure.Repositories;
using Xunit;

namespace MoneyMovement.Tests.Integration;

/// <summary>
/// Unlike TransferServiceTests (which use fakes and never touch EF Core),
/// these tests exercise the actual Infrastructure implementations against
/// EF Core's InMemory provider — confirming the repositories correctly
/// translate to/from Domain entities. They deliberately live in a separate
/// folder/namespace: they're slower and more "integration" in character
/// than the unit tests above.
///
/// NOTE: InMemory can't exercise real Postgres row-versioning/optimistic
/// concurrency semantics. A follow-up worth doing is swapping this for a
/// Testcontainers-backed Postgres instance to test the concurrency retry
/// path (ExecuteMoneyMovementWithRetryAsync) under real contention.
/// </summary>
public class EfRepositoryTests
{
    private static MoneyMovementDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<MoneyMovementDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new MoneyMovementDbContext(options);
    }

    [Fact]
    public async Task AccountRepository_AddThenGetById_RoundTripsCorrectly()
    {
        await using var db = CreateContext();
        var repo = new EfAccountRepository(db);
        var account = new Account("Alice", 250m, DateTime.UtcNow);

        await repo.AddAsync(account);
        await db.SaveChangesAsync();

        var fetched = await repo.GetByIdAsync(account.Id);
        Assert.NotNull(fetched);
        Assert.Equal("Alice", fetched!.OwnerName);
        Assert.Equal(250m, fetched.Balance);
    }

    [Fact]
    public async Task TransferRepository_GetByIdempotencyKey_FindsExistingTransfer()
    {
        await using var db = CreateContext();
        var repo = new EfTransferRepository(db);
        var transfer = new Transfer(Guid.NewGuid(), Guid.NewGuid(), 75m, "integration-key", DateTime.UtcNow);

        await repo.AddAsync(transfer);
        await db.SaveChangesAsync();

        var found = await repo.GetByIdempotencyKeyAsync("integration-key");
        Assert.NotNull(found);
        Assert.Equal(transfer.Id, found!.Id);
    }
}
