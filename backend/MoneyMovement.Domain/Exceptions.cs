namespace MoneyMovement.Domain;

// allows errors to cross in as domain, ignorant of other layer concetps

// Contract for API layer to use for exception-handling with two overloads to mirror the base Exception class, an exception choose from the two
public abstract class DomainException : Exception
{
    protected DomainException(string message) : base(message) { }
    protected DomainException(string message, Exception innerException) : base(message, innerException) { }
}

public class InsufficientFundsException : DomainException
{
    public Guid AccountId { get; }
    public decimal AvailableBalance { get; }
    public decimal RequestedAmount { get; }

    public InsufficientFundsException(Guid accountId, decimal availableBalance, decimal requestedAmount)
        : base($"Account {accountId} has insufficient funds: balance {availableBalance:C}, requested {requestedAmount:C}.")
    {
        AccountId = accountId;
        AvailableBalance = availableBalance;
        RequestedAmount = requestedAmount;
    }
}

public class InvalidTransferStateException : DomainException
{
    public Guid TransferId { get; }
    public TransferStatus CurrentStatus { get; }

    public InvalidTransferStateException(Guid transferId, TransferStatus currentStatus, string attemptedAction)
        : base($"Cannot perform '{attemptedAction}' on transfer {transferId} while it is {currentStatus}.")
    {
        TransferId = transferId;
        CurrentStatus = currentStatus;
    }
}

public class AccountNotFoundException : DomainException
{
    public Guid AccountId { get; }
    public string? AccountNumber { get; }

    public AccountNotFoundException(Guid accountId) : base($"Account {accountId} was not found.")
    {
        AccountId = accountId;
    }
    public AccountNotFoundException(string accountNumber) : base($"Account number '{accountNumber}' was not found.")
    {
        AccountNumber = accountNumber;
    }
}

public class TransferNotFoundException : DomainException
{
    public Guid TransferId { get; }

    public TransferNotFoundException(Guid transferId) : base($"Transfer {transferId} was not found.")
    {
        TransferId = transferId;
    }
}


public class ConcurrencyConflictException : DomainException
{
    public ConcurrencyConflictException(string message) : base(message) { }
    public ConcurrencyConflictException(string message, Exception innerException) : base(message, innerException) { }
}

// idempotency race condition
public class DuplicateTransferException : DomainException
{
    public Guid ExistingTransferId { get; }

    public DuplicateTransferException(Guid existingTransferId)
        : base($"A transfer with this idempotency key already exists (id: {existingTransferId}).")
    {
        ExistingTransferId = existingTransferId;
    }
}

public class ForbiddenAccountAccessException : DomainException
{
    public Guid AccountId { get; }
    public ForbiddenAccountAccessException(Guid accountId)
        : base($"You do not have access to account {accountId}.")
    {
        AccountId = accountId;
    }
}

public class EmailAlreadyRegisteredException : DomainException
{
    public string Email { get; }
    public EmailAlreadyRegisteredException(string email)
        : base($"An account with email '{email}' already exists.")
    {
        Email = email;
    }
}

public class InvalidCredentialsException : DomainException
{
    public InvalidCredentialsException()
        : base("The email or password is incorrect.") { }
}