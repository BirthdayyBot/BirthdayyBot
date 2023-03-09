import { container } from '@sapphire/framework';
import type { Guild } from 'discord.js';

export async function getGuildInformation(guild_id: string): Promise<Guild | null> {
    try {
        const guild: Guild | undefined = await container.client.guilds.fetch(guild_id);
        return guild;
    } catch (error) {
        container.logger.error(`Error fetching guild with id ${guild_id}: ${error}`);
        return null;
    }
}
