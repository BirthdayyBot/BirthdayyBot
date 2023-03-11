import { ApplyOptions } from '@sapphire/decorators';
import { Command, container } from '@sapphire/framework';
import { getCommandGuilds } from '../../helpers/utils/guilds';
import replyToInteraction from '../../helpers/send/response';
import generateEmbed from '../../helpers/generate/embed';
// import checkCurrentBirthdays from '../../lib/birthday/checkCurrentBirthdays';
import { isGuildPremium } from '../../helpers/provide/guild';
import { getCurrentOffset } from '../../helpers/provide/currentOffset';
import { getBirthdaysByDateAndTimezone } from '../../lib/birthday/birthday';
import thinking from '../../lib/discord/thinking';
import type { EmbedInformationModel } from '../../lib/model/EmbedInformation.model';
@ApplyOptions<Command.Options>({
    name: 'test',
    description: 'test things',
})
export class TestCommand extends Command {
    public override registerApplicationCommands(registry: Command.Registry) {
        // Register slash command
        registry.registerChatInputCommand(
            {
                name: this.name,
                description: this.description,
            },
            {
                guildIds: getCommandGuilds('testing'),
            },
        );
    }

    // slash command
    public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        await thinking(interaction);
        const fields = [{ name: 'test', value: 'Test Test' }];
        // await checkCurrentBirthdays();
        // await enableGuildRequest(interaction.guildId!);
        // await createGuildRequest(111 + interaction.guildId!, '945106657527078952');
        const o = await getCurrentOffset();
        const today = o.date;
        container.logger.info('today', today);
        const offset = o.offsetString;
        const request = await getBirthdaysByDateAndTimezone(today, offset);
        container.logger.info('request', request);
        fields.push({ name: 'getBirthdaysByDateAndTimezone', value: `\`\`\`${JSON.stringify(request, null, 2)}\`\`\`` });
        container.logger.info('isGuildPremiuum: ', await isGuildPremium(interaction.guildId!));

        const embedObj: EmbedInformationModel = { title: 'test', fields: fields };
        const embed = await generateEmbed(embedObj);
        await replyToInteraction(interaction, { content: '```TEST RUN```', embeds: [embed] });
        return;
    }
}
