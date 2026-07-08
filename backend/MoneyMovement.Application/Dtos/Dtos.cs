using MoneyMovement.Domain;

namespace MoneyMovement.Application.Dtos;

public record AccountDto(Guid Id, string AccountNumber, decimal Balance, DateTime CreatedAt)
{
    public static AccountDto FromDomain(Account a) => new(a.Id, a.AccountNumber, a.Balance, a.CreatedAt);
}

public record CreateAccountRequest(decimal OpeningBalance);

public record UserDto(Guid Id, string Name, string Email, DateTime CreatedAt)
{
    public static UserDto FromDomain(User u) => new(u.Id, u.Name, u.Email, u.CreatedAt);
}

public record RegisterRequest(string Name, string Email, string Password);
public record LoginRequest(string Email, string Password);
public record AuthResponse(string Token);

// keeping Guid for the From account for now, until I figure out a better prettier system lol
public record TransferRequest(Guid FromAccountId, string ToAccountNumber, decimal Amount, string IdempotencyKey);

public record TransferResponse(
    Guid Id,
    Guid FromAccountId,
    string FromAccountNumber,
    Guid ToAccountId,
    string ToAccountNumber,
    decimal Amount,
    TransferStatus Status,
    string? FailureReason,
    DateTime CreatedAt,
    DateTime? CompletedAt)
{
    public static TransferResponse FromDomain(Transfer t, string fromAccountNumber, string toAccountNumber) => new(
        t.Id, t.FromAccountId, fromAccountNumber, t.ToAccountId, toAccountNumber, t.Amount, t.Status,
        t.FailureReason, t.CreatedAt, t.CompletedAt);
}

public record ReviewTransferRequest(bool Approve, string? Reason);