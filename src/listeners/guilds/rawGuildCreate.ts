import { floatPromise } from '#lib/utils/functions/promises';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { GatewayDispatchEvents, type GatewayGuildCreateDispatch } from 'discord.js';

@ApplyOptions<Listener.Options>({ event: GatewayDispatchEvents.GuildCreate, emitter: 'ws' })
export class UserListener extends Listener {
	public async run(data: GatewayGuildCreateDispatch['d'], _shardId: number) {
		const tasks = await this.container.tasks.list({ types: ['waiting'] });
		const guildTask = tasks.find((task) => task.data === data.id);
		if (guildTask) floatPromise(guildTask.remove());
	}
}
