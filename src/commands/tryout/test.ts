import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { inlineCode, type APIEmbedField } from 'discord.js';
import { IS_CUSTOM_BOT } from '../../helpers';
import { reply } from '../../helpers/send/response';
import { getCommandGuilds } from '../../helpers/utils/guilds';
import thinking from '../../lib/discord/thinking';
import type { EmbedInformationModel } from '../../lib/model/EmbedInformation.model';
import { generateDefaultEmbed } from '../../lib/utils/embed';
import { isDevelopment } from '../../lib/utils/env';

@ApplyOptions<Command.Options>({
	name: 'test',
	description: 'test things',
})
export class TestCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		// Register slash command
		registry.registerChatInputCommand(
			{
				name: this.name,
				description: this.description,
			},
			{
				guildIds: getCommandGuilds('testing'),
			},
		);
	}

	// slash command
	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const toggle = {
			cleanUp: false,
			displayStats: true,
			reminder: true,
			isCustomBotCheck: true,
		};
		const fields: APIEmbedField[] = [{ name: 'test', value: 'Test Test' }];

		await thinking(interaction);

		if (isDevelopment && toggle.reminder) await this.container.tasks.run('BirthdayReminderTask', {});
		if (toggle.cleanUp) await this.container.tasks.run('CleanDatabaseTask', {});
		if (toggle.displayStats) await this.container.tasks.run('DisplayStats', {});
		if (toggle.isCustomBotCheck) fields.push({ name: 'IsCustomBot?', value: inlineCode(String(IS_CUSTOM_BOT)) });

		const testEmbedObj: EmbedInformationModel = { title: 'test', fields };
		const testEmbed = generateDefaultEmbed(testEmbedObj);

		return reply(interaction, { embeds: [testEmbed] });
	}
}
