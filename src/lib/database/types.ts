import type { Prisma } from '@prisma/client';

export type ConfigName = Exclude<Prisma.GuildScalarFieldEnum, 'disabled' | 'guild_id' | 'inviter' | 'last_updated' | 'premium'>
