import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import type { ButtonInteraction } from 'discord.js';
import generateBirthdayList from '../helpers/generate/birthdayList';
import generateEmbed from '../helpers/generate/embed';

@ApplyOptions<InteractionHandler.Options>({ interactionHandlerType: InteractionHandlerTypes.Button })
export class ExampleParseMethod extends InteractionHandler {
	public override async parse(interaction: ButtonInteraction<'cached'>) {
		if (!interaction.customId.startsWith('birthday_list_page_')) return this.none();
		await interaction.deferUpdate();
		if (!interaction.channel || !interaction.message) return this.none();
		const message = await interaction.channel.messages.fetch(interaction.message.id);
		return this.some({ isNormalMessage: message?.interaction ? true : false });
	}

	public async run(interaction: ButtonInteraction<'cached'>, result: { isNormalMessage: boolean }) {
		const { isNormalMessage } = result;
		const page_number = parseInt(interaction.customId.split('_')[3]);
		const { embed, components } = await generateBirthdayList(page_number, interaction.guildId);
		const finalEmbed = await generateEmbed(embed);
		if (isNormalMessage) return interaction.message.edit({ embeds: [finalEmbed], components });
		return interaction.editReply({ embeds: [finalEmbed], components });
	}
}
