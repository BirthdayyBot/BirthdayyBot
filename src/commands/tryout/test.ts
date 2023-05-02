import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { codeBlock } from '@sapphire/utilities';
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
		await thinking(interaction);
		const fields = [{ name: 'test', value: 'Test Test' }];
		if (isDevelopment) await this.container.tasks.run('BirthdayReminderTask', {});
		const testEmbedObj: EmbedInformationModel = { title: 'test', fields };
		const testEmbed = generateDefaultEmbed(testEmbedObj);

		const cleanReq = await this.container.tasks.run('CleanDatabaseTask', {});

		this.container.logger.info('TestCommand ~ overridechatInputRun ~ cleanReq:', cleanReq);
		const cleaningEmbed = generateDefaultEmbed({
			title: 'CleanUp Report (DELETE)',
			description: codeBlock('js', JSON.stringify(cleanReq, null, 2)),
		});

		return reply(interaction, { embeds: [testEmbed, cleaningEmbed] });
	}
}
