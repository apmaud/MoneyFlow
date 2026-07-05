using System.Security.Claims;
using MoneyMovement.Application.Abstractions;

namespace MoneyMovement.Api.Auth;

// Implementation here because who is logged in is HTTP-request concept
public class HttpCurrentUser : ICurrentUser
{
    public Guid UserId { get; }

    public HttpCurrentUser(IHttpContextAccessor accessor)
    {
        var claim = accessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)
                    ?? throw new InvalidOperationException("No authenticated user on this request.");

        UserId = Guid.Parse(claim.Value);
    }
}