import { ApplyOptions } from '@sapphire/decorators';
import { container } from '@sapphire/framework';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { type Snowflake } from 'discord.js';

@ApplyOptions<ScheduledTask.Options>({
	name: 'deleteGuild',
	customJobOptions: { removeOnComplete: true },
})
export class UserTask extends ScheduledTask {
	public async run(guildId: Snowflake) {
		const guild = await container.client.guilds.fetch({ guild: guildId, force: true }).catch(() => null);

		if (!guild) {
			await container.prisma.guild.delete({ where: { id: guildId } });
			await container.prisma.birthday.deleteMany({ where: { guildId } });
			container.client.guilds.cache.delete(guildId);
			return container.logger.info(`[ScheduledTask] Deleted the guild ${guildId}`);
		}

		return container.logger.info(`[ScheduledTask] Guild ${guildId} was not deleted`);
	}
}

declare module '@sapphire/plugin-scheduled-tasks' {
	interface ScheduledTasks {
		deleteGuild: Snowflake;
	}
}
