import type { BirthdayyCommand } from '#lib/structures';

import { Events as SkyraEvents } from '#lib/types';
import { ApplyOptions } from '@sapphire/decorators';
import { type ChatInputCommandSuccessPayload, Events, Listener } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({ event: Events.ChatInputCommandSuccess })
export class UserListener extends Listener<typeof Events.ChatInputCommandSuccess> {
	public run(payload: ChatInputCommandSuccessPayload) {
		const command = payload.command as BirthdayyCommand;
		this.container.client.emit(SkyraEvents.CommandUsageAnalytics, command.name, command.category);
	}
}
