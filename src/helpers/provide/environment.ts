/**
 * @file Environment Variables
 */

export const ENV = process.env.ENV; //dev; release; premium
export const DEBUG = process.env.DEBUG === 'TRUE' ? true : false;
export const MAIN_DISCORD = process.env.MAIN_DISCORD;
export const BIRTHDAYY_HQ = '934467365389893704';
export const BIRTHDAYY_ID = '916434908728164372';
//GENERIC
export const BOT_AVATAR = process.env.BOT_AVATAR; //BOT_AVATAR instead of PFP
export const IMG_CAKE = process.env.IMG_CAKE;
export const IMG_BLOCK = process.env.IMG_BLOCK;
export const BOT_NAME = process.env.BOT_NAME;
export const BOT_ID = process.env.BOT_ID;
export const BOT_INVITE = `https://discord.com/oauth2/authorize?client_id=${process.env.BOT_ID}&permissions=8&scope=bot`;
export const BIRTHDAYY_INVITE = 'https://discord.com/oauth2/authorize?client_id=916434908728164372&permissions=525529836753&scope=bot';
export const BOT_COLOR = parseInt(process.env.BOT_COLOR!);
export const BOT_OWNER = process.env.BOT_OWNER;
export const BOT_ADMIN = '267614892821970945';
export const WEBSITE_URL = 'https://birthdayy.xyz/';
export const DOCS_URL = 'https://birthdayy.xyz/docs';
export const PREMIUM_URL = 'https://birthdayy.xyz/premium';

//EMOJIS
export const SUCCESS = `<:checkmark_square:931267038272434198>`;
export const FAIL = `<:cross_square:931267041795637328>`;
export const YES = `<:checkmark_square:931267038272434198>`;
export const NO = `<:cross_square:931267041795637328>`;
export const ARROW_RIGHT = `<:arrwright:931267038746390578>`;
export const ARROW_LEFT = `<:arrwleft:931267038528274473>`;
export const PLUS = `<:plus:936220828817825793>`;
export const LINK = `<:link:931267039019020340>`;
export const EXCLAMATION = `<:exclamationmark:936214710032924732>`;
export const CAKE = `<:birthday_cake:931267038687670302>`;
export const CROWN = `<:crown:931267039732047902>`;
export const NEWS = `<:news:931267039232946196>`;
export const GIFT = `<:gift:931267039094534175>`;
export const BOOK = `<:book:931267038662504508>`;
export const ALARM = `<:notify:931267039035818014>`;
export const SUPPORT = `<:support:934485818062561310>`;
export const SIGN = `<:sign:931267038431834174>`;
export const HEART = `<:heart:931267039623000134>`;
export const PING = `<:ping:931267038968705104>`;
export const PEOPLE = `<:people:931267038574432308>`;
export const COMMENT = `<:bubble:931267038670897213>`;
export const ONLINE = `<:online:931267038662508585>`;
export const OFFLINE = `<:offline:976766832662937620>`;
export const WARNING = `<:warning:976767964110020628>`;
export const COMPASS = `<:compass:931267039576871052>`;
//COMMAND
export const CONFIG_STATUS = `</config status:935174203882217483>`;
export const BIRTHDAY_REGISTER = `</birthday register:935174192389840896>`;
//Trello
export const TRELLO_SUGGESTION_BOARD_NAME = '[Ideas] Birthdayy';
export const TRELLO_SUGGESTION_LIST_NAME = 'Ideas';
export const TRELLO_BUG_BOARD_NAME = '[Bugs] Birthdayy';
export const TRELLO_BUG_LIST_NAME = 'Bugs';

//Values
export const BOT_SERVER_LOG = '950681688227340319';
export const BOT_ADMIN_LOG = '966987605348589588';
export const DISCORD_INVITE = 'https://discord.gg/VNknfPRHg4';
export const VOTE_CHANNEL_ID = '950683261540130816';
export const VOTE_ROLE_ID = '1039089174948626473';

//Testing
export const TEST_OVERVIEW_MESSAGE = '1034565132426149980';

//Config
export const MAX_BIRTHDAYS = parseInt(process.env.MAX_BIRTHDAYS_PER_SITE!) || 80;
