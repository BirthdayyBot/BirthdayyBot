import type { Prisma } from '@prisma/client';
import { Utility } from '@sapphire/plugin-utilities-store';

export class Guild extends Utility {
	private prisma = this.container.prisma;

	public constructor(context: Utility.Context, options: Utility.Options) {
		super(context, {
			...options,
			name: 'guild',
		});
	}
	public get = {
		GuildByID: async (guildID: string) => this.prisma.guild.findUnique({ where: { guild_id: guildID } }),
		GuildsByIDs: async (guildIDs: string[]) => this.prisma.guild.findMany({ where: { guild_id: { in: guildIDs } } }),
		GuildsNotInIDs: async (guildIDs: string[]) => this.prisma.guild.findMany({ where: { guild_id: { notIn: guildIDs } } }),
		GuildsByTimezone: async (guildIDs: string[], timezone: number) =>
			this.prisma.guild.findMany({ where: { guild_id: { in: guildIDs }, timezone } }),
		GuildsEnableds: async () => this.prisma.guild.findMany({ where: { disabled: false } }),
		GuildsDisabled: async () => this.prisma.guild.findMany({ where: { disabled: true } }),
		GuildLanguage: async (guildID: string) =>
			this.prisma.guild.findUnique({ where: { guild_id: guildID }, select: { guild_id: true, language: true } }),
		GuildPremium: async (guildID: string) =>
			this.prisma.guild.findUnique({ where: { guild_id: guildID }, select: { guild_id: true, premium: true } }),
		GuildDisabled: async (guildID: string) =>
			this.prisma.guild.findUnique({ where: { guild_id: guildID }, select: { guild_id: true, disabled: true } }),
		GuildConfig: async (guildID: string) =>
			this.prisma.guild.findUnique({
				where: { guild_id: guildID },
				select: {
					guild_id: true,
					birthday_role: true,
					birthday_ping_role: true,
					announcement_channel: true,
					announcement_message: true,
					overview_channel: true,
					log_channel: true,
					overview_message: true,
					timezone: true,
					language: true,
					premium: true,
				},
			}),
	};

	public set = {
		AnnouncementChannel: async (guildID: string, channelID: string | null) =>
			this.prisma.guild.update({ where: { guild_id: guildID }, data: { announcement_channel: channelID } }),
		AnnouncementMessage: async (guildID: string, message: string | undefined) =>
			this.prisma.guild.update({ where: { guild_id: guildID }, data: { announcement_message: message } }),
		OverviewChannel: async (guildID: string, channelID: string | null) =>
			this.prisma.guild.update({ where: { guild_id: guildID }, data: { overview_channel: channelID } }),
		OverviewMessage: async (guildID: string, messageID: string | null) =>
			this.prisma.guild.update({ where: { guild_id: guildID }, data: { overview_message: messageID } }),
		LogChannel: async (guildID: string, channelID: string | null) =>
			this.prisma.guild.update({ where: { guild_id: guildID }, data: { log_channel: channelID } }),
		Timezone: async (guildID: string, timezone: number | undefined) =>
			this.prisma.guild.update({ where: { guild_id: guildID }, data: { timezone } }),
		Language: async (guildID: string, language: string | undefined) =>
			this.prisma.guild.update({ where: { guild_id: guildID }, data: { language } }),
		BirthdayRole: async (guildID: string, roleID: string | null) =>
			this.prisma.guild.update({ where: { guild_id: guildID }, data: { birthday_role: roleID } }),
		BirthdayPingRole: async (guildID: string, roleID: string | null) =>
			this.prisma.guild.update({ where: { guild_id: guildID }, data: { birthday_ping_role: roleID } }),
		Premium: async (guildID: string, premium: boolean | undefined) =>
			this.prisma.guild.update({ where: { guild_id: guildID }, data: { premium } }),
	};

	public update = {
		DisableGuildAndBirthdays: async (guildID: string, disabled: boolean) =>
			this.prisma.guild.update({
				where: {
					guild_id: guildID,
				},
				data: {
					disabled,
					birthday: {
						updateMany: {
							where: { guild_id: guildID },
							data: {
								disabled,
							},
						},
					},
				},
				include: { birthday: true },
			}),
		ByNotInAndBirthdays: async (guildID: string[], disabled: boolean) =>
			this.prisma.$transaction([
				this.prisma.guild.updateMany({
					where: {
						guild_id: { notIn: guildID },
					},
					data: {
						disabled,
					},
				}),
				this.prisma.birthday.updateMany({
					where: {
						guild_id: { notIn: guildID },
					},
					data: {
						disabled,
					},
				}),
			]),
	};

	public delete = {
		GuildByID: async (guildID: string) => this.prisma.guild.delete({ where: { guild_id: guildID } }),
		ByDisabledGuilds: async () => this.prisma.guild.deleteMany({ where: { disabled: true } }),
		ByLastUpdateDisable: async (date: Date) => this.prisma.guild.deleteMany({ where: { last_updated: date.toISOString(), disabled: true } }),
	};

	public create = (data: Prisma.GuildCreateInput) => this.prisma.guild.create({ data });

	public check = {
		isGuildPremium: async (guildID: string) => {
			const result = await this.get.GuildPremium(guildID);
			if (result === null) {
				return false;
			}
			return result.premium;
		},
	};
}
