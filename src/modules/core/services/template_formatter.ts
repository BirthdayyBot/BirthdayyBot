/**
 * Format a template string by replacing variables with corresponding values.
 * @param template The template string containing variables in the format {{variable}}.
 * @param values An object containing key-value pairs where keys are variable names and values are their replacements.
 * @returns The formatted string with variables replaced by their corresponding values.
 */
export function formatTemplate(template: string, values: Record<string, string>): string {
	let formatted = template;
	for (const [key, value] of Object.entries(values)) {
		formatted = formatted.replace(new RegExp(escapeRegExp(key), 'g'), value);
	}
	return formatted;
}

/**
 * Escapes special characters in a string to be used in a regular expression.
 * This is useful for safely replacing variables in a template string.
 * @param str The string to escape.
 * @returns The escaped string.
 */
function escapeRegExp(str: string): string {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
