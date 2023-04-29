import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { inlineCode, type APIEmbedField } from 'discord.js';
import generateEmbed from '../../helpers/generate/embed';
import replyToInteraction from '../../helpers/send/response';
import { getCommandGuilds } from '../../helpers/utils/guilds';
import { CountCMD } from '../../lib/commands/count';

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
		const fields = (await this.stats()).map<APIEmbedField>((field) => {
			return { ...field, value: inlineCode(field.value), inline: true };
		});

		await replyToInteraction(interaction, {
			embeds: [
				generateEmbed({
					title: 'Count Information',
					fields,
				}),
			],
		});
	}

	private async stats(): Promise<APIEmbedField[]> {
		return [
			{
				name: 'Discord Guilds',
				value: await this.container.botList.computeGuilds().then((guilds) => guilds.toString()),
			},
			{
				name: 'Discord Shards',
				value: this.container.client.shard?.count?.toString() ?? '1',
			},
			{
				name: 'Discord Users',
				value: await this.container.botList.computeUsers().then((users) => users.toString()),
			},
			{
				name: 'Guilds',
				value: await this.container.utilities.guild.get
					.GuildAvailableCount()
					.then((guilds) => guilds.toString()),
			},
			{
				name: 'Birthdays',
				value: await this.container.utilities.birthday.get
					.BirthdayAvailableCount()
					.then((birthdays) => birthdays.toString()),
			},
			{
				name: 'Users',
				value: await this.container.utilities.user.get.UserCount().then((users) => users.toString()),
			},
		];
	}
}
