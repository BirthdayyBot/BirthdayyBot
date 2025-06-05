import { Guild, time, TimestampStyles, User } from 'discord.js';
import { type Birthday } from '#domain/entities/birthday/birthday';
import { DateService } from '#root/core/application/services/date_service';
import { formatTemplate } from '#domain/services/template_formatter';

export interface BirthdayMessageFormatOptions {
	user: User;
	guild: Guild;
	birthday: Birthday;
	customPlaceholders?: Record<string, string>;
}

export function formatBirthdayMessage(message: string, options: BirthdayMessageFormatOptions): string {
	const { user, guild, birthday, customPlaceholders } = options;
	const dateService = new DateService();

	const parsedBirthday = dateService.parse(birthday.birthday);
	const formattedBirthday = dateService.format(parsedBirthday, 'MMMM Do');
	const nextBirthday = dateService.getNextBirthday(parsedBirthday);
	const discordTimestamp = parsedBirthday ? `<t:${Math.floor(parsedBirthday.getTime() / 1000)}:D>` : '';
	const nextBirthdayTimestamp = nextBirthday ? time(nextBirthday, TimestampStyles.LongDate) : '';

	const placeholders: Record<string, string> = {
		'{{user}}': user.toString(),
		'{{user.id}}': user.id,
		'{{user.username}}': user.username,
		'{{user.discriminator}}': user.discriminator,
		'{{guild}}': guild.name,
		'{{guild.id}}': guild.id,
		'{{birthday}}': formattedBirthday,
		'{{birthdayDate}}': birthday.birthday,
		'{{discordTimestamp}}': discordTimestamp,
		'{{nextBirthday}}': nextBirthdayTimestamp,
		...customPlaceholders
	};

	return formatTemplate(message, placeholders);
}
