import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import { DEBUG } from '../../helpers/provide/environment';

@ApplyOptions<Listener.Options>({ event: Events.Warn })
export class WarnEvent extends Listener<typeof Events.Warn> {
	public run(message: string) {
		return DEBUG ? this.container.logger.warn(message) : null;
	}
}
