import { container } from '@sapphire/pieces';

export default function getGuildCount() {
	return container.client.guilds.cache.size;
}
