using MoneyMovement.Application.Abstractions;
using MoneyMovement.Application.Dtos;
using MoneyMovement.Domain;

namespace MoneyMovement.Application.Services;

// Transfer logic
public class TransferService
{
    private const int MaxConcurrencyRetries = 3;

    private readonly IAccountRepository _accounts;
    private readonly ITransferRepository _transfers;
    private readonly IFraudRuleEngine _fraudEngine;
    private readonly IClock _clock;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUser _currentUser;

    public TransferService(
        IAccountRepository accounts,
        ITransferRepository transfers,
        IFraudRuleEngine fraudEngine,
        IClock clock,
        IUnitOfWork unitOfWork,
        ICurrentUser currentUser)
    {
        _accounts = accounts;
        _transfers = transfers;
        _fraudEngine = fraudEngine;
        _clock = clock;
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task<TransferResponse> PlaceTransferAsync(TransferRequest request, CancellationToken ct = default)
    {
        // check for duplicate idempotency key and return that original result if exists, also second layer PostGres database rule is set to keep the key unique
        var existing = await _transfers.GetByIdempotencyKeyAsync(request.IdempotencyKey, ct);
        if (existing is not null)
        {
            return await ToResponseAsync(existing, ct);
        }

        // Validation of both accounts existing and ownership for From
        var fromAccount = await _accounts.GetByIdAsync(request.FromAccountId, ct)
                          ?? throw new AccountNotFoundException(request.FromAccountId);
        
        if (fromAccount.OwnerId != _currentUser.UserId)
            throw new ForbiddenAccountAccessException(fromAccount.Id);
        
        var toAccount = await _accounts.GetByAccountNumberAsync(request.ToAccountNumber, ct)
                        ?? throw new AccountNotFoundException(request.ToAccountNumber);

        // Run Fraud Check
        var fraudResult = await _fraudEngine.EvaluateAsync(request.FromAccountId, request.Amount, ct);

        // Create new Transfer, pending status for now
        var transfer = new Transfer(fromAccount.Id, toAccount.Id, request.Amount, request.IdempotencyKey, _clock.UtcNow);

        try
        {
            if (fraudResult.ShouldFlag)
            {
                transfer.FlagForReview(fraudResult.Reason!);
                await _transfers.AddAsync(transfer, ct);
                await _unitOfWork.SaveChangesAsync(ct);
                return TransferResponse.FromDomain(transfer, fromAccount.AccountNumber, toAccount.AccountNumber);
            }

            await _transfers.AddAsync(transfer, ct);
            await ExecuteMoneyMovementWithRetryAsync(transfer, ct);

            return TransferResponse.FromDomain(transfer, fromAccount.AccountNumber, toAccount.AccountNumber);
        }
        catch (DuplicateTransferException ex)
        {
            var winner = await _transfers.GetByIdAsync(ex.ExistingTransferId, ct)
                         ?? throw new TransferNotFoundException(ex.ExistingTransferId);
            return await ToResponseAsync(winner, ct);
        }
    }

    public async Task<TransferResponse> GetByIdAsync(Guid transferId, CancellationToken ct = default)
    {
        var transfer = await _transfers.GetByIdAsync(transferId, ct)
                       ?? throw new TransferNotFoundException(transferId);

        var fromAccount = await _accounts.GetByIdAsync(transfer.FromAccountId, ct);
        var toAccount = await _accounts.GetByIdAsync(transfer.ToAccountId, ct);

        var isSender = fromAccount?.OwnerId == _currentUser.UserId;
        var isRecipient = toAccount?.OwnerId == _currentUser.UserId;

        if (!isSender && !isRecipient)
            throw new TransferNotFoundException(transferId);

        if (!isSender && !IsResolved(transfer.Status))
            throw new TransferNotFoundException(transferId);

        return TransferResponse.FromDomain(transfer, fromAccount?.AccountNumber ?? "unknown", toAccount?.AccountNumber ?? "unknown");
    }
    
    public async Task<List<TransferResponse>> GetHistoryForAccountAsync(Guid accountId, int page, int pageSize, CancellationToken ct = default)
    {
        var account = await _accounts.GetByIdAsync(accountId, ct)
                      ?? throw new AccountNotFoundException(accountId);

        if (account.OwnerId != _currentUser.UserId)
            throw new ForbiddenAccountAccessException(accountId);

        var transfers = await _transfers.GetHistoryForAccountAsync(accountId, page, pageSize, ct);
        
        // Visible if account was sender, transfer already resolved
        var visible = transfers.Where(t => t.FromAccountId == accountId || IsResolved(t.Status)).ToList();

        return await ToResponseListAsync(visible, ct);
    }

    public async Task<List<TransferResponse>> GetHistoryForOwnerAsync(int page, int pageSize, CancellationToken ct = default)
    {
        var ownedAccounts = await _accounts.GetAllForOwnerAsync(_currentUser.UserId, ct);
        var accountIds = ownedAccounts.Select(a => a.Id).ToHashSet();

        var transfers = await _transfers.GetHistoryForAccountsAsync(accountIds.ToList(), page, pageSize, ct);
        
        // visible if one of current user's accounts was sender, or if transfer already resolved
        var visible = transfers.Where(t => accountIds.Contains(t.FromAccountId) || IsResolved(t.Status)).ToList();

        return await ToResponseListAsync(visible, ct);
    }

    public async Task<TransferResponse> ReviewTransferAsync(Guid transferId, ReviewTransferRequest request, CancellationToken ct = default)
    {
        var transfer = await _transfers.GetByIdAsync(transferId, ct)
                       ?? throw new TransferNotFoundException(transferId);

        if (!request.Approve)
        {
            transfer.Reject(request.Reason ?? "Rejected during manual review.");
            await _transfers.SaveAsync(transfer, ct);
            await _unitOfWork.SaveChangesAsync(ct);
            return await ToResponseAsync(transfer, ct);
        }

        await ExecuteMoneyMovementWithRetryAsync(transfer, ct, isApproval: true);
        return await ToResponseAsync(transfer, ct);
    }
    
    private static bool IsResolved(TransferStatus status) =>
        status is TransferStatus.Completed or TransferStatus.Approved or TransferStatus.Rejected or TransferStatus.Failed;
    
    // Single-transfer mapping: two direct lookups is fine here — it's
    // always exactly two accounts, never a list that could grow into N+1.
    private async Task<TransferResponse> ToResponseAsync(Transfer transfer, CancellationToken ct)
    {
        var fromAccount = await _accounts.GetByIdAsync(transfer.FromAccountId, ct);
        var toAccount = await _accounts.GetByIdAsync(transfer.ToAccountId, ct);
        return TransferResponse.FromDomain(transfer, fromAccount?.AccountNumber ?? "unknown", toAccount?.AccountNumber ?? "unknown");
    }

    // List mapping: one bulk fetch of every distinct account involved across
    // the whole page of transfers, rather than two queries per transfer.
    private async Task<List<TransferResponse>> ToResponseListAsync(List<Transfer> transfers, CancellationToken ct)
    {
        var accountIds = transfers.SelectMany(t => new[] { t.FromAccountId, t.ToAccountId }).Distinct().ToList();
        var accounts = await _accounts.GetByIdsAsync(accountIds, ct);
        var numberById = accounts.ToDictionary(a => a.Id, a => a.AccountNumber);

        return transfers
            .Select(t => TransferResponse.FromDomain(
                t,
                numberById.GetValueOrDefault(t.FromAccountId, "unknown"),
                numberById.GetValueOrDefault(t.ToAccountId, "unknown")))
            .ToList();
    }

    
    // Concurrency handling for the debiting and crediting of accounts
    private async Task ExecuteMoneyMovementWithRetryAsync(Transfer transfer, CancellationToken ct, bool isApproval = false)
    {
        // loop for retrying the retries limit specified
        for (var attempt = 1; attempt <= MaxConcurrencyRetries; attempt++)
        {
            try
            {
                // refetch both accounts freshly
                var fromAccount = await _accounts.GetByIdAsync(transfer.FromAccountId, ct)
                    ?? throw new AccountNotFoundException(transfer.FromAccountId);
                var toAccount = await _accounts.GetByIdAsync(transfer.ToAccountId, ct)
                    ?? throw new AccountNotFoundException(transfer.ToAccountId);

                // Call debit and credit
                fromAccount.Debit(transfer.Amount);
                toAccount.Credit(transfer.Amount);

                // Finalize status, if approval needed, approve. If fresh transfer, then complete
                if (isApproval)
                    transfer.Approve(_clock.UtcNow);
                else
                    transfer.MarkCompleted(_clock.UtcNow);
                
                // Save
                await _accounts.SaveAsync(fromAccount, ct);
                await _accounts.SaveAsync(toAccount, ct);
                await _transfers.SaveAsync(transfer, ct);
                await _unitOfWork.SaveChangesAsync(ct);

                return; // success
            }
            catch (ConcurrencyConflictException) when (attempt < MaxConcurrencyRetries)
            {
                // A transfer touched one of these accounts first
                // Retry
            }
            catch (InsufficientFundsException)
            {
                // If they don't have funds then cancel now
                transfer.MarkFailed("Insufficient funds.");
                await _transfers.SaveAsync(transfer, ct);
                await _unitOfWork.SaveChangesAsync(ct);
                throw;
            }
        }

        // Fail
        transfer.MarkFailed("Could not complete transfer after repeated concurrent updates.");
        await _transfers.SaveAsync(transfer, ct);
        await _unitOfWork.SaveChangesAsync(ct);
        throw new ConcurrencyConflictException($"Transfer {transfer.Id} failed after {MaxConcurrencyRetries} concurrency retries.");
    }
}
