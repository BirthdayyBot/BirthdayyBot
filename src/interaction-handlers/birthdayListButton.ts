import { generateBirthdayList } from '#lib/utils/birthday';
import { generateDefaultEmbed } from '#lib/utils/embed';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import type { ButtonInteraction } from 'discord.js';

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
		const { embed, components } = await generateBirthdayList(result.pageNumber, interaction.guild);
		const finalEmbed = generateDefaultEmbed(embed);
		return interaction.message.edit({ embeds: [finalEmbed], components });
	}
}
