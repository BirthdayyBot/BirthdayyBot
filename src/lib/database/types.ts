import type { Prisma } from '@prisma/client';

export type ConfigName = Exclude<
	Prisma.GuildScalarFieldEnum,
	'disabled' | 'guildId' | 'inviter' | 'lastUpdated' | 'premium' | 'language'
>;
