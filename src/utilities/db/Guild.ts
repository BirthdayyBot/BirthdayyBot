import type { Prisma } from '@prisma/client';
import { Utility } from '@sapphire/plugin-utilities-store';

export class Guild extends Utility {
	public get = {
		GuildById: async (guildId: string) => this.prisma.guild.findUnique({ where: { guildId } }),
		GuildsByIds: async (guildIds: string[]) => this.prisma.guild.findMany({ where: { guildId: { in: guildIds } } }),
		GuildsNotInIds: async (guildIds: string[]) =>
			this.prisma.guild.findMany({ where: { guildId: { notIn: guildIds } } }),
		GuildsByTimezone: async (guildIds: string[], timezone: number) =>
			this.prisma.guild.findMany({ where: { guildId: { in: guildIds }, timezone } }),
		GuildsEnableds: async () => this.prisma.guild.findMany({ where: { disabled: false } }),
		GuildsDisabled: async () => this.prisma.guild.findMany({ where: { disabled: true } }),
		GuildLanguage: async (guildId: string) =>
			this.prisma.guild.findUnique({ where: { guildId }, select: { guildId: true, language: true } }),
		GuildPremium: async (guildId: string) =>
			this.prisma.guild.findUnique({ where: { guildId }, select: { guildId: true, premium: true } }),
		GuildDisabled: async (guildId: string) =>
			this.prisma.guild.findUnique({ where: { guildId }, select: { guildId: true, disabled: true } }),
		GuildConfig: async (guildId: string) =>
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
	};

	public set = {
		AnnouncementChannel: async (guildId: string, channelID: string | null) =>
			this.prisma.guild.update({ where: { guildId }, data: { announcementChannel: channelID } }),
		AnnouncementMessage: async (guildId: string, message: string | undefined) =>
			this.prisma.guild.update({ where: { guildId }, data: { announcementMessage: message } }),
		OverviewChannel: async (guildId: string, channelID: string | null) =>
			this.prisma.guild.update({ where: { guildId }, data: { overviewChannel: channelID } }),
		OverviewMessage: async (guildId: string, messageID: string | null) =>
			this.prisma.guild.update({ where: { guildId }, data: { overviewMessage: messageID } }),
		LogChannel: async (guildId: string, channelID: string | null) =>
			this.prisma.guild.update({ where: { guildId }, data: { logChannel: channelID } }),
		Timezone: async (guildId: string, timezone: number | undefined) =>
			this.prisma.guild.update({ where: { guildId }, data: { timezone } }),
		Language: async (guildId: string, language: string | undefined) =>
			this.prisma.guild.update({ where: { guildId }, data: { language } }),
		BirthdayRole: async (guildId: string, roleID: string | null) =>
			this.prisma.guild.update({ where: { guildId }, data: { birthdayRole: roleID } }),
		BirthdayPingRole: async (guildId: string, roleID: string | null) =>
			this.prisma.guild.update({ where: { guildId }, data: { birthdayPingRole: roleID } }),
		Premium: async (guildId: string, premium: boolean | undefined) =>
			this.prisma.guild.update({ where: { guildId }, data: { premium } }),
	};

	public update = {
		DisableGuildAndBirthdays: async (guildId: string, disabled: boolean) =>
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
		ByNotInAndBirthdays: async (guildId: string[], disabled: boolean) =>
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
		GuildByID: async (guildId: string) => this.prisma.guild.delete({ where: { guildId } }),
		ByDisabledGuilds: async () => this.prisma.guild.deleteMany({ where: { disabled: true } }),
		ByLastUpdatedDisabled: async (date: Date) =>
			this.prisma.guild.deleteMany({ where: { lastUpdated: date.toISOString(), disabled: true } }),
	};

	public check = {
		isGuildPremium: async (guildId: string) => {
			const result = await this.get.GuildPremium(guildId);
			if (result === null) {
				return false;
			}
			return result.premium;
		},
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
