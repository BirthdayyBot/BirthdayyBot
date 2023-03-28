import { ApplyOptions } from '@sapphire/decorators';
import { container, ContextMenuCommandSuccessPayload, Events, Listener, LogLevel } from '@sapphire/framework';
import type { Logger } from '@sapphire/plugin-logger';
import { logSuccessCommand } from '../../../helpers/utils/utils';

@ApplyOptions<Listener.Options>({
	enabled: (container.logger as Logger).level <= LogLevel.Debug,
	event: Events.ContextMenuCommandSuccess,
})
export class UserListener extends Listener {
	public run(payload: ContextMenuCommandSuccessPayload) {
		logSuccessCommand(payload);
	}
}
