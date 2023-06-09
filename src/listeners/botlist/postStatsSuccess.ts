import { ApplyOptions } from '@sapphire/decorators';
import { container, Events, Listener } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({ emitter: container.botList, event: 'postStatsSuccess' })
export class postStatsErrorEvent extends Listener<typeof Events.Error> {
	public run() {
		return container.logger.info('Successfully posted stats to bot lists.');
	}
}
