import { getStringDate } from '../utils/date';

/**
 * @returns {object} date
 */
export async function getCurrentOffset() {
	let allZones = createTimezones();
	let date = {
		current_offset: null,
		date: 'null',
		offsetString: ''
	};
	allZones.forEach((zone) => {
		if (zone.time.getHours() === 0) {
			date.offsetString = zone.offsetString;
			date.date = getStringDate(zone.time);
		}
	});
	return date;
}

function createTimezones(): any[] {
	let zones = [];
	const d = new Date();

	for (let i = -11; i <= 12; i++) {
		let offset = i;
		let offsetString;

		//if minus add a + if its a positive number add a -
		if (i < 0) {
			offset = i * -1;
			offsetString = `Etc/GMT+${offset}`;
		} else {
			offsetString = `Etc/GMT-` + offset;
		}

		const date = createDate(d, offsetString);
		const data = {
			time: date,
			offsetString: i,
			tz: getTimezone(i),
			l: offsetString
		};
		zones.push(data);
	}
	return zones;
}

function createDate(date: string | Date, timeZone: string) {
	if (typeof date === 'string') {
		return new Date(
			new Date(date).toLocaleString('en-US', {
				timeZone: timeZone
			})
		);
	}
	return new Date(
		date.toLocaleString('en-US', {
			timeZone
		})
	);
}

//check the hour and return the according timezone short name
function getTimezone(hour: number) {
	if (hour === 0) return 'GMT';
	if (hour === 1) return 'CET';
	if (hour === 2) return 'EET';
	if (hour === 3) return 'EAT';
	if (hour === 4) return 'NET';
	if (hour === 5) return 'PLT';
	if (hour === 6) return 'BST';
	if (hour === 7) return 'VST';
	if (hour === 8) return 'CTT';
	if (hour === 9) return 'JST';
	if (hour === 10) return 'AET';
	if (hour === 11) return 'SST';
	if (hour === 12) return 'NST';
	if (hour === -11) return 'MIT';
	if (hour === -10) return 'HST';
	if (hour === -9) return 'AST';
	if (hour === -8) return 'PST';
	if (hour === -7) return 'PNT';
	if (hour === -6) return 'CST';
	if (hour === -5) return 'EST';
	if (hour === -4) return 'PRT';
	if (hour === -2) return 'BET';
	return null;
}
