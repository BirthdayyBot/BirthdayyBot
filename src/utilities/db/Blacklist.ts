import { ApplyOptions } from '@sapphire/decorators';
import { Utility } from '@sapphire/plugin-utilities-store';

@ApplyOptions<Utility.Options>({
	name: 'blacklist',
})
export class Blacklist extends Utility {
	public get = {
		BlacklistByGuildId: (guildId: string) => this.prisma.blacklist.findMany({ where: { guildId } }),
	};

	public create = {
		BlacklistEntry: (guildId: string, userId: string) =>
			this.prisma.blacklist.create({ data: { guildId, userId } }),
	};

	public delete = {
		BlacklistEntry: (guildId: string, userId: string) =>
			this.prisma.blacklist.delete({ where: { userId_guildId: { userId, guildId } } }),
	};

	private prisma = this.container.prisma;
}
