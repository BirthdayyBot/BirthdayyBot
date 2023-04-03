import type { Command } from '@sapphire/framework';
import type { Subcommand } from '@sapphire/plugin-subcommands';
import { useCorrectDayFormat } from './string';

interface DateResult {
	isValidDate: boolean;
	date: string;
	message: string;
}

export default function getDateFromInteraction(
	interaction: Command.ChatInputCommandInteraction | Subcommand.ChatInputCommandInteraction,
): DateResult {
	const result: DateResult = {
		isValidDate: false,
		date: '',
		message: 'Something went wrong while validating the date.',
	};

	const day = useCorrectDayFormat(interaction.options.getInteger('day', true));
	const month = parseInt(interaction.options.getString('month', true), 10);
	const year = interaction.options.getInteger('year', false) ?? 'XXXX';

	result.isValidDate = true;
	result.message = 'The provided date is valid';
	result.date = `${year}-${month}-${day}`;
	return result;
}
