import { GuildIDEnum } from '../../lib/enum/GuildID.enum';
import { APP_ENV } from '../provide/environment';

export function getCommandGuilds(commandLevel: 'global' | 'testing' | 'premium' | 'admin'): string[] {
	if (APP_ENV !== 'prd') return [GuildIDEnum.CHILLI_HQ];
	switch (commandLevel) {
		case 'global':
			return [];
		case 'testing':
			return [GuildIDEnum.CHILLI_HQ];
		case 'premium':
			//todo: retrieve premium guilds from db
			return [''];
		case 'admin':
			return [GuildIDEnum.CHILLI_HQ, GuildIDEnum.BIRTHDAYY_HQ];
		default:
			return [];
	}
}
