import type { Prisma } from '@prisma/client';
import { Utility } from '@sapphire/plugin-utilities-store';
import type { Snowflake } from 'discord.js';
import { DEFAULT_ANNOUNCEMENT_MESSAGE } from '../../helpers';

export class Guild extends Utility {
	public get = {
		GuildById: (guildId: string) => this.prisma.guild.findUnique({ where: { guildId } }),
		GuildsByIds: (guildIds: string[]) => this.prisma.guild.findMany({ where: { guildId: { in: guildIds } } }),
		GuildsNotInIds: (guildIds: string[]) => this.prisma.guild.findMany({ where: { guildId: { notIn: guildIds } } }),
		GuildsByTimezone: (guildIds: string[], timezone: number) =>
			this.prisma.guild.findMany({ where: { guildId: { in: guildIds }, timezone } }),
		GuildsDisabled: (disabled = true) => this.prisma.guild.findMany({ where: { disabled } }),
		GuildLanguage: (guildId: string) =>
			this.prisma.guild.findUnique({ where: { guildId }, select: { guildId: true, language: true } }),
		GuildPremium: (guildId: string) =>
			this.prisma.guild.findUnique({ where: { guildId }, select: { guildId: true, premium: true } }),
		GuildDisabled: (guildId: string) =>
			this.prisma.guild.findUnique({ where: { guildId }, select: { guildId: true, disabled: true } }),
		GuildConfig: (guildId: string) =>
			this.prisma.guild.findUnique({
				where: { guildId },
				select: {
					guildId: true,
					birthdayRole: true,
					birthdayPingRole: true,
					announcementChannel: true,
					announcementMessage: true,
					overviewChannel: true,
					logChannel: true,
					overviewMessage: true,
					timezone: true,
					language: true,
					premium: true,
				},
			}),
		ByLastUpdatedDisabled: (date: Date) =>
			this.prisma
				.$transaction([
					this.prisma.birthday.findMany({
						where: { guild: { lastUpdated: { lt: date.toISOString() } }, disabled: true },
					}),
					this.prisma.guild.findMany({
						where: { lastUpdated: { lt: date.toISOString() }, disabled: true },
					}),
				])
				.then(([birthdays, guilds]) => ({
					deletedBirthdays: birthdays.length,
					deletedGuilds: guilds.length,
				}))
				.catch((error: any) => {
					this.container.logger.error(`[Guild][DeleteByLastUpdated] ${JSON.stringify(error)}`);
					return { deletedBirthdays: 0, deletedGuilds: 0 };
				}),
		GuildCount: () => this.prisma.guild.count({ where: { disabled: false } }),
		GuildAvailableCount: () => this.prisma.guild.count({ where: { disabled: false } }),
		GuildNotAvailableCount: () => this.prisma.guild.count({ where: { disabled: true } }),
	};

	public set = {
		AnnouncementChannel: (guildId: string, channelID: string) =>
			this.prisma.guild.update({ where: { guildId }, data: { announcementChannel: channelID } }),
		AnnouncementMessage: (guildId: string, message: string) =>
			this.prisma.guild.update({ where: { guildId }, data: { announcementMessage: message } }),
		OverviewChannel: (guildId: string, channelID: string) =>
			this.prisma.guild.update({ where: { guildId }, data: { overviewChannel: channelID } }),
		OverviewMessage: (guildId: string, messageID: string) =>
			this.prisma.guild.update({ where: { guildId }, data: { overviewMessage: messageID } }),
		LogChannel: (guildId: string, channelID: string) =>
			this.prisma.guild.update({ where: { guildId }, data: { logChannel: channelID } }),
		Timezone: (guildId: string, timezone: number) =>
			this.prisma.guild.update({ where: { guildId }, data: { timezone } }),
		Language: (guildId: string, language: string) =>
			this.prisma.guild.update({ where: { guildId }, data: { language } }),
		BirthdayRole: (guildId: string, roleID: string) =>
			this.prisma.guild.update({ where: { guildId }, data: { birthdayRole: roleID } }),
		BirthdayPingRole: (guildId: string, roleID: string) =>
			this.prisma.guild.update({ where: { guildId }, data: { birthdayPingRole: roleID } }),
		Premium: (guildId: string, premium: boolean) =>
			this.prisma.guild.update({ where: { guildId }, data: { premium } }),
	};

