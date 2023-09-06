import { PermissionLevels } from '#lib/types/Enums';
import { defaultClientPermissions, defaultUserPermissions } from '#lib/types/permissions';
import { BOT_OWNER } from '#utils/environment';
import { PreconditionContainerArray, UserError, type PieceContext } from '@sapphire/framework';
import { Subcommand } from '@sapphire/plugin-subcommands';
import type { CacheType } from 'discord.js';

export class CustomCommand extends Subcommand {
	public readonly permissionLevel: PermissionLevels;

	public constructor(context: PieceContext, options: CustomCommand.Options) {
		super(context, {
			cooldownDelay: 10_000,
			cooldownLimit: 2,
			cooldownFilteredUsers: BOT_OWNER,
			requiredClientPermissions: defaultClientPermissions.add(options.requiredClientPermissions ?? []),
			requiredUserPermissions: defaultUserPermissions.add(options.requiredUserPermissions ?? []),
			...options,
		});

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
		if (options.permissionLevel === PermissionLevels.BotOwner) {
			this.preconditions.append('BotOwner');
			return;
		}

		const container = new PreconditionContainerArray(['BotOwner'], this.preconditions);
		switch (options.permissionLevel ?? PermissionLevels.Everyone) {
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
			default:
				throw new Error(
					`SkyraCommand[${this.name}]: "permissionLevel" was specified as an invalid permission level (${options.permissionLevel}).`,
				);
		}

		this.preconditions.append(container);
	}
}

export namespace CustomCommand {
	/**
	 * The SkyraCommand Options
	 */
	export type Options = Subcommand.Options & {
		permissionLevel?: PermissionLevels | keyof typeof PermissionLevels;
	};
	export type Context = Subcommand.Context;
	export type Registry = Subcommand.Registry;
	export type ChatInputCommandInteraction<Cached extends CacheType = CacheType> =
		Subcommand.ChatInputCommandInteraction<Cached>;
	export type ContextMenuCommandInteraction<Cached extends CacheType = CacheType> =
		Subcommand.ContextMenuCommandInteraction<Cached>;
}
