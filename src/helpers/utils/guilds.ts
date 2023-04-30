import { GuildIDEnum } from '../../lib/enum/GuildID.enum';
import { envIs } from '../../lib/utils/env';

export function getCommandGuilds(commandLevel: 'global' | 'testing' | 'premium' | 'admin'): string[] {
	const testingGuilds = [GuildIDEnum.CHILLI_HQ, GuildIDEnum.CHILLI_ATTACK_V2, GuildIDEnum.BIRTHDAYY_TESTING];
	const adminGuilds = [GuildIDEnum.CHILLI_HQ, GuildIDEnum.BIRTHDAYY_HQ];
	if (!envIs('APP_ENV', 'production')) return testingGuilds;
	switch (commandLevel) {
		case 'global':
			return [];
		case 'testing':
			return testingGuilds;
		case 'premium':
			// todo: retrieve premium guilds from db
			return [''];
		case 'admin':
			return adminGuilds;
		default:
			return [];
	}
}
