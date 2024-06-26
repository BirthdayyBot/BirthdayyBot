import { PermissionLevels } from '#lib/types';
import { OWNERS } from '#root/config';
import { seconds } from '#utils/common';
import { Command, PreconditionContainerArray, UserError } from '@sapphire/framework';
import { Subcommand } from '@sapphire/plugin-subcommands';
import { PermissionFlagsBits, PermissionsBitField } from 'discord.js';

export const BirthdayyCommandConstructorDefaults = {
	cooldownDelay: seconds(10),
	cooldownFilteredUsers: OWNERS,
	cooldownLimit: 2,
	permissionLevel: PermissionLevels.Everyone,
	requiredClientPermissions: new PermissionsBitField().add(
		PermissionFlagsBits.SendMessages,
		PermissionFlagsBits.EmbedLinks,
		PermissionFlagsBits.ViewChannel
	)
} satisfies Partial<ExtendOptions<Command.Options>>;

export function implementBirthdayyCommandError(identifier: UserError | string, context?: unknown): never {
	throw typeof identifier === 'string' ? new UserError({ context, identifier }) : identifier;
}

export function implementBirthdayyCommandParseConstructorPreConditionsPermissionLevel(
	command: Command | Subcommand,
	permissionLevel: PermissionLevels = PermissionLevels.Everyone
): void {
	if (permissionLevel === PermissionLevels.BotOwner) {
		command.preconditions.append('BotOwner');
		return;
	}

	const container = new PreconditionContainerArray(['BotOwner'], command.preconditions);
	switch (permissionLevel) {
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
				`BirthdayyCommand[${command.name}]: "permissionLevel" was specified as an invalid permission level (${permissionLevel}).`
			);
	}

	command.preconditions.append(container);
}

export function implementBirthdayyCommandPaginatedOptions<
	T extends ExtendOptions<Command.Options> = ExtendOptions<Command.Options>
>(options?: T): T {
	return {
		cooldownDelay: seconds(15),
		// Merge in all given options
		...options,
		// Add all requiredPermissions set in the command, along EmbedLinks to send EmbedBuilder's
		requiredClientPermissions: new PermissionsBitField(options?.requiredClientPermissions).add(
			PermissionFlagsBits.EmbedLinks
		)
	} as unknown as T;
}

export type ExtendOptions<T> = {
	permissionLevel?: number;
} & T;
