import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { generateDefaultEmbed } from '../../lib/utils/embed';
import { reply } from '../../helpers/send/response';
import { getCurrentOffset } from '../../helpers/utils/date';
import { getCommandGuilds } from '../../helpers/utils/guilds';
import thinking from '../../lib/discord/thinking';
import type { EmbedInformationModel } from '../../lib/model/EmbedInformation.model';
import { envIs } from '../../lib/utils/env';

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
		const current = getCurrentOffset();
		if (!current) {
			const embed = generateDefaultEmbed({ title: 'test', description: 'No current time' });
			return reply(interaction, { embeds: [embed] });
		}
		if (!envIs('APP_ENV', 'production')) await this.container.tasks.run('BirthdayReminderTask', {});
		const embedObj: EmbedInformationModel = { title: 'test', fields };
		const embed = generateDefaultEmbed(embedObj);
		return reply(interaction, { embeds: [embed] });
	}
}
