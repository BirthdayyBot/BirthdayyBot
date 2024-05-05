import { BirthdayyCommand } from '#lib/structures';
import { BrandingColors } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry } from '@sapphire/framework';
import { applyDescriptionLocalizedBuilder, fetchT } from '@sapphire/plugin-i18next';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { EmbedBuilder } from 'discord.js';

@ApplyOptions<BirthdayyCommand.Options>({
	description: 'commands/system:supportDescription',
	requiredClientPermissions: [PermissionFlagsBits.EmbedLinks]
})
export class SupportCommand extends BirthdayyCommand {
	public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand((builder) =>
			applyDescriptionLocalizedBuilder(builder, this.description).setName('support').setDMPermission(true)
		);
	}

	public override async chatInputRun(interaction: BirthdayyCommand.Interaction) {
		const t = await fetchT(interaction);
		const embed = new EmbedBuilder()
			.setTitle(t('commands/system:supportEmbedTitle', { username: interaction.user.displayName }))
			.setDescription(t('commands/system:supportEmbedDescription'))
			.setColor(BrandingColors.Primary);

		return interaction.reply({ embeds: [embed] });
	}
}
