import { Precondition } from '@sapphire/framework';
import type { ChatInputCommandInteraction, CommandInteraction, ContextMenuCommandInteraction } from 'discord.js';

export class UserPermissionsPrecondition extends Precondition {
	public override async chatInputRun(interaction: ChatInputCommandInteraction<'cached'>) {
		return this.handle(interaction);
	}

	public override async contextMenuRun(interaction: ContextMenuCommandInteraction<'cached'>) {
		return this.handle(interaction);
	}

	public handle(interaction: CommandInteraction<'cached'>) {
		return interaction.user.id === interaction.guild.ownerId ? this.ok() : this.error({ identifier: 'preconditions:serverOwner' });
	}
}
