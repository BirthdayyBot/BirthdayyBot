import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat.js';
import { default as dayjstimezone, default as timezone } from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';

dayjs.extend(advancedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(dayjstimezone);

import { addZeroToSingleDigitNumber } from '#utils/common';
import { ChatInputCommandInteraction, time, type TimestampStylesString } from 'discord.js';

export function numberToMonthName(number: number) {
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
	];
	return months[number - 1];
}

export function formatDateForDisplay(date: string, fromHumanFormat = false) {
	const [year, month, day] = date.split(fromHumanFormat ? '.' : '-');
	return `${day}. ${numberToMonthName(Number(month))} ${year.includes('XXXX') ? '' : year}`;
}

export function splitDateString(date: string, separator = '-'): SplitDateResult {
	const [year, month, day] = date.split(separator);
	return { year, month: Number(month), day: Number(day) };
}

export function parseInputDate(date: string | Date): Date {
	let inputDate: Date;

	if (typeof date === 'string') {
		if (!/^(\d{4}|XXXX)-\d{2}-\d{2}$/.test(date)) {
			throw new Error('Invalid date format. Please use "XXXX-MM-DD".');
		}
		inputDate = new Date(date.replace('XXXX', '2000'));
	} else {
		inputDate = date;
	}
	return inputDate;
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

export const monthKeys = [
	'january',
	'february',
	'march',
	'april',
	'may',
	'june',
	'july',
	'august',
	'september',
	'october',
	'november',
	'december'
];

export const enum Month {
	January = 1,
	February,
	March,
	April,
	May,
	June,
	July,
	August,
	September,
	October,
	November,
	December
}

export interface ParsedDateInfo {
	year: number | null; // null for 'XXXX'
	month: number; // 1-12
	day: number; // 1-31
}

export interface SplitDateResult {
	year: string; // 'XXXX' or 'YYYY'
	month: number; // 1-12
	day: number; // 1-31
}

export function extractDateComponents(date: string): ParsedDateInfo {
	const match = /^(\d{4}|XXXX)-(\d{2})-(\d{2})$/.exec(date);
	if (!match) throw new Error('Invalid date format. Please use "YYYY-MM-DD" or "XXXX-MM-DD".');
	return {
		year: match[1] === 'XXXX' ? null : Number(match[1]),
		month: Number(match[2]),
		day: Number(match[3])
	};
}

export function standardizeDateDisplay(
	{ year, month, day }: { year: number | null; month: number; day: number },
	format = 'YYYY-MM-DD'
): string {
	const y = year === null ? 'XXXX' : String(year).padStart(4, '0');
	const m = String(month).padStart(2, '0');
	const d = String(day).padStart(2, '0');
	return format.replace('YYYY', y).replace('MM', m).replace('DD', d);
}

export function checkIfDateIsInFuture({ year, month, day }: ParsedDateInfo, from = new Date()): boolean {
	if (year === null) return false;
	const date = new Date(year, month - 1, day);
	return date > from;
}

export function convertUserMonthToServerMonth(userMonth: number): number {
	if (userMonth < 1 || userMonth > 12) throw new Error('Numéro de mois utilisateur invalide');
	return userMonth - 1;
}

export function convertServerMonthToUserMonth(serverMonth: number): number {
	if (serverMonth < 0 || serverMonth > 11) throw new Error('Numéro de mois serveur invalide');
	return serverMonth + 1;
}

export function calculateDateDifferenceInDays(dateA: Date, dateB: Date): number {
	const msPerDay = 24 * 60 * 60 * 1000;
	return Math.floor((dateA.getTime() - dateB.getTime()) / msPerDay);
}

export function incrementDateByDays(date: Date, days: number): Date {
	const result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
}

export function calculateUpcomingBirthday(
	{ month, day }: { month: number; day: number },
	from: Date = new Date()
): Date {
	const year = from.getFullYear();
	const thisYear = new Date(year, month - 1, day);
	if (thisYear > from) return thisYear;
	return new Date(year + 1, month - 1, day);
}

export function formatDateToTimestamp(date: Date, callback?: (timestamp: number) => string): string {
	const timestamp = Math.trunc(date.getTime() / 1000);
	return typeof callback === 'function' ? callback(timestamp) : timestamp.toString();
}
