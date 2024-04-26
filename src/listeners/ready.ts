import { sendMessage } from '#lib/discord';
import { isDevelopment } from '#utils/env';
import { BOT_ADMIN_LOG } from '#utils/environment';
import { floatPromise } from '#utils/functions/promises';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, Piece, Store } from '@sapphire/framework';
import { TFunction } from '@sapphire/plugin-i18next';
import { isNullish } from '@sapphire/utilities';
import { blue, gray, green, magenta, magentaBright, red, white, yellow } from 'colorette';

@ApplyOptions<Listener.Options>({ event: Events.ClientReady, once: true })
export class UserEvent extends Listener {
	private readonly style = isDevelopment ? yellow : blue;

	public async run() {
		this.printBanner();
		this.printStoreDebugInformation();
		floatPromise(await sendMessage(BOT_ADMIN_LOG, { content: 'online' }));
		floatPromise(this.container.tasks.run({ name: 'PostStats' }));

		for (const [guildID, guild] of await this.container.client.guilds.fetch()) {
			this.container.client.guildMemberFetchQueue.add((await guild.fetch()).shardId, guildID);
		}

		this.container.client.guildMemberFetchQueue.fetch();
	}

	private printBanner() {
		const { client } = this.container;
		const success = green('+');
		const failed = red('-');
		const llc = client.dev ? magentaBright : white;
		const blc = client.dev ? magenta : blue;

		// Offset Pad
		const pad = ' '.repeat(7);

		const isAuthEnabled = !isNullish(client.options.api?.auth);

		console.log(
			String.raw`
${blc(process.env.CLIENT_VERSION)}
[${success}] Gateway
[${client.analytics ? success : failed}] Analytics
[${isAuthEnabled ? success : failed}] OAuth 2.0 Enabled
${client.dev ? ` ${pad}${blc('<')}${llc('/')}${blc('>')} ${llc('DEVELOPMENT MODE')}` : ''}
		`.trim()
		);
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
