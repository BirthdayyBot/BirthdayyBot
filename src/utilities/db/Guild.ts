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
		GuildByID: (guildID: string) => this.prisma.guild.findUnique({ where: { guild_id: guildID } }),
		GuildsByIDs: (guildIDs: string[]) => this.prisma.guild.findMany({ where: { guild_id: { in: guildIDs } } }),
		GuildsNotInIDs: (guildIDs: string[]) => this.prisma.guild.findMany({ where: { guild_id: { notIn: guildIDs } } }),
		GuildsByTimezone: (guildIDs: string[], timezone: number) => this.prisma.guild.findMany({ where: { guild_id: { in: guildIDs }, timezone } }),
		GuildsEnableds: () => this.prisma.guild.findMany({ where: { disabled: false } }),
		GuildsDisabled: () => this.prisma.guild.findMany({ where: { disabled: true } }),
		GuildLanguage: (guildID: string) => this.prisma.guild.findUnique({ where: { guild_id: guildID }, select: { guild_id: true, language: true } }),
		GuildPremium: (guildID: string) => this.prisma.guild.findUnique({ where: { guild_id: guildID }, select: { guild_id: true, premium: true } }),
		GuildDisabled: (guildID: string) => this.prisma.guild.findUnique({ where: { guild_id: guildID }, select: { guild_id: true, disabled: true } }),
		GuildConfig: (guildID: string) => this.prisma.guild.findUnique({ where: { guild_id: guildID }, select: {
			guild_id: true,
			birthday_role: true,
			birthday_ping_role: true,
			announcement_channel: true,
			announcement_message: true, // TODO: #13 change to announcement_message once DP is deployed
			overview_channel: true,
			log_channel: true,
			overview_message: true,
			timezone: true,
			language: true,
			premium: true,
		  } }),
	};

	public update = {
		DisableGuildAndBirthdays: (guildID: string, disabled: boolean) => this.prisma.guild.update({
			where: {
				guild_id: guildID,
			},
			data: {
				disabled,
				birthday: {
					updateMany: {
						where: { guild_id : guildID },
						data: {
							disabled,
						},
					},
				},
			},
			include: { birthday: true },
		}),
		ByNotInAndBirthdays: (guildID: string[], disabled: boolean) => this.prisma.$transaction([
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
		GuildByID: (guildID: string) => this.prisma.guild.delete({ where: { guild_id: guildID } }),
		ByDisabledGuilds: () => this.prisma.guild.deleteMany({ where: { disabled: true } }),
		ByLastUpdateDisable: (date: Date) => this.prisma.guild.deleteMany({ where: { last_updated: date.toISOString(), disabled: true } }),
	};

	public create = (data: Prisma.GuildCreateInput) => this.prisma.guild.create({ data });
}