import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { container, Listener } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({ emitter: container.botList, event: Events.PostStatsSuccess })
export class postStatsErrorEvent extends Listener {
	public async run() {
		await container.logger.info('Successfully posted stats to bot lists.');
	}
}
