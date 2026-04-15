import { TIMEZONE_VALUES, addZeroToSingleDigitNumber } from '#utils/common';
import { container } from '@sapphire/framework';
import dayjs from 'dayjs';
import dayjstimezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
import { ChatInputCommandInteraction, time, type TimestampStylesString } from 'discord.js';

dayjs.extend(utc);
dayjs.extend(dayjstimezone);

export interface TimezoneObject {
	date: import('dayjs').Dayjs;
	dateFormatted: string;
	/**
	 * Current timezone offset in **minutes** (Dayjs-compatible).
	 * Example: UTC-5 => -300
	 */
	utcOffset?: number;
	/**
	 * Representative IANA timezone name for this offset hour bucket.
	 */
	timezone?: string;
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
		// Supports 'YYYY-MM-DD' / 'YYYY/MM/DD' and 'XXXX-MM-DD' / 'XXXX/MM/DD'
		const normalized = date.replaceAll('/', '-');
		if (!/^(\d{4}|XXXX)-\d{2}-\d{2}$/.test(normalized)) {
			throw new Error('Invalid date format. Please use "YYYY-MM-DD" or "XXXX-MM-DD".');
		}

		// Replace 'XXXX' with a stable year and parse as Date
		inputDate = new Date(normalized.replace('XXXX', '2000'));
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
	for (let offsetHours = -11; offsetHours <= 12; offsetHours++) {
		const offsetMinutes = offsetHours * 60;

		// Get the current time in the UTC offset timezone
		const hourWithHourZero = offsetHours === 0 ? dayjs().tz('UTC').hour() : dayjs().utcOffset(offsetMinutes).hour();
		const today = offsetHours === 0 ? dayjs().tz('UTC') : dayjs().utcOffset(offsetMinutes);

		// If the current time is 0, set the UTC offset as the hourZeroTimezone
		if (hourWithHourZero === 0) {
			timezoneObject = {
				date: today,
				dateFormatted: today.format('YYYY/MM/DD'),
				utcOffset: offsetMinutes,
				timezone: TIMEZONE_VALUES[offsetHours]
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
	const month = addZeroToSingleDigitNumber(interaction.options.getInteger('month', true));
	const year = interaction.options.getInteger('year', false) ?? 'XXXX';

	return `${year}-${month}-${day}`;
}
