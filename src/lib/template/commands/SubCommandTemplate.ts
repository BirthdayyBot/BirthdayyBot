import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import { Subcommand } from '@sapphire/plugin-subcommands';
import generateEmbed from '../../../helpers/generate/embed';
import { container } from '@sapphire/framework';
import { getCommandGuilds } from '../../../helpers/utils/guilds';
import thinking from '../../discord/thinking';
import replyToInteraction from '../../../helpers/send/response';
import { TemplateCMD } from '../../commands';
@ApplyOptions<Subcommand.Options>({
    name: 'template',
    description: 'Template Command',
    enabled: true,
    runIn: ['GUILD_TEXT'],
    requiredUserPermissions: ['ViewChannel'],
    requiredClientPermissions: ['SendMessages'],
    subcommands: [
        {
            name: 'test',
            chatInputRun: 'testCommand',
        },
    ],
})
export class TemplateCommand extends Subcommand {
    public constructor(context: Subcommand.Context, options: Subcommand.Options) {
        super(context, {
            ...options,
        });
    }

    public override async registerApplicationCommands(registry: Subcommand.Registry) {
        registry.registerChatInputCommand(await TemplateCMD(), {
            guildIds: getCommandGuilds('testing'),
        });
    }

    public async testCommand(interaction: Subcommand.ChatInputCommandInteraction, _args: Args) {
        container.logger.info('testCommand Command');
        await thinking(interaction);
        const embed = await generateEmbed({ title: 'Test', description: 'A Test Command' });
        return await replyToInteraction(interaction, { embeds: [embed] });
    }
}
