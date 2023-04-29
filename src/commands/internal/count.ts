import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { inlineCode } from 'discord.js';
import generateEmbed from '../../helpers/generate/embed';
import getGuildCount from '../../helpers/provide/guildCount';
import replyToInteraction from '../../helpers/send/response';
import { getCommandGuilds } from '../../helpers/utils/guilds';
import { CountCMD } from '../../lib/commands/count';
import thinking from '../../lib/discord/thinking';
import type { EmbedInformationModel } from '../../lib/model';

@ApplyOptions<Command.Options>({
	name: 'count',
	description: 'The current count of Guilds, Birthdays and Users',
	enabled: true,
	// runIn: ['GUILD_TEXT', 'DM'], CURRENTLY BROKEN
	preconditions: [['DMOnly', 'GuildTextOnly'] /* any other preconditions here */],
	requiredUserPermissions: ['ViewChannel'],
	requiredClientPermissions: ['SendMessages'],
})
export class CountCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(CountCMD(), {
			guildIds: getCommandGuilds('admin'),
		});
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		interface CountInformation {
			discord: {
				guilds: number;
				shards: number;
				users: number;
			};
			database: {
				guilds: number;
				birthdays: number;
				users: number;
			};
		}

		await thinking(interaction);

		const embedInformation: CountInformation = {
			discord: {
				guilds: await this.container.botList.computeGuilds(),
				shards: this.container.client.shard?.count ?? 1,
				users: await this.container.botList.computeUsers(),
			},
			database: {
				guilds: await this.container.utilities.guild.get.GuildCount(),
				birthdays: await this.container.utilities.birthday.get.BirthdayCount(),
				users: await this.container.utilities.user.get.UserCount(),
			},
		};

		const countEmbed: EmbedInformationModel = {
			title: 'Count Information',
			description: '',
			fields: [
				{
					name: 'Discord Servers',
					value: inlineCode(embedInformation.discord.guilds.toString()),
					inline: true,
				},
				{
					name: 'Discord Shards',
					value: inlineCode(embedInformation.discord.shards.toString()),
					inline: true,
				},
				{
					name: 'Discord Users',
					value: inlineCode(embedInformation.discord.users.toString()),
					inline: false,
				},

				{
					name: 'Guilds',
					value: inlineCode(embedInformation.database.guilds.toString()),
					inline: true,
				},
				{
					name: 'Birthdays',
					value: inlineCode(embedInformation.database.birthdays.toString()),
					inline: true,
				},
				{
					name: 'Users',
					value: inlineCode(embedInformation.database.users.toString()),
					inline: true,
				},
			],
		};

		const embed = generateEmbed(countEmbed);
		await replyToInteraction(interaction, {
			embeds: [embed],
		});
	}
}
