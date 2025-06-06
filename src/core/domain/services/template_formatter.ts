// Service de domaine pur pour le formatage de template

/**
 * Remplace les clés du template par leurs valeurs dans le message.
 * @param template Le message avec des placeholders (ex: {{user}})
 * @param values Un dictionnaire clé/valeur (clé = placeholder, valeur = string)
 */
export function formatTemplate(template: string, values: Record<string, string>): string {
	let formatted = template;
	for (const [key, value] of Object.entries(values)) {
		formatted = formatted.replace(new RegExp(escapeRegExp(key), 'g'), value);
	}
	return formatted;
}

/**
 * Échappe les caractères spéciaux d'une chaîne pour une utilisation sûre dans une RegExp.
 * @param str La chaîne à échapper
 */
function escapeRegExp(str: string): string {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
