import {
	monthKeys,
	Month,
	extractDateComponents,
	standardizeDateDisplay,
	checkIfDateIsInFuture,
	convertUserMonthToServerMonth,
	convertServerMonthToUserMonth,
	calculateDateDifferenceInDays,
	incrementDateByDays,
	calculateUpcomingBirthday,
	formatDateToTimestamp
} from '#domain/services/date_utils';
import { formatDateForDisplay } from '#infrastructure/services/date';

describe('date_utils', () => {
	describe('monthKeys', () => {
		it('should contain 12 months', () => {
			expect(monthKeys).toHaveLength(12);
			expect(monthKeys[0]).toBe('january');
			expect(monthKeys[11]).toBe('december');
		});
	});

	describe('Month enum', () => {
		it('should map months to correct numbers', () => {
			expect(Month.January).toBe(1);
			expect(Month.December).toBe(12);
		});
	});

	describe('extractDateComponents', () => {
		it('parses valid YYYY-MM-DD', () => {
			expect(extractDateComponents('2023-05-17')).toEqual({ year: 2023, month: 5, day: 17 });
		});
		it('parses XXXX-MM-DD', () => {
			expect(extractDateComponents('XXXX-12-25')).toEqual({ year: null, month: 12, day: 25 });
		});
		it('throws on invalid format', () => {
			expect(() => extractDateComponents('2023/05/17')).toThrow();
			expect(() => extractDateComponents('2023-5-17')).toThrow();
			expect(() => extractDateComponents('20230517')).toThrow();
		});
	});

	describe('standardizeDateDisplay', () => {
		it('formats with year', () => {
			expect(standardizeDateDisplay({ year: 2023, month: 5, day: 7 })).toBe('2023-05-07');
		});
		it('formats with null year', () => {
			expect(standardizeDateDisplay({ year: null, month: 1, day: 2 })).toBe('XXXX-01-02');
		});
		it('supports custom format', () => {
			expect(standardizeDateDisplay({ year: 2020, month: 12, day: 31 }, 'DD/MM/YYYY')).toBe('31/12/2020');
		});
	});

	describe('checkIfDateIsInFuture', () => {
		it('returns false if year is null', () => {
			expect(checkIfDateIsInFuture({ year: null, month: 1, day: 1 })).toBe(false);
		});
		it('returns true if date is in the future', () => {
			const future = { year: 2999, month: 1, day: 1 };
			expect(checkIfDateIsInFuture(future)).toBe(true);
		});
		it('returns false if date is in the past', () => {
			const past = { year: 2000, month: 1, day: 1 };
			expect(checkIfDateIsInFuture(past)).toBe(false);
		});
		it('respects custom "from" date', () => {
			const date = { year: 2025, month: 1, day: 1 };
			const from = new Date(2026, 0, 1);
			expect(checkIfDateIsInFuture(date, from)).toBe(false);
		});
	});

	describe('convertUserMonthToServerMonth', () => {
		it('converts user month to server month', () => {
			expect(convertUserMonthToServerMonth(1)).toBe(0);
			expect(convertUserMonthToServerMonth(12)).toBe(11);
		});
		it('throws on invalid input', () => {
			expect(() => convertUserMonthToServerMonth(0)).toThrow();
			expect(() => convertUserMonthToServerMonth(13)).toThrow();
		});
	});

	describe('convertServerMonthToUserMonth', () => {
		it('converts server month to user month', () => {
			expect(convertServerMonthToUserMonth(0)).toBe(1);
			expect(convertServerMonthToUserMonth(11)).toBe(12);
		});
		it('throws on invalid input', () => {
			expect(() => convertServerMonthToUserMonth(-1)).toThrow();
			expect(() => convertServerMonthToUserMonth(12)).toThrow();
		});
	});

	describe('calculateDateDifferenceInDays', () => {
		it('returns positive difference', () => {
			const a = new Date(2023, 0, 10);
			const b = new Date(2023, 0, 1);
			expect(calculateDateDifferenceInDays(a, b)).toBe(9);
		});
		it('returns negative difference', () => {
			const a = new Date(2023, 0, 1);
			const b = new Date(2023, 0, 10);
			expect(calculateDateDifferenceInDays(a, b)).toBe(-9);
		});
		it('returns zero for same day', () => {
			const a = new Date(2023, 0, 1);
			const b = new Date(2023, 0, 1);
			expect(calculateDateDifferenceInDays(a, b)).toBe(0);
		});
	});

	describe('incrementDateByDays', () => {
		it('adds days to date', () => {
			const date = new Date(2023, 0, 1);
			const result = incrementDateByDays(date, 10);
			expect(result.getDate()).toBe(11);
			expect(result.getMonth()).toBe(0);
		});
		it('does not mutate original date', () => {
			const date = new Date(2023, 0, 1);
			incrementDateByDays(date, 5);
			expect(date.getDate()).toBe(1);
		});
		it('handles negative days', () => {
			const date = new Date(2023, 0, 10);
			const result = incrementDateByDays(date, -5);
			expect(result.getDate()).toBe(5);
		});
	});

	describe('calculateUpcomingBirthday', () => {
		it('returns this year if birthday is in the future', () => {
			const from = new Date(2023, 0, 1);
			const next = calculateUpcomingBirthday({ month: 12, day: 31 }, from);
			expect(next.getFullYear()).toBe(2023);
			expect(next.getMonth()).toBe(11);
			expect(next.getDate()).toBe(31);
		});
		it('returns next year if birthday has passed', () => {
			const from = new Date(2023, 11, 31); // Dec 31
			const next = calculateUpcomingBirthday({ month: 1, day: 1 }, from);
			expect(next.getFullYear()).toBe(2024);
			expect(next.getMonth()).toBe(0);
			expect(next.getDate()).toBe(1);
		});
		it('returns next year if today is birthday', () => {
			const from = new Date(2023, 5, 15);
			const next = calculateUpcomingBirthday({ month: 6, day: 15 }, from);
			expect(next.getFullYear()).toBe(2024);
		});
	});

	describe('formatDateToTimestamp', () => {
		it('returns unix timestamp as string', () => {
			const date = new Date('2023-01-01T00:00:00Z');
			const ts = formatDateToTimestamp(date);
			expect(ts).toBe(Math.trunc(date.getTime() / 1000).toString());
		});
		it('calls callback if provided', () => {
			const date = new Date('2023-01-01T00:00:00Z');
			const cb = vi.fn((ts: number) => `ts:${ts}`);
			const result = formatDateToTimestamp(date, cb);
			expect(cb).toHaveBeenCalledWith(Math.trunc(date.getTime() / 1000));
			expect(result).toBe(`ts:${Math.trunc(date.getTime() / 1000)}`);
		});
	});
});