	public update = {
		DisableGuildAndBirthdays: (guildId: string, disabled: boolean) =>
			this.prisma.guild.update({
				where: {
					guildId,
				},
				data: {
					disabled,
					birthday: {
						updateMany: {
							where: { guildId },
							data: {
								disabled,
							},
						},
					},
				},
				include: { birthday: true },
			}),
		ByNotInAndBirthdays: (guildId: string[], disabled: boolean) =>
			this.prisma.$transaction([
				this.prisma.guild.updateMany({
					where: {
						guildId: { notIn: guildId },
					},
					data: {
						disabled,
					},
				}),
				this.prisma.birthday.updateMany({
					where: {
						guildId: { notIn: guildId },
					},
					data: {
						disabled,
					},
				}),
			]),
	};

	public delete = {
		GuildByID: (guildId: string) => this.prisma.guild.delete({ where: { guildId } }),
		ByDisabledGuilds: () => this.prisma.guild.deleteMany({ where: { disabled: true } }),
		ByLastUpdatedDisabled: (date: Date) =>
			this.prisma
				.$transaction([
					this.prisma.birthday.deleteMany({
						where: { guild: { lastUpdated: { lt: date.toISOString() } }, disabled: true },
					}),
					this.prisma.guild.deleteMany({
						where: { lastUpdated: { lt: date.toISOString() }, disabled: true },
					}),
				])
				.then(([deletedBirthdays, deletedGuilds]) => ({
					deletedBirthdays: deletedBirthdays.count,
					deletedGuilds: deletedGuilds.count,
				}))
				.catch((error: any) => {
					this.container.logger.error(`[Guild][DeleteByLastUpdated] ${JSON.stringify(error)}`);
					return { deletedBirthdays: 0, deletedGuilds: 0 };
				}),
	};

	public check = {
		isGuildPremium: async (guildId: Snowflake) => {
			const result = await this.get.GuildPremium(guildId);
			if (result === null) {
				return false;
			}
			return result.premium;
		},
	};

	public reset = {
		AnnouncementChannel: (guildId: Snowflake) =>
			this.prisma.guild.update({ where: { guildId }, data: { announcementChannel: null } }),
		AnnouncementMessage: (guildId: Snowflake) =>
			this.prisma.guild.update({
				where: { guildId },
				data: {
					announcementMessage: DEFAULT_ANNOUNCEMENT_MESSAGE,
				},
			}),
		OverviewChannel: (guildId: Snowflake) =>
			this.prisma.guild.update({ where: { guildId }, data: { overviewChannel: null } }),
		OverviewMessage: (guildId: Snowflake) =>
			this.prisma.guild.update({ where: { guildId }, data: { overviewMessage: null } }),
		LogChannel: (guildId: Snowflake) =>
			this.prisma.guild.update({ where: { guildId }, data: { logChannel: null } }),
		Timezone: (guildId: Snowflake) => this.prisma.guild.update({ where: { guildId }, data: { timezone: 0 } }),
		Language: (guildId: Snowflake) => this.prisma.guild.update({ where: { guildId }, data: { language: 'en-US' } }),
		BirthdayRole: (guildId: Snowflake) =>
			this.prisma.guild.update({ where: { guildId }, data: { birthdayRole: null } }),
		BirthdayPingRole: (guildId: Snowflake) =>
			this.prisma.guild.update({ where: { guildId }, data: { birthdayPingRole: null } }),
	};

	private prisma = this.container.prisma;

	public constructor(context: Utility.Context, options: Utility.Options) {
		super(context, {
			...options,
			name: 'guild',
		});
	}

	public create = (data: Prisma.GuildCreateInput) => this.prisma.guild.create({ data });
}
