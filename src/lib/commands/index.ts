import { chatInputApplicationCommandMention } from 'discord.js';

export * from './count';
export * from './guide';
export * from './guildInfo';
export * from './help';
export * from './invite';
export * from './stats';
export * from './support';
export * from './template';
export * from './reminder';
export * from './vote';
export * from './uwu';

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
