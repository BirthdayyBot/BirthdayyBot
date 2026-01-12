import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { ScheduledTaskEvents } from '@sapphire/plugin-scheduled-tasks';

@ApplyOptions<Listener.Options>({ event: ScheduledTaskEvents.ScheduledTaskStrategyConnectError })
export class ScheduledTaskStrategyConnectErrorEvent extends Listener<
	typeof ScheduledTaskEvents.ScheduledTaskStrategyConnectError
> {
	public run(error: Error) {
		return this.container.errorLogger.handle(error, { logSeverity: 'error' });
	}
}
