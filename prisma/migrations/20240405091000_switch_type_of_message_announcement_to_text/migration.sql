-- AlterTable
ALTER TABLE "guild" ALTER COLUMN "messages.announcement" SET DATA TYPE TEXT,
ALTER COLUMN "roles.notified" SET DEFAULT ARRAY[]::VARCHAR(19)[];
