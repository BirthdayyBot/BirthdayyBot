import { ApplyOptions } from '@sapphire/decorators';
import { Command, container } from '@sapphire/framework';
import { getCommandGuilds } from '../../helpers/utils/guilds';
import replyToInteraction from '../../helpers/send/response';
import generateEmbed from '../../helpers/generate/embed';
// import checkCurrentBirthdays from '../../lib/birthday/checkCurrentBirthdays';
import { isGuildPremium } from '../../helpers/provide/guild';
import { getCurrentOffset } from '../../helpers/provide/currentOffset';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const lib = require('lib')({ token: process.env.STDLIB_SECRET_TOKEN });
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
        // await checkCurrentBirthdays();
        // await enableGuildRequest(interaction.guildId!);
        // await createGuildRequest(111 + interaction.guildId!, '945106657527078952');
        const o = await getCurrentOffset();
        const today = o.date;
        container.logger.info('today', today);
        const offset = o.offsetString;
        container.logger.info(
            await lib.chillihero['birthday-api'][`@${process.env.AUTOCODE_ENV}`].birthday.retrieve.entriesByDateAndTimezone({
                birthday: today,
                timezone: offset,
            }),
        );

        container.logger.info('isGuildPremiuum: ', await isGuildPremium(interaction.guildId!));
        const embed = await generateEmbed({ title: 'test' });
        await replyToInteraction(interaction, { content: '```TEST RUN```', embeds: [embed] });
        return;
    }
}
