import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { inlineCode, type APIEmbedField } from 'discord.js';
import { APP_ENV, IS_CUSTOM_BOT, reply } from '../../helpers';
import { getCommandGuilds } from '../../helpers/utils/guilds';
import thinking from '../../lib/discord/thinking';
import type { EmbedInformationModel } from '../../lib/model/EmbedInformation.model';
import { generateDefaultEmbed } from '../../lib/utils/embed';
import { isProduction } from '../../lib/utils/env';

@ApplyOptions<Command.Options>({
	name: 'test',
	description: 'test things',
})
export class TestCommand extends Command {
	public override async registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(
			{
				name: this.name,
				description: this.description,
			},
			{
				guildIds: await getCommandGuilds('testing'),
			},
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const toggle = {
			cleanUp: false,
			displayStats: true,
			reminder: true,
			isCustomBotCheck: true,
			appEnv: true,
		};
		const fields: APIEmbedField[] = [{ name: 'test', value: 'Test Test' }];

		await thinking(interaction);

		if (true) await this.container.tasks.run('BirthdayReminderTask', {});
		if (toggle.cleanUp) await this.container.tasks.run('CleanDatabaseTask', {});
		if (toggle.displayStats) await this.container.tasks.run('DisplayStats', {});
		if (toggle.isCustomBotCheck) fields.push({ name: 'IsCustomBot?', value: inlineCode(String(IS_CUSTOM_BOT)) });
		if (toggle.appEnv) fields.push({ name: 'APP ENV', value: inlineCode(APP_ENV) });
		if (toggle.appEnv) fields.push({ name: 'isProduction', value: inlineCode(isProduction ? 'true' : 'false') });
		const testEmbedObj: EmbedInformationModel = { title: 'test', fields };
		const testEmbed = generateDefaultEmbed(testEmbedObj);

		return reply(interaction, { embeds: [testEmbed] });
	}
}
