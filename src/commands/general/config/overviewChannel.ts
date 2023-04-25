import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { Result } from '@sapphire/result';
import { channelMention, ChannelType } from 'discord.js';
import generateBirthdayList from '../../../helpers/generate/birthdayList';
import generateEmbed from '../../../helpers/generate/embed';
import { ARROW_RIGHT, FAIL, SUCCESS } from '../../../helpers/provide/environment';
import { hasBotChannelPermissions } from '../../../helpers/provide/permission';
import reply from '../../../helpers/send/response';
import thinking from '../../../lib/discord/thinking';

@RegisterSubCommand('config', (builder) =>
	builder
		.setName('overview-channel')
		.setDescription('List all Birthdays on the Server in that channel and updates it on changes')
		.addChannelOption((option) =>
			option
				.setName('channel')
				.setDescription('Channel where the overview should get sent and updated in')
				.setRequired(true)
				.addChannelTypes(ChannelType.GuildText),
		),
)
export class OverviewChannelCommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		await thinking(interaction);
		const channel = interaction.options.getChannel<ChannelType.GuildText>('channel', true);
		const hasWritingPermissionsInChannel = await hasBotChannelPermissions({
			interaction,
			channel,
			permissions: ['ViewChannel', 'SendMessages'],
		});

		if (!hasWritingPermissionsInChannel) {
			const embed = generateEmbed({
				title: `${FAIL} Failure`,
				description: `${ARROW_RIGHT} I don't have the permission to see & send messages in ${channelMention(
					channel.id,
				)}.`,
			});
			return reply(interaction, { embeds: [embed] });
		}

		const birthdayList = await generateBirthdayList(1, interaction.guildId);
		const birthdayListEmbed = generateEmbed(birthdayList.embed);

		const message = await channel.send({
			embeds: [birthdayListEmbed],
			components: birthdayList.components,
		});

		const result = await Result.fromAsync(() =>
			this.container.prisma.guild.update({
				where: { guildId: interaction.guildId },
				data: { overviewMessage: message.id, overviewChannel: channel.id },
			}),
		);

		if (result.isErr()) {
			const embed = generateEmbed({
				title: `${FAIL} Failure`,
				description: `${ARROW_RIGHT} An error occurred while updating the database.`,
			});
			return reply(interaction, { embeds: [embed] });
		}

		const embed = generateEmbed({
			title: `${SUCCESS} Success`,
			description: `${ARROW_RIGHT} The birthday overview channel has been set to ${channelMention(channel.id)}.`,
		});

		return reply(interaction, { embeds: [embed] });
	}
}
