import { Utility } from '@sapphire/plugin-utilities-store';
import { extractDayAndMonth } from '../../helpers/utils/date';

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
		ByLastUpdateDisable: (date: Date) => this.prisma.guild.deleteMany({ where: { last_updated: date.toISOString(), disabled: true } }),
		ByGuildAndUser: (guildID: string, userID: string) => this.prisma.birthday.delete({ where: { user_id_guild_id: { guild_id: guildID, user_id: userID } } }),
	};

	public create = (birthday:string, guild_id:string, user_id: string) => this.prisma.birthday.create({ data: {
		birthday,
		guild_id,
		user_id,
	} });
}