import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { Result } from '@sapphire/result';
import { setDefaultConfig } from '../../../helpers/provide/config';
import { reply } from '../../../helpers/send/response';
import { type ConfigName, configNameExtended } from '../../../lib/database';
import thinking from '../../../lib/discord/thinking';
import { interactionProblem, interactionSuccess } from '../../../lib/utils/embed';

@RegisterSubCommand('config', (builder) =>
	builder
		.setName('reset')
		.setDescription('Reset settings from your server config')
		.addStringOption((option) =>
			option
				.setName('config')
				.setDescription('Config that you want to remove')
				.addChoices(
					{
						name: 'Announcement Channel',
						value: 'announcementChannel',
					},
					{
						name: 'Overview Channel',
						value: 'overviewChannel',
					},
					{
						name: 'Birthday Role',
						value: 'birthdayRole',
					},
					{
						name: 'Ping Role',
						value: 'birthdayPingRole',
					},
					{
						name: 'Announcement Message',
						value: 'announcementMessage',
					},
					// {
					// 	name: 'Logs',
					// 	value: 'logs'
					// }
				)
				.setRequired(true),
		),
)
export class ResetCommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		await thinking(interaction);
		const config = interaction.options.getString('config', true) as ConfigName;
		const configName = configNameExtended[config];

		const result = await Result.fromAsync(() => setDefaultConfig(config, interaction.guildId));

		if (result.isErr()) {
			return reply(
				interaction,
				interactionProblem(`An error occurred while trying to reset the ${configName} config.`),
			);
		}

		return reply(interaction, interactionSuccess(`Successfully reset the ${configName} config.`));
	}
}
