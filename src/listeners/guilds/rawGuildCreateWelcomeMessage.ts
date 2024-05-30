import { ConfigApplicationCommandMentions } from '#root/commands/Birthday/config';
import { ClientColor } from '#utils/constants';
import {
	getActionRow,
	getDocumentationComponent,
	getInviteComponent,
	getSupportComponent,
	getWebsiteComponent
} from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { canSendEmbeds, isTextChannel } from '@sapphire/discord.js-utilities';
import { Listener } from '@sapphire/framework';
import { fetchT, type TFunction } from '@sapphire/plugin-i18next';
import { EmbedBuilder, GatewayDispatchEvents, type GatewayGuildCreateDispatch } from 'discord.js';

@ApplyOptions<Listener.Options>({ event: GatewayDispatchEvents.GuildCreate, emitter: 'ws' })
export class UserListener extends Listener {
	public async run({ id: guildId }: GatewayGuildCreateDispatch['d'], _shardId: number) {
		const guild = await this.container.client.guilds.fetch(guildId).catch(() => null);
		if (!guild) return;

		// Check if the guild has joined the guild for less than a day
		if (Date.now() - guild.joinedTimestamp > 86400000) return;

		const channel = guild.systemChannel ?? guild.channels.cache.filter(isTextChannel).filter(canSendEmbeds).first();
		if (!channel) return;

		const t = await fetchT(guild);
		const description = t('events/guilds:welcomeEmbedDescription', {
			command: ConfigApplicationCommandMentions.Edit
		});

		const embed = new EmbedBuilder()
			.setTitle(t('events/guilds:welcomeEmbedTitle'))
			.setDescription(description)
			.setColor(ClientColor);

		const components = this.getComponents(t);

		return channel.send({ embeds: [embed], components });
	}

	private getComponents(t: TFunction) {
		return [
			getActionRow(
				getDocumentationComponent(t('events/guilds:welcomeComponentsDocumentation')),
				getInviteComponent(t('events/guilds:welcomeComponentsInvite'))
			),
			getActionRow(
				getSupportComponent(t('events/guilds:welcomeComponentsSupport')),
				getWebsiteComponent(t('events/guilds:welcomeComponentsWebsite'))
			)
		];
	}
}
