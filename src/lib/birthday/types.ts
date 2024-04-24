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
	year: number | null;
	month: number;
	day: number;
}

export interface TaskBirthdayData extends DateWithOptionalYear, Record<string, unknown> {
	userId: string;
	guildId: string;
}
