import { WebsiteUrl, docsButtonBuilder, inviteSupportDicordButton } from '#lib/components/button';
import { defaultEmbed } from '#lib/utils/embed';
import { BirthdayyEmojis } from '#lib/utils/environment';
import { reply } from '#lib/utils/utils';
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
				emoji: BirthdayyEmojis.Compass,
			}),
			resolveKey(interaction, 'commands/support:invite.description', {
				support: WebsiteUrl('discord'),
				docs: WebsiteUrl('docs'),
				arrow: BirthdayyEmojis.ArrowRight,
				link: BirthdayyEmojis.Link,
			}),
		]);

		const embed = new EmbedBuilder(defaultEmbed()).setTitle(title).setDescription(description);
		const components = new ActionRowBuilder<ButtonBuilder>().setComponents([
			await inviteSupportDicordButton(interaction),
			await docsButtonBuilder(interaction),
		]);

		return reply(interaction, {
			embeds: [embed],
			components: [components],
		});
	}
}
