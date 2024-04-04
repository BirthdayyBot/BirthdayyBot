import thinking from '#lib/discord/thinking';
import { CustomCommand } from '#lib/structures/commands/CustomCommand';
import { BrandingColors } from '#lib/utils/constants';
import { applyLocalizedBuilder, fetchT, TFunction } from '@sapphire/plugin-i18next';
import { EmbedBuilder } from 'discord.js';

export class VoteCommand extends CustomCommand {
	public override registerApplicationCommands(registry: CustomCommand.Registry) {
		registry.registerChatInputCommand(
			(builder) => {
				return applyLocalizedBuilder(builder, 'commands/tools:voteName', 'commands/tools:voteDescription');
			},
			{ guildIds: ['980559116076470272'] },
		);
	}

	public override async chatInputRun(interaction: CustomCommand.ChatInputCommandInteraction) {
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
