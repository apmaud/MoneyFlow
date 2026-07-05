namespace MoneyMovement.Application.Abstractions;

// implemented by Api not Infra, who is logged in is not infra-level but http level
public interface ICurrentUser
{
    Guid UserId { get; }
}