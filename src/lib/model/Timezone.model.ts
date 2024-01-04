import type { TIMEZONE_VALUES } from '#root/helpers/utils/date';
import type { Dayjs } from 'dayjs';

export interface TimezoneObject {
	date: Dayjs;
	dateFormatted: string;
	utcOffset?: keyof typeof TIMEZONE_VALUES;
	timezone?: typeof TIMEZONE_VALUES;
}
