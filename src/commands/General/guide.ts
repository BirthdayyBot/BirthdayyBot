import { WebsiteUrl } from '#lib/components/button';
import { getSupportedUserLanguageT } from '#lib/i18n/translate';
import { BirthdayyCommand } from '#lib/structures';
import { ConfigApplicationCommandMentions } from '#root/commands/Admin/config';
import { BirthdayApplicationCommandMentions } from '#root/commands/Birthday/birthday';
import { BrandingColors, Emojis } from '#utils/constants';
import { defaultEmbed } from '#utils/embed';
import { CLIENT_NAME } from '#utils/environment';
import { ApplicationCommandRegistry, container } from '@sapphire/framework';
import { applyLocalizedBuilder, resolveKey, type Target, type TFunction } from '@sapphire/plugin-i18next';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';

export class GuideCommand extends BirthdayyCommand {
	public override async registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand((builder) =>
			applyLocalizedBuilder(builder, 'commands/guide:name', 'commands/guide:description').setDMPermission(true)
		);
	}

	public override async chatInputRun(interaction: BirthdayyCommand.Interaction) {
		const t = getSupportedUserLanguageT(interaction);

		const embed = new EmbedBuilder()
			.setTitle(t('commands/guide:embedTitle'))
			.setDescription(t('commands/guide:embedDescription'))
			.setColor(BrandingColors.Primary)
			.addFields(this.getStarted(t), this.getConfig(t), this.getImportant(t));

		const components = this.createComponents(t);

		return interaction.reply({ embeds: [embed], components, ephemeral: true });
	}

	private getStarted(t: TFunction) {
		const command = BirthdayApplicationCommandMentions.Set;
		return {
			name: t('commands/guide:embedFieldsStartedTitle'),
			value: t('commands/guide:embedFieldsStartedValue', { command })
		};
	}

	private getConfig(t: TFunction) {
		const commandView = ConfigApplicationCommandMentions.View;
		const commandEdit = ConfigApplicationCommandMentions.Edit;
		return {
			name: t('commands/guide:embedFieldsConfigTitle'),
			value: t('commands/guide:embedFieldsConfigValue', { commandView, commandEdit })
		};
	}

	private getImportant(t: TFunction) {
		return {
			name: t('commands/guide:embedFieldsImportantTitle'),
			value: t('commands/guide:embedFieldsImportantValue')
		};
	}

	private createComponents(t: TFunction) {
		return [
			new ActionRowBuilder<ButtonBuilder>().setComponents(
				new ButtonBuilder()
					.setLabel(t('commands/guide:buttonDocsLabel'))
					.setURL('https://birthdayy.xyz/docs')
					.setStyle(ButtonStyle.Link)
					.setEmoji(Emojis.Book),
				new ButtonBuilder()
					.setURL('https://join.birthdayy.xyz')
					.setLabel(t('commands/guide:buttonInviteLabel'))
					.setStyle(ButtonStyle.Link)
					.setEmoji(Emojis.People)
			)
		];
	}
}

export async function resolveEmbed(target: Target) {
	const embed = await resolveKey(target, 'commands/guide:embed', {
		returnObjects: true,
		emojis: {
			arrowRight: Emojis.ArrowRight,
			cake: Emojis.Cake,
			plus: Emojis.Plus,
			exclamation: Emojis.Exclamation,
			heart: Emojis.Heart
		},
		command: {
			set: BirthdayApplicationCommandMentions.Set,
			list: ConfigApplicationCommandMentions.View
		},
		vote: WebsiteUrl('vote'),
		invite: WebsiteUrl('invite'),
		premium: WebsiteUrl('premium'),
		quickstart: WebsiteUrl('docs/quickstart'),
		name: CLIENT_NAME || container.client.user!.username
	});
	return [new EmbedBuilder({ ...defaultEmbed(), ...embed })];
}
