-- CreateTable
CREATE TABLE "birthday" (
    "id" BIGSERIAL NOT NULL,
    "user_id" VARCHAR(32) NOT NULL,
    "guild_id" VARCHAR(32) NOT NULL,
    "birthday" VARCHAR(10) NOT NULL,
    "disabled" BOOLEAN NOT NULL DEFAULT false,


CONSTRAINT "birthday_pkey" PRIMARY KEY ("id") );

-- CreateTable
CREATE TABLE "guild" (
    "guild_id" VARCHAR(32) NOT NULL,
    "inviter" VARCHAR(20),
    "announcement_channel" VARCHAR(20),
    "announcement_message" VARCHAR(512) NOT NULL DEFAULT '<:arrow_right_birthdayy:1102221944016875650> Today is a special Day!{NEW_LINE}<:gift:931267039094534175> Please wish {MENTION} a happy Birthday <3',
    "overview_channel" VARCHAR(20),
    "overview_message" VARCHAR(20),
    "birthday_role" VARCHAR(20),
    "birthday_ping_role" VARCHAR(20),
    "log_channel" VARCHAR(20),
    "timezone" INTEGER NOT NULL DEFAULT 0,
    "premium" BOOLEAN NOT NULL DEFAULT false,
    "language" VARCHAR(5) NOT NULL DEFAULT 'en-US',
    "last_updated" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "disabled" BOOLEAN NOT NULL DEFAULT false,


CONSTRAINT "guild_pkey" PRIMARY KEY ("guild_id") );

-- CreateTable
CREATE TABLE "user" (
    "user_id" VARCHAR(32) NOT NULL,
    "username" VARCHAR(32),
    "discriminator" VARCHAR(4),
    "premium" BOOLEAN NOT NULL DEFAULT false,
    "last_updated" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,


CONSTRAINT "user_pkey" PRIMARY KEY ("user_id") );

-- CreateTable
CREATE TABLE "premium" (
    "id" SERIAL NOT NULL,
    "user_id" VARCHAR(32) NOT NULL,
    "guild_id" VARCHAR(32),
    "tier" BOOLEAN NOT NULL DEFAULT true,


CONSTRAINT "premium_pkey" PRIMARY KEY ("id") );

-- CreateTable
CREATE TABLE "tiers" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(512),
    "last_updated" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,


CONSTRAINT "tiers_pkey" PRIMARY KEY ("id") );

-- CreateIndex
CREATE INDEX "index_birthday_birthday" ON "birthday" ("birthday");

-- CreateIndex
CREATE INDEX "index_guild_id_birthday" ON "birthday" ("guild_id");

-- CreateIndex
CREATE INDEX "index_user_id_birthday" ON "birthday" ("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_user_guild" ON "birthday" ("user_id", "guild_id");

-- CreateIndex
CREATE INDEX "index_last_updated_guild" ON "guild" ("last_updated");

-- CreateIndex
CREATE INDEX "index_user_birthday" ON "user" ("username");

-- AddForeignKey
ALTER TABLE "birthday"
ADD CONSTRAINT "birthday_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "birthday"
ADD CONSTRAINT "birthday_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guild" ("guild_id") ON DELETE RESTRICT ON UPDATE CASCADE;