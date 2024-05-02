import { container } from '@sapphire/framework';
import dayjs from 'dayjs';
import dayjstimezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
import { ChatInputCommandInteraction, time, type TimestampStylesString } from 'discord.js';
import { addZeroToSingleDigitNumber } from './string.js';
import { TIMEZONE_VALUES } from './timezone.js';

dayjs.extend(utc);
dayjs.extend(dayjstimezone);

export interface TimezoneObject {
	date: import('dayjs').Dayjs;
	dateFormatted: string;
	utcOffset?: keyof typeof TIMEZONE_VALUES;
	timezone?: typeof TIMEZONE_VALUES;
}

export function formatDateForDisplay(date: string, fromHumanFormat = false) {
	const [year, month, day] = date.split(fromHumanFormat ? '.' : '-');
	return `${day}. ${numberToMonthName(Number(month))} ${year.includes('XXXX') ? '' : year}`;
}

export function splitDateString(date: string, separator = '-') {
	const [year, month, day] = date.split(separator);
	return { year, month: Number(month), day };
}

const months = [
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
	'December'
] as const;

export function numberToMonthName(number: number) {
	return months[number - 1];
}

export function parseInputDate(date: string | Date): Date {
	let inputDate: Date;

	if (typeof date === 'string') {
		// Ensure the input date string is in 'XXXX-MM-DD' format
		if (!/^(\d{4}\/\d{2}\/\d{2})$/.test(date)) {
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
				dateFormatted: today.format('YYYY/MM/DD'),
				utcOffset: offset,
				timezone: TIMEZONE_VALUES[offset]
			};
			return timezoneObject;
		}
	}
	container.logger.warn('getCurrentOffset ~ Could not find timezone offset');
	timezoneObject = {
		date: dayjs(),
		dateFormatted: dayjs().format('YYYY/MM/DD'),
		utcOffset: 0,
		timezone: 'UTC'
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
