import type { Events } from '@sapphire/framework';
import { Listener } from '@sapphire/framework';
import type { GuildMember } from 'discord.js';

export class UserEvent extends Listener<typeof Events.GuildMemberRemove> {
	public async run(member: GuildMember) {
		//TODO: remove from database and update birthday list
		//Code: https://autocode.com/mp/chillihero/birthday-bot/dev/?filename=functions%2Fevents%2Fdiscord%2Fguild%2Fmember%2Fremove.js
		console.log('member', member);
	}
}
