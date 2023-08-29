import { WebsiteUrl, docsButtonBuilder, inviteSupportDicordButton } from '#lib/components/button';
import { defaultClientPermissions, defaultUserPermissions } from '#lib/types/permissions';
import { BOT_NAME, Emojis, defaultEmbed, reply } from '#utils';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { applyLocalizedBuilder, resolveKey, type Target } from '@sapphire/plugin-i18next';
import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, type APIEmbedField } from 'discord.js';
import { BirthdayApplicationCommandMentions } from './birthday/birthday.js';
import { ConfigApplicationCommandMentions } from './config/config.js';

@ApplyOptions<Command.Options>({
	requiredUserPermissions: defaultUserPermissions,
	requiredClientPermissions: defaultClientPermissions,
})
export class GuideCommand extends Command {
	public override async registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			applyLocalizedBuilder(builder, 'commands/guide:guide')
				.setDefaultMemberPermissions(defaultUserPermissions.bitfield)
				.setDMPermission(true),
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const components = new ActionRowBuilder<ButtonBuilder>().setComponents(
			await docsButtonBuilder(interaction),
			await inviteSupportDicordButton(interaction),
		);

		await reply(interaction, {
			embeds: [await parseGuildEmbed(interaction)],
			components: [components],
		});
	}
}

export async function parseGuildEmbed(interaction: Target) {
	return new EmbedBuilder(defaultEmbed())
		.setTitle(
			await resolveKey(interaction, 'commands/guide:embedTitle', {
				name: BOT_NAME || interaction.client.user.username,
				emoji: Emojis.Heart,
			}),
		)
		.setDescription(await resolveKey(interaction, 'commands/guide:embedDescription', { emoji: Emojis.ArrowRight }))
		.setFields(
			await parseEmbedFields(interaction, 'commands/guide:embedStartedField', {
				command: BirthdayApplicationCommandMentions.Register,
				emoji: Emojis.Exclamation,
				url: WebsiteUrl('docs/quickstart'),
			}),
			await parseEmbedFields(interaction, 'commands/guide:embedConfigField', {
				command: ConfigApplicationCommandMentions.List,
				emoji: Emojis.Exclamation,
			}),
			await parseEmbedFields(interaction, 'commands/guide:embedImportantField', {
				command: ConfigApplicationCommandMentions.List,
				emojis: {
					arrowRight: Emojis.ArrowRight,
					cake: Emojis.Cake,
					plus: Emojis.Plus,
					exclamation: Emojis.Exclamation,
					heart: Emojis.Heart,
				},
				vote: WebsiteUrl('vote'),
				invite: WebsiteUrl('invite'),
				premium: WebsiteUrl('premium'),
			}),
		);
}

function parseEmbedFields(interaction: Target, key: string, options: any) {
	return resolveKey(interaction, key, { returnObjects: true, ...options }) as Promise<APIEmbedField>;
}
