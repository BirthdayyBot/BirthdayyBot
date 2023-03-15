import { container } from '@sapphire/framework';

export async function getLocalizedString(locale: string, key: string) {
	return container.i18n.format(locale, key, {
		defaultValue: `Translation not found: ${key}`,
		fallbackLng: 'en',
	});
}
