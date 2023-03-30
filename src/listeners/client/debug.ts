import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import { DEBUG } from '../../helpers/provide/environment';

@ApplyOptions<Listener.Options>({ event: Events.Debug })
export class ErrorEvent extends Listener<typeof Events.Debug> {
	public run(message: string) {
		return DEBUG ? this.container.logger.debug(message) : null;
	}
}
