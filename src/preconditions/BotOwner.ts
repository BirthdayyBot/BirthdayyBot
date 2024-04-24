import type { ChatInputCommandInteraction, CommandInteraction, ContextMenuCommandInteraction } from 'discord.js';

import { OWNERS } from '#root/config';
import { type AsyncPreconditionResult, Precondition } from '@sapphire/framework';

export class UserPrecondition extends Precondition {
	public override async chatInputRun(interaction: ChatInputCommandInteraction): AsyncPreconditionResult {
		const result = await this.handler(interaction);
		return result;
	}

	public override async contextMenuRun(interaction: ContextMenuCommandInteraction): AsyncPreconditionResult {
		const result = await this.handler(interaction);
		return result;
	}

	private async handler(interaction: CommandInteraction): AsyncPreconditionResult {
		return OWNERS.includes(interaction.user.id) ? this.ok() : this.error({ context: { silent: true } });
	}
}
