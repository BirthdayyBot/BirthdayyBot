import { getT } from '#lib/i18n/translate';
import { ApplyOptions } from '@sapphire/decorators';
import { container, Events, Listener, type ListenerOptions } from '@sapphire/framework';
import type { TFunction } from '@sapphire/plugin-i18next';
import { Colors, EmbedBuilder, Guild } from 'discord.js';

@ApplyOptions<ListenerOptions>({ event: Events.GuildDelete, enabled: Boolean(container.client.webhookLog) })
export class UserEvent extends Listener<typeof Events.GuildDelete> {
	public async run(guild: Guild) {
		if (guild.available) return;

		const t = getT('en-US');
		const embed = new EmbedBuilder()
			.setTitle('events/guilds-logs:leaveBotEmbedTitle')
			.setDescription('events/guilds-logs:joinBotEmbedDescription')
			.setColor(Colors.Red)
			.addFields([this.getMembersField(guild.memberCount, t), this.getJoinedField(guild.joinedTimestamp, t)]);

		return this.container.client.webhookLog!.send({ embeds: [embed] });
	}

	private getMembersField(memberCount: number, t: TFunction) {
		return {
			name: t('events/guilds-logs:joinLogsEmbedFieldsMembers'),
			value: memberCount.toString(),
			inline: true
		};
	}

	private getJoinedField(joinedAt: number, t: TFunction) {
		return {
			name: t('events/guilds-logs:joinLogsEmbedFieldsJoined'),
			value: t('events/guilds-logs:joinLogsEmbedFieldsJoinedValue', { joined_at: joinedAt }),
			inline: true
		};
	}
}
