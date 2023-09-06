import { isModerator } from '#utils/functions';
import { Precondition, type AsyncPreconditionResult } from '@sapphire/framework';
import type { ChatInputCommandInteraction } from 'discord.js';

export class UserPrecondition extends Precondition {
	public override async chatInputRun(interaction: ChatInputCommandInteraction<'cached'>): AsyncPreconditionResult {
		return isModerator(interaction.member) ? this.ok() : this.error({ identifier: 'preconditions:moderator' });
	}
}
