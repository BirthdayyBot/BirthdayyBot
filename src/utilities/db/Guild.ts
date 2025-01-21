import { BOT_ADMIN_LOG } from '#utils/environment';
import type { Prisma } from '@prisma/client';
import { isTextBasedChannel } from '@sapphire/discord.js-utilities';
import { container } from '@sapphire/framework';
import { Utility } from '@sapphire/plugin-utilities-store';
import { codeBlock } from '@sapphire/utilities';
import type { Snowflake } from 'discord.js';

export class Guild extends Utility {
	public get = {
		GuildById: (id: string) => this.prisma.guild.findUnique({ where: { id } }),
		GuildsByIds: (ids: string[]) => this.prisma.guild.findMany({ where: { id: { in: ids } } }),
		GuildsNotInIds: (ids: string[]) => this.prisma.guild.findMany({ where: { id: { notIn: ids } } }),
		GuildsByTimezone: (ids: string[], timezone: string) =>
			this.prisma.guild.findMany({ where: { id: { in: ids }, timezone } }),
		GuildsDisabled: (disabled = true) => this.prisma.guild.findMany({ where: { disabled } }),
		GuildLanguage: (id: string) =>
			this.prisma.guild.findUnique({ where: { id }, select: { id: true, language: true } }),
		GuildPremium: (id: string) =>
			this.prisma.guild.findUnique({ where: { id }, select: { id: true, premium: true } }),
		PremiumGuilds: () => this.prisma.guild.findMany({ where: { premium: true } }),
		GuildDisabled: (id: string) =>
			this.prisma.guild.findUnique({ where: { id }, select: { id: true, disabled: true } }),
		GuildConfig: (id: string) =>
			this.prisma.guild.findUnique({
				where: { id },
				select: {
					id: true,
					birthdayRole: true,
					birthdayPingRole: true,
					announcementChannel: true,
					announcementMessage: true,
					overviewChannel: true,
					logChannel: true,
					overviewMessage: true,
					timezone: true,
					language: true,
					premium: true
				}
			}),
		ByLastUpdatedDisabled: (date: Date) =>
			this.prisma
				.$transaction([
					this.prisma.birthday.findMany({
						where: { guild: { updatedAt: { lt: date.toISOString() } }, disabled: true }
					}),
					this.prisma.guild.findMany({
						where: { updatedAt: { lt: date.toISOString() }, disabled: true }
					})
				])
				.then(([birthdays, guilds]) => ({
					deletedBirthdays: birthdays.length,
					deletedGuilds: guilds.length
				}))
				.catch((error: any) => {
					this.container.logger.error(`[Guild][DeleteByLastUpdated] ${JSON.stringify(error)}`);
					return { deletedBirthdays: 0, deletedGuilds: 0 };
				}),
		GuildCount: () => this.prisma.guild.count({ where: { disabled: false } }),
		GuildAvailableCount: () => this.prisma.guild.count({ where: { disabled: false } }),
		GuildNotAvailableCount: () => this.prisma.guild.count({ where: { disabled: true } }),
		GuildTimezone: (id: string) =>
			this.prisma.guild.findUnique({ where: { id }, select: { id: true, timezone: true } })
	};

	public set = {
		AnnouncementChannel: (id: string, channelID: string) =>
			this.prisma.guild.update({ where: { id }, data: { announcementChannel: channelID } }),
		AnnouncementMessage: (id: string, message: string) =>
			this.prisma.guild.update({ where: { id }, data: { announcementMessage: message } }),
		OverviewChannel: (id: string, channelID: string) =>
			this.prisma.guild.update({ where: { id }, data: { overviewChannel: channelID } }),
		OverviewMessage: (id: string, messageID: string) =>
			this.prisma.guild.update({ where: { id }, data: { overviewMessage: messageID } }),
		LogChannel: (id: string, channelID: string) =>
			this.prisma.guild.update({ where: { id }, data: { logChannel: channelID } }),
		Timezone: (id: string, timezone: string) => this.prisma.guild.update({ where: { id }, data: { timezone } }),
		Language: (id: string, language: string) => this.prisma.guild.update({ where: { id }, data: { language } }),
		BirthdayRole: (id: string, roleID: string) =>
			this.prisma.guild.update({ where: { id }, data: { birthdayRole: roleID } }),
		BirthdayPingRole: (id: string, roleID: string) =>
			this.prisma.guild.update({ where: { id }, data: { birthdayPingRole: roleID } }),
		Premium: (id: string, premium: boolean) => this.prisma.guild.update({ where: { id }, data: { premium } })
	};

