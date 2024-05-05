import { WebsiteUrl, docsButtonBuilder, inviteSupportDiscordButton } from '#lib/components/button';
import { BirthdayyCommand } from '#lib/structures';
import { ConfigApplicationCommandMentions } from '#root/commands/Admin/config';
import { BirthdayApplicationCommandMentions } from '#root/commands/Birthday/birthday';
import { Emojis } from '#utils/constants';
import { defaultEmbed } from '#utils/embed';
import { CLIENT_NAME } from '#utils/environment';
import { ApplicationCommandRegistry, container } from '@sapphire/framework';
import { applyLocalizedBuilder, resolveKey, type Target } from '@sapphire/plugin-i18next';
import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from 'discord.js';

export class GuideCommand extends BirthdayyCommand {
	public override async registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand((builder) =>
			applyLocalizedBuilder(builder, 'commands/guide:guide').setDMPermission(true)
		);
	}

	public override async chatInputRun(interaction: BirthdayyCommand.Interaction) {
		const components = [
			new ActionRowBuilder<ButtonBuilder>().setComponents(
				await docsButtonBuilder(interaction),
				await inviteSupportDiscordButton(interaction)
			)
		];
		const embeds = await resolveEmbed(interaction);

		return interaction.reply({ embeds, components, ephemeral: true });
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
