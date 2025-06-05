// Service de domaine pur pour le formatage de template

/**
 * Remplace les clés du template par leurs valeurs dans le message.
 * @param template Le message avec des placeholders (ex: {{user}})
 * @param values Un dictionnaire clé/valeur (clé = placeholder, valeur = string)
 */
export function formatTemplate(template: string, values: Record<string, string>): string {
	let formatted = template;
	for (const [key, value] of Object.entries(values)) {
		formatted = formatted.replace(new RegExp(key, 'g'), value);
	}
	return formatted;
}
