import type { ChatInputCommandInteraction } from 'discord.js';

import { isGuildModerator } from '#utils/functions';
import { Precondition } from '@sapphire/framework';

export class UserPrecondition extends Precondition {
	public override async chatInputRun(interaction: ChatInputCommandInteraction<'cached'>): Precondition.AsyncResult {
		const result = isGuildModerator(interaction.member);
		return result ? this.ok() : this.error({ identifier: 'preconditions:moderator' });
	}
}
