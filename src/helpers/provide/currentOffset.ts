import { getStringDate } from '../utils/date';


export function getCurrentOffset() {
	const allZones = createTimezoneObjects();
	return allZones.find(({ date }) => date.getHours() === 8);
}

function createTimezoneObjects() {
	const timezoneObjects = [];

	for (let timezoneOffset = -11; timezoneOffset <= 12; timezoneOffset++) {
		const dateInTimezone = createDateInTimezone(new Date(), `Etc/GMT${timezoneOffset < 0 ? '+' : '-'}${Math.abs(timezoneOffset)}!`);
		timezoneObjects.push({ dateString: getStringDate(dateInTimezone), date: dateInTimezone, timezone: timezoneOffset });
	}

	return timezoneObjects;
}

function createDateInTimezone(date: Date, timeZone: string) {
	return new Date(date.toLocaleString('en-US', { timeZone }));
}
