import { container } from '@sapphire/pieces';

export function getLocalizedString(locale: string, key: string) {
	return container.i18n.format(locale, key, {
		defaultValue: `Translation not found: ${key}`,
		fallbackLng: 'en',
	});
}
