import { ApplyOptions } from '@sapphire/decorators';
import { container, Events, Listener } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({ emitter: container.botList, event: 'postStatsError' })
export class postStatsErrorEvent extends Listener<typeof Events.Error> {
	public run(error: Error) {
		return container.errorLogger.handle(error, { logSeverity: 'error' });
	}
}
