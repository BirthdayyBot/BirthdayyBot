import { DefaultEmbedBuilder } from '#lib/discord';
import { BirthdayyCommand } from '#lib/structures';
import { PermissionLevels } from '#lib/types';
import { ClientColor } from '#utils/constants';
import { isNotCustom as enabled } from '#utils/env';
import { getCommandGuilds } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';

@ApplyOptions<BirthdayyCommand.Options>({ enabled, permissionLevel: PermissionLevels.BotOwner })
export class CountCommand extends BirthdayyCommand {
	public override async registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setDescription('The current count of Guilds, Birthdays and Users')
					.setName(this.name)
					.setDMPermission(true),
			{
				guildIds: await getCommandGuilds('admin')
			}
		);
	}

	public override async chatInputRun(interaction: BirthdayyCommand.Interaction) {
		const discordInfoEmbed = new EmbedBuilder()
			.setTitle('Discord Information')
			.setColor(ClientColor)
			.addFields(
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
			);

		const databaseInfoEmbed = new DefaultEmbedBuilder().setTitle('Database Information').addFields(
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
		);

		return interaction.reply({ embeds: [discordInfoEmbed.toJSON(), databaseInfoEmbed.toJSON()], ephemeral: true });
	}
}
