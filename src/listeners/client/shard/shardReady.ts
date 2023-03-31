import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';


@ApplyOptions<Listener.Options>({ event: Events.ShardReady })
export class UserShardEvent extends Listener<typeof Events.ShardReady> {
	public run(id: number, _unavailableGuilds: Set<string> | undefined) {
		if (id === 0) {
			this.container.server.connect();
		}
	}
}
