import { ApplyOptions } from '@sapphire/decorators';
import { container, Events, Listener, type ListenerOptions } from '@sapphire/framework';
import type { TFunction } from '@sapphire/plugin-i18next';
import { Colors, EmbedBuilder, Guild, type EmbedAuthorData } from 'discord.js';

@ApplyOptions<ListenerOptions>({ event: Events.GuildDelete, enabled: Boolean(container.client.webhookLog) })
export class UserEvent extends Listener<typeof Events.GuildDelete> {
	public async run(guild: Guild) {
		if (guild.available) return;

		const t = container.i18n.getT('en-US');
		const embed = new EmbedBuilder()
			.setDescription('events/guilds:leaveEmbedDescription')
			.setColor(Colors.Red)
			.addFields([this.getMembersField(guild.memberCount, t), this.getJoinedField(guild.joinedTimestamp, t)])
			.setAuthor(this.getAuthorField(guild, t))
			.setTimestamp()
			.setFooter({ text: t('events/guilds:leaveEmbedFooter') });
		return this.container.client.webhookLog!.send({ embeds: [embed] });
	}

	private getAuthorField(guild: Guild, t: TFunction): EmbedAuthorData {
		const { name, id, icon } = guild;

		return {
			name: t('events/guilds:leaveEmbedAuthor', { name, id }),
			iconURL: icon ? container.client.rest.cdn.icon(id, icon) : undefined
		};
	}

	private getMembersField(memberCount: number, t: TFunction) {
		return {
			name: t('events/guilds:leaveEmbedFieldsMembers'),
			value: memberCount.toString(),
			inline: true
		};
	}

	private getJoinedField(joinedAt: number, t: TFunction) {
		return {
			name: t('events/guilds:leaveEmbedFieldsJoined'),
			value: t('events/guilds:leaveEmbedFieldsJoinedValue', { joined_at: joinedAt }),
			inline: true
		};
	}
}
