// eslint-disable-next-line spaced-comment
/// <reference lib="ESNext" />

import { once } from 'node:events';
import { readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createGunzip } from 'node:zlib';
import { extract } from 'tar';

const response = await fetch('https://www.iana.org/time-zones/repository/tzdata-latest.tar.gz');
if (!response.ok || !response.body) {
	console.error('Failed to read the UnicodeData file, see response:');
	console.error(await response.text());
	process.exit(1);
}

const cwd = tmpdir();
const zoneName = 'zone1970.tab';
const isoName = 'iso3166.tab';
const files = [zoneName, isoName];

const tar = extract({ cwd }, files).on('entry', (entry) => console.debug('[TAR] Written:', entry.absolute));
const gzip = createGunzip().pipe(tar);
const reader = response.body.getReader();

// Write the gzip stream into the tar stream:
let chunk;
while (!(chunk = await reader.read()).done) {
	gzip.write(chunk.value);
}

// End the writable and wait for it to flush:
tar.end();
await once(tar, 'finish');

// Write tz-country-codes.json
async function writeTzCountry() {
	const path = join(cwd, isoName);

	const text = await readFile(path, 'utf8');
	const lines = text.split(/\r?\n/g);

	/** @type {{code:string; name: string}[]} */
	const output = [];
	for (const line of lines) {
		if (!line.length || line.startsWith('#')) continue;

		// Line:
		//     ES	Spain
		// Format:
		// 0: Country code                                     - ES
		// 1: Name of country, territory, area, or subdivision - Spain
		const parts = line.split('\t');
		output.push({ code: parts[0], name: parts[1] });
	}

	output.sort((a, b) => a.name.localeCompare(b.name));
	const outputFile = new URL('../src/generated/data/tz-country-codes.json', import.meta.url);
	await writeFile(outputFile, JSON.stringify(output, undefined, '\t'), 'utf8');

	// Clean up the temporary file:
	await rm(path);
}

// Write tz.json
async function writeTzData() {
	const path = join(cwd, zoneName);

	const text = await readFile(path, 'utf8');
	const lines = text.split(/\r?\n/g);

	/** @type {{codes:string[]; name: string}[]} */
	const output = [];
	for (const line of lines) {
		if (!line.length || line.startsWith('#')) continue;

		// Line:
		//     ES	+4024-00341	Europe/Madrid	Spain (mainland)
		// Format:
		// 0: Comma-separated country codes - ES
		// 1: Coordinates                   - +4024-00341
		// 2: TZ                            - Europe/Madrid
		// 3: Comments                      - Spain (mainland)
		const parts = line.split('\t');
		const tz = parts[2];

		// Skip if the timezone isn't supported by the current Node.js version:
		try {
			new Intl.DateTimeFormat(undefined, { timeZone: tz });
		} catch {
			continue;
		}

		output.push({ codes: parts[0].split(','), name: tz.replaceAll('_', ' ') });
	}

	output.sort((a, b) => a.name.localeCompare(b.name));
	const outputFile = new URL('../src/generated/data/tz.json', import.meta.url);
	await writeFile(outputFile, JSON.stringify(output, undefined, '\t'), 'utf8');

	// Clean up the temporary file:
	await rm(path);
}

// Run both with allSettled so one's error doesn't affect the execution
// (and cleanup) of the other:
const results = await Promise.allSettled([
	writeTzCountry(), //
	writeTzData()
]);

/** @type {any[]} */
const errors = results.filter((result) => result.status === 'rejected');
if (errors.length > 0) {
	for (const error of errors) console.error(error.reason);
	process.exit(1);
}
