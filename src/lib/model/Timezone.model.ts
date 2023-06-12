import type { Dayjs } from 'dayjs';
import type { TIMEZONE_VALUES } from '../../helpers/utils/date';

export interface TimezoneObject {
	date: Dayjs;
	dateFormatted: string;
	utcOffset?: keyof typeof TIMEZONE_VALUES;
	timezone?: typeof TIMEZONE_VALUES;
}
