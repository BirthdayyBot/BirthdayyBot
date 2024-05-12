import { getT } from '#lib/i18n/translate';
import { BrandingColors } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import type { TFunction } from '@sapphire/plugin-i18next';
import {
	EmbedBuilder,
	GatewayDispatchEvents,
	type GatewayGuildCreateDispatch,
	type GatewayGuildCreateDispatchData
} from 'discord.js';

@ApplyOptions<Listener.Options>({ event: GatewayDispatchEvents.GuildCreate, emitter: 'ws' })
export class UserListener extends Listener {
	public async run(data: GatewayGuildCreateDispatch['d'], _shardId: number) {
		const { webhookLog } = this.container.client;
		const embeds = [await this.#createLogsEmbed(data, getT('en-US'))];

		if (webhookLog) await webhookLog.send({ embeds });
	}

	async #createLogsEmbed(data: GatewayGuildCreateDispatchData, t: TFunction): Promise<EmbedBuilder> {
		const owner = await this.container.client.users.fetch(data.owner_id);
		const size = await this.container.client.computeGuilds();
		const { joined_at, member_count, name, id } = data;

		return new EmbedBuilder()
			.setTitle(t('events/guilds-logs:joinLogsEmbedTitle'))
			.setDescription(t('events/guilds-logs:joinLogsEmbedDescription', { name, id, size }))
			.setColor(BrandingColors.Primary)
			.addFields(
				{
					name: t('events/guilds-logs:joinLogsEmbedFieldsOwner'),
					value: `${owner.tag} (${owner.id})`
				},
				{
					name: t('events/guilds-logs:joinLogsEmbedFieldsMembers'),
					value: member_count.toString()
				},
				{
					name: t('events/guilds-logs:joinLogsEmbedFieldsCreated'),
					value: t('events/guilds-logs:logsEmbedFieldsCreatedValue', { joined_at })
				}
			);
	}
}
