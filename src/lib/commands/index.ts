import { chatInputApplicationCommandMention } from 'discord.js';

export * from './birthday';
export * from './guide';
export * from './help';
export * from './invite';
export * from './stats';
export * from './support';
export * from './template';
export * from './uwu';

// BIRTHDAY
export const BIRTHDAY_UPDATE = chatInputApplicationCommandMention('birthday', 'update', '935174192389840896');
export const BIRTHDAY_REGISTER = chatInputApplicationCommandMention('birthday', 'register', '935174192389840896');
export const BIRTHDAY_REMOVE = chatInputApplicationCommandMention('birthday', 'remove', '935174192389840896');
export const BIRTHDAY_LIST = chatInputApplicationCommandMention('birthday', 'list', '935174192389840896');
export const BIRTHDAY_SHOW = chatInputApplicationCommandMention('birthday', 'show', '935174192389840896');
export const BIRTHDAY_TEST = chatInputApplicationCommandMention('birthday', 'test', '935174192389840896');

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
