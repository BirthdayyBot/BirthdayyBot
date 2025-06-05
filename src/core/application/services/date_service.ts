import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat.js';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { type TFunction } from '@sapphire/plugin-i18next';

dayjs.extend(advancedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

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

/**
 * Utility service for date management, compatible with time zones.
 * All methods are pure and documented.
 */
export class DateService {
	/**
	 * Parses a date in the format "YYYY-MM-DD" or "XXXX-MM-DD" and returns a Date object.
	 * @throws {Error} If the date format or value is invalid.
	 */
	public parse(date: string): Date {
		if (!/^(\d{4}|XXXX)-\d{2}-\d{2}$/.test(date)) {
			throw new Error('Invalid date format. Use "YYYY-MM-DD" or "XXXX-MM-DD".');
		}
		const normalizedDate = date.replace('XXXX', '2000');
		const parsedDate = dayjs(normalizedDate, 'YYYY-MM-DD', true);
		if (!parsedDate.isValid()) {
			throw new Error('Invalid date value.');
		}
		// If the original date contained "XXXX", replace the year in the returned Date object
		if (date.startsWith('XXXX')) {
			const result = parsedDate.toDate();
			result.setFullYear(0);
			return result;
		}
		return parsedDate.toDate();
	}

	/**
	 * Formats a Date object as a string according to the provided format (default YYYY-MM-DD).
	 * @param date Date to format
	 * @param format Dayjs format (e.g., 'YYYY-MM-DD')
	 */
	public format(date: Date, format: string = 'YYYY-MM-DD'): string {
		return dayjs(date).format(format);
	}

	/**
	 * Checks if a date is in the future.
	 * @param date Date to check
	 */
	public isFuture(date: Date): boolean {
		return dayjs(date).isAfter(dayjs());
	}

	/**
	 * Returns the month name via i18n (external) according to the locale.
	 * @param month Month number (1-12)
	 * @param t i18n translation function
	 */
	public getMonthName(month: number, t: TFunction): string {
		if (month < 1 || month > 12) throw new Error('Invalid month number');
		return t(`month:${monthKeys[month - 1]}`);
	}

	/**
	 * Converts a user month (1-12) to a server month (0-11).
	 * @param userMonth User month (1-12)
	 */
	public userMonthToServerMonth(userMonth: number): number {
		if (userMonth < 1 || userMonth > 12) throw new Error('Invalid user month number');
		return userMonth - 1;
	}

	/**
	 * Converts a server month (0-11) to a user month (1-12).
	 * @param serverMonth Server month (0-11)
	 */
	public serverMonthToUserMonth(serverMonth: number): number {
		if (serverMonth < 0 || serverMonth > 11) throw new Error('Invalid server month number');
		return serverMonth + 1;
	}

	/**
	 * Returns the current date in the given timezone (e.g., 'Europe/Paris').
	 * @param tz IANA timezone (e.g., 'Europe/Paris')
	 */
	public nowInTimezone(tz: string): Date {
		return dayjs().tz(tz).toDate();
	}

	/**
	 * Formats a date in a given timezone.
	 * @param date Date to format
	 * @param tz IANA timezone
	 * @param format Dayjs format (e.g., 'YYYY-MM-DD HH:mm')
	 */
	public formatInTimezone(date: Date, tz: string, format: string = 'YYYY-MM-DD HH:mm'): string {
		return dayjs(date).tz(tz).format(format);
	}

	/**
	 * Checks if a date is valid, according to the expected format.
	 * @param dateString Date as string
	 * @param format Expected format (default 'YYYY-MM-DD')
	 */
	public isValid(dateString: string, format: string = 'YYYY-MM-DD'): boolean {
		return dayjs(dateString, format, true).isValid();
	}

	/**
	 * Adds or subtracts a number of days to a date.
	 * @param date Base date
	 * @param days Number of days (positive or negative)
	 */
	public addDays(date: Date, days: number): Date {
		return dayjs(date).add(days, 'day').toDate();
	}

	/**
	 * Returns the difference in days between two dates.
	 * @param dateA First date
	 * @param dateB Second date
	 */
	public diffInDays(dateA: Date, dateB: Date): number {
		return dayjs(dateA).diff(dayjs(dateB), 'day');
	}

	/**
	 * Retourne le prochain anniversaire à partir d'une liste de dates.
	 * @param birthday Date de l'anniversaire à vérifier
	 * @param fromDate Date de référence (par défaut aujourd'hui)
	 * @returns La date du prochain anniversaire ou null si la liste est vide
	 */
	public getNextBirthday(birthday: Date, fromDate: Date = new Date()): Date {
		const today = dayjs(fromDate);
		const birthdayThisYear = dayjs(birthday).year(today.year());

		if (birthdayThisYear.isAfter(today)) {
			return birthdayThisYear.toDate();
		}

		const birthdayNextYear = birthdayThisYear.add(1, 'year');
		return birthdayNextYear.toDate();
	}
}
