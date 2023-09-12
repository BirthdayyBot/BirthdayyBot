import { logSuccessCommand } from '#utils/utils';
import { Subcommand } from '@kaname-png/plugin-subcommands-advanced';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, LogLevel, container, type ChatInputCommandSuccessPayload } from '@sapphire/framework';
import type { Logger } from '@sapphire/plugin-logger';

@ApplyOptions<Listener.Options>({
	event: Events.ChatInputCommandSuccess,
	enabled: (container.logger as Logger).level <= LogLevel.Debug,
})
export class UserListener extends Listener {
	public run(payload: ChatInputCommandSuccessPayload) {
		if (payload.command instanceof Subcommand) return null;
		return logSuccessCommand(payload);
	}
}
