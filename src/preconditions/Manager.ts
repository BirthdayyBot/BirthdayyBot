import type { ChatInputCommandInteraction } from 'discord.js';

import { isGuildManager } from '#utils/functions';
import { Precondition } from '@sapphire/framework';

export class UserPrecondition extends Precondition {
	public override async chatInputRun(interaction: ChatInputCommandInteraction<'cached'>): Precondition.AsyncResult {
		const result = isGuildManager(interaction.member);
		return result ? this.ok() : this.error({ identifier: 'preconditions:manager' });
	}
}
