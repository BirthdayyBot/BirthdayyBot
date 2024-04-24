import { ApplyOptions } from '@sapphire/decorators';
import { Time } from '@sapphire/duration';
import { Listener } from '@sapphire/framework';
import { GatewayDispatchEvents, type GatewayGuildDeleteDispatch } from 'discord.js';

@ApplyOptions<Listener.Options>({ emitter: 'ws', event: GatewayDispatchEvents.GuildDelete })
export class UserListener extends Listener {
	public run({ id, unavailable }: GatewayGuildDeleteDispatch['d']) {
		if (unavailable) return;

		void this.container.tasks.create({ name: 'deleteGuild', payload: id }, { delay: Time.Hour, repeated: false });
	}
}
