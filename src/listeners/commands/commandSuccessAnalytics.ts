import { CustomCommand } from '#lib/structures/commands/CustomCommand';
import { Events as CustomEvents } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import {
	ChatInputCommand,
	ChatInputCommandSuccessPayload,
	ContextMenuCommandSuccessPayload,
	Events,
	Listener,
} from '@sapphire/framework';
import {
	ChatInputCommandSubcommandMappingMethod,
	ChatInputSubcommandSuccessPayload,
	SubcommandPluginEvents,
} from '@sapphire/plugin-subcommands';

@ApplyOptions<Listener.Options>({ name: 'AnalyticsChatInputCommandSuccess', event: Events.ChatInputCommandSuccess })
export class UserListener extends Listener<typeof Events.ChatInputCommandSuccess> {
	public run(payload: ChatInputCommandSuccessPayload) {
		const command = payload.command as CustomCommand;
		this.container.client.emit(CustomEvents.CommandUsageAnalytics, command.name, command.category);
	}
}

@ApplyOptions<Listener.Options>({ name: 'AnalyticsContextMenuCommandSuccess', event: Events.ContextMenuCommandSuccess })
export class UserListenerContextMenu extends Listener<typeof Events.ContextMenuCommandSuccess> {
	public run(payload: ContextMenuCommandSuccessPayload) {
		const command = payload.command as CustomCommand;
		this.container.client.emit(CustomEvents.CommandUsageAnalytics, command.name, command.category);
	}
}

@ApplyOptions<Listener.Options>({
	name: 'AnalyticsChatInputSubcommandSuccess',
	event: SubcommandPluginEvents.ChatInputSubcommandSuccess,
})
export class UserListenerMessage extends Listener<typeof SubcommandPluginEvents.ChatInputSubcommandSuccess> {
	public run(
		_interaction: ChatInputCommand.Interaction,
		subcommand: ChatInputCommandSubcommandMappingMethod,
		payload: ChatInputSubcommandSuccessPayload,
	) {
		this.container.client.emit(
			CustomEvents.CommandUsageAnalytics,
			`${payload.command.name}/${subcommand.name}`,
			payload.command.category,
		);
	}
}
