import { ApplyOptions } from '@sapphire/decorators';
import { container } from '@sapphire/framework';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import dayjs from 'dayjs';
import { inlineCode } from 'discord.js';
import generateEmbed from '../helpers/generate/embed';
import { BOT_ADMIN_LOG, isNotDev, isPrd } from '../helpers/provide/environment';
import { sendMessage } from '../lib/discord';

@ApplyOptions<ScheduledTask.Options>({ name: 'CleanDatabaseTask', pattern: '0 0 * * *', enabled: isNotDev })
export class CleanDatabaseTask extends ScheduledTask {
	public async run() {
		this.container.logger.debug('[CleaningTask] Started');
		const oneDayAgo = dayjs().subtract(1, 'day').toDate();

		// Delete all guilds and birthdays that are disabled and haven't been updated in the last 24 hours
		let deletedBirthdays;
		let deletedGuilds;
		if (isPrd) {
			const res = await container.utilities.guild.get.ByLastUpdatedDisabled(oneDayAgo);
			deletedBirthdays = res.deletedBirthdays;
			deletedGuilds = res.deletedGuilds;
		} else {
			const res = await container.utilities.guild.delete.ByLastUpdatedDisabled(oneDayAgo);
			deletedBirthdays = res.deletedBirthdays;
			deletedGuilds = res.deletedGuilds;
		}
		await sendMessage(BOT_ADMIN_LOG, {
			embeds: [
				generateEmbed({
					title: `CleanUp Report${isPrd ? `(SELECT)` : ' (DELETE)'}`,
					description: '',
					fields: [
						{ name: 'Deleted Guilds', value: inlineCode(deletedGuilds.toString()), inline: true },
						{
							name: 'Deleted Birthdays',
							value: inlineCode(deletedBirthdays.toString()),
							inline: true,
						},
					],
				}),
			],
		});

		this.container.logger.info(`[CleaningTask] Deleted ${deletedGuilds} guilds and ${deletedBirthdays} birthdays`);

		this.container.logger.debug('[CleaningTask] Done');
	}
}
