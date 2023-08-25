import { WebsiteUrl, docsButtonBuilder, inviteSupportDicordButton } from '#lib/components/button';
import { Emojis, defaultEmbed, reply } from '#utils';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { applyLocalizedBuilder, resolveKey } from '@sapphire/plugin-i18next';
import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

@ApplyOptions<Command.Options>({
	name: 'support',
	requiredUserPermissions: ['ViewChannel', 'UseApplicationCommands', 'SendMessages'],
	requiredClientPermissions: ['SendMessages', 'EmbedLinks', 'UseExternalEmojis'],
})
export class SupportCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			applyLocalizedBuilder(builder, 'commands/support:support')
				.setDefaultMemberPermissions(PermissionFlagsBits.ViewChannel)
				.setDMPermission(true),
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const [title, description] = await Promise.all([
			resolveKey(interaction, 'commands/support:invite.title', {
				emoji: Emojis.Compass,
			}),
			resolveKey(interaction, 'commands/support:invite.description', {
				support: WebsiteUrl('discord'),
				docs: WebsiteUrl('docs'),
				arrow: Emojis.ArrowRight,
				link: Emojis.Link,
			}),
		]);

		const embed = new EmbedBuilder(defaultEmbed()).setTitle(title).setDescription(description);
		const components = new ActionRowBuilder<ButtonBuilder>().setComponents([
			await inviteSupportDicordButton(interaction),
			await docsButtonBuilder(interaction),
		]);

		return reply({
			embeds: [embed],
			components: [components],
		});
	}
}
