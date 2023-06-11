import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { reply } from '../../../helpers/send/response';
import thinking from '../../../lib/discord/thinking';
import { generateDefaultEmbed } from '../../../lib/utils/embed';

@RegisterSubCommand('blacklist', (builder) =>
	builder
		.setName('add')
		.setDescription('Add a user to the blacklist')
		.addUserOption((option) =>
			option.setName('user').setDescription('User to add to the blacklist').setRequired(true),
		),
)
export class AddCommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		await thinking(interaction);
		const blacklistUser = interaction.options.getUser('user', true);
		this.container.logger.info('AddCommand ~ overridechatInputRun ~ blacklistUser:', blacklistUser);

		return reply(interaction, {
			embeds: [
				generateDefaultEmbed({
					title: 'Blacklist Add',
					description: `Blacklisted users:`,
				}),
			],
		});
	}
}
