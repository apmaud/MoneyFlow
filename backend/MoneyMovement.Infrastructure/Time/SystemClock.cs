using MoneyMovement.Application.Abstractions;

namespace MoneyMovement.Infrastructure.Time;

public class SystemClock : IClock
{
    public DateTime UtcNow => DateTime.UtcNow;
}
