import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { RESTJSONErrorCodes } from 'discord-api-types/v9';
import { bold, DiscordAPIError, inlineCode } from 'discord.js';
import { getCommandGuilds } from '../../helpers';
import { reply } from '../../helpers/send/response';
import { interactionProblem, success } from '../../lib/utils/embed';
import { isNotCustom } from '../../lib/utils/env';
import { fromDiscordAPIError } from '../../lib/utils/ErrorLogger';

@ApplyOptions<Command.Options>({
	name: 'toggle-premium',
	description: 'Toggle premium status for a guild',
	enabled: isNotCustom,
	preconditions: ['AdminOnly'],
	requiredUserPermissions: ['ViewChannel'],
	requiredClientPermissions: ['SendMessages'],
})
export class TogglePremiumCommand extends Command {
	public override async registerApplicationCommands(registry: Command.Registry) {
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
				guildIds: await getCommandGuilds('admin'),
			},
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction<'cached'>) {
		const toggle = interaction.options.getBoolean('toggle', true);
		const guildId = interaction.options.getString('guild-id', true);

		// Validate guild ID format (should be numeric snowflake)
		if (!/^\d{15,21}$/.test(guildId)) {
			return reply(interaction, interactionProblem(`Invalid guild ID format ${inlineCode(guildId)}`, true));
		}

		await interaction.deferReply();

		let guild;

		try {
			guild = await interaction.client.guilds.fetch(guildId);
		} catch (error) {
			if (error instanceof DiscordAPIError && error.code === RESTJSONErrorCodes.UnknownGuild) {
				return reply(interaction, interactionProblem(`Guild ${inlineCode(guildId)} not found`, true));
			}

			const discordError = fromDiscordAPIError(error as DiscordAPIError, { guildId });
			this.container.errorLogger.handle(discordError, {
				logSeverity: 'warn',
				guildId,
			});
			return reply(interaction, interactionProblem(`Failed to fetch guild ${inlineCode(guildId)}`, true));
		}

		try {
			// Set premium for guild to toggle
			await this.container.utilities.guild.set.Premium(guildId, toggle);

			// Log the action
			this.container.logger.info(
				`[ADMIN] Premium toggled for guild ${guild.name} (${guildId}): ${String(toggle)}`,
			);

			return reply(interaction, {
				embeds: [
					success(
						`Premium toggled for guild ${bold(guild.name)} [${inlineCode(guildId)}] to ${bold(
							toggle ? '✅ Enabled' : '❌ Disabled',
						)}`,
					),
				],
			});
		} catch (error) {
			const dbError = error instanceof Error ? error : new Error('Unknown error');
			this.container.errorLogger.handle(dbError, {
				logSeverity: 'error',
				guildId,
			});
			return reply(
				interaction,
				interactionProblem(`Failed to update premium status for guild ${inlineCode(guildId)}`, true),
			);
		}
	}
}
