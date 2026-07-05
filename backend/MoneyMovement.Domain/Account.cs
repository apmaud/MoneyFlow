using System.Security.Cryptography;

namespace MoneyMovement.Domain;

public class Account
{
    public Guid Id { get; set; }
    public Guid OwnerId { get; set; }
    public string AccountNumber { get; private set; } = string.Empty;
    public decimal Balance { get; private set; }
    public DateTime CreatedAt { get; set; }
    
    // Concurrency, map to Postgress xmin column in Infrastructure
    // Compare this with whats in db
    public uint Version { get; set; }

    // Parameterless constructor for loading objects from queries
    private Account() { }

    // new account constructor
    public Account(Guid ownerId, decimal openingBalance, DateTime createdAtUtc)
    {
        if (ownerId == Guid.Empty)
            throw new ArgumentException("Account must belong to a user.", nameof(ownerId));
        if (openingBalance < 0)
            throw new ArgumentException("Opening balance cannot be negative.", nameof(openingBalance));

        Id = Guid.NewGuid();
        OwnerId = ownerId;
        AccountNumber = RandomNumberGenerator.GetInt32(0, 1_000_000_000).ToString("D10");
        Balance = openingBalance;
        CreatedAt = createdAtUtc;
    }

    // Checks for bad balances, done in this layer, JUST to protect against bad unchcked calling
    public void Debit(decimal amount)
    {
        if (amount <= 0)
            throw new ArgumentException("Debit amount must be positive.", nameof(amount));
        if (Balance < amount)
            throw new InsufficientFundsException(Id, Balance, amount);

        Balance -= amount;
    }

    public void Credit(decimal amount)
    {
        if (amount <= 0)
            throw new ArgumentException("Credit amount must be positive.", nameof(amount));

        Balance += amount;
    }
}
