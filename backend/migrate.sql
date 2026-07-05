CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

START TRANSACTION;

CREATE TABLE accounts (
    "Id" uuid NOT NULL,
    "OwnerName" character varying(200) NOT NULL,
    "Balance" numeric(18,2) NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_accounts" PRIMARY KEY ("Id")
);

CREATE TABLE transfers (
    "Id" uuid NOT NULL,
    "FromAccountId" uuid NOT NULL,
    "ToAccountId" uuid NOT NULL,
    "Amount" numeric(18,2) NOT NULL,
    "IdempotencyKey" character varying(200) NOT NULL,
    "Status" character varying(30) NOT NULL,
    "FlagReason" character varying(500),
    "FailureReason" character varying(500),
    "CreatedAt" timestamp with time zone NOT NULL,
    "CompletedAt" timestamp with time zone,
    CONSTRAINT "PK_transfers" PRIMARY KEY ("Id")
);

CREATE INDEX "IX_transfers_FromAccountId" ON transfers ("FromAccountId");

CREATE UNIQUE INDEX "IX_transfers_IdempotencyKey" ON transfers ("IdempotencyKey");

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260703025444_InitialCreate', '8.0.10');

COMMIT;

START TRANSACTION;

ALTER TABLE accounts DROP COLUMN "OwnerName";

ALTER TABLE accounts ADD "OwnerId" uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';

CREATE TABLE users (
    "Id" uuid NOT NULL,
    "Name" character varying(200) NOT NULL,
    "Email" character varying(320) NOT NULL,
    "PasswordHash" text NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_users" PRIMARY KEY ("Id")
);

CREATE INDEX "IX_accounts_OwnerId" ON accounts ("OwnerId");

CREATE UNIQUE INDEX "IX_users_Email" ON users ("Email");

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260704015223_AddUsersAndAccountOwnership', '8.0.10');

COMMIT;

START TRANSACTION;

ALTER TABLE accounts ADD "AccountNumber" character varying(10) NOT NULL DEFAULT '';

CREATE UNIQUE INDEX "IX_accounts_AccountNumber" ON accounts ("AccountNumber");

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260704202857_AddAccountNumber', '8.0.10');

COMMIT;

