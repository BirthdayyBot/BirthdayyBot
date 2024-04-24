import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, ListenerOptions } from '@sapphire/framework';

@ApplyOptions<ListenerOptions>({ emitter: 'ws', event: Events.ShardReady, once: true })
export class UserShardEvent extends Listener<typeof Events.ShardReady> {
	public run(id: number, _unavailableGuilds: Set<string> | undefined) {
		if (id === 0) {
			void this.container.server.connect();
		}
	}
}
