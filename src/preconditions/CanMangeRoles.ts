import { AllFlowsPrecondition } from '@sapphire/framework';
import type { CommandInteraction, ContextMenuCommandInteraction, Message, PermissionsBitField } from 'discord.js';

export class CanManageRolesPrecondition extends AllFlowsPrecondition {
	#message = 'You need to have the `Manage Roles` permission to use this command.';
	#NotInGuildMessage = 'You need to be in a guild to use this command.';

	public override async chatInputRun(interaction: CommandInteraction) {
		return this.canManageRoles(interaction.memberPermissions);
	}

	public override async contextMenuRun(interaction: ContextMenuCommandInteraction) {
		return this.canManageRoles(interaction.memberPermissions);
	}

	public override async messageRun(message: Message) {
		return this.canManageRoles(message.member?.permissions);
	}

	private canManageRoles(permissions: PermissionsBitField | null | undefined) {
		if (!permissions) return this.error({ message: this.#NotInGuildMessage });
		if (permissions.has('ManageRoles')) return this.ok();
		return this.error({ message: this.#message });
	}
}