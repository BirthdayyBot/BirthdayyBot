import type { Command } from '@sapphire/framework';
import type { Subcommand } from '@sapphire/plugin-subcommands';
import findOption from './findOption';
import { useCorrectDayFormat } from './string';

interface DateResult {
	isValidDate: boolean;
	date: string;
	message: string;
}

/**
 *
 * @param interaction - it can be of type Command.ChatInputCommandInteraction or Subcommand.ChatInputCommandInteraction
 * @returns an object with properties "isValidDate", "date", "message" representing if the date is valid, the date string in the format of "YYYY-MM-DD" and a message indicating the result of the operation
 */
export default function getDateFromInteraction(
    interaction: Command.ChatInputCommandInteraction | Subcommand.ChatInputCommandInteraction,
): DateResult {
    const result: DateResult = {
        isValidDate: false,
        date: '',
        message: 'Something went wrong while validating the date.',
    };

    const day = useCorrectDayFormat(findOption(interaction, 'day', null));
    const month = findOption(interaction, 'month', null);
    const year = findOption(interaction, 'year', 'XXXX');

    if (!day || !month) {
        console.error('day or month is null');
        result.message = 'day or month is null';
        return result;
    }

    if (parseInt(day) > 31 || parseInt(day) < 1) {
        console.error('invalid day provided');
        result.message = 'The provided day is invalid. Please provide a day between 1 and 31';
        return result;
    }
    result.isValidDate = true;
    result.message = 'The provided date is valid';
    result.date = `${year}-${month}-${day}`;
    return result;
}
