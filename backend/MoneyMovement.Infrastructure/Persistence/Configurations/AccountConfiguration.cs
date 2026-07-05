using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MoneyMovement.Domain;

namespace MoneyMovement.Infrastructure.Persistence.Configurations;

public class AccountConfiguration : IEntityTypeConfiguration<Account>
{
    public void Configure(EntityTypeBuilder<Account> builder)
    {
        builder.ToTable("accounts");
        builder.HasKey(a => a.Id);

        builder.Property(a => a.OwnerId).IsRequired();
        builder.HasIndex(a => a.OwnerId);
        
        builder.Property(a => a.AccountNumber).IsRequired().HasMaxLength(10);
        builder.HasIndex(a => a.AccountNumber).IsUnique();

        builder.Property(a => a.Balance).HasColumnType("numeric(18,2)");
        builder.Property(a => a.CreatedAt).IsRequired();
        
        // mapping xmin column for postgres
        builder.Property(a => a.Version)
            .IsRowVersion()
            .HasColumnName("xmin")
            .HasColumnType("xid");
    }
}