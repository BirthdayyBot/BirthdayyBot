import { InteractionHandler, InteractionHandlerTypes, PieceContext } from '@sapphire/framework';
import type { ButtonInteraction } from 'discord.js';
import generateBirthdayList from '../helpers/generate/birthdayList';
import generateEmbed from '../helpers/generate/embed';

export class ExampleParseMethod extends InteractionHandler {
    public constructor(ctx: PieceContext) {
        super(ctx, { interactionHandlerType: InteractionHandlerTypes.Button });
    }

    public async run(interaction: ButtonInteraction, result: { isNormalMessage: boolean }) {
        const { isNormalMessage } = result;
        const page_number = parseInt(interaction.customId.split('_')[3]);
        const birthdayList = await generateBirthdayList(page_number, interaction.guildId!);
        const embed = birthdayList.embed;
        const finalEmbed = await generateEmbed(embed);
        const components = birthdayList.components || [];
        if (isNormalMessage) {
            interaction.message.edit({ embeds: [finalEmbed], components });
        } else {
            interaction.editReply({ embeds: [finalEmbed], components });
        }
        return;
    }

    public async parse(interaction: ButtonInteraction) {
        if (!interaction.customId.startsWith('birthday_list_page_')) return this.none();
        await interaction.deferUpdate();
        const { channel, message } = interaction;
        const fetchedMessage = await channel!.messages.fetch(message.id);
        const isNormalMessage = fetchedMessage!.interaction ? false : true;
        return this.some({ isNormalMessage });
    }
}
