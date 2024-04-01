import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { fetchT } from '@sapphire/plugin-i18next';
import { AutocompleteInteraction } from 'discord.js';

@ApplyOptions<InteractionHandler.Options>({ interactionHandlerType: InteractionHandlerTypes.Autocomplete })
export class UserInteractionHandler extends InteractionHandler {
	public async run(interaction: AutocompleteInteraction, result: InteractionHandler.ParseResult<this>) {
		return interaction.respond(result);
	}

	public override async parse(interaction: AutocompleteInteraction) {
		if (interaction.commandName !== 'birthday') return this.none();

		const focusedOption = interaction.options.getFocused(true);

		switch (focusedOption.name) {
			case 'month': {
				const t = await fetchT(interaction);
				const months = t('globals:months', { returnObjects: true }) satisfies string[];
				this.container.logger.debug(months);
				const items = months.map((name, index) => ({ name, value: index + 1 }));

				return this.some(
					items.filter((item) => item.name.toLowerCase().includes(focusedOption.value.toLowerCase())),
				);
			}
			default:
				return this.none();
		}
	}
}
