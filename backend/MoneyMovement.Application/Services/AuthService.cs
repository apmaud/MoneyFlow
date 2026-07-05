using MoneyMovement.Application.Abstractions;
using MoneyMovement.Application.Dtos;
using MoneyMovement.Domain;

namespace MoneyMovement.Application.Services;

public class AuthService
{
    private readonly IUserRepository _users;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenService _tokenService;
    private readonly ICurrentUser _currentUser;
    private readonly IClock _clock;
    private readonly IUnitOfWork _unitOfWork;

    public AuthService(
        IUserRepository users, IPasswordHasher passwordHasher, ITokenService tokenService, IClock clock, IUnitOfWork unitOfWork)
    {
        _users = users;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
        _clock = clock;
        _unitOfWork = unitOfWork;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken ct = default)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        if (await _users.GetByEmailAsync(normalizedEmail, ct) is not null)
            throw new EmailAlreadyRegisteredException(normalizedEmail);

        var hash = _passwordHasher.Hash(request.Password);
        var user = new User(request.Name, normalizedEmail, hash, _clock.UtcNow);

        await _users.AddAsync(user, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        return new AuthResponse(_tokenService.GenerateToken(user));
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var user = await _users.GetByEmailAsync(request.Email.Trim().ToLowerInvariant(), ct);

        if (user is null || !_passwordHasher.Verify(request.Password, user.PasswordHash))
            throw new InvalidCredentialsException();

        return new AuthResponse(_tokenService.GenerateToken(user));
    }
    
    public async Task<UserDto> GetCurrentUserAsync(CancellationToken ct = default)
    {
        var user = await _users.GetByIdAsync(_currentUser.UserId, ct)
                   ?? throw new InvalidOperationException("Authenticated user no longer exists.");
        return UserDto.FromDomain(user);
    }
}