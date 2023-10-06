import { container } from '@sapphire/pieces';
import { GuildMember, userMention } from 'discord.js';

export function addZeroToSingleDigitNumber(number: number | string): string {
	return number.toString().length < 2 ? `0${number}` : `${number}`;
}

export function checkIfLengthIsTwo(number: string) {
	return number.length < 2 ? `0${number}` : number;
}

export function logLimiter() {
	container.logger.info('===============================');
}

export function checkLength(length: number, string: string) {
	return string.toString().length === length;
}

export function formatBirthdayMessage(message: string, member: GuildMember) {
	const placeholders = {
		'{USERNAME}': member.displayName,
		'{DISCRIMINATOR}': member.user?.discriminator ?? '0',
		'{NEW_LINE}': '\n',
		'{GUILD_NAME}': member.guild.name,
		'{GUILD_ID}': member.guild.id,
		'{MENTION}': userMention(member.id),
		'{SERVERNAME}': member.guild.name,
	};

	let formattedMessage = message;
	for (const [placeholder, value] of Object.entries(placeholders)) {
		formattedMessage = formattedMessage.replace(new RegExp(placeholder, 'gi'), value);
	}

	return formattedMessage;
}
