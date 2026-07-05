using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using MoneyMovement.Application.Abstractions;
using MoneyMovement.Domain;

namespace MoneyMovement.Infrastructure.Security;

public class JwtTokenService : ITokenService
{
    private readonly string _signingKey;
    private readonly string _issuer;
    private readonly TimeSpan _lifetime;

    public JwtTokenService(IConfiguration configuration)
    {
        _signingKey = configuration["Jwt:SigningKey"]
                      ?? throw new InvalidOperationException("Jwt:SigningKey is not configured.");
        _issuer = configuration["Jwt:Issuer"] ?? "MoneyMovementSimulator";
        _lifetime = TimeSpan.FromHours(2);
    }

    public string GenerateToken(User user)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Name),
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_signingKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _issuer,
            audience: _issuer,
            claims: claims,
            expires: DateTime.UtcNow.Add(_lifetime),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}