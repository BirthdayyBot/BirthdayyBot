import { chatInputApplicationCommandMention } from 'discord.js';

export * from './birthday';
export * from './config';
export * from './guide';
export * from './help';
export * from './invite';
export * from './stats';
export * from './support';
export * from './template';
export * from './uwu';

export const BIRTHDAY_UPDATE = chatInputApplicationCommandMention('birthday', 'update', '935174192389840896');
