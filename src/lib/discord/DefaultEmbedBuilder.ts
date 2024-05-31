import { ClientColor } from '#utils/constants';
import { CLIENT_AVATAR, CLIENT_NAME } from '#utils/environment';
import { envParseBoolean } from '@skyra/env-utilities';
import { EmbedBuilder } from 'discord.js';

export class DefaultEmbedBuilder extends EmbedBuilder {
	public constructor() {
		super();

		this.setColor(ClientColor);
		this.setTimestamp();
		this.setFooter({ text: `${CLIENT_NAME} ${envParseBoolean('CUSTOM_BOT') ? '👑' : ''}`, iconURL: CLIENT_AVATAR });
	}
}
