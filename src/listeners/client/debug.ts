import { DEBUG } from '#utils/environment';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({ event: Events.Debug })
export class ErrorEvent extends Listener<typeof Events.Debug> {
	public run(message: string) {
		const logs = [
			'[HeartbeatTimer] Sending a heartbeat.',
			'[HeartbeatTimer] Heartbeat acknowledged, latency of ',
			'Heartbeat acknowledged, latency of',
			'WS => Shard',
		];

		if (logs.some((log) => message.includes(log))) return;

		return DEBUG ? this.container.logger.debug(message) : null;
	}
}
