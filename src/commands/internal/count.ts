import { defaultUserPermissions } from '#lib/types';
import { BOT_COLOR, generateDefaultEmbed, isNotCustom, reply } from '#utils';
import { getCommandGuilds } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';

@ApplyOptions<Command.Options>({
	name: 'count',
	description: 'The current count of Guilds, Birthdays and Users',
	enabled: isNotCustom,
	preconditions: [['DMOnly', 'GuildTextOnly']],
	requiredUserPermissions: ['ViewChannel', 'UseApplicationCommands', 'SendMessages'],
	requiredClientPermissions: ['SendMessages', 'EmbedLinks', 'UseExternalEmojis'],
})
export class CountCommand extends Command {
	public override async registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(
			(builder) => {
				return builder
					.setName(this.name)
					.setDMPermission(true)
					.setDescription(this.description)
					.setDefaultMemberPermissions(defaultUserPermissions.bitfield);
			},
			{
				guildIds: await getCommandGuilds('admin'),
			},
		);
	}

	public override async chatInputRun() {
		await reply({
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
