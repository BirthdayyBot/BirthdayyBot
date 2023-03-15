import { container } from '@sapphire/framework';

export default function getGuildCount() {
	return container.client.guilds.cache.size;
}
