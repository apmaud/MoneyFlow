using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MoneyMovement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAccountNumber : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AccountNumber",
                table: "accounts",
                type: "character varying(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_accounts_AccountNumber",
                table: "accounts",
                column: "AccountNumber",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_accounts_AccountNumber",
                table: "accounts");

            migrationBuilder.DropColumn(
                name: "AccountNumber",
                table: "accounts");
        }
    }
}
