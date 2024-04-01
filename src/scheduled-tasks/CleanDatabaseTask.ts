import { sendMessage } from '#lib/discord/message';
import { generateDefaultEmbed } from '#utils/embed';
import { isProduction } from '#utils/env';
import { BOT_ADMIN_LOG } from '#utils/environment';
import { ApplyOptions } from '@sapphire/decorators';
import { container } from '@sapphire/framework';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { envParseBoolean } from '@skyra/env-utilities';
import dayjs from 'dayjs';
import { inlineCode } from 'discord.js';

@ApplyOptions<ScheduledTask.Options>({
	name: 'CleanDatabaseTask',
	pattern: '30 0 * * *',
	enabled: isProduction,
})
export class CleanDatabaseTask extends ScheduledTask {
	public async run() {
		if (envParseBoolean('CUSTOM_BOT', false)) return;
		container.logger.debug('[CleaningTask] Started');
		const oneDayAgo = dayjs().subtract(1, 'day').toDate();

		const req = await container.utilities.guild.delete.ByLastUpdatedDisabled(oneDayAgo);
		const { deletedBirthdays, deletedGuilds } = req;

		await sendMessage(BOT_ADMIN_LOG, {
			embeds: [
				generateDefaultEmbed({
					title: `CleanUp Report (DELETE)`,
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

		container.logger.info(`[CleaningTask] Deleted ${deletedGuilds} guilds and ${deletedBirthdays} birthdays`);

		container.logger.debug('[CleaningTask] Done');
	}
}
