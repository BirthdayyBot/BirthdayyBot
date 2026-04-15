import { isDevelopment } from '#utils/env';
import { DefaultEmbedBuilder } from '#lib/discord';
import { Emojis } from '#utils/constants';
import { BOT_ADMIN_LOG } from '#utils/environment';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, Piece, Store, container } from '@sapphire/framework';
import { type TFunction } from '@sapphire/plugin-i18next';
import { isTextBasedChannel } from '@sapphire/discord.js-utilities';
import { isNullish } from '@sapphire/utilities';
import { blue, gray, green, magenta, magentaBright, red, white, yellow } from 'colorette';

@ApplyOptions<Listener.Options>({ once: true, event: Events.ClientReady })
export class UserEvent extends Listener {
	private readonly style = isDevelopment ? yellow : blue;

	public async run() {
		this.printBanner();
		this.printStoreDebugInformation();
		await this.sendOnlineMessage();
	}

	private printBanner() {
		const { client } = this.container;
		const success = green('+');
		const failed = red('-');
		const llc = isDevelopment ? magentaBright : white;
		const blc = isDevelopment ? magenta : blue;

		const isAuthEnabled = !isNullish(client.options.api?.auth);

		container.logger.info(
			String.raw`
${blc('1.0.0')}
[${success}] Gateway
[${client.analytics ? success : failed}] Analytics
[${isAuthEnabled ? success : failed}] OAuth 2.0 Enabled
${isDevelopment ? ` ${blc('<')}${llc('/')}${blc('>')} ${llc('DEVELOPMENT MODE')}` : ''}
		`.trim()
		);
	}

	private async sendOnlineMessage() {
		const channel = this.container.client.channels.cache.get(BOT_ADMIN_LOG);
		if (!isTextBasedChannel(channel)) return;

		const { user } = this.container.client;
		const version = process.env.CLIENT_VERSION ?? 'unknown';

		const embed = new DefaultEmbedBuilder()
			.setDescription(`${Emojis.Online} **Online**`)
			.addFields(
				{ name: 'Version', value: version, inline: true },
				{ name: 'User', value: user ? `${user.tag} (${user.id})` : 'unknown', inline: true },
				{ name: 'Mode', value: isDevelopment ? 'development' : 'production', inline: true }
			)
			.setTimestamp();

		try {
			await channel.send({ embeds: [embed] });
		} catch (error) {
			// Don't fail startup if channel is missing perms:
			container.logger.warn('[Ready] Failed to send online message:', error);
		}
	}

	private printStoreDebugInformation() {
		const { client, logger, i18n } = this.container;
		const stores = [...client.stores.values()];

		for (const store of stores) {
			logger.info(this.styleStore(store));
		}

		logger.info(this.styleLanguages(i18n.languages));
	}

	private styleStore(store: Store<Piece>) {
		return gray(`├─ Loaded ${this.style(store.size.toString().padEnd(2, ' '))} ${store.name}.`);
	}

	private styleLanguages(languages: Map<string, TFunction>) {
		return gray(`└─ Loaded ${this.style(languages.size.toString().padEnd(2, ' '))} languages.`);
	}
}
