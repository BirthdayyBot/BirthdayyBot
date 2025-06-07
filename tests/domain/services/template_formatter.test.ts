import { describe, it, expect } from 'vitest';
import { formatTemplate } from '#domain/services/template_formatter';

describe('formatTemplate', () => {
	it('replaces a single placeholder', () => {
		const template = 'Hello, {name}!';
		const values = { '{name}': 'Alice' };
		expect(formatTemplate(template, values)).toBe('Hello, Alice!');
	});

	it('replaces multiple placeholders', () => {
		const template = '{greeting}, {name}!';
		const values = { '{greeting}': 'Hi', '{name}': 'Bob' };
		expect(formatTemplate(template, values)).toBe('Hi, Bob!');
	});

	it('replaces repeated placeholders', () => {
		const template = '{word} {word} {word}';
		const values = { '{word}': 'echo' };
		expect(formatTemplate(template, values)).toBe('echo echo echo');
	});

	it('returns the original string if no placeholders match', () => {
		const template = 'No placeholders here.';
		const values = { '{unused}': 'value' };
		expect(formatTemplate(template, values)).toBe('No placeholders here.');
	});

	it('handles empty values object', () => {
		const template = 'Hello, {name}!';
		const values = {};
		expect(formatTemplate(template, values)).toBe('Hello, {name}!');
	});

	it('handles empty template string', () => {
		const template = '';
		const values = { '{name}': 'Alice' };
		expect(formatTemplate(template, values)).toBe('');
	});

	it('replaces overlapping keys in order', () => {
		const template = '{a}{ab}';
		const values = { '{a}': 'X', '{ab}': 'Y' };
		expect(formatTemplate(template, values)).toBe('XY');
	});
});
