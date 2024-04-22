import thinking from '#lib/discord/thinking';
import { BirthdayyCommand } from '#lib/structures';
import { BrandingColors } from '#lib/utils/constants';
import { ApplicationCommandRegistry } from '@sapphire/framework';
import { applyLocalizedBuilder, fetchT, TFunction } from '@sapphire/plugin-i18next';
import { EmbedBuilder } from 'discord.js';

export class UserCommand extends BirthdayyCommand {
	public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand(
			(builder) => {
				return applyLocalizedBuilder(builder, 'commands/tools:voteName', 'commands/tools:voteDescription');
			},
			{ guildIds: [this.getGlobalCommandId()] }
		);
	}

	public override async chatInputRun(interaction: BirthdayyCommand.Interaction) {
		await thinking(interaction);
		const t = await fetchT(interaction);
		const embed = this.buildEmbed(t);
		return interaction.editReply({ embeds: [embed] });
	}

	private buildEmbed(t: TFunction) {
		return new EmbedBuilder()
			.setTitle(t('commands/tools:voteEmbedTitle'))
			.setDescription(t('commands/tools:voteEmbedDescription'))
			.setColor(BrandingColors.Primary);
	}
}