	public update = {
		DisableGuildAndBirthdays: (id: string, disabled: boolean) =>
			this.prisma.guild.update({
				where: {
					id
				},
				data: {
					disabled,
					birthday: {
						updateMany: {
							where: { guildId: id },
							data: {
								disabled
							}
						}
					}
				},
				include: { birthday: true }
			}),
		ByNotInAndBirthdays: (ids: string[], disabled: boolean) =>
			this.prisma.$transaction([
				this.prisma.guild.updateMany({
					where: {
						id: { notIn: ids }
					},
					data: {
						disabled
					}
				}),
				this.prisma.birthday.updateMany({
					where: {
						guildId: { notIn: ids }
					},
					data: {
						disabled
					}
				})
			])
	};

	public delete = {
		GuildByID: (id: string) => this.prisma.guild.delete({ where: { id } }),
		ByDisabledGuilds: () => this.prisma.guild.deleteMany({ where: { disabled: true } }),
		ByLastUpdatedDisabled: (date: Date) =>
			this.prisma
				.$transaction([
					this.prisma.birthday.deleteMany({
						where: { guild: { updatedAt: { lt: date.toISOString() } }, disabled: true }
					}),
					this.prisma.guild.deleteMany({
						where: { updatedAt: { lt: date.toISOString() }, disabled: true }
					})
				])
				.then(([deletedBirthdays, deletedGuilds]) => ({
					deletedBirthdays: deletedBirthdays.count,
					deletedGuilds: deletedGuilds.count
				}))
				.catch(async (error: any) => {
					const channel = container.client.channels.cache.get(BOT_ADMIN_LOG);

					if (!channel || !isTextBasedChannel(channel)!) {
						return { deletedBirthdays: 0, deletedGuilds: 0 };
					}

					this.container.logger.error(`[Guild][DeleteByLastUpdated] ${JSON.stringify(error)}`);
					await channel.send(
						codeBlock('json', `Error in [Guild][DeleteByLastUpdated]:\n${JSON.stringify(error)}`)
					);
					return { deletedBirthdays: 0, deletedGuilds: 0 };
				})
	};

	public check = {
		isGuildPremium: async (id: Snowflake) => {
			const result = await this.get.GuildPremium(id);
			if (result === null) {
				return false;
			}
			return result.premium;
		}
	};

	public reset = {
		AnnouncementChannel: (id: Snowflake) =>
			this.prisma.guild.update({ where: { id }, data: { announcementChannel: null } }),
		OverviewChannel: (id: Snowflake) =>
			this.prisma.guild.update({ where: { id }, data: { overviewChannel: null } }),
		OverviewMessage: (id: Snowflake) =>
			this.prisma.guild.update({ where: { id }, data: { overviewMessage: null } }),
		LogChannel: (id: Snowflake) => this.prisma.guild.update({ where: { id }, data: { logChannel: null } }),
		Timezone: (id: Snowflake) => this.prisma.guild.update({ where: { id }, data: { timezone: 'UTC' } }),
		Language: (id: Snowflake) => this.prisma.guild.update({ where: { id }, data: { language: 'en-US' } }),
		BirthdayRole: (id: Snowflake) => this.prisma.guild.update({ where: { id }, data: { birthdayRole: null } }),
		BirthdayPingRole: (id: Snowflake) =>
			this.prisma.guild.update({ where: { id }, data: { birthdayPingRole: null } })
	};

	private prisma = container.prisma;

	public constructor(context: Utility.LoaderContext, options: Utility.Options) {
		super(context, {
			...options,
			name: 'guild'
		});
	}

	public create = (data: Prisma.GuildCreateInput) => this.prisma.guild.create({ data });
}
