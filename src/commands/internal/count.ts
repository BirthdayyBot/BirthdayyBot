import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { reply } from '../../helpers/send/response';
import { getCommandGuilds } from '../../helpers/utils/guilds';
import { CountCMD } from '../../lib/commands/count';
import { generateDefaultEmbed } from '../../lib/utils/embed';
import { isNotCustom } from '../../lib/utils/env';
import { BOT_COLOR } from '../../helpers';

@ApplyOptions<Command.Options>({
	name: 'count',
	description: 'The current count of Guilds, Birthdays and Users',
	enabled: isNotCustom,
	preconditions: [['DMOnly', 'GuildTextOnly']],
	requiredUserPermissions: ['ViewChannel'],
	requiredClientPermissions: ['SendMessages'],
})
export class CountCommand extends Command {
	public override async registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(CountCMD(), {
			guildIds: await getCommandGuilds('admin'),
		});
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await reply(interaction, {
			embeds: [
				{
					title: 'Discord Information',
					color: BOT_COLOR,
					fields: [
						{
							inline: true,
							name: 'Guilds',
							value: (await this.container.botList.computeGuilds()).toString(),
						},
						{
							inline: true,
							name: 'Shards',
							value: this.container.client.shard?.count?.toString() ?? '1',
						},
						{
							inline: true,
							name: 'Users',
							value: (await this.container.botList.computeUsers()).toString(),
						},
					],
				},
				generateDefaultEmbed({
					title: 'Database Information',
					fields: [
						{
							inline: true,
							name: 'Guilds',
							value: (await this.container.utilities.guild.get.GuildAvailableCount()).toString(),
						},
						{
							inline: true,
							name: 'Birthdays',
							value: (await this.container.utilities.birthday.get.BirthdayAvailableCount()).toString(),
						},
						{
							inline: true,
							name: 'Users',
							value: (await this.container.utilities.user.get.UserCount()).toString(),
						},
					],
				}),
			],
		});
	}
}
