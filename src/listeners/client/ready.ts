import { BOT_ADMIN_LOG } from '#utils/environment';
import { ApplyOptions } from '@sapphire/decorators';
import { container, Events, Listener, Store } from '@sapphire/framework';
import { blue, gray, green, magenta, magentaBright, white, yellow } from 'colorette';
import { sendMessage } from '../../lib/discord/message';
import { isDevelopment } from '../../lib/utils/env';

@ApplyOptions<Listener.Options>({ once: true, event: Events.ClientReady })
export class UserEvent extends Listener {
	private readonly style = isDevelopment ? yellow : blue;

	public async run() {
		this.printBanner();
		this.printStoreDebugInformation();
		await sendMessage(BOT_ADMIN_LOG, { content: 'online' });
		await this.container.tasks.run('PostStats', {});
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
		`.trim(),
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
