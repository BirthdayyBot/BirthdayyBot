import { ShardListener } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';
import { ListenerOptions } from '@sapphire/framework';
import { magenta } from 'colorette';

@ApplyOptions<ListenerOptions>({ event: 'shardReady', once: true })
export class UserShardListener extends ShardListener {
	protected readonly title = magenta('Ready');

	public run(id: number, unavailableGuilds: Set<string> | null) {
		this.container.logger.info(`${this.header(id)}: ${this.title} ${unavailableGuilds ? `(unavailable: ${unavailableGuilds.size})` : ''};	`);
	}
}
