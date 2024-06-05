import { getSupportedUserLanguageT } from '#lib/i18n/translate';
import { BirthdayyCommand } from '#lib/structures';
import { ClientColor } from '#utils/constants';
import { ApplicationCommandRegistry } from '@sapphire/framework';
import { applyDescriptionLocalizedBuilder } from '@sapphire/plugin-i18next';
import { EmbedBuilder } from 'discord.js';

export class VoteCommand extends BirthdayyCommand {
	public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand((builder) => {
			return applyDescriptionLocalizedBuilder(builder, 'commands/vote:voteDescription').setName('vote');
		});
	}

	public override async chatInputRun(interaction: BirthdayyCommand.Interaction) {
		const t = getSupportedUserLanguageT(interaction);
		const embed = new EmbedBuilder()
			.setAuthor({ name: t('commands/vote:embedTitle'), iconURL: interaction.client.user.displayAvatarURL() })
			.setDescription(t('commands/vote:embedDescription'))
			.setColor(ClientColor)
			.setFooter({ text: interaction.client.user.username })
			.setTimestamp();

		return interaction.reply({ embeds: [embed] });
	}
}
