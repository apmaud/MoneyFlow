using System.Net;
using System.Text.Json;
using MoneyMovement.Domain;

namespace MoneyMovement.Api.Middleware;

/// <summary>
/// The only place in the solution that translates a Domain exception into an
/// HTTP status code. Domain/Application throw plain C# exceptions and don't
/// know HTTP exists; Api decides what those exceptions mean to a client.
/// </summary>
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (DomainException ex)
        {
            var statusCode = ex switch
            {
                AccountNotFoundException => HttpStatusCode.NotFound,
                TransferNotFoundException => HttpStatusCode.NotFound,
                InsufficientFundsException => HttpStatusCode.UnprocessableEntity,
                InvalidTransferStateException => HttpStatusCode.Conflict,
                ConcurrencyConflictException => HttpStatusCode.Conflict,
                DuplicateTransferException => HttpStatusCode.Conflict,
                ForbiddenAccountAccessException => HttpStatusCode.Forbidden,
                EmailAlreadyRegisteredException => HttpStatusCode.Conflict,
                InvalidCredentialsException => HttpStatusCode.Unauthorized,
                _ => HttpStatusCode.BadRequest
            };

            _logger.LogWarning(ex, "Domain exception handled as {StatusCode}", statusCode);

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)statusCode;
            await context.Response.WriteAsync(JsonSerializer.Serialize(new { error = ex.Message }));
        }
    }
}

public static class ExceptionHandlingMiddlewareExtensions
{
    public static IApplicationBuilder UseDomainExceptionHandling(this IApplicationBuilder app) =>
        app.UseMiddleware<ExceptionHandlingMiddleware>();
}
