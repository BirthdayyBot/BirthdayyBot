import {
	monthKeys,
	Month,
	parseDateString,
	formatDate,
	isFutureDate,
	userMonthToServerMonth,
	serverMonthToUserMonth,
	diffInDays,
	addDays,
	getNextBirthday,
	getTimestampForDate
} from '#domain/services/date_utils';

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

	describe('parseDateString', () => {
		it('parses valid YYYY-MM-DD', () => {
			expect(parseDateString('2023-05-17')).toEqual({ year: 2023, month: 5, day: 17 });
		});
		it('parses XXXX-MM-DD', () => {
			expect(parseDateString('XXXX-12-25')).toEqual({ year: null, month: 12, day: 25 });
		});
		it('throws on invalid format', () => {
			expect(() => parseDateString('2023/05/17')).toThrow();
			expect(() => parseDateString('2023-5-17')).toThrow();
			expect(() => parseDateString('20230517')).toThrow();
		});
	});

	describe('formatDate', () => {
		it('formats with year', () => {
			expect(formatDate({ year: 2023, month: 5, day: 7 })).toBe('2023-05-07');
		});
		it('formats with null year', () => {
			expect(formatDate({ year: null, month: 1, day: 2 })).toBe('XXXX-01-02');
		});
		it('supports custom format', () => {
			expect(formatDate({ year: 2020, month: 12, day: 31 }, 'DD/MM/YYYY')).toBe('31/12/2020');
		});
	});

	describe('isFutureDate', () => {
		it('returns false if year is null', () => {
			expect(isFutureDate({ year: null, month: 1, day: 1 })).toBe(false);
		});
		it('returns true if date is in the future', () => {
			const future = { year: 2999, month: 1, day: 1 };
			expect(isFutureDate(future)).toBe(true);
		});
		it('returns false if date is in the past', () => {
			const past = { year: 2000, month: 1, day: 1 };
			expect(isFutureDate(past)).toBe(false);
		});
		it('respects custom "from" date', () => {
			const date = { year: 2025, month: 1, day: 1 };
			const from = new Date(2026, 0, 1);
			expect(isFutureDate(date, from)).toBe(false);
		});
	});

	describe('userMonthToServerMonth', () => {
		it('converts user month to server month', () => {
			expect(userMonthToServerMonth(1)).toBe(0);
			expect(userMonthToServerMonth(12)).toBe(11);
		});
		it('throws on invalid input', () => {
			expect(() => userMonthToServerMonth(0)).toThrow();
			expect(() => userMonthToServerMonth(13)).toThrow();
		});
	});

	describe('serverMonthToUserMonth', () => {
		it('converts server month to user month', () => {
			expect(serverMonthToUserMonth(0)).toBe(1);
			expect(serverMonthToUserMonth(11)).toBe(12);
		});
		it('throws on invalid input', () => {
			expect(() => serverMonthToUserMonth(-1)).toThrow();
			expect(() => serverMonthToUserMonth(12)).toThrow();
		});
	});

	describe('diffInDays', () => {
		it('returns positive difference', () => {
			const a = new Date(2023, 0, 10);
			const b = new Date(2023, 0, 1);
			expect(diffInDays(a, b)).toBe(9);
		});
		it('returns negative difference', () => {
			const a = new Date(2023, 0, 1);
			const b = new Date(2023, 0, 10);
			expect(diffInDays(a, b)).toBe(-9);
		});
		it('returns zero for same day', () => {
			const a = new Date(2023, 0, 1);
			const b = new Date(2023, 0, 1);
			expect(diffInDays(a, b)).toBe(0);
		});
	});

	describe('addDays', () => {
		it('adds days to date', () => {
			const date = new Date(2023, 0, 1);
			const result = addDays(date, 10);
			expect(result.getDate()).toBe(11);
			expect(result.getMonth()).toBe(0);
		});
		it('does not mutate original date', () => {
			const date = new Date(2023, 0, 1);
			addDays(date, 5);
			expect(date.getDate()).toBe(1);
		});
		it('handles negative days', () => {
			const date = new Date(2023, 0, 10);
			const result = addDays(date, -5);
			expect(result.getDate()).toBe(5);
		});
	});

	describe('getNextBirthday', () => {
		it('returns this year if birthday is in the future', () => {
			const from = new Date(2023, 0, 1);
			const next = getNextBirthday({ month: 12, day: 31 }, from);
			expect(next.getFullYear()).toBe(2023);
			expect(next.getMonth()).toBe(11);
			expect(next.getDate()).toBe(31);
		});
		it('returns next year if birthday has passed', () => {
			const from = new Date(2023, 11, 31); // Dec 31
			const next = getNextBirthday({ month: 1, day: 1 }, from);
			expect(next.getFullYear()).toBe(2024);
			expect(next.getMonth()).toBe(0);
			expect(next.getDate()).toBe(1);
		});
		it('returns next year if today is birthday', () => {
			const from = new Date(2023, 5, 15);
			const next = getNextBirthday({ month: 6, day: 15 }, from);
			expect(next.getFullYear()).toBe(2024);
		});
	});

	describe('getTimestampForDate', () => {
		it('returns unix timestamp as string', () => {
			const date = new Date('2023-01-01T00:00:00Z');
			const ts = getTimestampForDate(date);
			expect(ts).toBe(Math.trunc(date.getTime() / 1000).toString());
		});
		it('calls callback if provided', () => {
			const date = new Date('2023-01-01T00:00:00Z');
			const cb = vi.fn((ts: number) => `ts:${ts}`);
			const result = getTimestampForDate(date, cb);
			expect(cb).toHaveBeenCalledWith(Math.trunc(date.getTime() / 1000));
			expect(result).toBe(`ts:${Math.trunc(date.getTime() / 1000)}`);
		});
	});
});
