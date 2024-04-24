import { Emojis } from '#utils/constants';
import { envParseBoolean, envParseString } from '@skyra/env-utilities';
import { PermissionsBitField } from 'discord.js';
import { join, resolve } from 'path';

// DIRECTORY
export const SRC_DIR = resolve('src');
export const ROOT_DIR = join(SRC_DIR, '../');

export const DEBUG = envParseBoolean('DEBUG', true);
export const APP_ENV = envParseString('APP_ENV');

// GENERIC
export const { BOT_AVATAR, CLIENT_NAME } = process.env;

// Values
export const BOT_ADMIN_LOG = envParseString('LOG_CHANNEL_ADMIN', '1077621363881300018');
export const DISCORD_INVITE = 'https://discord.com/invite/Bs9bSVe2Hf';
export const DEFAULT_ANNOUNCEMENT_MESSAGE = `${Emojis.Arrow} Today is a special Day!{NEW_LINE}${Emojis.Gift} Please wish {MENTION} a happy Birthday <3`;

export const CLIENT_PERMISSIONS = new PermissionsBitField() //
	.add([PermissionsBitField.Flags.ViewChannel]);
