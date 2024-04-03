-- AlterTable
ALTER TABLE "guild" ALTER COLUMN "roles.notified" SET DEFAULT ARRAY[]::VARCHAR(19)[];