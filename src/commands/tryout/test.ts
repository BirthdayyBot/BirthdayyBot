import thinking from '#lib/discord/thinking';
import { APP_ENV, generateDefaultEmbed, isCustom, isProduction, reply } from '#utils';
import { getCommandGuilds } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { inlineCode, type APIEmbedField } from 'discord.js';

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

		if (toggle.reminder && !isProduction) await this.container.tasks.run('BirthdayReminderTask', {});
		if (toggle.cleanUp) await this.container.tasks.run('CleanDatabaseTask', {});
		if (toggle.displayStats) await this.container.tasks.run('DisplayStats', {});
		if (toggle.isCustomBotCheck) fields.push({ name: 'IsCustomBot', value: inlineCode(String(isCustom)) });
		if (toggle.appEnv) fields.push({ name: 'APP ENV', value: inlineCode(APP_ENV) });
		if (toggle.appEnv) fields.push({ name: 'isProduction', value: inlineCode(isProduction ? 'true' : 'false') });

		return reply({ embeds: [generateDefaultEmbed({ title: 'test', fields })] });
	}
}
