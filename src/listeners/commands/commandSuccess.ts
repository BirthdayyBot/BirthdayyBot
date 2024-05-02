import { Events as CustomEvents } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import {
	Command,
	ContextMenuCommandSuccessPayload,
	Events,
	Listener,
	LogLevel,
	container,
	type ChatInputCommandSuccessPayload
} from '@sapphire/framework';
import type { Logger } from '@sapphire/plugin-logger';
import { Subcommand } from '@sapphire/plugin-subcommands';
import { cyan } from 'colorette';
import { APIUser, Guild, User } from 'discord.js';

@ApplyOptions<Listener.Options>({
	event: Events.ChatInputCommandSuccess,
	enabled: (container.logger as Logger).level <= LogLevel.Debug
})
export class UserListener extends Listener {
	public run(payload: ChatInputCommandSuccessPayload) {
		if (payload.command instanceof Subcommand) return null;
		return logSuccessCommand(payload);
	}
}

@ApplyOptions<Listener.Options>({
	event: Events.ContextMenuCommandError,
	enabled: (container.logger as Logger).level <= LogLevel.Debug
})
export class UserListenerContextMenu extends Listener {
	public run(payload: ChatInputCommandSuccessPayload) {
		return logSuccessCommand(payload);
	}
}

export function logSuccessCommand(payload: ContextMenuCommandSuccessPayload | ChatInputCommandSuccessPayload): void {
	const successLoggerData = getSuccessLoggerData(
		payload.interaction.guild,
		payload.interaction.user,
		payload.command
	);

	container.logger.debug(
		`${successLoggerData.shard} - ${successLoggerData.commandName} ${successLoggerData.author} ${successLoggerData.sentAt}`
	);

	container.client.emit(CustomEvents.CommandUsageAnalytics, payload.command.name, payload.command.category);
}

export function getSuccessLoggerData(guild: Guild | null, user: User, command: Command) {
	const shard = getShardInfo(guild?.shardId ?? 0);
	const commandName = getCommandInfo(command);
	const author = getAuthorInfo(user);
	const sentAt = getGuildInfo(guild);

	return { shard, commandName, author, sentAt };
}

export function parseBoolean(bool: string | boolean): boolean {
	if (typeof bool === 'boolean') return bool;
	return ['true', 't', '1', 'yes', 'y'].includes(bool.toLowerCase());
}

function getShardInfo(id: number) {
	return `[${cyan(id.toString())}]`;
}

function getCommandInfo(command: Command) {
	return cyan(command.name);
}

function getAuthorInfo(author: User | APIUser) {
	return `${author.username}[${cyan(author.id)}]`;
}

function getGuildInfo(guild: Guild | null) {
	if (guild === null) return 'Direct Messages';
	return `${guild.name}[${cyan(guild.id)}]`;
}
