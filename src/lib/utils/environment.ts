import { BirthdayyBotId, BrandingColors, Emojis, GuildIDEnum, OwnerID } from '#lib/types';
import { isCustom, isProduction } from '#utils/env';
import { envParseArray, envParseBoolean, envParseInteger, envParseString } from '@skyra/env-utilities';
import { PermissionsBitField } from 'discord.js';
import { join } from 'path';

// DIRECTORY
export const ROOT_DIR = join(__dirname, '..', '..', '..');
export const SRC_DIR = join(ROOT_DIR, 'src');

export const DEBUG = envParseBoolean('DEBUG', true);
export const APP_ENV = envParseString('APP_ENV');

// GENERIC
export const { BOT_ID, BOT_NAME, BOT_AVATAR } = process.env;
export const IMG_CAKE =
	process.env.IMG_CAKE ?? 'https://media.discordapp.net/attachments/931273194160160829/931273371889586226/cake.png';
export const IMG_BLOCK =
	process.env.IMG_BLOCK ??
	'https://media.discordapp.net/attachments/931273194160160829/1036939867805990912/blocked.png';
export const BOT_INVITE = `https://discord.com/oauth2/authorize?client_id=${process.env
	.BOT_ID!}&permissions=8&scope=bot`;
export const BIRTHDAYY_INVITE = `https://discord.com/oauth2/authorize?client_id=${
	isCustom ? BirthdayyBotId.Birthdayy : BOT_ID || BirthdayyBotId.Birthdayy
}&permissions=525529836753&scope=bot`;
export const BOT_COLOR = envParseInteger('BOT_COLOR', BrandingColors.Birthdayy);
export const BOT_OWNER = envParseArray('BOT_OWNER', [OwnerID.Chillihero]);
export const WEBSITE_URL = 'https://birthdayy.xyz/';
export const DOCS_URL = 'https://birthdayy.xyz/docs';
export const PREMIUM_URL = 'https://birthdayy.xyz/premium';
export const IS_CUSTOM_BOT = envParseBoolean('CUSTOM_BOT');

// Values
export const BOT_SERVER_LOG = envParseString('LOG_CHANNEL_SERVER', '1077621363881300018');
export const BOT_ADMIN_LOG = envParseString('LOG_CHANNEL_ADMIN', '1077621363881300018');
export const DISCORD_INVITE = 'https://discord.birthdayy.xyz';
export const VOTE_CHANNEL_ID = isProduction ? '950683261540130816' : envParseString('LOG_CHANNEL_ADMIN');
export const VOTE_ROLE_ID = '1039089174948626473';
export const DEFAULT_ANNOUNCEMENT_MESSAGE = `${Emojis.ArrowRight} Today is a special Day!{NEW_LINE}${Emojis.Gift} Please wish {MENTION} a happy Birthday <3`;
export const MAIN_DISCORD = envParseString('MAIN_DISCORD', GuildIDEnum['Birthdayy']);
export const BOT_ADMINS: string[] = [OwnerID.Chillihero, OwnerID.Swiizyy];

export const Permission_Bits = [
	PermissionsBitField.Flags.AddReactions,
	PermissionsBitField.Flags.AttachFiles,

	PermissionsBitField.Flags.ChangeNickname,
	PermissionsBitField.Flags.CreateInstantInvite,
	PermissionsBitField.Flags.CreatePrivateThreads,
	PermissionsBitField.Flags.CreatePublicThreads,

	PermissionsBitField.Flags.EmbedLinks,

	PermissionsBitField.Flags.ManageChannels,
	PermissionsBitField.Flags.ManageGuildExpressions,
	PermissionsBitField.Flags.ManageMessages,
	PermissionsBitField.Flags.ManageNicknames,
	PermissionsBitField.Flags.ManageEvents,
	PermissionsBitField.Flags.ManageRoles,

	PermissionsBitField.Flags.ViewChannel,
	PermissionsBitField.Flags.ViewAuditLog,

	PermissionsBitField.Flags.SendMessages,
	PermissionsBitField.Flags.SendMessagesInThreads,

	PermissionsBitField.Flags.UseExternalEmojis,
	PermissionsBitField.Flags.UseExternalStickers,
];
export { Emojis };
