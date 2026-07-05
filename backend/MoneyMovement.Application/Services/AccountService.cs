using MoneyMovement.Application.Abstractions;
using MoneyMovement.Application.Dtos;
using MoneyMovement.Domain;

namespace MoneyMovement.Application.Services;

public class AccountService
{
    private readonly IAccountRepository _accounts;
    private readonly IClock _clock;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUser _currentUser;

    public AccountService(IAccountRepository accounts, IClock clock, IUnitOfWork unitOfWork, ICurrentUser currentUser)
    {
        _accounts = accounts;
        _clock = clock;
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task<AccountDto> CreateAccountAsync(CreateAccountRequest request, CancellationToken ct = default)
    {
        var account = new Account(_currentUser.UserId, request.OpeningBalance, _clock.UtcNow);
        await _accounts.AddAsync(account, ct);
        await _unitOfWork.SaveChangesAsync(ct);
        return AccountDto.FromDomain(account);
    }

    public async Task<List<AccountDto>> GetAllAsync(CancellationToken ct = default)
    {
        var accounts = await _accounts.GetAllForOwnerAsync(_currentUser.UserId, ct);
        return accounts.Select(AccountDto.FromDomain).ToList();
    }

    public async Task<AccountDto> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var account = await _accounts.GetByIdAsync(id, ct) ?? throw new AccountNotFoundException(id);

        if (account.OwnerId != _currentUser.UserId)
            throw new ForbiddenAccountAccessException(id);

        return AccountDto.FromDomain(account);
    }
}