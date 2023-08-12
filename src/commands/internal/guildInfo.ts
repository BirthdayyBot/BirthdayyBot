import { GuildInfoCMD } from '#lib/commands/guildInfo';
import thinking from '#lib/discord/thinking';
import generateConfigList from '#utils/birthday/config';
import { getFormattedTimestamp } from '#utils/common';
import { generateDefaultEmbed } from '#utils/embed';
import { isCustom } from '#utils/env';
import { getCommandGuilds } from '#utils/functions';
import { reply } from '#utils/utils';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptionsRunTypeEnum } from '@sapphire/framework';
@ApplyOptions<Command.Options>({
	description: 'Get Infos about a Guild',
	enabled: !isCustom,
	name: 'guild-info',
	preconditions: ['AdminOnly'],
	requiredClientPermissions: ['SendMessages'],
	requiredUserPermissions: ['ViewChannel'],
	runIn: CommandOptionsRunTypeEnum.GuildAny,
})
export class GuildInfoCommand extends Command {
	public override async registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(GuildInfoCMD(), {
			guildIds: await getCommandGuilds('admin'),
		});
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction<'cached'>) {
		const guildId = interaction.options.getString('guild-id', true);
		await thinking(interaction);
		const guildDatabase = await this.container.utilities.guild.get.GuildById(guildId).catch(() => null);
		const guildDiscord = await this.container.client.guilds.fetch(guildId).catch(() => null);
		const guildBirthdayCount = await this.container.utilities.birthday.get.BirthdayCountByGuildId(guildId);

		if (!guildDatabase || !guildDiscord) return reply('Guild Infos not found');

		const embed = generateDefaultEmbed({
			fields: [
				{
					name: 'GuildId',
					value: guildDatabase.guildId,
					inline: true,
				},
				{
					name: 'GuildName',
					value: guildDiscord.name,
					inline: true,
				},
				{
					name: 'Description',
					value: guildDiscord.description ?? 'No Description',
					inline: true,
				},
				{
					name: 'GuildShard',
					value: `Shard ${guildDiscord.shardId + 1}`,
					inline: true,
				},
				{
					name: 'MemberCount',
					value: guildDiscord.memberCount.toString(),
					inline: true,
				},
				{
					name: 'BirthdayCount',
					value: guildBirthdayCount.toString(),
					inline: true,
				},

				{
					name: 'GuildOwner',
					value: guildDiscord.ownerId,
					inline: true,
				},
				{
					name: 'IsPartnered',
					inline: true,
					value: String(guildDiscord.partnered),
				},
				{
					name: 'Premium Tier',
					value: guildDiscord.premiumTier.toString(),
					inline: true,
				},
				{
					name: 'GuildCreated',
					value: getFormattedTimestamp(guildDiscord.createdTimestamp, 'f'),
					inline: true,
				},
				{
					name: 'GuildJoined',
					value: getFormattedTimestamp(guildDiscord.joinedTimestamp, 'f'),
					inline: true,
				},
				{
					name: 'GuildServed',
					value: getFormattedTimestamp(guildDiscord.joinedTimestamp, 'R'),
					inline: true,
				},
				{
					name: 'Guild Permissions',
					value:
						guildDiscord.members?.me?.permissions
							.toArray()
							.map((permission: string) => `**\`${permission}\`**`)
							.join(' • ') ?? 'No Permissions',
				},
			],
			thumbnail: {
				url: guildDiscord.iconURL({ extension: 'png' }) ?? 'No Image',
			},
			title: 'GuildInfos',
		});

		const configEmbed = generateDefaultEmbed(await generateConfigList(guildId, { guild: guildDiscord }));

		return reply({
			content: `GuildInfos for ${guildDiscord.name}`,
			embeds: [embed, configEmbed],
		});
	}
}
