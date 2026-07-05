namespace MoneyMovement.Domain;

public enum TransferStatus
{
    Pending,
    Completed,
    FlaggedForReview,
    Approved,
    Rejected,
    Failed
}

public class Transfer
{
    public Guid Id { get; set; }
    public Guid FromAccountId { get; set; }
    public Guid ToAccountId { get; set; }
    public decimal Amount { get; set; }
    public string IdempotencyKey { get; set; } = string.Empty;
    public TransferStatus Status { get; private set; }
    public string? FlagReason { get; private set; }
    public string? FailureReason { get; private set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; private set; }

    private Transfer() { }

    public Transfer(Guid fromAccountId, Guid toAccountId, decimal amount, string idempotencyKey, DateTime createdAtUtc)
    {
        if (fromAccountId == toAccountId)
            throw new ArgumentException("Cannot transfer to the same account.");
        if (amount <= 0)
            throw new ArgumentException("Transfer amount must be positive.", nameof(amount));
        if (string.IsNullOrWhiteSpace(idempotencyKey))
            throw new ArgumentException("Idempotency key is required.", nameof(idempotencyKey));

        Id = Guid.NewGuid();
        FromAccountId = fromAccountId;
        ToAccountId = toAccountId;
        Amount = amount;
        IdempotencyKey = idempotencyKey;
        Status = TransferStatus.Pending;
        CreatedAt = createdAtUtc;
    }

    public void MarkCompleted(DateTime completedAtUtc)
    {
        if (Status != TransferStatus.Pending)
            throw new InvalidTransferStateException(Id, Status, nameof(MarkCompleted));

        Status = TransferStatus.Completed;
        CompletedAt = completedAtUtc;
    }

    public void FlagForReview(string reason)
    {
        if (Status != TransferStatus.Pending)
            throw new InvalidTransferStateException(Id, Status, nameof(FlagForReview));

        Status = TransferStatus.FlaggedForReview;
        FlagReason = reason;
    }

    public void Approve(DateTime completedAtUtc)
    {
        if (Status != TransferStatus.FlaggedForReview)
            throw new InvalidTransferStateException(Id, Status, nameof(Approve));

        Status = TransferStatus.Approved;
        CompletedAt = completedAtUtc;
    }

    public void Reject(string reason)
    {
        if (Status != TransferStatus.FlaggedForReview)
            throw new InvalidTransferStateException(Id, Status, nameof(Reject));

        Status = TransferStatus.Rejected;
        FailureReason = reason;
    }

    public void MarkFailed(string reason)
    {
        if (Status is TransferStatus.Completed or TransferStatus.Approved or TransferStatus.Rejected or TransferStatus.Failed)
            throw new InvalidTransferStateException(Id, Status, nameof(MarkFailed));

        Status = TransferStatus.Failed;
        FailureReason = reason;
    }
}