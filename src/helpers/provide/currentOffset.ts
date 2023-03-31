import dayjs, { Dayjs } from 'dayjs';
import dayjstimezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

// Extend dayjs with the required plugins
dayjs.extend(utc);
dayjs.extend(dayjstimezone);

// Define an object for mapping timezone values to their string representations.
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
	return allZones.find(({ date }) => date.hour() === 0) ?? null;
}
/**
 * It creates an array of objects, each of which contains a date and a timezone
 * @returns An array of objects with the timezone and date.
 */

export function createTimezoneObjects(): TimezoneObject[] {
	const allZones = Object.entries(TIMEZONE_VALUES).map(([timezone, zone]) => {
		const date = dayjs().tz(zone);
		return { date, timezone: Number(timezone) };
	});
	return allZones;
}
