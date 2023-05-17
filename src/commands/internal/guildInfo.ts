import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { getCommandGuilds, getFormattedTimestamp, reply } from '../../helpers';
import { GuildInfoCMD } from '../../lib/commands/guildInfo';
import thinking from '../../lib/discord/thinking';
import { generateDefaultEmbed } from '../../lib/utils/embed';

@ApplyOptions<Command.Options>({
	name: 'guild-info',
	description: 'Get Infos about a Guild',
	enabled: true,
	// runIn: ['GUILD_TEXT', 'DM'], CURRENTLY BROKEN
	preconditions: [['DMOnly', 'GuildTextOnly'] /* any other preconditions here */],
	requiredUserPermissions: ['ViewChannel'],
	requiredClientPermissions: ['SendMessages'],
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

		if (!guildDatabase || !guildDiscord) return reply(interaction, 'Guild Infos not found');
		const embed = generateDefaultEmbed({
			title: 'GuildInfos',
			thumbnail: {
				url: guildDiscord.iconURL({ extension: 'png' }) ?? 'No Image',
			},
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
					value: String(guildDiscord.partnered),
					inline: true,
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
		});

		return reply(interaction, {
			content: `GuildInfos for ${guildDiscord.name}`,
			embeds: [embed],
		});
	}
}
