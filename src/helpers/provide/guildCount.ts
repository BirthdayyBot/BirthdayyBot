import { container } from '@sapphire/pieces';

export function getGuildCount() {
	return container.client.guilds.cache.size;
}
