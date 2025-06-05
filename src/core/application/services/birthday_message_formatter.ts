import { Guild, time, TimestampStyles, User } from 'discord.js';
import { type Birthday } from '#domain/entities/birthday/birthday';
import { formatTemplate } from '#domain/services/template_formatter';
import { formatDate, getNextBirthday, getTimestampForDate, parseDateString } from '#domain/services/date_utils';

export interface BirthdayMessageFormatOptions {
	user: User;
	guild: Guild;
	birthday: Birthday;
	customPlaceholders?: Record<string, string>;
}

/**
 * Formats a birthday message with dynamic placeholders.
 * @param message The message containing placeholders.
 * @param options Formatting options (user, guild, birthday, custom placeholders).
 * @returns The formatted message.
 */
export function formatBirthdayMessage(message: string, options: BirthdayMessageFormatOptions): string {
	const { user, guild, birthday, customPlaceholders } = options;

	const parsedBirthday = parseDateString(birthday.birthday);

	const formattedBirthday = formatDate(parsedBirthday);
	const nextBirthday = getNextBirthday(parsedBirthday);
	const nextBirthdayTimestamp = getTimestampForDate(nextBirthday);
	const discordTimestamp = time(nextBirthday, TimestampStyles.LongDateTime);

	const basePlaceholders: Record<string, string> = {
		'{{user}}': user.toString(),
		'{{user.id}}': user.id,
		'{{user.username}}': user.username,
		'{{user.discriminator}}': user.discriminator,
		'{{guild}}': guild.name,
		'{{guild.id}}': guild.id,
		'{{birthday}}': formattedBirthday,
		'{{birthdayDate}}': birthday.birthday,
		'{{discordTimestamp}}': discordTimestamp,
		'{{nextBirthday}}': nextBirthdayTimestamp
	};

	const placeholders = Object.assign({}, basePlaceholders, customPlaceholders);

	return formatTemplate(message, placeholders);
}
