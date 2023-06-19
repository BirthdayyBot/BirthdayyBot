import { AllFlowsPrecondition, Piece, Result } from '@sapphire/framework';
import type { CommandInteraction, ContextMenuCommandInteraction, Message, Snowflake } from 'discord.js';
import { canManageRoles } from '../lib/utils/precondition';

export class CanManageRolesPrecondition extends AllFlowsPrecondition {
	#message = 'You are blacklisted from using Birthdayy on this.';

	public constructor(context: Piece.Context, options: AllFlowsPrecondition.Options) {
		super(context, {
			...options,
			position: 20,
		});
	}

	public override async chatInputRun(interaction: CommandInteraction) {
		if (canManageRoles(interaction.memberPermissions)) return this.ok();
		return this.isBlacklisted(interaction.guildId, interaction.user.id);
	}

	public override async contextMenuRun(interaction: ContextMenuCommandInteraction) {
		if (canManageRoles(interaction.memberPermissions)) return this.ok();
		return this.isBlacklisted(interaction.guildId, interaction.user.id);
	}

	public override async messageRun(message: Message) {
		if (canManageRoles(message.member?.permissions)) return this.ok();
		return this.isBlacklisted(message.guildId, message.author.id);
	}

	private async isBlacklisted(guildId: Snowflake | null, userId: Snowflake) {
		if (guildId === null) return this.ok();
		const isUserBlacklisted = await Result.fromAsync(
			this.container.prisma.blacklist.findFirstOrThrow({ where: { guildId, userId } }),
		);

		// SQL query failed, therefore no userid with guildid was found, therefore the guild is not banned.
		if (isUserBlacklisted.isErr()) return this.ok();
		return this.error({ identifier: 'IsBlacklisted', message: this.#message });
	}
}
