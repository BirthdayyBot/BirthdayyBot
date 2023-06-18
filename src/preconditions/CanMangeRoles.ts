import { Precondition } from '@sapphire/framework';

import type {
	CommandInteraction,
	ContextMenuCommandInteraction,
	Message,
	PermissionsBitField,
	Snowflake,
} from 'discord.js';
import { isBotAdmin } from '../lib/utils/helper';

export class CanManageRolesPrecondition extends Precondition {
	#message = 'You need to have the `Manage Roles` permission to use this command.';
	#NotInGuildMessage = 'You need to be in a guild to use this command.';

	public override async chatInputRun(interaction: CommandInteraction) {
		return this.canManageRoles(interaction.user.id, interaction.memberPermissions);
	}

	public override async contextMenuRun(interaction: ContextMenuCommandInteraction) {
		return this.canManageRoles(interaction.user.id, interaction.memberPermissions);
	}

	public override async messageRun(message: Message) {
		return this.canManageRoles(message.author.id, message.member?.permissions);
	}

	private canManageRoles(userId: Snowflake, permissions: PermissionsBitField | null | undefined) {
		if (isBotAdmin(userId)) return this.ok();
		if (!permissions) return this.error({ message: this.#NotInGuildMessage });
		if (permissions.has('ManageRoles')) return this.ok();
		return this.error({ identifier: 'CannotManageRoles', message: this.#message });
	}
}
