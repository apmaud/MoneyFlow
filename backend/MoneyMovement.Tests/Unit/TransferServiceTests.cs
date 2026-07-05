using MoneyMovement.Application.Dtos;
using MoneyMovement.Application.Services;
using MoneyMovement.Domain;
using MoneyMovement.Tests.Fakes;
using Xunit;

namespace MoneyMovement.Tests.Unit;

// assert with fakes
public class TransferServiceTests
{
    private static (TransferService service, FakeAccountRepository accounts, FakeTransferRepository transfers, FakeClock clock)
        CreateService()
    {
        var accounts = new FakeAccountRepository();
        var transfers = new FakeTransferRepository();
        var clock = new FakeClock();
        var fraudEngine = new RuleBasedFraudEngine(transfers, clock);
        var unitOfWork = new FakeUnitOfWork();

        var service = new TransferService(accounts, transfers, fraudEngine, clock, unitOfWork);
        return (service, accounts, transfers, clock);
    }

    [Fact]
    public async Task PlaceTransfer_MovesMoneyBetweenAccounts()
    {
        var (service, accounts, _, clock) = CreateService();
        var from = new Account("Alice", 500m, clock.UtcNow);
        var to = new Account("Bob", 100m, clock.UtcNow);
        accounts.Seed(from);
        accounts.Seed(to);

        var result = await service.PlaceTransferAsync(new TransferRequest(from.Id, to.Id, 200m, "key-1"));

        Assert.Equal(TransferStatus.Completed, result.Status);
        Assert.Equal(300m, (await accounts.GetByIdAsync(from.Id))!.Balance);
        Assert.Equal(300m, (await accounts.GetByIdAsync(to.Id))!.Balance);
    }

    [Fact]
    public async Task PlaceTransfer_InsufficientFunds_MarksTransferFailed()
    {
        var (service, accounts, _, clock) = CreateService();
        var from = new Account("Alice", 50m, clock.UtcNow);
        var to = new Account("Bob", 0m, clock.UtcNow);
        accounts.Seed(from);
        accounts.Seed(to);

        await Assert.ThrowsAsync<InsufficientFundsException>(() =>
            service.PlaceTransferAsync(new TransferRequest(from.Id, to.Id, 500m, "key-2")));

        // Balances must be untouched — a failed transfer can't leave a partial debit/credit.
        Assert.Equal(50m, (await accounts.GetByIdAsync(from.Id))!.Balance);
    }

    [Fact]
    public async Task PlaceTransfer_DuplicateIdempotencyKey_ReturnsOriginalResultWithoutMovingMoneyTwice()
    {
        var (service, accounts, _, clock) = CreateService();
        var from = new Account("Alice", 500m, clock.UtcNow);
        var to = new Account("Bob", 0m, clock.UtcNow);
        accounts.Seed(from);
        accounts.Seed(to);

        var first = await service.PlaceTransferAsync(new TransferRequest(from.Id, to.Id, 100m, "same-key"));
        var second = await service.PlaceTransferAsync(new TransferRequest(from.Id, to.Id, 100m, "same-key"));

        Assert.Equal(first.Id, second.Id);
        Assert.Equal(400m, (await accounts.GetByIdAsync(from.Id))!.Balance); // debited only once
    }

    [Fact]
    public async Task PlaceTransfer_UnknownFromAccount_ThrowsAccountNotFound()
    {
        var (service, accounts, _, clock) = CreateService();
        var to = new Account("Bob", 0m, clock.UtcNow);
        accounts.Seed(to);

        await Assert.ThrowsAsync<AccountNotFoundException>(() =>
            service.PlaceTransferAsync(new TransferRequest(Guid.NewGuid(), to.Id, 50m, "key-3")));
    }

    [Fact]
    public async Task PlaceTransfer_OverThreshold_FlagsForReviewWithoutMovingMoney()
    {
        var (service, accounts, _, clock) = CreateService();
        var from = new Account("Alice", 50_000m, clock.UtcNow);
        var to = new Account("Bob", 0m, clock.UtcNow);
        accounts.Seed(from);
        accounts.Seed(to);

        var result = await service.PlaceTransferAsync(new TransferRequest(from.Id, to.Id, 15_000m, "key-4"));

        Assert.Equal(TransferStatus.FlaggedForReview, result.Status);
        Assert.NotNull(result.FlagReason);
        Assert.Equal(50_000m, (await accounts.GetByIdAsync(from.Id))!.Balance); // untouched until reviewed
    }

    [Fact]
    public async Task ReviewTransfer_Approve_CompletesMoneyMovement()
    {
        var (service, accounts, _, clock) = CreateService();
        var from = new Account("Alice", 50_000m, clock.UtcNow);
        var to = new Account("Bob", 0m, clock.UtcNow);
        accounts.Seed(from);
        accounts.Seed(to);

        var flagged = await service.PlaceTransferAsync(new TransferRequest(from.Id, to.Id, 15_000m, "key-5"));
        var approved = await service.ReviewTransferAsync(flagged.Id, new ReviewTransferRequest(true, null));

        Assert.Equal(TransferStatus.Approved, approved.Status);
        Assert.Equal(35_000m, (await accounts.GetByIdAsync(from.Id))!.Balance);
        Assert.Equal(15_000m, (await accounts.GetByIdAsync(to.Id))!.Balance);
    }

    [Fact]
    public async Task ReviewTransfer_Reject_LeavesBalancesUntouched()
    {
        var (service, accounts, _, clock) = CreateService();
        var from = new Account("Alice", 50_000m, clock.UtcNow);
        var to = new Account("Bob", 0m, clock.UtcNow);
        accounts.Seed(from);
        accounts.Seed(to);

        var flagged = await service.PlaceTransferAsync(new TransferRequest(from.Id, to.Id, 15_000m, "key-6"));
        var rejected = await service.ReviewTransferAsync(flagged.Id, new ReviewTransferRequest(false, "Looked suspicious"));

        Assert.Equal(TransferStatus.Rejected, rejected.Status);
        Assert.Equal(50_000m, (await accounts.GetByIdAsync(from.Id))!.Balance);
    }

    [Fact]
    public async Task PlaceTransfer_RapidRepeatedTransfers_GetFlagged()
    {
        var (service, accounts, _, clock) = CreateService();
        var from = new Account("Alice", 10_000m, clock.UtcNow);
        var to = new Account("Bob", 0m, clock.UtcNow);
        accounts.Seed(from);
        accounts.Seed(to);

        await service.PlaceTransferAsync(new TransferRequest(from.Id, to.Id, 10m, "rapid-1"));
        await service.PlaceTransferAsync(new TransferRequest(from.Id, to.Id, 10m, "rapid-2"));
        await service.PlaceTransferAsync(new TransferRequest(from.Id, to.Id, 10m, "rapid-3"));
        var fourth = await service.PlaceTransferAsync(new TransferRequest(from.Id, to.Id, 10m, "rapid-4"));

        Assert.Equal(TransferStatus.FlaggedForReview, fourth.Status);
    }

    [Fact]
    public void Account_Debit_ThrowsWhenAmountExceedsBalance()
    {
        var account = new Account("Alice", 10m, DateTime.UtcNow);
        Assert.Throws<InsufficientFundsException>(() => account.Debit(50m));
    }
}
