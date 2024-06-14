-- CreateTable
CREATE TABLE "birthday" (
    "user_id" VARCHAR(19) NOT NULL,
    "guild_id" VARCHAR(19) NOT NULL,
    "birthday" VARCHAR(10) NOT NULL,
    "disabled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "guild" (
    "id" VARCHAR(19) NOT NULL,
    "inviter" VARCHAR(19),
    "announcementChannel" VARCHAR(19),
    "announcementMessage" VARCHAR(512),
    "overviewChannel" VARCHAR(19),
    "overviewMessage" VARCHAR(19),
    "birthday_role" VARCHAR(19),
    "birthday_ping_role" VARCHAR(19),
    "log_channel" VARCHAR(19),
    "timezone" INTEGER NOT NULL DEFAULT 0,
    "premium" BOOLEAN NOT NULL DEFAULT false,
    "language" VARCHAR(5) NOT NULL DEFAULT 'en-US',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "disabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "guild_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" VARCHAR(19) NOT NULL,
    "username" VARCHAR(19),
    "discriminator" VARCHAR(4),
    "premium" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "premium" (
    "user_id" VARCHAR(19) NOT NULL,
    "guild_id" VARCHAR(19) NOT NULL,
    "tier" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "tiers" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(512),
    "updatedAt" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "tiers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "birthday_birthday_idx" ON "birthday"("birthday");

-- CreateIndex
CREATE UNIQUE INDEX "birthday_user_id_guild_id_key" ON "birthday"("user_id", "guild_id");

-- CreateIndex
CREATE INDEX "guild_id_idx" ON "guild"("id");

-- CreateIndex
CREATE INDEX "user_id_idx" ON "user"("id");

-- CreateIndex
CREATE UNIQUE INDEX "premium_user_id_guild_id_key" ON "premium"("user_id", "guild_id");

-- AddForeignKey
ALTER TABLE "birthday" ADD CONSTRAINT "birthday_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "birthday" ADD CONSTRAINT "birthday_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
