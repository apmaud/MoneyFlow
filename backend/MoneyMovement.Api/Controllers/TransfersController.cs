using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MoneyMovement.Application.Dtos;
using MoneyMovement.Application.Services;

namespace MoneyMovement.Api.Controllers;

[ApiController]
[Route("api/transfers")]
[Authorize]
public class TransfersController : ControllerBase
{
    private readonly TransferService _transferService;

    public TransfersController(TransferService transferService)
    {
        _transferService = transferService;
    }

    [HttpPost]
    public async Task<ActionResult<TransferResponse>> Create(TransferRequest request, CancellationToken ct)
    {
        var result = await _transferService.PlaceTransferAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TransferResponse>> GetById(Guid id, CancellationToken ct) =>
        Ok(await _transferService.GetByIdAsync(id, ct));

    [HttpGet("account/{accountId:guid}")]
    public async Task<ActionResult<List<TransferResponse>>> GetHistory(
        Guid accountId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 100);
        return Ok(await _transferService.GetHistoryForAccountAsync(accountId, page, pageSize, ct));
    }

    [HttpGet("history")]
    public async Task<ActionResult<List<TransferResponse>>> GetMyHistory(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 100);
        return Ok(await _transferService.GetHistoryForOwnerAsync(page, pageSize, ct));
    }

    [HttpPatch("{id:guid}/review")]
    public async Task<ActionResult<TransferResponse>> Review(Guid id, ReviewTransferRequest request, CancellationToken ct) =>
        Ok(await _transferService.ReviewTransferAsync(id, request, ct));
}
