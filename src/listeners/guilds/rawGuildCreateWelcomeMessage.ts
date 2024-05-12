import { ConfigApplicationCommandMentions } from '#root/commands/Admin/config';
import { BrandingColors } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { canSendEmbeds, isTextChannel } from '@sapphire/discord.js-utilities';
import { Listener } from '@sapphire/framework';
import { fetchT, type TFunction } from '@sapphire/plugin-i18next';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	GatewayDispatchEvents,
	type GatewayGuildCreateDispatch
} from 'discord.js';

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
		const components = this.createComponents(await fetchT(guild));

		return channel.send({ embeds: [embed], components });
	}

	private createComponents(t: TFunction) {
		return [
			new ActionRowBuilder<ButtonBuilder>().setComponents(
				new ButtonBuilder() //
					.setLabel(t('events/guilds:welcomeComponentsDocumentation'))
					.setURL('https://docs.birthdayy.xyz/')
					.setStyle(ButtonStyle.Link)
					.setEmoji('📚'),
				new ButtonBuilder() //
					.setLabel(t('events/guilds:welcomeComponentsInvite'))
					.setURL('https://invite.birthdayy.xyz/')
					.setStyle(ButtonStyle.Link)
					.setEmoji('🎉'),
				new ButtonBuilder() //
					.setLabel(t('events/guilds:welcomeComponentsSupport'))
					.setURL('https://support.birthdayy.xyz/')
					.setStyle(ButtonStyle.Link)
					.setEmoji('🛠️'),
				new ButtonBuilder() //
					.setLabel(t('events/guilds:welcomeComponentsWebsite'))
					.setURL('https://birthdayy.xyz/')
					.setStyle(ButtonStyle.Link)
					.setEmoji('🎂')
			)
		];
	}
}
