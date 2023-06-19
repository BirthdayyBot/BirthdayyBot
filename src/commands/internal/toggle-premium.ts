import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { bold, inlineCode } from 'discord.js';
import { getCommandGuilds } from '../../helpers';
import { reply } from '../../helpers/send/response';
import { getGuildInformation } from '../../lib/discord';
import thinking from '../../lib/discord/thinking';
import { generateDefaultEmbed, interactionProblem } from '../../lib/utils/embed';

@ApplyOptions<Command.Options>({
	name: 'toggle-premium',
	description: 'The current count of Guilds, Birthdays and Users',
	enabled: true,
	preconditions: [['DMOnly', 'GuildTextOnly'], 'AdminOnly' /* any other preconditions here */],
	requiredUserPermissions: ['ViewChannel'],
	requiredClientPermissions: ['SendMessages'],
})
export class TogglePremiumCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName(this.name)
					.setDescription(this.description)
					.addStringOption((option) =>
						option
							.setName('guild-id')
							.setDescription('The guild id to toggle premium for')
							.setRequired(true),
					)
					.addBooleanOption((option) =>
						option.setName('toggle').setDescription('The toggle value').setRequired(true),
					),
			{
				guildIds: getCommandGuilds('admin'),
			},
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const toggle = interaction.options.getBoolean('toggle', true);
		const guildId = interaction.options.getString('guild-id', true);
		// check if guild exists if not send error message
		const guild = await getGuildInformation(guildId);
		await thinking(interaction, true);
		if (!guild) {
			return reply(interaction, interactionProblem(`Guild ${inlineCode(guildId)} not found`, true));
		}
		// set premium for guild to toggle
		await this.container.utilities.guild.set.Premium(guildId, toggle);
		return reply(interaction, {
			embeds: [
				generateDefaultEmbed({
					title: 'Toggle Premium',
					description: `Toggled premium for guild ${bold(guild.name)} [${inlineCode(
						guildId,
					)}] to ${inlineCode(toggle.toString())}`,
				}),
			],
		});
	}
}
