import { getRootData } from '@sapphire/pieces';
import { envParseNumber } from '@skyra/env-utilities';
import { join } from 'path';

export const mainFolder = getRootData().root;
export const rootFolder = join(mainFolder, '..');

export const ZeroWidthSpace = '\u200B';
export const LongWidthSpace = '\u3000';

export enum Emojis {
	Alarm = '<:bell_birthdayy:1102221947003219968>',
	Arrow = '<:arrow_right_birthdayy:1102221944016875650>',
	Book = '<:book_birthdayy:1102221958592086137>',
	Cake = '<:cake_birthdayy:1102221988380020766>',
	Exclamation = '<:exclamation_mark_birthdayy:1102222058777223209>',
	Fail = '<:cross_square_birthdayy:1102222032155988068> ',
	Gift = '<:gift_birthdayy:1102222060845015050>',
	Heart = '<:heart_birthdayy:1102222063030239232>',
	Link = '<:link_birthdayy:1102222076380725319>',
	News = '<:news_birthdayy:1102222080029761618>',
	People = '<:people_birthdayy:1102222095573844108>',
	Ping = '<:ping_birthdayy:1102222097788440657>',
	Plus = '<:plus_birthdayy:1102222100544110712>',
	Sign = '<:sign_birthdayy:1102222111155703909> ',
	Success = '<:checkmark_square_birthdayy:1102222019476586526>',
	Support = '<:support_birthdayy:1102222115056386208>',
	Tools = '<:tools_birthdayy:1102222421651623936>'
}

export const enum LanguageFormatters {
	BirthdayMessage = 'birthdayMessage',
	Channel = 'channel',
	Language = 'language',
	Message = 'message',
	Number = 'number',
	Role = 'role',
	Timezone = 'timezone',
	replaceNull = 'replaceNull'
}

export enum BrandingColors {
	Primary = envParseNumber('CLIENT_COLOR', 0x78c2ad)
}

export enum CdnUrls {
	Cake = 'https://media.discordapp.net/attachments/931273194160160829/931273371889586226/cake.png',
	CupCake = 'https://cdn.discordapp.com/avatars/916434908728164372/8107b2ca04a252947eeffef4692346f0.png?size=128'
}

/**
 * @name PrismaErrorCodeEnum
 * @description A collection of error codes
 * @link https://www.prisma.io/docs/reference/api-reference/error-reference#error-codes
 */
export enum PrismaErrorCodeEnum {
	NotFound = 'P2025',
	UniqueConstraintViolation = 'P2002'
}

export enum GuildIDEnum {
	Birthdayy = '934467365389893704',
	BirthdayyTesting = '980559116076470272',
	ChilliAttackV2 = '768556541439377438',
	ChilliHQ = '766707453994729532'
}
