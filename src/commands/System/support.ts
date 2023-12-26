import { WebsiteUrl, docsButtonBuilder, inviteSupportDicordButton } from '#lib/components/button';
import { CustomCommand } from '#lib/structures/commands/CustomCommand';
import { Emojis, defaultEmbed } from '#utils';
import { Command } from '@sapphire/framework';
import { applyLocalizedBuilder, resolveKey } from '@sapphire/plugin-i18next';
import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from 'discord.js';

export class SupportCommand extends CustomCommand {
	public override registerApplicationCommands(registry: CustomCommand.Registry) {
		registry.registerChatInputCommand((builder) =>
			applyLocalizedBuilder(builder, 'commands/support:support').setDMPermission(true),
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const embed = await resolveKey(interaction, 'commands/support:supportEmbed', {
			returnObjects: true,
			support: WebsiteUrl('discord'),
			docs: WebsiteUrl('docs'),
			arrow: Emojis.ArrowRight,
			link: Emojis.Link,
			emoji: Emojis.Compass,
		});

		const embeds = [new EmbedBuilder({ ...defaultEmbed(), ...embed })];
		const components = [
			new ActionRowBuilder<ButtonBuilder>().setComponents(
				await inviteSupportDicordButton(interaction),
				await docsButtonBuilder(interaction),
			),
		];

		return interaction.reply({ embeds, components });
	}
}
