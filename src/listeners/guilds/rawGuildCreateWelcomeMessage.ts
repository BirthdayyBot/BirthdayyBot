import {
	getActionRow,
	getDocumentationComponent,
	getInviteComponent,
	getSupportComponent,
	getWebsiteComponent
} from '#lib/discord/button';
import { ConfigApplicationCommandMentions } from '#root/commands/Admin/config';
import { BrandingColors } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { canSendEmbeds, isTextChannel } from '@sapphire/discord.js-utilities';
import { Listener } from '@sapphire/framework';
import { fetchT } from '@sapphire/plugin-i18next';
import { EmbedBuilder, GatewayDispatchEvents, type GatewayGuildCreateDispatch } from 'discord.js';

@ApplyOptions<Listener.Options>({ event: GatewayDispatchEvents.GuildCreate, emitter: 'ws' })
export class UserListener extends Listener {
	public async run({ id: guildId }: GatewayGuildCreateDispatch['d'], _shardId: number) {
		const guild = this.container.client.guilds.cache.get(guildId);
		if (!guild) return;

		const channel = guild.systemChannel ?? guild.channels.cache.filter(isTextChannel).filter(canSendEmbeds).first();
		if (!channel) return;

		const t = await fetchT(guild);
		const description = t('events/guilds:welcomeEmbedDescription', {
			command: ConfigApplicationCommandMentions.Edit
		});

		const embed = new EmbedBuilder()
			.setTitle('events/guilds:welcomeEmbedTitle')
			.setDescription(description)
			.setColor(BrandingColors.Primary);

		const components = this.getComponents();

		return channel.send({ embeds: [embed], components });
	}

	private getComponents() {
		return [
			getActionRow(
				getDocumentationComponent('events/guilds:welcomeComponentsDocumentation'),
				getInviteComponent('events/guilds:welcomeComponentsInvite')
			),
			getActionRow(
				getSupportComponent('events/guilds:welcomeComponentsSupport'),
				getWebsiteComponent('events/guilds:welcomeComponentsWebsite')
			)
		];
	}
}
