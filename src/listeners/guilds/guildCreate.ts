import { getT } from '#lib/i18n/translate';
import { BrandingColors } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { canSendMessages, isTextChannel } from '@sapphire/discord.js-utilities';
import { Listener, type ListenerOptions } from '@sapphire/framework';
import { fetchT, type TFunction } from '@sapphire/plugin-i18next';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Events, Guild } from 'discord.js';

@ApplyOptions<ListenerOptions>({ event: Events.GuildCreate })
export class UserEvent extends Listener<typeof Events.GuildCreate> {
	public async run(guild: Guild) {
		this.container.client.guildMemberFetchQueue.add(guild.shardId, guild.id);

		this.container.logger.info(`[GUILD JOIN] ${guild.name} (${guild.id}) added the bot.`);

		const { webhookLog } = this.container.client;

		if (webhookLog) await webhookLog.send({ embeds: [await this.#createLogsEmbed(guild, getT('en-US'))] });

		const channel = guild.systemChannel ?? guild.channels.cache.filter(isTextChannel).find(canSendMessages);

		const t = await fetchT(guild);

		if (channel) {
			const embeds = [this.#createBotJoinEmbed(guild, t)];
			const components = this.#createBotJoinComponents(t);
			await channel.send({ embeds, components });
		}

		await this.#setDisableSettings(guild);
	}

	async #setDisableSettings(guild: Guild) {
		await this.container.prisma.guild.upsert({
			where: { guildId: guild.id },
			update: { disabled: false },
			create: { guildId: guild.id }
		});
	}

	#createBotJoinEmbed(guild: Guild, t: TFunction): EmbedBuilder {
		const embed = new EmbedBuilder()
			.setTitle(t('events/guilds-logs:joinBotEmbedTitle'))
			.setDescription(t('events/guilds-logs:joinBotEmbedDescription', { guild: guild.name }))
			.setColor(BrandingColors.Primary);

		return embed;
	}

	#createBotJoinComponents(t: TFunction) {
		return [
			new ActionRowBuilder<ButtonBuilder>().setComponents(
				new ButtonBuilder() //
					.setLabel(t('events/guilds-logs:joinBotEmbedFieldsDocumentation'))
					.setURL('https://docs.birthdayy.xyz/')
					.setStyle(ButtonStyle.Link)
					.setEmoji('📚'),
				new ButtonBuilder() //
					.setLabel(t('events/guilds-logs:joinBotEmbedFieldsInvite'))
					.setURL('https://invite.birthdayy.xyz/')
					.setStyle(ButtonStyle.Link)
					.setEmoji('🎉'),
				new ButtonBuilder() //
					.setLabel(t('events/guilds-logs:joinBotEmbedFieldsSupport'))
					.setURL('https://support.birthdayy.xyz/')
					.setStyle(ButtonStyle.Link)
					.setEmoji('🛠️'),
				new ButtonBuilder() //
					.setLabel(t('events/guilds-logs:joinBotEmbedFieldsWebsite'))
					.setURL('https://birthdayy.xyz/')
					.setStyle(ButtonStyle.Link)
					.setEmoji('🎂')
			)
		];
	}

	async #createLogsEmbed(guild: Guild, t: TFunction): Promise<EmbedBuilder> {
		const owner = await guild.fetchOwner();
		const embed = new EmbedBuilder()
			.setTitle(t('events/guilds-logs/create:logsEmbedTitle'))
			.setDescription(t('events/guilds-logs:logsEmbedDescription', { guild }))
			.setColor(BrandingColors.Primary)
			.addFields(
				{
					name: t('events/guilds-logs:logsEmbedFieldsOwner'),
					value: `${owner.user.tag} (${owner.id})`
				},
				{
					name: t('events/guilds-logs:logsEmbedFieldsMembers'),
					value: guild.memberCount.toString()
				},
				{
					name: t('events/guilds-logs:logsEmbedFieldsCreated'),
					value: t('events/guilds-logs:logsEmbedFieldsCreatedValue', { timestamp: guild.createdAt })
				}
			);

		return embed;
	}
}
