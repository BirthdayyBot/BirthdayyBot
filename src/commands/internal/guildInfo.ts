import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { bold, Guild, inlineCode } from 'discord.js';
import { getCommandGuilds, getFormattedTimestamp, reply } from '../../helpers';
import generateConfigList from '../../helpers/generate/configList';
import { GuildInfoCMD } from '../../lib/commands/guildInfo';
import thinking from '../../lib/discord/thinking';
import { generateDefaultEmbed, interactionProblem } from '../../lib/utils/embed';
import { isCustom } from '../../lib/utils/env';
import { type Guild as GuildDatabase } from '@prisma/client';

@ApplyOptions<Command.Options>({
	name: 'guild-info',
	description: 'Get Infos about a Guild',
	enabled: !isCustom,
	runIn: CommandOptionsRunTypeEnum.GuildAny,
	preconditions: ['AdminOnly'],
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

		// Validate guild ID format
		if (!/^\d{15,21}$/.test(guildId)) {
			return reply(interaction, interactionProblem(`Invalid guild ID format ${inlineCode(guildId)}`, true));
		}

		await thinking(interaction);

		const [guildDatabase, guildBirthdayCount] = await Promise.all([
			this.container.utilities.guild.get.GuildById(guildId).catch(() => null),
			this.container.utilities.birthday.get.BirthdayCountByGuildId(guildId).catch(() => 0),
		]);

		if (!guildDatabase) {
			return reply(interaction, interactionProblem(`Guild ${inlineCode(guildId)} not found in database`, true));
		}

		const guildDiscord = await this.container.client.guilds.fetch(guildId).catch(() => null);

		if (!guildDiscord) {
			return reply(interaction, interactionProblem(`Guild ${inlineCode(guildId)} not found on Discord`, true));
		}

		this.container.logger.debug(`Retrieving info for guild: ${guildDiscord.name} (${guildId})`);

		const embed = generateDefaultEmbed({
			title: `Guild Information - ${guildDiscord.name}`,
			thumbnail: {
				url: guildDiscord.iconURL({ extension: 'png', size: 1024 }) ?? '',
			},
			fields: this.buildGuildInfoFields(guildDiscord, guildDatabase, guildBirthdayCount),
		});

		try {
			const configEmbed = generateDefaultEmbed(await generateConfigList(guildDiscord));

			return reply(interaction, {
				content: `Guild configuration for ${bold(guildDiscord.name)}`,
				embeds: [embed, configEmbed],
			});
		} catch (error) {
			this.container.logger.error(`Failed to retrieve config for guild ${guildId}:`, error);
			return reply(interaction, {
				content: `Guild information for ${bold(guildDiscord.name)}`,
				embeds: [embed],
			});
		}
	}

	private buildGuildInfoFields(guildDiscord: Guild, guildDatabase: GuildDatabase, guildBirthdayCount: number) {
		const permissions = guildDiscord.members?.me?.permissions
			.toArray()
			.map((permission: string) => inlineCode(permission))
			.join(' ');

		return [
			{
				name: 'Guild ID',
				value: inlineCode(guildDatabase.guildId),
				inline: true,
			},
			{
				name: 'Members',
				value: inlineCode(guildDiscord.memberCount.toString()),
				inline: true,
			},
			{
				name: 'Birthdays Registered',
				value: inlineCode(guildBirthdayCount.toString()),
				inline: true,
			},
			{
				name: 'Owner',
				value: inlineCode(guildDiscord.ownerId),
				inline: true,
			},
			{
				name: 'Shard',
				value: inlineCode(`${guildDiscord.shardId + 1}`),
				inline: true,
			},
			{
				name: 'Premium Tier',
				value: inlineCode(guildDiscord.premiumTier.toString()),
				inline: true,
			},
			{
				name: 'Created',
				value: getFormattedTimestamp(guildDiscord.createdTimestamp, 'f'),
				inline: true,
			},
			{
				name: 'Bot Joined',
				value: getFormattedTimestamp(guildDiscord.joinedTimestamp, 'f'),
				inline: true,
			},
			{
				name: 'Time Serving',
				value: getFormattedTimestamp(guildDiscord.joinedTimestamp, 'R'),
				inline: true,
			},
			{
				name: 'Partnered',
				value: guildDiscord.partnered ? '✅ Yes' : '❌ No',
				inline: true,
			},
			{
				name: 'Description',
				value: guildDiscord.description ?? '*No description*',
			},
			{
				name: 'Bot Permissions',
				value: permissions || '*No permissions*',
			},
		];
	}
}
