import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({ once: true, event: Events.ShardReady })
export class UserShardEvent extends Listener<typeof Events.ShardReady> {
	public async run(id: number, _unavailableGuilds: Set<string> | undefined) {
		if (id === 0) {
			await this.container.server.connect();
		}
	}
}
