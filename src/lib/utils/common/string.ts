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
		'{DISCRIMINATOR}': member.user?.discriminator ?? '0',
		'{GUILD_ID}': member.guild.id,
		'{GUILD_NAME}': member.guild.name,
		'{MENTION}': userMention(member.id),
		'{NEW_LINE}': '\n',
		'{SERVERNAME}': member.guild.name,
		'{USERNAME}': member.displayName
	};

	let formattedMessage = message;
	for (const [placeholder, value] of Object.entries(placeholders)) {
		formattedMessage = formattedMessage.replace(new RegExp(placeholder, 'gi'), value);
	}

	return formattedMessage;
}
