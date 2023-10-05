import { container } from '@sapphire/framework';
import dayjs, { Dayjs } from 'dayjs';
import dayjstimezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
import { ChatInputCommandInteraction, Locale, TimestampStylesString, time } from 'discord.js';
import { addZeroToSingleDigitNumber } from './string.js';

dayjs.extend(utc);
dayjs.extend(dayjstimezone);

export interface TimezoneObject {
	date: import('dayjs').Dayjs;
	dateFormatted: string;
	utcOffset?: keyof typeof TIMEZONE_VALUES;
	timezone?: typeof TIMEZONE_VALUES;
}

export function getCurrentDateInLocaleTimezone(locale: Locale) {
	const timezone = TimezoneWithLocale[locale];
	return dayjs().tz(timezone);
}

export function getCurrentDateFormatted(date: Dayjs): string {
	return date.format('YYYY-MM-DD');
}

export function formatDateForDisplay(date: string, fromHumanFormat = false) {
	const [year, month, day] = date.split(fromHumanFormat ? '.' : '-');
	return `${day}. ${numberToMonthName(Number(month))} ${year.includes('XXXX') ? '' : year}`;
}

function getMonths() {
	// TODO: Add Translation
	return [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December',
	];
}

export function numberToMonthName(number: number) {
	const months = getMonths();
	number -= 1;
	return months[number];
}

export function parseInputDate(date: string | Date): Date {
	let inputDate: Date;

	if (typeof date === 'string') {
		// Ensure the input date string is in 'XXXX-MM-DD' format
		if (!/^(\d{4}-\d{2}-\d{2})$/.test(date)) {
			throw new Error('Invalid date format. Please use "XXXX-MM-DD".');
		}

		// Replace 'XXXX' with '2000' and parse as Date
		inputDate = new Date(date.replace('XXXX', '2000'));
	} else if (date instanceof Date) {
		// Use the provided Date object
		inputDate = date;
	} else {
		throw new Error('Invalid input type. Please provide a string in "XXXX-MM-DD" format or a Date object.');
	}

	return inputDate;
}

export function formatMonthWithLeadingZero(month: number) {
	const monthString = month.toString().padStart(2, '0');
	return `-${monthString}-`;
}

export function formatDateWithMonthAndDay(date: string | Date) {
	const inputDate = parseInputDate(date);
	const dayString = inputDate.getDate().toString().padStart(2, '0');
	const monthString = (inputDate.getMonth() + 1).toString().padStart(2, '0');
	return `-${monthString}-${dayString}`;
}

export function isDateString(date: string): boolean {
	const regex = /^(\d{4}|X{4})-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])$/;
	return regex.test(date);
}

export const TIMEZONE_VALUES: Record<number, string> = {
	'-11': 'Pacific/Samoa',
	'-10': 'Pacific/Honolulu',
	'-9': 'America/Anchorage',
	'-8': 'America/Los_Angeles',
	'-7': 'America/Denver',
	'-6': 'America/Chicago',
	'-5': 'America/New_York',
	'-4': 'America/Caracas',
	'-3': 'America/Argentina/Buenos_Aires',
	'-2': 'Atlantic/South_Georgia',
	'-1': 'Atlantic/Azores',
	0: 'Europe/London',
	1: 'Europe/Paris',
	2: 'Europe/Berlin',
	3: 'Europe/Moscow',
	4: 'Asia/Dubai',
	5: 'Asia/Karachi',
	6: 'Asia/Dhaka',
	7: 'Asia/Jakarta',
	8: 'Asia/Shanghai',
	9: 'Asia/Tokyo',
	10: 'Australia/Brisbane',
	11: 'Pacific/Noumea',
	12: 'Pacific/Fiji',
};

export function getCurrentOffset(): TimezoneObject {
	let timezoneObject: TimezoneObject;
	for (let offset = -11; offset <= 12; offset++) {
		// Get the current time in the UTC offset timezone
		const hourWithHourZero = offset === 0 ? dayjs().tz('UTC').hour() : dayjs().utcOffset(offset).hour();
		const today = offset === 0 ? dayjs().tz('UTC') : dayjs().utcOffset(offset);

		// If the current time is 0, set the UTC offset as the hourZeroTimezone
		if (hourWithHourZero === 0) {
			timezoneObject = {
				date: today,
				dateFormatted: today.format('YYYY-MM-DD'),
				utcOffset: offset,
				timezone: TIMEZONE_VALUES[offset],
			};
			return timezoneObject;
		}
	}
	container.logger.warn('getCurrentOffset ~ Could not find timezone offset');
	timezoneObject = {
		date: dayjs(),
		dateFormatted: dayjs().format('YYYY-MM-DD'),
		utcOffset: 0,
		timezone: 'UTC',
	};
	container.logger.debug('getCurrentOffset ~ timezoneObject:', timezoneObject);
	return timezoneObject;
}

export function getFormattedTimestamp(discordTimestamp: number, style: TimestampStylesString): string {
	return time(Math.floor(discordTimestamp / 1000), style);
}

export function getDateFromInteraction(interaction: ChatInputCommandInteraction) {
	const day = addZeroToSingleDigitNumber(interaction.options.getInteger('day', true));
	const month = addZeroToSingleDigitNumber(interaction.options.getString('month', true));
	const year = interaction.options.getInteger('year', false) ?? 'XXXX';

	return `${year}-${month}-${day}`;
}

export const TimezoneWithLocale: Record<Locale, string> = {
	[Locale.EnglishUS]: ' America/Chicago',
	[Locale.Greek]: 'Europe/Athens',
	[Locale.Korean]: 'Asia/Seoul',
	[Locale.Hungarian]: 'Europe/Budapest',
	[Locale.Russian]: 'Europe/Moscow',
	[Locale.French]: 'Europe/Paris',
	[Locale.EnglishGB]: 'Europe/London',
	[Locale.Indonesian]: 'Asia/Makassar',
	[Locale.Bulgarian]: 'Europe/Sofia',
	[Locale.ChineseCN]: 'Asia/Chongqing',
	[Locale.ChineseTW]: 'Asia/Taipei',
	[Locale.Croatian]: 'Europe/Zagreb',
	[Locale.Czech]: 'Europe/Prague',
	[Locale.Danish]: 'Europe/Copenhagen',
	[Locale.Dutch]: 'Europe/Berlin',
	[Locale.Finnish]: 'Europe/Helsinki',
	[Locale.German]: 'Europe/Isle_of_Man',
	[Locale.Hindi]: 'Africa/Lagos',
	[Locale.Italian]: 'Europe/Rome',
	[Locale.Japanese]: 'Asia/Tokyo',
	[Locale.Lithuanian]: 'Europe/Vilnius',
	[Locale.Norwegian]: 'Europe/Berlin',
	[Locale.Polish]: 'Europe/Kyiv',
	[Locale.PortugueseBR]: 'Europe/Lisbon',
	[Locale.Romanian]: 'Europe/Chisinau',
	[Locale.SpanishES]: 'Europe/Madrid',
	[Locale.Swedish]: 'Europe/Berlin',
	[Locale.Thai]: 'Asia/Bangkok',
	[Locale.Turkish]: 'Asia/Istanbul',
	[Locale.Ukrainian]: 'Europe/Simferopol',
	[Locale.Vietnamese]: 'Asia/Ho_Chi_Minh',
};
