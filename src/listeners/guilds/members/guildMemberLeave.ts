import { ApplyOptions } from '@sapphire/decorators';
import { container, Events, Listener } from '@sapphire/framework';
import { GuildMember } from 'discord.js';

@ApplyOptions<Listener.Options>({ event: Events.GuildMemberRemove })
export class UserEvent extends Listener {
	public async run(member: GuildMember) {
		await container.prisma.birthday.deleteMany({ where: { userId: member.id, guildId: member.guild.id } });

		container.logger.info(`[EVENT] ${Events.GuildMemberRemove} - ${member.user.tag} (${member.id})`);
	}
}
