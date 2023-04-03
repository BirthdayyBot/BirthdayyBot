import { container } from '@sapphire/pieces';
import dayjs, { Dayjs } from 'dayjs';
import dayjstimezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { DEBUG } from '../provide/environment';
import { checkIfLengthIsTwo } from './string';

dayjs.extend(utc);
dayjs.extend(dayjstimezone);

/**
 * Get the current date in the specified timezone.
 * @param timezone - The timezone to use.
 * @returns  The date.
 */
export function getCurrentDate(timezone = 'UTC'): Dayjs {
	const today = dayjs();
	const date = dayjs.tz(today, timezone);
	return date;
}

/**
 * Get the current formatted date in the specified timezone.
 * @param timezone - The timezone to use.
 * @returns  The formatted date.
 */
export function getCurrentDateFormated(timezone = 'UTC'): string {
	const today = dayjs();
	const todayUTC = dayjs.tz(today, timezone);
	const formattedDate = todayUTC.format('YYYY-MM-DD');
	return formattedDate;
}

export function formatDateForDisplay(date: string, fromHumanFormat = false) {
	// DD.MM.YYYY
	let day: string;
	let month: string;
	let year: string;
	if (fromHumanFormat) {
		[day, month, year] = date.split('.');
		month = numberToMonthname(parseInt(month));
	} else {
		// container.logger.info(DEBUG ? 'date: ' + date : '');
		[year, month, day] = date.split('-');
		month = numberToMonthname(parseInt(month));
	}
	let finalString = `${day}. ${month}`;
	year.includes('XXXX') ? (finalString = String(finalString)) : (finalString += ` ${year}`);
	return finalString;
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

export function numberToMonthname(number: number) {
	const months = getMonths();
	number -= 1;
	return months[number];
}

export function getStringDate(date: Dayjs) {
	const d = date.day();
	const m = date.month() + 1;
	const year = date.year();
	const day = checkIfLengthIsTwo(`${d}`);
	const month = checkIfLengthIsTwo(`${m}`);

	return `${year}-${month}-${day}`;
}

export function extractDayAndMonth(inputDate: string) {
	inputDate = inputDate.replace('XXXX', '2000');
	const d = new Date(inputDate);
	const day = d.getDate();
	const dayString = day.toString().length === 1 ? '0'.concat(day.toString()) : day.toString();
	let month = d.getMonth();
	month += 1;
	const monthString = month.toString().length === 1 ? '0'.concat(month.toString()) : month.toString();
	const str = `-${monthString}-${dayString}`;
	return str;
}

export function isDateString(date: string): boolean {
	// ESLint compains so - /^(\d{4}|X{4})\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/.test(date)
	const isDate = /^(\d{4}|X{4})-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])$/.test(date);
	if (DEBUG) container.logger.debug(`isDate [${date}]`, isDate);
	return isDate;
}

const TIMEZONE_VALUES: Record<number, string> = {
	0: 'Europe/Dublin',
	1: 'Europe/Paris',
	2: 'Europe/Helsinki',
	3: 'Europe/Moscow',
	4: 'Asia/Dubai',
	5: 'Asia/Karachi',
	6: 'Asia/Dhaka',
	7: 'Asia/Bangkok',
	8: 'Asia/Shanghai',
	9: 'Asia/Tokyo',
	10: 'Australia/Sydney',
	11: 'Pacific/Guadalcanal',
	12: 'Pacific/Auckland',
	'-11': 'Pacific/Midway',
	'-10': 'Pacific/Honolulu',
	'-9': 'America/Anchorage',
	'-8': 'America/Los_Angeles',
	'-7': 'America/Denver',
	'-6': 'America/Mexico_City',
	'-5': 'America/New_York',
	'-4': 'America/Caracas',
	'-3': 'America/Sao_Paulo',
	'-2': 'Atlantic/South_Georgia',
	'-1': 'Atlantic/Azores',
};

interface TimezoneObject {
	date: Dayjs;
	dateFormatted: string;
	timezone: keyof typeof TIMEZONE_VALUES;
}

/**
 * It creates an array of timezone objects, then finds the one where the hour is 0
 * @returns The timezone offset of the current timezone.
 */
export function getCurrentOffset() {
	const allZones = createTimezoneObjects();
	return allZones.find(({ date }) => date.hour() === 0) ?? null;
}
/**
 * It creates an array of objects, each of which contains a date and a timezone
 * @returns An array of objects with the timezone and date.
 */

export function createTimezoneObjects(): TimezoneObject[] {
	const allZones = Object.entries(TIMEZONE_VALUES).map(([timezone, zone]) => {
		const date = getCurrentDate(zone);
		const dateFormatted = getCurrentDateFormated(zone);
		return { date, dateFormatted, timezone: Number(timezone) };
	});
	return allZones;
}
