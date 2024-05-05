import { ApplyOptions } from '@sapphire/decorators';
import { container, Events, Listener } from '@sapphire/framework';
import { GuildMember } from 'discord.js';

@ApplyOptions<Listener.Options>({ event: Events.GuildMemberRemove })
export class UserEvent extends Listener {
	public run(member: GuildMember) {
		container.logger.info(`[EVENT] ${Events.GuildMemberRemove} - ${member.user.tag} (${member.id})`);
	}
}
