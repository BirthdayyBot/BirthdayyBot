import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import generateEmbed from '../../helpers/generate/embed';
import { getCommandGuilds } from '../../helpers/utils/guilds';
import thinking from '../../lib/discord/thinking';
import replyToInteraction from '../../helpers/send/response';
import { VoteEmbed } from '../../lib/embeds';
import { VoteCMD } from '../../lib/commands/vote';

@ApplyOptions<Command.Options>({
    name: 'vote',
    description: 'Vote for Birthdayy <3',
    enabled: true,
    // runIn: ['GUILD_TEXT', 'DM'], CURRENTYY BROKEN
    preconditions: [['DMOnly', 'GuildTextOnly'] /* any other preconditions here */],
    requiredUserPermissions: ['ViewChannel'],
    requiredClientPermissions: ['SendMessages'],
})
export class VoteCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
        });
    }

    public override async registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand(await VoteCMD(), {
            guildIds: getCommandGuilds('global'),
        });
    }

    public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        await thinking(interaction);
        const embed = await generateEmbed(VoteEmbed);
        await replyToInteraction(interaction, {
            embeds: [embed],
        });
    }
}
