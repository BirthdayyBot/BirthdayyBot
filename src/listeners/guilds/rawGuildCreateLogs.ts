import { getT } from '#lib/i18n/translate';
import { BrandingColors } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { container, Listener } from '@sapphire/framework';
import type { TFunction } from '@sapphire/plugin-i18next';
import { EmbedBuilder, GatewayDispatchEvents, type GatewayGuildCreateDispatch } from 'discord.js';

@ApplyOptions<Listener.Options>({
	event: GatewayDispatchEvents.GuildCreate,
	emitter: 'ws',
	enabled: Boolean(container.client.webhookLog)
})
export class UserListener extends Listener {
	public async run(data: GatewayGuildCreateDispatch['d'], _shardId: number) {
		const t = getT('en-US');
		const { name, id } = data;

		const size = await this.container.client.computeGuilds();

		const embed = new EmbedBuilder()
			.setTitle(t('events/guilds-logs:joinLogsEmbedTitle'))
			.setDescription(t('events/guilds-logs:joinLogsEmbedDescription', { name, id, size }))
			.setColor(BrandingColors.Primary)
			.addFields([
				await this.fetchOwnerField(data.owner_id, t),
				this.getMembersField(data.member_count, t),
				this.getCreatedField(data.joined_at, t)
			]);

		return this.container.client.webhookLog!.send({ embeds: [embed] });
	}

	private async fetchOwnerField(ownerId: string, t: TFunction) {
		const owner = await this.container.client.users.fetch(ownerId);

		return {
			name: t('events/guilds-logs:joinLogsEmbedFieldsOwner'),
			value: `${owner.tag} (${owner.id})`
		};
	}

	private getMembersField(memberCount: number, t: TFunction) {
		return {
			name: t('events/guilds-logs:joinLogsEmbedFieldsMembers'),
			value: memberCount.toString()
		};
	}

	private getCreatedField(joinedAt: string, t: TFunction) {
		return {
			name: t('events/guilds-logs:joinLogsEmbedFieldsCreated'),
			value: t('events/guilds-logs:logsEmbedFieldsCreatedValue', { joined_at: joinedAt })
		};
	}
}
