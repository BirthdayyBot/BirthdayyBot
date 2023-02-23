import { ApplyOptions } from '@sapphire/decorators';
import { Listener, Store } from '@sapphire/framework';
import { blue, gray, green, magenta, magentaBright, white, yellow } from 'colorette';
import { APP_ENV } from '../helpers/provide/environment';
import checkBirthdayScheduler from '../lib/scheduler/checkBirthdayScheduler';
// import testScheduler from '../lib/scheduler/testScheduler';

const isDev = APP_ENV !== 'prd';

@ApplyOptions<Listener.Options>({ once: true })
export class UserEvent extends Listener {
	private readonly style = isDev ? yellow : blue;

	public async run() {
		this.printBanner();
		this.printStoreDebugInformation();
		// await testScheduler();
		await checkBirthdayScheduler();
	}

	private printBanner() {
		const success = green('+');

		const llc = isDev ? magentaBright : white;
		const blc = isDev ? magenta : blue;

		const line01 = llc('');
		const line02 = llc('');
		const line03 = llc('');

		// Offset Pad
		const pad = ' '.repeat(7);

		console.log(
			String.raw`
${line01} ${pad}${blc('1.0.0')}
${line02} ${pad}[${success}] Gateway
${line03}${isDev ? ` ${pad}${blc('<')}${llc('/')}${blc('>')} ${llc('DEVELOPMENT MODE')}` : ''}
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
