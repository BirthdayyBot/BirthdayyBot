import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat.js';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import dayjstimezone from 'dayjs/plugin/timezone.js';
import { ChatInputCommandInteraction, time, type TimestampStylesString } from 'discord.js';
import { addZeroToSingleDigitNumber } from '#utils/common';
import type { ParsedDateString } from '#root/core/domain/services/date_utils.js';

dayjs.extend(advancedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(dayjstimezone);

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

export function splitDateString(date: string, separator = '-'): ParsedDateString {
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
