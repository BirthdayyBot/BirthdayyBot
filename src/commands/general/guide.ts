import { WebsiteUrl, docsButtonBuilder, inviteSupportDicordButton } from '#lib/components/button';
import { CustomCommand } from '#lib/structures/commands/CustomCommand';
import { defaultUserPermissions } from '#lib/types/permissions';
import { BirthdayApplicationCommandMentions } from '#root/commands/general/birthday';
import { ConfigApplicationCommandMentions } from '#root/commands/general/config';
import { BOT_NAME, Emojis, defaultEmbed } from '#utils';
import { applyLocalizedBuilder, resolveKey } from '@sapphire/plugin-i18next';
import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, type APIEmbed } from 'discord.js';

export class GuideCommand extends CustomCommand {
	public override async registerApplicationCommands(registry: CustomCommand.Registry) {
		registry.registerChatInputCommand((builder) =>
			applyLocalizedBuilder(builder, 'commands/guide:guide')
				.setDefaultMemberPermissions(defaultUserPermissions.bitfield)
				.setDMPermission(true),
		);
	}

	public override async chatInputRun(interaction: CustomCommand.ChatInputCommandInteraction) {
		const components = [
			new ActionRowBuilder<ButtonBuilder>().setComponents(
				await docsButtonBuilder(interaction),
				await inviteSupportDicordButton(interaction),
			),
		];
		const embeds = await this.resolveEmbed(interaction);

		return interaction.reply({ embeds, components, ephemeral: true });
	}

	private async resolveEmbed(interaction: CustomCommand.ChatInputCommandInteraction) {
		const embed = await resolveKey<APIEmbed>(interaction, 'commands/guide:embed', {
			returnObjects: true,
			emojis: {
				arrowRight: Emojis.ArrowRight,
				cake: Emojis.Cake,
				plus: Emojis.Plus,
				exclamation: Emojis.Exclamation,
				heart: Emojis.Heart,
			},
			command: {
				set: BirthdayApplicationCommandMentions.Set,
				list: ConfigApplicationCommandMentions.List,
			},
			vote: WebsiteUrl('vote'),
			invite: WebsiteUrl('invite'),
			premium: WebsiteUrl('premium'),
			quickstart: WebsiteUrl('docs/quickstart'),
			name: BOT_NAME || interaction.client.user.username,
		});
		return [new EmbedBuilder({ ...defaultEmbed(), ...embed })];
	}
}
