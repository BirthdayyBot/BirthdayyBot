import { BirthdayyCommand } from '#lib/structures';
import { Events as BirthdayyEvents } from '#lib/types';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, type ContextMenuCommandSuccessPayload } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({ event: Events.ContextMenuCommandSuccess })
export class UserListener extends Listener<typeof Events.ContextMenuCommandSuccess> {
	public run(payload: ContextMenuCommandSuccessPayload) {
		const command = payload.command as BirthdayyCommand;
		this.container.client.emit(BirthdayyEvents.CommandUsageAnalytics, command.name, command.category);
	}
}
