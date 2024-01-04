import { GuildIDEnum } from '#lib/enum/GuildID.enum';
import { isNotCustom, isDevelopment, isCustom } from '#lib/utils/env';
import type { Guild } from '@prisma/client';
import { container } from '@sapphire/framework';
import { MAIN_DISCORD } from '../index.js';

export async function getCommandGuilds(commandLevel: 'global' | 'testing' | 'premium' | 'admin'): Promise<string[] | undefined> {
	const testingGuilds = [GuildIDEnum.CHILLI_HQ, GuildIDEnum.CHILLI_ATTACK_V2, GuildIDEnum.BIRTHDAYY_TESTING];
	const adminGuilds = [GuildIDEnum.BIRTHDAYY_HQ, GuildIDEnum.BIRTHDAYY_TESTING];
	const customGuild = [MAIN_DISCORD];
	if (isNotCustom) adminGuilds.push(GuildIDEnum.CHILLI_HQ);
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
