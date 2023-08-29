import { WebsiteUrl, docsButtonBuilder, inviteSupportDicordButton } from '#lib/components/button';
import { BOT_NAME, Emojis, defaultEmbed, reply } from '#utils';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { applyLocalizedBuilder, resolveKey } from '@sapphire/plugin-i18next';
import { EmbedBuilder, type APIEmbedField } from 'discord.js';
import { BirthdayApplicationCommandMentions } from './birthday/birthday.js';
import { ConfigApplicationCommandMentions } from './config/config.js';
import { getCommandGuilds } from '#utils/functions/guilds';

@ApplyOptions<Command.Options>({
	preconditions: [['DMOnly', 'GuildTextOnly']],
	requiredUserPermissions: ['ViewChannel', 'UseApplicationCommands', 'SendMessages'],
	requiredClientPermissions: ['SendMessages', 'EmbedLinks', 'UseExternalEmojis'],
})
export class GuideCommand extends Command {
	public override async registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) => applyLocalizedBuilder(builder, 'commands/guide:guide'), {
			guildIds: await getCommandGuilds('global'),
		});
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await reply(interaction, {
			embeds: [await this.parseEmbed(interaction)],
			components: [
				{
					type: 1,
					components: [await docsButtonBuilder(interaction), await inviteSupportDicordButton(interaction)],
				},
			],
		});
	}

	private async parseEmbed(interaction: Command.ChatInputCommandInteraction) {
		return new EmbedBuilder(defaultEmbed())
			.setTitle(
				await resolveKey(interaction, 'commands/guide:embedTitle', {
					name: BOT_NAME || interaction.client.user.username,
					emoji: Emojis.Heart,
				}),
			)
			.setDescription(
				await resolveKey(interaction, 'commands/guide:embedDescription', { emoji: Emojis.ArrowRight }),
			)
			.setFields(
				await this.parseEmbedFields(interaction, 'commands/guide:embedStartedField', {
					command: BirthdayApplicationCommandMentions.Register,
					emoji: Emojis.Exclamation,
					url: WebsiteUrl('docs/quickstart'),
				}),
				await this.parseEmbedFields(interaction, 'commands/guide:embedConfigField', {
					command: ConfigApplicationCommandMentions.List,
					emoji: Emojis.Exclamation,
				}),
				await this.parseEmbedFields(interaction, 'commands/guide:embedImportantField', {
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

	private parseEmbedFields(interaction: Command.ChatInputCommandInteraction, key: string, options: any) {
		return resolveKey(interaction, key, { returnObjects: true, ...options }) as Promise<APIEmbedField>;
	}
}
