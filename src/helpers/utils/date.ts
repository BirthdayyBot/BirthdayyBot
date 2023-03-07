// import { DEBUG } from '../provide/environment';

import { container } from '@sapphire/framework';
import { DEBUG } from '../provide/environment';
import { checkIfLengthIsTwo } from './string';

export function getCurrentDate(): string {
	const d1 = new Date().toLocaleString('en-US', {
		timeZone: 'Europe/Berlin'
	});
	const date = new Date(d1);

	const d = date.getDate();
	const day = d <= 9 ? '0' + d : d;

	const m = date.getMonth() + 1;
	const month = m <= 9 ? '0' + m : m;

	const year = date.getFullYear();

	const str = `${year}-${month}-${day}`;
	DEBUG ? container.logger.info('today: ', str) : str;
	return str;
}

export function getBeautifiedDate(date: string, fromHumanFormat = false) {
	//DD.MM.YYY
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
	year.includes('XXXX') ? (finalString += ``) : (finalString += ` ${year}`);
	return finalString;
}

function getMonths() {
	//TODO: Add Translation
	return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
}

export function numberToMonthname(number: number) {
	const months = getMonths();
	number = number - 1;
	return months[number];
}

export function getStringDate(date: Date) {
	const d = date.getDate();
	const m = date.getMonth() + 1;
	const year = date.getFullYear();
	const day = checkIfLengthIsTwo(`${d}`);
	const month = checkIfLengthIsTwo(`${m}`);

	return `${year}-${month}-${day}`;
}
