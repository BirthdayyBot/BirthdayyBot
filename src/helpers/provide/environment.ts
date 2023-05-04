import { envParseArray, envParseBoolean, envParseInteger, envParseString } from '@skyra/env-utilities';
import { join } from 'path';
import { BotColorEnum } from '../../lib/enum/BotColor.enum';
import { UserIDEnum } from '../../lib/enum/UserID.enum';
import { isProduction } from '../../lib/utils/env';

// DIRECTORY
export const ROOT_DIR = join(__dirname, '..', '..', '..');
export const SRC_DIR = join(ROOT_DIR, 'src');

export const DEBUG = envParseBoolean('DEBUG', true);

// GENERIC
export const { BOT_ID, BOT_NAME, BOT_AVATAR } = process.env;
export const IMG_CAKE =
	process.env.IMG_CAKE ?? 'https://media.discordapp.net/attachments/931273194160160829/931273371889586226/cake.png';
export const IMG_BLOCK =
	process.env.IMG_BLOCK ??
	'https://media.discordapp.net/attachments/931273194160160829/1036939867805990912/blocked.png';
export const BOT_INVITE = `https://discord.com/oauth2/authorize?client_id=${process.env
	.BOT_ID!}&permissions=8&scope=bot`;
export const BIRTHDAYY_INVITE =
	'https://discord.com/oauth2/authorize?client_id=916434908728164372&permissions=525529836753&scope=bot';
export const BOT_COLOR = envParseInteger('BOT_COLOR', BotColorEnum.BIRTHDAYY);
export const BOT_OWNER = envParseArray('BOT_OWNER', [UserIDEnum.CHILLIHERO]);
export const WEBSITE_URL = 'https://birthdayy.xyz/';
export const DOCS_URL = 'https://birthdayy.xyz/docs';
export const PREMIUM_URL = 'https://birthdayy.xyz/premium';
export const IS_CUSTOM_BOT = envParseBoolean('CUSTOM_BOT', false);

// EMOJIS
export const SUCCESS = '<:checkmark_square_birthdayy:1102222019476586526>';
export const FAIL = '<:cross_square_birthdayy:1102222032155988068> ';
export const YES = '<:checkmark_square_birthdayy:1102222019476586526>';
export const NO = '<:cross_square_birthdayy:1102222032155988068> ';
export const ARROW_RIGHT = '<:arrow_right_birthdayy:1102221944016875650>';
export const ARROW_LEFT = '<:arrow_left_birthdayy:1102221941223477268>';
export const PLUS = '<:plus_birthdayy:1102222100544110712>';
export const LINK = '<:link_birthdayy:1102222076380725319>';
export const EXCLAMATION = '<:exclamation_mark_birthdayy:1102222058777223209>';
export const CAKE = '<:cake_birthdayy:1102221988380020766>';
export const CROWN = '<:crown_birthdayy:1102222034458660915>';
export const NEWS = '<:news_birthdayy:1102222080029761618>';
export const GIFT = '<:gift_birthdayy:1102222060845015050>';
export const BOOK = '<:book_birthdayy:1102221958592086137>';
export const ALARM = '<:bell_birthdayy:1102221947003219968>';
export const SUPPORT = '<:support_birthdayy:1102222115056386208>';
export const SIGN = '<:sign_birthdayy:1102222111155703909> ';
export const HEART = '<:heart_birthdayy:1102222063030239232>';
export const PING = '<:ping_birthdayy:1102222097788440657>';
export const PEOPLE = '<:people_birthdayy:1102222095573844108>';
export const COMMENT = '<:speech_bubble_birthdayy:1102222112711786577>';
export const ONLINE = '<:online_birthdayy:1102222090712657930>';
export const OFFLINE = '<:offline_birthdayy:1102222087973769368>';
export const WARNING = '<:warning_birthdayy:1102222123809906778>';
export const COMPASS = '<:compass_birthdayy:1102222027101839360>';

// Values
export const BOT_SERVER_LOG = envParseString('LOG_CHANNEL_SERVER', '1077621363881300018');
export const BOT_ADMIN_LOG = envParseString('LOG_CHANNEL_ADMIN', '1077621363881300018');
export const DISCORD_INVITE = 'https://discord.birthdayy.xyz';
export const VOTE_CHANNEL_ID = isProduction ? '950683261540130816' : envParseString('LOG_CHANNEL_ADMIN');
export const VOTE_ROLE_ID = '1039089174948626473';
export const DEFAULT_ANNOUNCEMENT_MESSAGE = `${ARROW_RIGHT} Today is a special Day!{NEW_LINE}${GIFT} Please wish {MENTION} a happy Birthday <3`;
