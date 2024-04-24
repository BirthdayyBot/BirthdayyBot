import { GuildInfoCMD } from '#lib/commands/guildInfo';
import { BirthdayyCommand } from '#lib/structures';
import { PermissionLevels } from '#lib/types/Enums';
import generateConfigList from '#utils/birthday/config';
import { getFormattedTimestamp } from '#utils/common';
import { isCustom } from '#utils/env';
import { getCommandGuilds } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';

@ApplyOptions<BirthdayyCommand.Options>({
	description: 'Get Infos about a Guild',
	enabled: !isCustom,
	name: 'guild-info',
	permissionLevel: PermissionLevels.Administrator,
	runIn: CommandOptionsRunTypeEnum.GuildAny
})
export class GuildInfoCommand extends BirthdayyCommand {
	public override async chatInputRun(interaction: BirthdayyCommand.Interaction) {
		const guildId = interaction.options.getString('guild-id', true);
		const settings = await this.container.prisma.guild.findUnique({ where: { id: guildId } });
		const guild = await this.container.client.guilds.fetch(guildId).catch(() => null);
		const guildBirthdayCount = await this.container.prisma.birthday.count({ where: { guildId, inDeleteQueue: false } });

		if (!settings || !guild) return interaction.reply('Guild Infos not found');

		const embed = new EmbedBuilder({
			fields: [
				{
					inline: true,
					name: 'GuildId',
					value: settings.id
				},
				{
					inline: true,
					name: 'GuildName',
					value: guild.name
				},
				{
					inline: true,
					name: 'Description',
					value: guild.description ?? 'No Description'
				},
				{
					inline: true,
					name: 'GuildShard',
					value: `Shard ${guild.shardId + 1}`
				},
				{
					inline: true,
					name: 'MemberCount',
					value: guild.memberCount.toString()
				},
				{
					inline: true,
					name: 'BirthdayCount',
					value: guildBirthdayCount.toString()
				},

				{
					inline: true,
					name: 'GuildOwner',
					value: guild.ownerId
				},
				{
					inline: true,
					name: 'IsPartnered',
					value: `${guild.partnered}`
				},
				{
					inline: true,
					name: 'Premium Tier',
					value: `${guild.premiumTier}`
				},
				{
					inline: true,
					name: 'GuildCreated',
					value: getFormattedTimestamp(guild.createdTimestamp, 'f')
				},
				{
					inline: true,
					name: 'GuildJoined',
					value: getFormattedTimestamp(guild.joinedTimestamp, 'f')
				},
				{
					inline: true,
					name: 'GuildServed',
					value: getFormattedTimestamp(guild.joinedTimestamp, 'R')
				},
				{
					name: 'Guild Permissions',
					value:
						guild.members.me?.permissions
							.toArray()
							.map((permission: string) => `**\`${permission}\`**`)
							.join(' • ') ?? 'No Permissions'
				}
			],
			thumbnail: {
				url: guild.iconURL({ extension: 'png' }) ?? 'No Image'
			},
			title: 'GuildInfos'
		});

		const configEmbed = new EmbedBuilder(await generateConfigList(guildId, { guild, member: interaction.member }));

		return interaction.reply({
			content: `GuildInfos for ${guild.name}`,
			embeds: [embed, configEmbed]
		});
	}

	public override async registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand(GuildInfoCMD(), {
			guildIds: await getCommandGuilds('admin')
		});
	}
}
