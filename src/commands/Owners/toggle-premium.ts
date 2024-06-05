import { BirthdayyCommand } from '#lib/structures';
import { PermissionLevels } from '#lib/types/Enums';
import { interactionProblem, interactionSuccess } from '#utils/embed';
import { isNotCustom as enabled } from '#utils/env';
import { resolveOnErrorCodesDiscord } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry } from '@sapphire/framework';
import { RESTJSONErrorCodes } from 'discord.js';

@ApplyOptions<BirthdayyCommand.Options>({ enabled, permissionLevel: PermissionLevels.BotOwner })
export class TogglePremiumCommand extends BirthdayyCommand {
	public override async registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName('toggle-premium')
				.setDescription('Toggle premium status')
				.addStringOption((option) =>
					option.setName('guild-id').setDescription('The ID of the guild').setRequired(true)
				)
				.addBooleanOption((option) =>
					option.setName('toggle').setDescription('Toggle premium status').setRequired(true)
				)
		);
	}

	public override async chatInputRun(interaction: BirthdayyCommand.Interaction) {
		const toggle = interaction.options.getBoolean('toggle', true);
		const guildId = interaction.options.getString('guild-id', true);

		const guild = await resolveOnErrorCodesDiscord(
			this.container.client.guilds.fetch(guildId),
			RESTJSONErrorCodes.UnknownGuild
		);
		if (!guild) return interaction.reply(interactionProblem(`Guild with id \`${guildId}\` not found`));

		await this.container.utilities.guild.set.Premium(guildId, toggle);
		const content = `Premium status for guild **${guildId}** (\`${guild.name}\`) has been **${toggle ? 'enabled' : 'disabled'}**.`;
		return interaction.reply(interactionSuccess(content));
	}
}
