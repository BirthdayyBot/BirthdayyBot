import { sendMessage } from '#lib/discord';
import { BOT_ADMIN_LOG, isDevelopment } from '#utils';
import { floatPromise } from '#utils/functions/promises';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, Store, container } from '@sapphire/framework';
import { blue, gray, green, magenta, magentaBright, white, yellow } from 'colorette';

@ApplyOptions<Listener.Options>({ once: true, event: Events.ClientReady })
export class UserEvent extends Listener {
	private readonly style = isDevelopment ? yellow : blue;

	public async run() {
		this.printBanner();
		this.printStoreDebugInformation();
		floatPromise(await sendMessage(BOT_ADMIN_LOG, { content: 'online' }));
		floatPromise(this.container.tasks.run('PostStats', {}));

		for (const [guildID, guild] of await this.container.client.guilds.fetch()) {
			this.container.client.guildMemberFetchQueue.add((await guild.fetch()).shardId, guildID);
		}

		this.container.client.guildMemberFetchQueue.fetch();
	}

	private printBanner() {
		const success = green('+');

		const llc = isDevelopment ? magentaBright : white;
		const blc = isDevelopment ? magenta : blue;

		const line01 = llc('');
		const line02 = llc('');
		const line03 = llc('');

		// Offset Pad
		const pad = ' '.repeat(7);

		container.logger.info(
			String.raw`
${line01} ${pad}${blc('1.0.0')}
${line02} ${pad}[${success}] Gateway
${line03}${isDevelopment ? ` ${pad}${blc('<')}${llc('/')}${blc('>')} ${llc('DEVELOPMENT MODE')}` : ''}
		`.trim()
		);
	}

	private printStoreDebugInformation() {
		const { client, logger } = this.container;
		const stores = [...client.stores.values()];
		const last = stores.pop()!;

		for (const store of stores) logger.info(this.styleStore(store, false));
		logger.info(this.styleStore(last, true));
	}

	private styleStore(store: Store<any>, last: boolean) {
		return gray(`${last ? '└─' : '├─'} Loaded ${this.style(store.size.toString().padEnd(3, ' '))} ${store.name}.`);
	}
}
