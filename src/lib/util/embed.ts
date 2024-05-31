import { ClientColor } from '#utils/constants';
import { Colors } from 'discord.js';

export function interactionSuccess(description: string, ephemeral = true) {
	return {
		ephemeral,
		embeds: [
			{
				color: ClientColor,
				description: `${description}`
			}
		]
	};
}

export function interactionProblem(description: string, ephemeral = true) {
	return {
		ephemeral,
		embeds: [
			{
				color: Colors.Red,
				description: `${description}`
			}
		]
	};
}
