import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({ emitter: process, event: 'unhandledRejection' })
export class UnhandledRejectionListener extends Listener {
	public run(error: Error) {
		return this.container.errorLogger.handle(error, { logSeverity: 'error' });
	}
}
