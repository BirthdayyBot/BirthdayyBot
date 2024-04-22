import { sendMessage } from '#lib/discord/message';
import { BOT_ADMIN_LOG } from '#utils/environment';
import type { Prisma } from '@prisma/client';
import { container } from '@sapphire/framework';
import { Utility } from '@sapphire/plugin-utilities-store';
import { codeBlock } from '@sapphire/utilities';
import type { Snowflake } from 'discord.js';

export class Guild extends Utility {
	public get = {
		GuildById: (id: string) => this.prisma.guild.findUnique({ where: { id } }),
		GuildsByIds: (guildIds: string[]) => this.prisma.guild.findMany({ where: { id: { in: guildIds } } }),
		GuildsNotInIds: (guildIds: string[]) => this.prisma.guild.findMany({ where: { id: { notIn: guildIds } } }),
		GuildsByTimezone: (guildIds: string[], timezone: number) => this.prisma.guild.findMany({ where: { id: { in: guildIds }, timezone } }),
		GuildsDisabled: (inDeleteQueue = true) => this.prisma.guild.findMany({ where: { inDeleteQueue } }),
		GuildLanguage: (id: string) => this.prisma.guild.findUnique({ where: { id }, select: { id: true, language: true } }),
		GuildPremium: (id: string) => this.prisma.guild.findUnique({ where: { id }, select: { id: true, premium: true } }),
		PremiumGuilds: () => this.prisma.guild.findMany({ where: { premium: true } }),
		GuildDisabled: (id: string) => this.prisma.guild.findUnique({ where: { id }, select: { id: true, inDeleteQueue: true } }),
		GuildConfig: (id: string) =>
			this.prisma.guild.findUnique({
				where: { id },
				select: {
					id: true,
					rolesBirthday: true,
					rolesNotified: true,
					channelsAnnouncement: true,
					messagesAnnouncement: true,
					channelsOverview: true,
					channelsLogs: true,
					messagesOverview: true,
					timezone: true,
					language: true,
					premium: true
				}
			}),
		ByLastUpdatedDisabled: (date: Date) =>
			this.prisma
				.$transaction([
					this.prisma.birthday.findMany({
						where: { guild: { updatedAt: { lt: date.toISOString() } }, inDeleteQueue: true }
					}),
					this.prisma.guild.findMany({
						where: { updatedAt: { lt: date.toISOString() }, inDeleteQueue: true }
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
		GuildCount: () => this.prisma.guild.count({ where: { inDeleteQueue: false } }),
		GuildAvailableCount: () => this.prisma.guild.count({ where: { inDeleteQueue: false } }),
		GuildNotAvailableCount: () => this.prisma.guild.count({ where: { inDeleteQueue: true } }),
		GuildTimezone: (id: string) => this.prisma.guild.findUnique({ where: { id }, select: { id: true, timezone: true } })
	};

	public set = {
		AnnouncementChannel: (id: string, channelID: string) =>
			this.prisma.guild.update({ where: { id }, data: { channelsAnnouncement: channelID } }),
		AnnouncementMessage: (id: string, message: string) => this.prisma.guild.update({ where: { id }, data: { messagesAnnouncement: message } }),
		OverviewChannel: (id: string, channelID: string) => this.prisma.guild.update({ where: { id }, data: { channelsOverview: channelID } }),
		OverviewMessage: (id: string, messageID: string) => this.prisma.guild.update({ where: { id }, data: { messagesOverview: messageID } }),
		LogChannel: (id: string, channelID: string) => this.prisma.guild.update({ where: { id }, data: { channelsLogs: channelID } }),
		Timezone: (id: string, timezone: number) => this.prisma.guild.update({ where: { id }, data: { timezone } }),
		Language: (id: string, language: string) => this.prisma.guild.update({ where: { id }, data: { language } }),
		BirthdayRole: (id: string, roleID: string) => this.prisma.guild.update({ where: { id }, data: { rolesBirthday: roleID } }),
		BirthdayPingRole: (id: string, roleID: string) =>
			this.prisma.guild.update({
				where: { id },
				data: {
					rolesNotified: roleID
				}
			}),
		Premium: (id: string, premium: boolean) => this.prisma.guild.update({ where: { id }, data: { premium } })
	};

	public update = {
		DisableGuildAndBirthdays: (id: string, inDeleteQueue: boolean) =>
			this.prisma.guild.update({
				where: {
					id
				},
				data: {
					inDeleteQueue,
					birthday: {
						updateMany: {
							where: { guildId: id },
							data: {
								inDeleteQueue
							}
						}
					}
				},
				include: { birthday: true }
			}),
		ByNotInAndBirthdays: (ids: string[], inDeleteQueue: boolean) =>
			this.prisma.$transaction([
				this.prisma.guild.updateMany({
					where: {
						id: { notIn: ids }
					},
					data: {
						inDeleteQueue
					}
				}),
				this.prisma.birthday.updateMany({
					where: {
						guildId: { notIn: ids }
					},
					data: {
						inDeleteQueue
					}
				})
			])
	};

	public delete = {
		GuildByID: (id: string) => this.prisma.guild.delete({ where: { id } }),
		ByDisabledGuilds: () => this.prisma.guild.deleteMany({ where: { inDeleteQueue: true } }),
		ByLastUpdatedDisabled: (date: Date) =>
			this.prisma
				.$transaction([
					this.prisma.birthday.deleteMany({
						where: { guild: { updatedAt: { lt: date.toISOString() } }, inDeleteQueue: true }
					}),
					this.prisma.guild.deleteMany({
						where: { updatedAt: { lt: date.toISOString() }, inDeleteQueue: true }
					})
				])
				.then(([deletedBirthdays, deletedGuilds]) => ({
					deletedBirthdays: deletedBirthdays.count,
					deletedGuilds: deletedGuilds.count
				}))
				.catch(async (error: any) => {
					this.container.logger.error(`[Guild][DeleteByLastUpdated] ${JSON.stringify(error)}`);
					await sendMessage(BOT_ADMIN_LOG, {
						content: `**[ERROR][DeleteByLastUpdated]**\n${codeBlock(JSON.stringify(error))}`
					});
					return { deletedBirthdays: 0, deletedGuilds: 0 };
				})
	};

	public reset = {
		AnnouncementChannel: (id: Snowflake) => this.prisma.guild.update({ where: { id }, data: { channelsAnnouncement: null } }),
		OverviewChannel: (id: Snowflake) => this.prisma.guild.update({ where: { id }, data: { channelsOverview: null } }),
		OverviewMessage: (id: Snowflake) => this.prisma.guild.update({ where: { id }, data: { messagesOverview: null } }),
		LogChannel: (id: Snowflake) => this.prisma.guild.update({ where: { id }, data: { channelsLogs: null } }),
		Timezone: (id: Snowflake) => this.prisma.guild.update({ where: { id }, data: { timezone: 0 } }),
		Language: (id: Snowflake) => this.prisma.guild.update({ where: { id }, data: { language: 'en-US' } }),
		BirthdayRole: (id: Snowflake) => this.prisma.guild.update({ where: { id }, data: { rolesBirthday: null } }),
		BirthdayPingRole: (id: Snowflake) => this.prisma.guild.update({ where: { id }, data: { rolesNotified: null } })
	};

	private prisma = container.prisma;

	public constructor(context: Utility.Context, options: Utility.Options) {
		super(context, {
			...options,
			name: 'guild'
		});
	}

	public create = (data: Prisma.GuildCreateInput) => this.prisma.guild.create({ data });
}
