using MoneyMovement.Domain;

namespace MoneyMovement.Application.Abstractions;

public interface ITokenService
{
    string GenerateToken(User user);
}