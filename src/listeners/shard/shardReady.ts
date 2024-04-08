import { ShardListener } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import { green } from 'colorette';

@ApplyOptions<Listener.Options>({ once: true, event: Events.ShardReady })
export class UserShardEvent extends ShardListener {
	protected readonly title = green('Ready');

	public async run(id: number, _unavailableGuilds: Set<string> | undefined) {
		this.container.logger.info(`${this.header(id)}: Shard is ready.`);

		if (id === 0) await this.container.server.connect();
	}
}
