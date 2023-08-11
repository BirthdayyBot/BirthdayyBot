import { DEBUG } from '#lib/utils/environment';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({ event: Events.Warn })
export class WarnEvent extends Listener<typeof Events.Warn> {
	public run(message: string) {
		return DEBUG ? this.container.logger.warn(message) : null;
	}
}
