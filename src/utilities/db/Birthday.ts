import { container } from '@sapphire/framework';
import { Utility } from '@sapphire/plugin-utilities-store';
import type { Dayjs } from 'dayjs';
import type { User } from 'discord.js';

export class Birthday extends Utility {
	public get = {
		BirthdaysByDate: (date: Dayjs) => this.prisma.birthday.findMany({ where: { birthday: { contains: date.format('-MM-DD') } } }),
		BirthdayByDateAndTimezone: (date: Dayjs, timezone: number) =>
			this.prisma.birthday.findMany({
				where: { birthday: { contains: date.format('-MM-DD') }, guild: { timezone } }
			}),
		BirthdayByDateTimezoneAndGuild: (date: Dayjs, timezone: number, guildId: string) => {
			return this.prisma.birthday.findMany({
				where: { birthday: { contains: date.format('-MM-DD') }, guild: { timezone, id: guildId } }
			});
		},
		BirthdaysByGuildId: (guildId: string) => this.prisma.birthday.findMany({ where: { guildId } }),
		BirthdayByUserAndGuild: (guildId: string, userId: string) =>
			this.prisma.birthday.findUnique({
				where: { userId_guildId: { guildId, userId } }
			}),
		BirthdaysNotDisabled: (guildId: string) => this.prisma.birthday.findMany({ where: { guildId, inDeleteQueue: false } }),
		BirthdayCountByGuildId: (guildId: string) => this.prisma.birthday.count({ where: { guildId, inDeleteQueue: false } }),
		BirthdayAvailableCount: () => this.prisma.birthday.count({ where: { inDeleteQueue: false } }),
		BirthdayNotAvailableCount: () => this.prisma.birthday.count()
	};

	public update = {
		BirthdayDisabled: (guildId: string, userId: string, inDeleteQueue: boolean) =>
			this.prisma.birthday.update({
				where: { userId_guildId: { guildId, userId } },
				data: { inDeleteQueue }
			}),
		BirthdayByUserAndGuild: (guildId: string, userId: string, birthday: string) =>
			this.prisma.birthday.update({
				where: { userId_guildId: { guildId, userId } },
				data: { birthday }
			})
	};

	public delete = {
		GuildById: (id: string) => this.prisma.guild.delete({ where: { id } }),
		ByDisabledGuilds: () => this.prisma.guild.deleteMany({ where: { inDeleteQueue: true } }),
		ByGuildAndUser: (guildId: string, userId: string) => this.prisma.birthday.delete({ where: { userId_guildId: { guildId, userId } } })
	};

	private prisma = container.prisma;

	public constructor(context: Utility.Context, options: Utility.Options) {
		super(context, {
			...options,
			name: 'birthday'
		});
	}

	public create = (birthday: string, id: string, user: User) =>
		this.prisma.birthday.create({
			data: {
				birthday,
				guild: {
					connectOrCreate: {
						create: { id },
						where: { id }
					}
				},
				user: {
					connectOrCreate: {
						create: {
							id: user.id,
							discriminator: user.discriminator,
							username: user.username
						},
						where: {
							id: user.id
						}
					}
				}
			}
		});
}
