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

export interface DateWithOptionalYear {
	day: number;
	month: number;
	year: null | number;
}

export interface TaskBirthdayData extends DateWithOptionalYear, Record<string, unknown> {
	guildId: string;
	userId: string;
}
