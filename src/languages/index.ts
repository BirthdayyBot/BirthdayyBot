import type { Handler } from '#lib/i18n/structures/Handler';
import { ExtendedHandler as EnUsHandler } from '#root/languages/en-US/constants';
import type { LocaleString } from 'discord.js';

export const handlers = new Map<LocaleString, Handler>([['en-US', new EnUsHandler()]]);

export function getHandler(name: LocaleString): Handler {
	return handlers.get(name) ?? handlers.get('en-US')!;
}
