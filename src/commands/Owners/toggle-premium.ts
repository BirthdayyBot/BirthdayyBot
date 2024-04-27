import { BirthdayyCommand } from '#lib/structures';
import { PermissionLevels } from '#lib/types/Enums';
import { BrandingColors } from '#utils/constants';
import { isCustom } from '#utils/env';
import { resolveOnErrorCodesDiscord } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry } from '@sapphire/framework';
import { envParseString } from '@skyra/env-utilities';
import { EmbedBuilder, RESTJSONErrorCodes, inlineCode } from 'discord.js';

@ApplyOptions<BirthdayyCommand.Options>({
	description: 'The current count of Guilds, Birthdays and Users',
	enabled: !isCustom,
	name: 'toggle-premium',
	permissionLevel: PermissionLevels.Administrator
})
export class TogglePremiumCommand extends BirthdayyCommand {
	public override async chatInputRun(interaction: BirthdayyCommand.Interaction) {
		const toggle = interaction.options.getBoolean('toggle', true);
		const guildId = interaction.options.getString('guild-id', true);
		// check if guild exists if not send error message
		const guild = await resolveOnErrorCodesDiscord(this.container.client.guilds.fetch(guildId), RESTJSONErrorCodes.UnknownGuild);
		if (!guild) return interaction.reply(`Guild ${inlineCode(guildId)} not found`);

		// set premium for guild to toggle
		await this.container.prisma.guild.update({
			where: { id: guildId },
			data: { premium: toggle }
		});

		const embed = new EmbedBuilder() //
			.setColor(BrandingColors.Primary)
			.setDescription('This premium has been');
		return interaction.reply({
			embeds: [embed]
		});
	}

	public override async registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName(this.name)
					.setDescription(this.description)
					.addStringOption((option) => option.setName('guild-id').setDescription('The guild id to toggle premium for').setRequired(true))
					.addBooleanOption((option) => option.setName('toggle').setDescription('The toggle value').setRequired(true)),
			{
				guildIds: [envParseString('CLIENT_MAIN_GUILD')]
			}
		);
	}
}
