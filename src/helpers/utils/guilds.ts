import type { Guild } from '@prisma/client';
import { container } from '@sapphire/framework';
import { GuildIDEnum } from '../../lib/enum/GuildID.enum';
import { isDevelopment } from '../../lib/utils/env';

export async function getCommandGuilds(
	commandLevel: 'global' | 'testing' | 'premium' | 'admin',
): Promise<string[] | undefined> {
	const testingGuilds = [GuildIDEnum.CHILLI_HQ, GuildIDEnum.CHILLI_ATTACK_V2, GuildIDEnum.BIRTHDAYY_TESTING];
	const adminGuilds = [GuildIDEnum.CHILLI_HQ, GuildIDEnum.BIRTHDAYY_HQ];
	if (isDevelopment) return testingGuilds;
	switch (commandLevel) {
		case 'global':
			return undefined;
		case 'testing':
			return testingGuilds;
		case 'premium': {
			const guilds: Guild[] = await container.utilities.guild.get.PremiumGuilds();
			const guildIds: string[] = guilds.map((guild) => guild.guildId);
			return guildIds;
		}
		case 'admin':
			return adminGuilds;
		default:
			return undefined;
	}
}
