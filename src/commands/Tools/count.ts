import { CustomCommand } from '#lib/structures/commands/CustomCommand';
import { BrandingColors } from '#utils/constants';
import { generateDefaultEmbed } from '#utils/embed';
import { isNotCustom } from '#utils/env';
import { getCommandGuilds } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { applyLocalizedBuilder } from '@sapphire/plugin-i18next';

@ApplyOptions<CustomCommand.Options>({
	name: 'count',
	description: 'The current count of Guilds, Birthdays and Users',
	enabled: isNotCustom
})
export class CountCommand extends CustomCommand {
	public override async registerApplicationCommands(registry: CustomCommand.Registry) {
		registry.registerChatInputCommand(
			(builder) => applyLocalizedBuilder(builder, 'commands/count:count').setDMPermission(true),
			{
				guildIds: await getCommandGuilds('admin')
			}
		);
	}

	public override async chatInputRun(interaction: CustomCommand.ChatInputCommandInteraction) {
		return interaction.reply({
			embeds: [
				{
					title: 'Discord Information',
					color: BrandingColors.Primary,
					fields: [
						{
							inline: true,
							name: 'Guilds',
							value: (await this.container.client.computeGuilds()).toString()
						},
						{
							inline: true,
							name: 'Shards',
							value: this.container.client.shard?.count?.toString() ?? '1'
						},
						{
							inline: true,
							name: 'Users',
							value: (await this.container.client.computeUsers()).toString()
						}
					]
				},
				generateDefaultEmbed({
					title: 'Database Information',
					fields: [
						{
							inline: true,
							name: 'Guilds',
							value: (await this.container.utilities.guild.get.GuildAvailableCount()).toString()
						},
						{
							inline: true,
							name: 'Birthdays',
							value: (await this.container.utilities.birthday.get.BirthdayAvailableCount()).toString()
						},
						{
							inline: true,
							name: 'Users',
							value: (await this.container.utilities.user.get.UserCount()).toString()
						}
					]
				})
			]
		});
	}
}
