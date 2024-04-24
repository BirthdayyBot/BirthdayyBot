import type { ButtonInteraction } from 'discord.js';

import { generateBirthdayList } from '#utils/birthday/index';
import { generateDefaultEmbed } from '#utils/embed';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';

@ApplyOptions<InteractionHandler.Options>({ interactionHandlerType: InteractionHandlerTypes.Button })
export class ExampleParseMethod extends InteractionHandler {
	public override async parse(interaction: ButtonInteraction<'cached'>) {
		if (!interaction.customId.startsWith('birthday_list_page_')) return this.none();
		const pageNumber = Number(interaction.customId.split('_')[3]);
		await interaction.deferUpdate();
		if (!interaction.channel || !interaction.message) return this.none();
		return this.some({ pageNumber });
	}

	public async run(interaction: ButtonInteraction<'cached'>, result: { pageNumber: number }) {
		const { components, embed } = await generateBirthdayList(result.pageNumber, interaction.guild);
		const finalEmbed = generateDefaultEmbed(embed);
		return interaction.message.edit({ components, embeds: [finalEmbed] });
	}
}
