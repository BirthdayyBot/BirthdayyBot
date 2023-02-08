import { NODE_ENV } from '../provide/environment';

export function getCommandGuilds(commandLevel: 'global' | 'testing' | 'premium' | 'admin'): string[] {
	if (NODE_ENV === 'development') return ['766707453994729532'];
	switch (commandLevel) {
		case 'global':
			return [];
		case 'testing':
			return ['766707453994729532'];
		case 'premium':
			//todo: retrieve premium guilds from db
			return [''];
		case 'admin':
			return ['934467365389893704', '766707453994729532'];
		default:
			return [];
	}
}
