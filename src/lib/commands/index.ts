import { chatInputApplicationCommandMention } from 'discord.js';

export * from './count.js';
export * from './guildInfo.js';
export * from './help.js';
export * from './invite.js';
export * from './stats.js';
export * from './support.js';
export * from './template.js';
export * from './reminder.js';
export * from './vote.js';
export * from './uwu.js';

// CONFIG
export const CONFIG_LIST = chatInputApplicationCommandMention('config', 'list', '935174203882217483');
export const CONFIG_ANNOUNCEMENT_CHANNEL = chatInputApplicationCommandMention(
	'config',
	'announcement-channel',
	'935174203882217483',
);
export const CONFIG_TIMEZONE = chatInputApplicationCommandMention('config', 'timezone', '935174203882217483');
export const CONFIG_LANGUAGE = chatInputApplicationCommandMention('config', 'language', '935174203882217483');
export const CONFIG_BIRTHDAY_ROLE = chatInputApplicationCommandMention('config', 'birthday-role', '935174203882217483');
export const CONFIG_ANNOUNCEMENT_MESSAGE = chatInputApplicationCommandMention(
	'config',
	'announcement-message',
	'935174203882217483',
);
export const CONFIG_PING_ROLE = chatInputApplicationCommandMention('config', 'ping-role', '935174203882217483');
export const CONFIG_RESET = chatInputApplicationCommandMention('config', 'reset', '935174203882217483');

// OTHERS TBD
