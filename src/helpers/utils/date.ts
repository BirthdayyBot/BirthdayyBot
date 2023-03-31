// import { DEBUG } from '../provide/environment';
import { container } from '@sapphire/pieces';
import dayjs, { Dayjs } from 'dayjs';
import dayjstimezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { DEBUG } from '../provide/environment';
import { checkIfLengthIsTwo } from './string';

// Extend dayjs with the required plugins
dayjs.extend(utc);
dayjs.extend(dayjstimezone);

export function getCurrentDate(formatted = true): string | Dayjs {
	const today = dayjs();
	const todayUTC = dayjs.tz(today, 'UTC');
	const formattedDate = todayUTC.format('YYYY-MM-DD');
	container.logger.debug('today: ', formattedDate);
	return formatted ? formattedDate : todayUTC;
}

export function formatDateForDisplay(date: string, fromHumanFormat = false) {
	// DD.MM.YYY
	let items;
	let day: string;
	let month: string;
	let year: string;
	if (fromHumanFormat) {
		items = date.split('.');
		day = items[0];
		month = items[1];
		month = numberToMonthname(parseInt(month));
		year = items[2];
	} else {
		// container.logger.info(DEBUG ? 'date: ' + date : '');
		items = date.split('-');
		day = items[2];
		month = items[1];
		month = numberToMonthname(parseInt(month));
		year = items[0];
	}
	let finalString = `${day}. ${month}`;
	year.includes('XXXX') ? (finalString += '') : (finalString += ` ${year}`);
	return finalString;
}

function getMonths() {
	// TODO: Add Translation
	return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
}

export function numberToMonthname(number: number) {
	const months = getMonths();
	number = number - 1;
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
	month = month + 1;
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

type TimezoneObject = {
	date: Dayjs;
	timezone: keyof typeof TIMEZONE_VALUES;
};

/**
 * It creates an array of timezone objects, then finds the one where the hour is 0
 * @returns The timezone offset of the current timezone.
 */
export function getCurrentOffset() {
	const allZones = createTimezoneObjects();
	console.log('All zones: ', allZones);
	return allZones.find(({ date }) => date.hour() === 0) ?? null;
}
/**
 * It creates an array of objects, each of which contains a date and a timezone
 * @returns An array of objects with the timezone and date.
 */

export function createTimezoneObjects(): TimezoneObject[] {
	const allZones = Object.entries(TIMEZONE_VALUES).map(([timezone, zone]) => {
		const date = dayjs().tz(zone);
		console.log('Date: ', date);
		return { date, timezone: Number(timezone) };
	});
	return allZones;
}
