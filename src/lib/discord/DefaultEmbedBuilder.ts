import { ClientColor } from '#utils/constants';
import { container } from '@sapphire/framework';
import { envParseBoolean } from '@skyra/env-utilities';
import { EmbedBuilder } from 'discord.js';

export class DefaultEmbedBuilder extends EmbedBuilder {
	public constructor() {
		super();
		this.setColor(ClientColor);
		this.setTimestamp();
		this.setFooter({
			text: `${container.client.user!.displayName} ${envParseBoolean('CUSTOM_BOT') ? '👑' : ''}`,
			iconURL: container.client.user!.displayAvatarURL()
		});
	}
}
