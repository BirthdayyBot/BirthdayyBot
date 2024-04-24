import type { InternationalizationContext, TFunction } from '@sapphire/plugin-i18next';
import type { Nullish } from '@sapphire/utilities';
import type { Interaction, LocaleString } from 'discord.js';

import { DecoratorIdentifiers } from '@sapphire/decorators';
import { Identifiers, container } from '@sapphire/framework';

export function translate(identifier: string): string {
	switch (identifier) {
		case Identifiers.CommandDisabled:
			return 'commands:disabled';
		case Identifiers.PreconditionCooldown:
			return 'preconditions:cooldown';
		case Identifiers.PreconditionNSFW:
			return 'preconditions:nsfw';
		case Identifiers.PreconditionClientPermissions:
			return 'preconditions:clientPermissions';
		case DecoratorIdentifiers.RequiresClientPermissionsMissingPermissions:
			return 'preconditions:clientPermissionsMissingPermissions';
		case DecoratorIdentifiers.RequiresUserPermissionsMissingPermissions:
			return 'preconditions:userPermissionsMissingPermissions';
		case Identifiers.PreconditionClientPermissionsNoClient:
			return 'preconditions:clientPermissionsNoClient';
		case Identifiers.PreconditionClientPermissionsNoPermissions:
			return 'preconditions:clientPermissionsNoPermissions';
		case Identifiers.PreconditionRunIn:
			return 'preconditions:runIn';
		case Identifiers.PreconditionUserPermissions:
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
			return `preconditions:requiresClientPermissionsGuildOnly`;
		case DecoratorIdentifiers.RequiresUserPermissionsGuildOnly:
			return `preconditions:requiresUserPermissionsGuildOnly`;
		default:
			return identifier;
	}
}

/**
 * Returns a translation function for the specified locale, or the default 'en-US' if none is provided.
 * @param locale The locale to get the translation function for.
 * @returns The translation function for the specified locale.
 */
export function getT(locale?: LocaleString | Nullish) {
	return container.i18n.getT(locale ?? 'en-US');
}

export function getSupportedLanguageName(interaction: Interaction): LocaleString {
	if (interaction.guildLocale && container.i18n.languages.has(interaction.guildLocale)) return interaction.guildLocale;
	return 'en-US';
}

export function getSupportedLanguageT(interaction: Interaction): TFunction {
	return getT(getSupportedLanguageName(interaction));
}

export function getSupportedUserLanguageName(interaction: Interaction): LocaleString {
	if (container.i18n.languages.has(interaction.locale)) return interaction.locale;
	return getSupportedLanguageName(interaction);
}

export function getSupportedUserLanguageT(interaction: Interaction): TFunction {
	return getT(getSupportedUserLanguageName(interaction));
}

/**
 * Fetches the language for the given {@link InternationalizationContext}.
 * If the language cannot be fetched, defaults to 'en-US'.
 * @param context The InternationalizationContext to fetch the language for.
 * @returns The fetched language as a {@link LocaleString}.
 */
export async function fetchLanguage(context: InternationalizationContext) {
	return (await container.i18n.fetchLanguage(context))! as LocaleString;
}

/**
 * Fetches the translation function for the given context.
 * @param context The internationalization context.
 * @returns The translation function.
 */
export async function fetchT(context: InternationalizationContext) {
	return getT(await fetchLanguage(context));
}
