import { envParseArray, envParseBoolean, envParseInteger, envParseString } from '@skyra/env-utilities';
import { PermissionsBitField } from 'discord.js';
import { join } from 'path';
import { isCustom, isProduction } from '../../lib/utils/env';
import { BirthdayyBotColor, BirthdayyBotId, GuildIDEnum, OwnerID } from '../../lib/types/Enums';

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
export const BOT_COLOR = envParseInteger('BOT_COLOR', BirthdayyBotColor.Birthdayy);
export const BOT_OWNER = envParseArray('BOT_OWNER', [OwnerID.Chillihero]);
export const WEBSITE_URL = 'https://birthdayy.xyz/';
export const DOCS_URL = 'https://birthdayy.xyz/docs';
export const PREMIUM_URL = 'https://birthdayy.xyz/premium';
export const IS_CUSTOM_BOT = envParseBoolean('CUSTOM_BOT');

// EMOJIS
export const enum BirthdayyEmojis {
	Success = '<:checkmark_square_birthdayy:1102222019476586526>',
	Fail = '<:cross_square_birthdayy:1102222032155988068> ',
	Yes = '<:checkmark_square_birthdayy:1102222019476586526>',
	No = '<:cross_square_birthdayy:1102222032155988068> ',
	ArrowRight = '<:arrow_right_birthdayy:1102221944016875650>',
	ArrowLeft = '<:arrow_left_birthdayy:1102221941223477268>',
	Plus = '<:plus_birthdayy:1102222100544110712>',
	Link = '<:link_birthdayy:1102222076380725319>',
	Exclamation = '<:exclamation_mark_birthdayy:1102222058777223209>',
	Cake = '<:cake_birthdayy:1102221988380020766>',
	Crown = '<:crown_birthdayy:1102222034458660915>',
	News = '<:news_birthdayy:1102222080029761618>',
	Gift = '<:gift_birthdayy:1102222060845015050>',
	Book = '<:book_birthdayy:1102221958592086137>',
	Alarm = '<:bell_birthdayy:1102221947003219968>',
	Support = '<:support_birthdayy:1102222115056386208>',
	Sign = '<:sign_birthdayy:1102222111155703909> ',
	Heart = '<:heart_birthdayy:1102222063030239232>',
	Ping = '<:ping_birthdayy:1102222097788440657>',
	People = '<:people_birthdayy:1102222095573844108>',
	Comment = '<:speech_bubble_birthdayy:1102222112711786577>',
	Online = '<:online_birthdayy:1102222090712657930>',
	Offline = '<:offline_birthdayy:1102222087973769368>',
	Warning = '<:warning_birthdayy:1102222123809906778>',
	Compass = '<:compass_birthdayy:1102222027101839360>',
	Tools = '<:tools_birthdayy:1102222421651623936>',
}

// Values
export const BOT_SERVER_LOG = envParseString('LOG_CHANNEL_SERVER', '1077621363881300018');
export const BOT_ADMIN_LOG = envParseString('LOG_CHANNEL_ADMIN', '1077621363881300018');
export const DISCORD_INVITE = 'https://discord.birthdayy.xyz';
export const VOTE_CHANNEL_ID = isProduction ? '950683261540130816' : envParseString('LOG_CHANNEL_ADMIN');
export const VOTE_ROLE_ID = '1039089174948626473';
export const DEFAULT_ANNOUNCEMENT_MESSAGE = `${BirthdayyEmojis.ArrowRight} Today is a special Day!{NEW_LINE}${BirthdayyEmojis.Gift} Please wish {MENTION} a happy Birthday <3`;
export const MAIN_DISCORD = envParseString('MAIN_DISCORD', GuildIDEnum.Birthdayy);
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
