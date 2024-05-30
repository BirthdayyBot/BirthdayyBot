import { getSupportedUserLanguageT } from '#lib/i18n/translate';
import { BirthdayyCommand } from '#lib/structures';
import { ConfigApplicationCommandMentions } from '#root/commands/Admin/config';
import { ClientColor } from '#utils/constants';
import { getActionRow, getDocumentationComponent, getInviteComponent } from '#utils/functions';
import { ApplicationCommandRegistry } from '@sapphire/framework';
import { applyDescriptionLocalizedBuilder, type TFunction } from '@sapphire/plugin-i18next';
import { envParseString } from '@skyra/env-utilities';
import { chatInputApplicationCommandMention, EmbedBuilder } from 'discord.js';

export class GuideCommand extends BirthdayyCommand {
	public override async registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand((builder) =>
			applyDescriptionLocalizedBuilder(builder, 'commands/general:guideDescription').setName(this.name)
		);
	}

	public override async chatInputRun(interaction: BirthdayyCommand.Interaction) {
		const t = getSupportedUserLanguageT(interaction);

		const embed = new EmbedBuilder()
			.setTitle(t('commands/general:guideEmbedTitle'))
			.setDescription(t('commands/general:guideEmbedDescription'))
			.setColor(ClientColor)
			.addFields(this.getStartedField(t), this.getConfigField(t), this.getImportantField(t));

		const components = this.getComponents(t);

		return interaction.reply({ embeds: [embed], components, ephemeral: true });
	}

	private getStartedField(t: TFunction) {
		const command = chatInputApplicationCommandMention('birthday', 'set', envParseString('COMMANDS_BIRTHDAY_ID'));
		return {
			name: t('commands/general:guideEmbedFieldsStartedTitle'),
			value: t('commands/general:guideEmbedFieldsStartedValue', { command })
		};
	}

	private getConfigField(t: TFunction) {
		const commandView = ConfigApplicationCommandMentions.View;
		const commandEdit = ConfigApplicationCommandMentions.Edit;
		return {
			name: t('commands/general:guideEmbedFieldsConfigTitle'),
			value: t('commands/general:guideEmbedFieldsConfigValue', { commandView, commandEdit })
		};
	}

	private getImportantField(t: TFunction) {
		return {
			name: t('commands/general:guideEmbedFieldsImportantTitle'),
			value: t('commands/general:guideEmbedFieldsImportantValue')
		};
	}

	private getComponents(t: TFunction) {
		return [
			getActionRow(
				getDocumentationComponent(t('commands/general:guideButtonDocumentation')),
				getInviteComponent(t('commands/general:guideButtonInvite'))
			)
		];
	}
}
