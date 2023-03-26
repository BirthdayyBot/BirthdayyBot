import { Utility } from '@sapphire/plugin-utilities-store';
import { extractDayAndMonth } from '../../helpers/utils/date';
import type { User } from 'discord.js';

export class Birthday extends Utility {
	private prisma = this.container.prisma;

	public constructor(context: Utility.Context, options: Utility.Options) {
		super(context, {
			...options,
			name: 'birthday',
		});
	}
	public get = {
		BirthdaysByDate: (date: string) => this.prisma.birthday.findMany({ where: { birthday: { contains: extractDayAndMonth(date) } } }),
		BirthdayByDateAndTimezone: (date: string, timezone: number) =>
			this.prisma.birthday.findMany({ where: { birthday: { contains: extractDayAndMonth(date) }, guild: { timezone } } }),
		BirthdaysByGuildID: (guildID: string) => this.prisma.birthday.findMany({ where: { guild_id: guildID } }),
		BirthdayByUserAndGuild: (guildID: string, userID: string) => this.prisma.birthday.findUnique({
			where: { user_id_guild_id: { guild_id: guildID, user_id: userID } },
		}),
		BirthdaysNotDisabled: (guildID: string) => this.prisma.birthday.findMany({ where: { guild_id: guildID, disabled: false } }),
	};

	public update = {
		BirthdayDisabled: (guildID: string, userID: string, disabled: boolean) => this.prisma.birthday.update({
			where: { user_id_guild_id: { guild_id: guildID, user_id: userID } }, data: { disabled },
		}),
		BirthdayByUserAndGuild: (guildID: string, userID: string, birthday: string) => this.prisma.birthday.update({
			where: { user_id_guild_id: { guild_id: guildID, user_id: userID } }, data: { birthday },
		}),
	};

	public delete = {
		GuildByID: (guildID: string) => this.prisma.guild.delete({ where: { guild_id: guildID } }),
		ByDisabledGuilds: () => this.prisma.guild.deleteMany({ where: { disabled: true } }),
		ByLastUpdateDisable: (date: Date) => this.prisma.guild.deleteMany({ where: { last_updated: { lt: date.toISOString() }, disabled: true } }),
		ByGuildAndUser: (guildID: string, userID: string) =>
			this.prisma.birthday.delete({ where: { user_id_guild_id: { guild_id: guildID, user_id: userID } } }),
	};

	public create = (birthday:string, guildID:string, user: User) => this.prisma.birthday.create({ data: {
		birthday: birthday,
		guild: {
			connectOrCreate: {
				create: {
					guild_id: guildID,
				},
				where: {
					guild_id: guildID,
				},
			},
		},
		user: {
			connectOrCreate: {
				create: {
					user_id: user.id,
					discriminator: user.discriminator,
					username: user.username,
				},
				where: {
					user_id: user.id,
				},
			},
		},
	} });
}