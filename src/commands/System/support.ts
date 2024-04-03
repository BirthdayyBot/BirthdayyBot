import { CustomCommand } from '#lib/structures/commands/CustomCommand';
import { DEFAULT_REQUIRED_CLIENT_PERMISSIONS } from '#lib/structures/commands/utils.js';
import { BrandingColors } from '#utils';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { applyDescriptionLocalizedBuilder, fetchT } from '@sapphire/plugin-i18next';
import { EmbedBuilder } from 'discord.js';

@ApplyOptions<CustomCommand.Options>({
	name: 'support',
	description: 'commands/system:supportDescription',
	requiredClientPermissions: DEFAULT_REQUIRED_CLIENT_PERMISSIONS,
})
export class SupportCommand extends CustomCommand {
	public override registerApplicationCommands(registry: CustomCommand.Registry) {
		registry.registerChatInputCommand((builder) =>
			applyDescriptionLocalizedBuilder(builder, this.description).setName('support').setDMPermission(true),
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const t = await fetchT(interaction);
		const embed = new EmbedBuilder()
			.setTitle(t('commands/system:supportEmbedTitle', { username: interaction.user.displayName }))
			.setDescription(t('commands/system:supportEmbedDescription'))
			.setColor(BrandingColors.Primary);

		return interaction.reply({ embeds: [embed] });
	}
}
