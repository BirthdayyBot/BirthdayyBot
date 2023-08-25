import { GuildIDEnum } from '#utils/constants';
import { isCustom, isDevelopment, isNotCustom } from '#utils/env';
import { MAIN_DISCORD } from '#utils/environment';
import type { Guild } from '@prisma/client';
import { container } from '@sapphire/framework';

export async function getCommandGuilds(
	commandLevel: 'global' | 'testing' | 'premium' | 'admin',
): Promise<string[] | undefined> {
	const testingGuilds = [GuildIDEnum.ChilliHQ, GuildIDEnum.ChilliAttackV2, GuildIDEnum.BirthdayyTesting];
	const adminGuilds = [GuildIDEnum.Birthdayy, GuildIDEnum.BirthdayyTesting];
	const customGuild = [MAIN_DISCORD];
	if (isNotCustom) adminGuilds.push(GuildIDEnum.ChilliHQ);
	if (isDevelopment) return testingGuilds;
	switch (commandLevel) {
		case 'global':
			if (isCustom) return customGuild;
			return undefined;
		case 'testing':
			return testingGuilds;
		case 'premium': {
			if (isCustom) return customGuild;
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
