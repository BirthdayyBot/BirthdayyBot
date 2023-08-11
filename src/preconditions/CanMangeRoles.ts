import { Precondition, type PreconditionOptions } from '@sapphire/framework';
import type { CommandInteraction, ContextMenuCommandInteraction, Message, PermissionsBitField } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import type { Nullish } from '@sapphire/utilities';
import { canManageRoles, isBotAdmin } from '#lib/utils/functions';

@ApplyOptions<PreconditionOptions>({
	name: 'CanManageRoles',
	position: 20,
})
export class CanManageRolesPrecondition extends Precondition {
	#message = 'You need to have the `Manage Roles` permission to use this command.';
	#NotInGuildMessage = 'You need to be in a guild to use this command.';

	public override async chatInputRun(interaction: CommandInteraction) {
		return this.canUserManageRoles(interaction.user.id, interaction.memberPermissions);
	}

	public override async contextMenuRun(interaction: ContextMenuCommandInteraction) {
		return this.canUserManageRoles(interaction.user.id, interaction.memberPermissions);
	}

	public override async messageRun(message: Message) {
		return this.canUserManageRoles(message.author.id, message.member?.permissions);
	}

	public canUserManageRoles(userId: string, permissions: PermissionsBitField | Nullish) {
		if (isBotAdmin(userId)) return this.ok();
		if (!permissions) return this.error({ message: this.#NotInGuildMessage });
		if (canManageRoles(permissions)) return this.ok();
		return this.error({ identifier: 'CannotManageRoles', message: this.#message });
	}
}

declare module '@sapphire/framework' {
	interface Preconditions {
		CanManageRoles: never;
	}
}
