// import { DEBUG } from '../provide/environment';

import { container } from '@sapphire/framework';
import { DEBUG } from '../provide/environment';
import { checkIfLengthIsTwo } from './string';

export function getCurrentDate(): string {
    const d1 = new Date().toLocaleString('en-US', {
        timeZone: 'Europe/Berlin',
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

export function getStringDate(date: Date) {
    const d = date.getDate();
    const m = date.getMonth() + 1;
    const year = date.getFullYear();
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
