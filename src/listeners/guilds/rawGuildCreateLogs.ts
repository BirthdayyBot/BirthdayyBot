import { getT } from '#lib/i18n/translate';
import { BrandingColors } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { container, Listener } from '@sapphire/framework';
import type { TFunction } from '@sapphire/plugin-i18next';
import {
	EmbedBuilder,
	GatewayDispatchEvents,
	type EmbedAuthorData,
	type GatewayGuildCreateDispatch,
	type GatewayGuildCreateDispatchData
} from 'discord.js';

@ApplyOptions<Listener.Options>({
	event: GatewayDispatchEvents.GuildCreate,
	emitter: 'ws',
	enabled: Boolean(container.client.webhookLog)
})
export class UserListener extends Listener {
	public async run(data: GatewayGuildCreateDispatch['d'], _shardId: number) {
		const t = getT('en-US');

		const size = await this.container.client.computeGuilds();

		const embed = new EmbedBuilder()
			.setDescription(t('events/guilds:joinEmbedDescription', { size }))
			.setColor(BrandingColors.Primary)
			.setAuthor(this.fetchAuthorField(data, t))
			.setTimestamp()
			.setFooter({ text: t('events/guilds:joinEmbedFooter') })
			.addFields([
				await this.fetchOwnerField(data.owner_id, t),
				this.getMembersField(data.member_count, t),
				this.getCreatedField(data.joined_at, t)
			]);

		return this.container.client.webhookLog!.send({ embeds: [embed] });
	}

	private fetchAuthorField(data: GatewayGuildCreateDispatchData, t: TFunction): EmbedAuthorData {
		const { name, id, icon } = data;

		return {
			name: t('events/guilds:joinEmbedFieldsAuthor', { name, id }),
			iconURL: icon ? `https://cdn.discordapp.com/icons/${id}/${icon}.png` : undefined
		};
	}

	private async fetchOwnerField(ownerId: string, t: TFunction) {
		const owner = await this.container.client.users.fetch(ownerId);

		return {
			name: t('events/guilds:joinEmbedFieldsOwner'),
			value: `${owner.tag} (${owner.id})`
		};
	}

	private getMembersField(memberCount: number, t: TFunction) {
		return {
			name: t('events/guilds:joinEmbedFieldsMembers'),
			value: memberCount.toString()
		};
	}

	private getCreatedField(joinedAt: string, t: TFunction) {
		return {
			name: t('events/guilds:joinEmbedFieldsCreated'),
			value: t('events/guilds:joinEmbedFieldsCreatedValue', { joined_at: joinedAt })
		};
	}
}
