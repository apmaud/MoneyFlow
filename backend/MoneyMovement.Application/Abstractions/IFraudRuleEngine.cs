namespace MoneyMovement.Application.Abstractions;

public record FraudCheckResult(bool ShouldFlag, string? Reason);

// Interface for plug and play ability
// currently only uses business-level logic implementation, but can plug somethin else in later
public interface IFraudRuleEngine
{
    Task<FraudCheckResult> EvaluateAsync(Guid fromAccountId, decimal amount, CancellationToken ct = default);
}
