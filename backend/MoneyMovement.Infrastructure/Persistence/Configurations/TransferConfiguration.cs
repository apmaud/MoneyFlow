using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MoneyMovement.Domain;

namespace MoneyMovement.Infrastructure.Persistence.Configurations;

public class TransferConfiguration : IEntityTypeConfiguration<Transfer>
{
    public void Configure(EntityTypeBuilder<Transfer> builder)
    {
        builder.ToTable("transfers");
        builder.HasKey(t => t.Id);

        builder.Property(t => t.Amount).HasColumnType("numeric(18,2)");
        builder.Property(t => t.IdempotencyKey).IsRequired().HasMaxLength(200);
        builder.HasIndex(t => t.IdempotencyKey).IsUnique();
        builder.HasIndex(t => t.FromAccountId);

        builder.Property(t => t.Status)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(t => t.FlagReason).HasMaxLength(500);
        builder.Property(t => t.FailureReason).HasMaxLength(500);
    }
}
