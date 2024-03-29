import { WebsiteUrl, docsButtonBuilder, inviteSupportDicordButton } from '#lib/components/button';
import { CustomCommand } from '#lib/structures/commands/CustomCommand';
import { BirthdayApplicationCommandMentions } from '#root/commands/Birthday/birthday';
import { ConfigApplicationCommandMentions } from '#root/commands/Admin/config';
import { CLIENT_NAME, Emojis, defaultEmbed } from '#utils';
import { container } from '@sapphire/framework';
import { applyLocalizedBuilder, resolveKey, type Target } from '@sapphire/plugin-i18next';
import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from 'discord.js';

export class GuideCommand extends CustomCommand {
	public override async registerApplicationCommands(registry: CustomCommand.Registry) {
		registry.registerChatInputCommand((builder) =>
			applyLocalizedBuilder(builder, 'commands/guide:guide').setDMPermission(true),
		);
	}

	public override async chatInputRun(interaction: CustomCommand.ChatInputCommandInteraction) {
		const components = [
			new ActionRowBuilder<ButtonBuilder>().setComponents(
				await docsButtonBuilder(interaction),
				await inviteSupportDicordButton(interaction),
			),
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
			heart: Emojis.Heart,
		},
		command: {
			set: BirthdayApplicationCommandMentions.Set,
			list: ConfigApplicationCommandMentions.View,
		},
		vote: WebsiteUrl('vote'),
		invite: WebsiteUrl('invite'),
		premium: WebsiteUrl('premium'),
		quickstart: WebsiteUrl('docs/quickstart'),
		name: CLIENT_NAME || container.client.user!.username,
	});
	return [new EmbedBuilder({ ...defaultEmbed(), ...embed })];
}
