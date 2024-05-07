import { isAdmin } from '#utils/functions/permissions';
import { Precondition } from '@sapphire/framework';
import type { ChatInputCommandInteraction, CommandInteraction, ContextMenuCommandInteraction } from 'discord.js';

export class UserPermissionsPrecondition extends Precondition {
	public override async chatInputRun(interaction: ChatInputCommandInteraction<'cached'>): Precondition.AsyncResult {
		const result = await this.handler(interaction);
		return result;
	}

	public override async contextMenuRun(
		interaction: ContextMenuCommandInteraction<'cached'>
	): Precondition.AsyncResult {
		const result = await this.handler(interaction);
		return result;
	}

	private async handler(interaction: CommandInteraction<'cached'>) {
		return isAdmin(interaction.member) ? this.ok() : this.error({ identifier: 'preconditions:administrator' });
	}
}
