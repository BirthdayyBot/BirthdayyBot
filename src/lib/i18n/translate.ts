import { DecoratorIdentifiers } from '@sapphire/decorators';
import { Identifiers } from '@sapphire/framework';

export function translate(identifier: string): string {
	switch (identifier) {
		case Identifiers.CommandDisabled:
			return 'preconditions:disableGlobal';
		case Identifiers.PreconditionCooldown:
			return 'preconditions:cooldown';
		case Identifiers.PreconditionNSFW:
			return 'preconditions:nsfw';
		case Identifiers.PreconditionClientPermissions:
		case DecoratorIdentifiers.RequiresClientPermissionsMissingPermissions:
			return 'preconditions:clientPermissions';
		case Identifiers.PreconditionClientPermissionsNoClient:
			return 'preconditions:clientPermissionsNoClient';
		case Identifiers.PreconditionClientPermissionsNoPermissions:
			return 'preconditions:clientPermissionsNoPermissions';
		case Identifiers.PreconditionRunIn:
			return 'preconditions:runIn';
		case Identifiers.PreconditionUserPermissions:
		case DecoratorIdentifiers.RequiresUserPermissionsMissingPermissions:
			return 'preconditions:userPermissions';
		case Identifiers.PreconditionUserPermissionsNoPermissions:
			return 'preconditions:userPermissionsNoPermissions';
		case Identifiers.PreconditionUnavailable:
			return 'preconditions:unavailable';
		case Identifiers.PreconditionMissingMessageHandler:
			return 'preconditions:missingMessageHandler';
		case Identifiers.PreconditionMissingChatInputHandler:
			return 'preconditions:missingChatInputHandler';
		case Identifiers.PreconditionMissingContextMenuHandler:
			return 'preconditions:missingContextMenuHandler';
		case DecoratorIdentifiers.RequiresClientPermissionsGuildOnly:
		case DecoratorIdentifiers.RequiresUserPermissionsGuildOnly:
			return 'preconditions:guildOnly';

		default:
			return identifier;
	}
}
