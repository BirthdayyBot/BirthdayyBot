-- CreateEnum
CREATE TYPE "RestrictedMode" AS ENUM ('AUTHORIZED', 'PROHIBITED');

-- AlterTable
ALTER TABLE "guild" ADD COLUMN     "announcementRestrictedMode" "RestrictedMode" NOT NULL DEFAULT 'AUTHORIZED',
ADD COLUMN     "announcementRestrictedRole" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "birthdayRestrictedMode" "RestrictedMode" NOT NULL DEFAULT 'AUTHORIZED',
ADD COLUMN     "birthdayRestrictedRole" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "birthday_announcement" (
    "status" BOOLEAN NOT NULL DEFAULT true,
    "guild_id" VARCHAR(19) NOT NULL,
    "channel_id" VARCHAR(19) NOT NULL,
    "message_content" VARCHAR(2000) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "birthday_announcement_pkey" PRIMARY KEY ("guild_id")
);

-- CreateTable
CREATE TABLE "birthday_overview" (
    "status" BOOLEAN NOT NULL DEFAULT true,
    "guild_id" VARCHAR(19) NOT NULL,
    "channel_id" VARCHAR(19) NOT NULL,
    "message_id" VARCHAR(19) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "birthday_overview_pkey" PRIMARY KEY ("guild_id")
);

-- CreateTable
CREATE TABLE "birthday_role" (
    "status" BOOLEAN NOT NULL DEFAULT true,
    "guild_id" VARCHAR(19) NOT NULL,
    "role_id" VARCHAR(19) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "birthday_role_pkey" PRIMARY KEY ("guild_id")
);
