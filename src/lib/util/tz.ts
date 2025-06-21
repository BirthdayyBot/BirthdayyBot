import { cut } from '#utils/common/strings';
import { srcFolder } from '#utils/constants';
import dayjs from 'dayjs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const tz = new Map<string, TimeZone>();

export let MinimumLength = 100;
export const MaximumLength = 100;

{
	const tzCountries = new Map<string, TimeZoneCountry>();
	const tzCountryNames = new Map<string, string>();

	const PathTimeZoneCountry = join(srcFolder, 'generated/data/tz-country-codes.json');
	for (const entry of JSON.parse(await readFile(PathTimeZoneCountry, 'utf8')) as RawTimeZoneCountry[]) {
		tzCountries.set(entry.code, { code: entry.code.toLowerCase(), name: entry.name.toLowerCase() });
		tzCountryNames.set(entry.code, entry.name);
	}

	const PathTimeZone = join(srcFolder, 'generated/data/tz.json');
	for (const entry of JSON.parse(await readFile(PathTimeZone, 'utf8')) as RawTimeZone[]) {
		const countries = entry.codes.map((code) => tzCountries.get(code)!);
		const countryNames = entry.codes.map((code) => tzCountryNames.get(code)!);
		tz.set(entry.name.toLowerCase(), {
			name: entry.name,
			countries,
			// It's cut to the maximum length minus 2 because auto-complete will prepend an emoji and a space:
			full: cut(`${entry.name} (${countryNames.join(', ')})`, MaximumLength - 2)
		});

		if (entry.name.length < MinimumLength) MinimumLength = entry.name.length;
	}
}

const defaults = [
	'asia/kolkata', // India
	'america/los angeles', // United States, West Coast
	'america/new york', // United States, East Coast
	'america/phoenix', // United States, Mountain Central
	'europe/london', // United Kingdom, Ireland
	'pacific/auckland', // New Zealand, Antarctica
	'europe/paris', // France, Monaco, Belgium, The Netherlands, Luxembourg
	'america/mexico city', // Mexico
	'australia/melbourne', // Australia
	'australia/sydney', // Australia
	'australia/perth', // Australia
	'australia/brisbane', // Australia
	'america/toronto', // Canada, Bahamas
	'america/sao paulo', // Brazil
	'america/argentina/buenos aires', // Argentina
	'asia/tokyo', // Japan
	'europe/madrid', // Spain
	'asia/singapore', // Singapore
	'asia/bangkok', // Thailand, Christmas Island, Cambodia, Laos, Vietnam
	'europe/istanbul', // Turkey
	'asia/seoul', // South Korea
	'europe/berlin', // Berlin, Denmark, Norway, Sweden, Svalbard & Jan Mayen
	'europe/prague', // Czech Republic, Slovakia
	'asia/shanghai', // China
	'africa/cairo' // Egypt
].map((value) => ({ score: 1, value: tz.get(value)! }) satisfies TimeZoneSearchResult);

export function getTimeZone(id: string) {
	return tz.get(id.toLowerCase()) ?? null;
}

export function searchTimeZone(id: string): readonly TimeZoneSearchResult[] {
	if (id.length === 0) return defaults;
	if (id.length > MaximumLength) return [];

	id = id.toLowerCase();
	const entries = [] as TimeZoneSearchResult[];
	for (const [key, value] of tz.entries()) {
		const score = getSearchScore(id, key, value);
		if (score !== 0) entries.push({ score, value });
	}

	return entries.sort((a, b) => b.score - a.score).slice(0, 25);
}

function getSearchScore(id: string, key: string, value: TimeZone) {
	if (key === id) return 1;

	let score = key.includes(id) ? id.length / key.length : 0;
	for (const country of value.countries) {
		if (country.name === id || country.code === id) return 1;
		if (country.name.includes(id)) score = Math.max(score, id.length / country.name.length);
	}

	return score;
}

export interface CurrentOffsetResult {
	utcOffset: number;
	dateFormatted: string;
	date: string;
	timezone?: string;
}

export function getCurrentOffset(): CurrentOffsetResult | null {
	const timezones = getTimeZones();
	const now = dayjs();

	for (const timezone of timezones) {
		const date = now.tz(timezone.name);
		if (date.hour() === 0) {
			return {
				utcOffset: date.utcOffset(),
				dateFormatted: date.format('YYYY-MM-DD HH:mm:ss'),
				date: date.format('MM-DD'),
				timezone: timezone.name
			};
		}
	}
	return null;
}

export function getTimezoneWithOffset(offset: number) {
	const timezones = Array.from(tz.values()).filter((timezone) => {
		const utcOffset = dayjs().tz(timezone.name).utcOffset();
		return utcOffset === offset;
	});
	return timezones.map((timezone) => timezone.name);
}

export function getTimeZones(): readonly TimeZone[] {
	return Array.from(tz.values());
}

export interface TimeZone {
	countries: TimeZoneCountry[];
	name: string;
	full: string;
}

export interface TimeZoneCountry {
	code: string;
	name: string;
}

export interface TimeZoneSearchResult {
	score: number;
	value: TimeZone;
}

interface RawTimeZoneCountry {
	code: string;
	name: string;
}

interface RawTimeZone {
	codes: string[];
	name: string;
}
