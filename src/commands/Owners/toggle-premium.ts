import { BirthdayyCommand } from '#lib/structures';
import { PermissionLevels } from '#lib/types/Enums';
import { getCommandGuilds, resolveOnErrorCodesDiscord } from '#utils/functions';
import { reply } from '#utils/utils.js';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry } from '@sapphire/framework';
import { RESTJSONErrorCodes, inlineCode, EmbedBuilder } from 'discord.js';
import { isNotCustom } from '#utils/env';
import { BrandingColors } from '#utils/constants';

@ApplyOptions<BirthdayyCommand.Options>({
	name: 'toggle-premium',
	description: 'The current count of Guilds, Birthdays and Users',
	enabled: isNotCustom,
	permissionLevel: PermissionLevels.Administrator
})
export class TogglePremiumCommand extends BirthdayyCommand {
	public override async registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName(this.name)
					.setDescription(this.description)
					.addStringOption((option) => option.setName('guild-id').setDescription('The guild id to toggle premium for').setRequired(true))
					.addBooleanOption((option) => option.setName('toggle').setDescription('The toggle value').setRequired(true)),
			{
				guildIds: await getCommandGuilds('admin')
			}
		);
	}

	public override async chatInputRun(interaction: BirthdayyCommand.Interaction) {
		const toggle = interaction.options.getBoolean('toggle', true);
		const guildId = interaction.options.getString('guild-id', true);
		// check if guild exists if not send error message
		const guild = await resolveOnErrorCodesDiscord(this.container.client.guilds.fetch(guildId), RESTJSONErrorCodes.UnknownGuild);
		if (!guild) return reply(interaction, `Guild ${inlineCode(guildId)} not found`);

		// set premium for guild to toggle
		await this.container.utilities.guild.set.Premium(guildId, toggle);
		const embed = new EmbedBuilder() //
			.setColor(BrandingColors.Primary)
			.setDescription('This premium has been');
		return reply(interaction, {
			embeds: [embed]
		});
	}
}
