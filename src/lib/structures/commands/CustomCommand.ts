import { PermissionLevels } from '#lib/types/Enums';
import { OWNERS } from '#root/config';
import { Command, PreconditionContainerArray, UserError } from '@sapphire/framework';
import { Subcommand } from '@sapphire/plugin-subcommands';
import type { CacheType } from 'discord.js';

export class CustomCommand extends Command {
	public readonly permissionLevel: PermissionLevels;

	public constructor(context: Command.LoaderContext, options: CustomCommand.Options) {
		super(context, sharedCommandOptions(options));

		this.permissionLevel =
			typeof options.permissionLevel === 'string'
				? PermissionLevels[options.permissionLevel]
				: options.permissionLevel ?? PermissionLevels.Everyone;
	}

	protected error(identifier: string | UserError, context?: unknown): never {
		throw typeof identifier === 'string' ? new UserError({ identifier, context }) : identifier;
	}

	protected override parseConstructorPreConditions(options: CustomCommand.Options): void {
		super.parseConstructorPreConditions(options);
		sharedPreconditionPermissionsLevel(this, options);
	}
}

export class CustomSubCommand extends Subcommand {
	public readonly permissionLevel: PermissionLevels;

	public constructor(context: Subcommand.LoaderContext, options: CustomCommand.Options) {
		super(context, sharedCommandOptions(options));

		this.permissionLevel =
			typeof options.permissionLevel === 'string'
				? PermissionLevels[options.permissionLevel]
				: options.permissionLevel ?? PermissionLevels.Everyone;
	}

	protected error(identifier: string | UserError, context?: unknown): never {
		throw typeof identifier === 'string' ? new UserError({ identifier, context }) : identifier;
	}

	protected override parseConstructorPreConditions(options: CustomCommand.Options): void {
		super.parseConstructorPreConditions(options);
		this.parseConstructorPreConditionsPermissionLevel(options);
	}

	protected parseConstructorPreConditionsPermissionLevel(options: CustomCommand.Options): void {
		sharedPreconditionPermissionsLevel(this, options);
	}
}

export namespace CustomCommand {
	/**
	 * The SkyraCommand Options
	 */
	export type Options = Command['options'] & {
		permissionLevel?: PermissionLevels | keyof typeof PermissionLevels;
	};
	export type LoaderContext = Command.LoaderContext;
	export type Registry = Command.Registry;
	export type ChatInputCommandInteraction<Cached extends CacheType = CacheType> =
		Command.ChatInputCommandInteraction<Cached>;
	export type ContextMenuCommandInteraction<Cached extends CacheType = CacheType> =
		Command.ContextMenuCommandInteraction<Cached>;
}

export namespace CustomSubCommand {
	/**
	 * The SkyraCommand Options
	 */
	export type Options = Subcommand['options'] & {
		permissionLevel?: PermissionLevels | keyof typeof PermissionLevels;
	};
	export type LoaderContext = Subcommand.LoaderContext;
	export type Registry = Subcommand.Registry;
	export type ChatInputCommandInteraction<Cached extends CacheType = CacheType> =
		Subcommand.ChatInputCommandInteraction<Cached>;
	export type ContextMenuCommandInteraction<Cached extends CacheType = CacheType> =
		Subcommand.ContextMenuCommandInteraction<Cached>;
}

function sharedCommandOptions(options: CustomCommand.Options | CustomSubCommand.Options) {
	return {
		cooldownDelay: 10_000,
		cooldownLimit: 2,
		cooldownFilteredUsers: OWNERS,
		...options
	};
}

function sharedPreconditionPermissionsLevel(command: CustomCommand | CustomSubCommand, options: CustomCommand.Options) {
	if (options.permissionLevel === PermissionLevels.BotOwner) {
		command.preconditions.append('BotOwner');
		return;
	}

	const container = new PreconditionContainerArray([], command.preconditions);
	switch (options.permissionLevel || PermissionLevels.Everyone) {
		case PermissionLevels.Everyone:
			container.append('Everyone');
			break;
		case PermissionLevels.Moderator:
			container.append('Moderator');
			break;
		case PermissionLevels.Administrator:
			container.append('Administrator');
			break;
		case PermissionLevels.ServerOwner:
			container.append('ServerOwner');
			break;
		case PermissionLevels.Manager:
			container.append('Manager');
			break;
		default:
			throw new Error(
				`SkyraCommand[${command.name}]: "permissionLevel" was specified as an invalid permission level (${options.permissionLevel}).`
			);
	}

	command.preconditions.append(container);
}
