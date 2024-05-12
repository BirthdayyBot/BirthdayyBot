import { getT } from '#lib/i18n/translate';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, type ListenerOptions } from '@sapphire/framework';
import type { TFunction } from '@sapphire/plugin-i18next';
import { Colors, EmbedBuilder, Guild } from 'discord.js';

@ApplyOptions<ListenerOptions>({ event: Events.GuildDelete })
export class UserEvent extends Listener<typeof Events.GuildDelete> {
	public async run(guild: Guild) {
		if (guild.available) return;

		const { webhookLog } = this.container.client;
		if (webhookLog) await webhookLog.send({ embeds: [await this.#createLogsEmbed(guild, getT('en-US'))] });
	}

	async #createLogsEmbed(guild: Guild, t: TFunction) {
		const { joinedTimestamp, memberCount, name, id } = guild;
		const size = await this.container.client.computeGuilds();
		return new EmbedBuilder()
			.setTitle(t('events/guilds-logs:leaveBotEmbedTitle'))
			.setDescription(t('events/guilds-logs:joinBotEmbedDescription', { name, id, size }))
			.setColor(Colors.Red)
			.addFields(
				{
					name: t('events/guilds-logs:leaveLogsEmbedFieldsMembers'),
					value: memberCount.toString(),
					inline: true
				},
				{
					name: t('events/guilds-logs:leaveLogsEmbedFieldsJoined'),
					value: t('events/guilds-logs:leaveLogsEmbedFieldsJoinedValue', {
						timestamp: joinedTimestamp
					}),

					inline: true
				}
			);
	}
}
