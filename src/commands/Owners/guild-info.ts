import { DefaultEmbedBuilder } from '#lib/discord';
import { BirthdayyCommand } from '#lib/structures';
import { PermissionLevels } from '#lib/types/Enums';
import { OWNERS } from '#root/config';
import { getFormattedTimestamp } from '#utils/common';
import { interactionProblem } from '#utils/embed';
import { isNotCustom as enabled } from '#utils/env';
import { getCommandGuilds, getSettings } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry } from '@sapphire/framework';
import { applyDescriptionLocalizedBuilder, fetchT } from '@sapphire/plugin-i18next';
import { InteractionContextType, type SlashCommandStringOption } from 'discord.js';

@ApplyOptions<BirthdayyCommand.Options>({ enabled, permissionLevel: PermissionLevels.BotOwner })
export class GuildInfoCommand extends BirthdayyCommand {
	public override async registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand(
			(builder) =>
				applyDescriptionLocalizedBuilder(builder, 'commands/owners:guildInfoDescription')
					.setName('guild-info')
					.setContexts(InteractionContextType.Guild)
					.addStringOption((option) => this.registerGuildIDCommandOption(option)),
			{
				guildIds: await getCommandGuilds('admin')
			}
		);
	}

	public override async chatInputRun(interaction: BirthdayyCommand.Interaction<'cached'>) {
		if (!OWNERS.includes(interaction.user.id)) return;

		const id = interaction.options.getString('guild-id', true);
		const guild = await this.container.client.guilds.fetch(id).catch(() => null);
		const t = await fetchT(interaction);

		if (!guild) return interaction.reply(interactionProblem(t('commands/owners:guildInfoGuildNotFound')));

		const settings = await this.container.prisma.guild.findUnique({ where: { id } });

		if (!settings) return interaction.reply(interactionProblem(t('commands/owners:guildInfoSettingsNotFound')));

		const guildBirthdayCount = await this.container.prisma.birthday.count({ where: { guildId: id } });

		const infoEmbed = new DefaultEmbedBuilder()
			.setTitle('GuildInfos')
			.setThumbnail(guild.iconURL())
			.addFields(
				{
					name: 'GuildId',
					value: guild.id,
					inline: true
				},
				{
					name: 'GuildName',
					value: guild.name,
					inline: true
				},
				{
					name: 'Description',
					value: guild.description ?? 'No Description',
					inline: true
				},
				{
					name: 'GuildShard',
					value: `Shard ${guild.shardId + 1}`,
					inline: true
				},
				{
					name: 'MemberCount',
					value: guild.memberCount.toString(),
					inline: true
				},
				{
					name: 'BirthdayCount',
					value: guildBirthdayCount.toString(),
					inline: true
				},
				{
					name: 'GuildOwner',
					value: guild.ownerId,
					inline: true
				},
				{
					name: 'IsPartnered',
					value: `${guild.partnered}`,
					inline: true
				},
				{
					name: 'Premium Tier',
					value: `${guild.premiumTier}`,
					inline: true
				},
				{
					name: 'GuildCreated',
					value: getFormattedTimestamp(guild.createdTimestamp, 'f'),
					inline: true
				},
				{
					name: 'GuildJoined',
					value: getFormattedTimestamp(guild.joinedTimestamp, 'f'),
					inline: true
				},
				{
					name: 'GuildServed',
					value: getFormattedTimestamp(guild.joinedTimestamp, 'R'),
					inline: true
				},
				{
					name: 'Guild Permissions',
					value:
						guild.members.me?.permissions
							.toArray()
							.map((permission: string) => `**\`${permission}\`**`)
							.join(' • ') ?? 'No Permissions',
					inline: true
				}
			);

		const configEmbed = await getSettings(id).embedList();
		return interaction.reply({
			content: `GuildInfos for ${guild.name}`,
			embeds: [infoEmbed.toJSON(), configEmbed.toJSON()]
		});
	}

	private registerGuildIDCommandOption(option: SlashCommandStringOption) {
		return applyDescriptionLocalizedBuilder(option, 'commands/owners:guildInfoGuildIdOptionDescription')
			.setName('guild-id')
			.setRequired(true);
	}
}
