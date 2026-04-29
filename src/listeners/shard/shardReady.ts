import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({ once: true, event: Events.ShardReady })
export class UserShardEvent extends Listener<typeof Events.ShardReady> {
	public async run(id: number, _unavailableGuilds: Set<string> | undefined) {
		if (id !== 0) return;

		const key = '__birthdayy_api_connected__';
		const globalAny = globalThis as unknown as Record<string, unknown>;
		if (globalAny[key] === true) return;

		globalAny[key] = true;
		try {
			await this.container.server.connect();
		} catch (error: any) {
			// If HMR or a reload caused the API server to already be listening, don't crash the process.
			if (error && typeof error === 'object' && 'code' in error && error.code === 'ERR_SERVER_ALREADY_LISTEN')
				return;
			throw error;
		}
	}
}
