import { join } from 'path';
import { UserIDEnum } from '../../lib/enum/UserID.enum';
import { parseBoolean } from '../utils/utils';
import { getGuildPremium } from './config';

// DIRECTORY
export const ROOT_DIR = join(__dirname, '..', '..', '..');
export const SRC_DIR = join(ROOT_DIR, 'src');

// MAIN
export const { NODE_ENV } = process.env;
export const { APP_ENV } = process.env;
export const DEBUG = parseBoolean(process.env.DEBUG);

// GENERIC
export const { BOT_NAME } = process.env;
export const { BOT_ID } = process.env;
export const { BOT_AVATAR } = process.env;
export const IMG_CAKE = process.env.IMG_CAKE ?? 'https://media.discordapp.net/attachments/931273194160160829/931273371889586226/cake.png';
export const IMG_BLOCK = process.env.IMG_BLOCK ?? 'https://media.discordapp.net/attachments/931273194160160829/1036939867805990912/blocked.png';
export const BOT_INVITE = `https://discord.com/oauth2/authorize?client_id=${process.env.BOT_ID!}&permissions=8&scope=bot`;
export const BIRTHDAYY_INVITE = 'https://discord.com/oauth2/authorize?client_id=916434908728164372&permissions=525529836753&scope=bot';
export const BOT_COLOR = parseInt(process.env.BOT_COLOR, 10);
export const BOT_OWNER = process.env.BOT_OWNER
	? process.env.BOT_OWNER.includes(',')
		? process.env.BOT_OWNER.split(',')
		: process.env.BOT_OWNER
	: [UserIDEnum.CHILLIHERO, UserIDEnum.SORAYA];
export const BOT_ADMIN = UserIDEnum.CHILLIHERO;
export const WEBSITE_URL = 'https://birthdayy.xyz/';
export const DOCS_URL = 'https://birthdayy.xyz/docs';
export const PREMIUM_URL = 'https://birthdayy.xyz/premium';
export const IS_CUSTOM_BOT = parseBoolean(process.env.CUSTOM_BOT);
export const IS_PREMIUM = async (guild_id: string) => {
	return getGuildPremium(guild_id);
};

// EMOJIS
export const SUCCESS = '<:checkmark_square:931267038272434198>';
export const FAIL = '<:cross_square:931267041795637328>';
export const YES = '<:checkmark_square:931267038272434198>';
export const NO = '<:cross_square:931267041795637328>';
export const ARROW_RIGHT = '<:arrwright:931267038746390578>';
export const ARROW_LEFT = '<:arrwleft:931267038528274473>';
export const PLUS = '<:plus:936220828817825793>';
export const LINK = '<:link:931267039019020340>';
export const EXCLAMATION = '<:exclamationmark:936214710032924732>';
export const CAKE = '<:birthday_cake:931267038687670302>';
export const CROWN = '<:crown:931267039732047902>';
export const NEWS = '<:news:931267039232946196>';
export const GIFT = '<:gift:931267039094534175>';
export const BOOK = '<:book:931267038662504508>';
export const ALARM = '<:notify:931267039035818014>';
export const SUPPORT = '<:support:934485818062561310>';
export const SIGN = '<:sign:931267038431834174>';
export const HEART = '<:heart:931267039623000134>';
export const PING = '<:ping:931267038968705104>';
export const PEOPLE = '<:people:931267038574432308>';
export const COMMENT = '<:bubble:931267038670897213>';
export const ONLINE = '<:online:931267038662508585>';
export const OFFLINE = '<:offline:976766832662937620>';
export const WARNING = '<:warning:976767964110020628>';
export const COMPASS = '<:compass:931267039576871052>';

// COMMAND
export const CONFIG_LIST = '</config list:935174203882217483>';
export const BIRTHDAY_REGISTER = '</birthday register:935174192389840896>';

// Values
export const BOT_SERVER_LOG = process.env.LOG_CHANNEL_SERVER ?? '1077621363881300018';
export const BOT_ADMIN_LOG = process.env.LOG_CHANNEL_ADMIN ?? '1077621363881300018';
export const DISCORD_INVITE = 'https://discord.birthdayy.xyz';
export const VOTE_CHANNEL_ID = '950683261540130816';
export const VOTE_ROLE_ID = '1039089174948626473';

// Config
export const MAX_BIRTHDAYS = parseInt(process.env.MAX_BIRTHDAYS_PER_SITE, 10) || 80;

// Autocode
export const AUTOCODE_ENV = `@${process.env.AUTOCODE_ENV}`;

// Sentry
export const { SENTRY_DSN } = process.env;

// API
export const { API_BASE_URL } = process.env;
export const { API_EXTENSION } = process.env;
export const API_PORT = parseInt(process.env.API_PORT, 10);
export const { API_SECRET } = process.env;
export const { API_URL } = process.env;
export const { WEBHOOK_SECRET } = process.env;

// REDIS
export const { REDIS_HOST } = process.env;
export const REDIS_PORT = parseInt(process.env.REDIS_PORT, 10);
export const { REDIS_PASSWORD } = process.env;
export const REDIS_DB = parseInt(process.env.REDIS_DB, 10);
export const { REDIS_USERNAME } = process.env;

// DATABASE
export const { DB_URL } = process.env;

// BOT WEBSITES
// TODO: Change env name
export const TOKEN_TOPGG = process.env.TOPGG_TOKEN;
export const TOKEN_DISCORDLIST = process.env.DISCORDLIST_TOKEN;
export const TOKEN_DISCORDBOTLIST = process.env.DISCORDBOTLIST_TOKEN;

// WEBHOOKS
export const { WEBHOOK_ID } = process.env;
export const { WEBHOOK_TOKEN } = process.env;
