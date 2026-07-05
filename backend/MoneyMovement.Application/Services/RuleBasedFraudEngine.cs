using MoneyMovement.Application.Abstractions;

namespace MoneyMovement.Application.Services;

// 10k or more
// more than 3 tsfrs from same account within 1 hr
// business policy not external integration, depends on ITransferRepository and IClock
public class RuleBasedFraudEngine : IFraudRuleEngine
{
    private const decimal LargeTransferThreshold = 10_000m;
    private const int RapidTransferCountThreshold = 3;
    private static readonly TimeSpan RapidTransferWindow = TimeSpan.FromHours(1);

    private readonly ITransferRepository _transferRepository;
    private readonly IClock _clock;

    public RuleBasedFraudEngine(ITransferRepository transferRepository, IClock clock)
    {
        _transferRepository = transferRepository;
        _clock = clock;
    }

    public async Task<FraudCheckResult> EvaluateAsync(Guid fromAccountId, decimal amount, CancellationToken ct = default)
    {
        if (amount > LargeTransferThreshold)
        {
            return new FraudCheckResult(true, $"Transfer of {amount:C} exceeds the {LargeTransferThreshold:C} threshold.");
        }

        var recentHistory = await _transferRepository.GetHistoryForAccountAsync(fromAccountId, page: 1, pageSize: 50, ct);
        var windowStart = _clock.UtcNow - RapidTransferWindow;
        var recentCount = recentHistory.Count(t => t.CreatedAt >= windowStart);

        if (recentCount >= RapidTransferCountThreshold)
        {
            return new FraudCheckResult(true, $"{recentCount} transfers from this account within the last hour.");
        }

        return new FraudCheckResult(false, null);
    }
}
