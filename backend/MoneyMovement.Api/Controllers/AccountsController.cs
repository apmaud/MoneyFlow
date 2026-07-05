using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MoneyMovement.Application.Dtos;
using MoneyMovement.Application.Services;

namespace MoneyMovement.Api.Controllers;

[ApiController]
[Route("api/accounts")]
[Authorize]
public class AccountsController : ControllerBase
{
    private readonly AccountService _accountService;

    public AccountsController(AccountService accountService)
    {
        _accountService = accountService;
    }

    [HttpGet]
    public async Task<ActionResult<List<AccountDto>>> GetAll(CancellationToken ct) =>
        Ok(await _accountService.GetAllAsync(ct));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<AccountDto>> GetById(Guid id, CancellationToken ct) =>
        Ok(await _accountService.GetByIdAsync(id, ct));

    [HttpPost]
    public async Task<ActionResult<AccountDto>> Create(CreateAccountRequest request, CancellationToken ct)
    {
        var account = await _accountService.CreateAccountAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = account.Id }, account);
    }
}
