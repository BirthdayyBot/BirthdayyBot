import { TIMEZONE_VALUES } from '#utils/common';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { AutocompleteInteraction } from 'discord.js';

@ApplyOptions<InteractionHandler.Options>({ interactionHandlerType: InteractionHandlerTypes.Autocomplete })
export class UserInteractionHandler extends InteractionHandler {
	public async run(interaction: AutocompleteInteraction, result: InteractionHandler.ParseResult<this>) {
		return interaction.respond(result);
	}

	public override parse(interaction: AutocompleteInteraction) {
		if (interaction.commandName !== 'config') return this.none();

		const focusedOption = interaction.options.getFocused(true);

		switch (focusedOption.name) {
			case 'timezone': {
				const items = Object.entries(TIMEZONE_VALUES).map(([value, name]) => ({ name, value }));
				return this.some(
					items.filter((item) => item.name.toLowerCase().includes(focusedOption.value.toLowerCase()))
				);
			}
			default:
				return this.none();
		}
	}
}
