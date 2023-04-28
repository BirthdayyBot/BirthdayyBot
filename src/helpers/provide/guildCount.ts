import { container } from '@sapphire/pieces';

export default function getGuildCount(): number {
	return container.client.guilds.cache.size;
}
