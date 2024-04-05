import { Emojis } from '#utils/constants';
import { isProduction } from '#utils/env';
import { envParseBoolean, envParseString } from '@skyra/env-utilities';
import { PermissionsBitField } from 'discord.js';
import { join, resolve } from 'path';

// DIRECTORY
export const SRC_DIR = resolve('src');
export const ROOT_DIR = join(SRC_DIR, '../');

export const DEBUG = envParseBoolean('DEBUG', true);
export const APP_ENV = envParseString('APP_ENV');

// GENERIC
export const { CLIENT_NAME, BOT_AVATAR } = process.env;

// Values
export const BOT_SERVER_LOG = envParseString('LOG_CHANNEL_SERVER', '1077621363881300018');
export const BOT_ADMIN_LOG = envParseString('LOG_CHANNEL_ADMIN', '1077621363881300018');
export const DISCORD_INVITE = 'https://discord.com/invite/Bs9bSVe2Hf';
export const VOTE_CHANNEL_ID = isProduction ? '950683261540130816' : envParseString('LOG_CHANNEL_ADMIN');
export const VOTE_ROLE_ID = '1039089174948626473';
export const DEFAULT_ANNOUNCEMENT_MESSAGE = `${Emojis.ArrowRight} Today is a special Day!{NEW_LINE}${Emojis.Gift} Please wish {MENTION} a happy Birthday <3`;

export const CLIENT_PERMISSIONS = new PermissionsBitField().add([PermissionsBitField.Flags.ViewChannel]);
