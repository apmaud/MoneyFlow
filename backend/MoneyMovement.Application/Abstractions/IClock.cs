namespace MoneyMovement.Application.Abstractions;

// Abstraction for time so can be tested
public interface IClock
{
    DateTime UtcNow { get; }
}
