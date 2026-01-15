import { AllFlowsPrecondition, Result } from '@sapphire/framework';
import type { CommandInteraction, ContextMenuCommandInteraction, Message, Snowflake } from 'discord.js';
import { canManageRoles } from '../lib/utils/precondition';

/**
 * Checks if a user is blacklisted from using the bot in the guild
 * Bot admins and users with manage roles permissions bypass this check
 * Runs early in the precondition chain to fail fast
 */
export class IsNotBlacklistedPrecondition extends AllFlowsPrecondition {
	readonly #message = 'You are blacklisted from using Birthdayy in this guild.';
	readonly #identifier = 'IsNotBlacklistedPrecondition';

	public constructor(context: AllFlowsPrecondition.LoaderContext, options: AllFlowsPrecondition.Options) {
		super(context, {
			...options,
			// Run this check early to fail fast
			position: 20,
		});
	}

	public override chatInputRun(interaction: CommandInteraction) {
		// Users with manage roles permission bypass the blacklist check
		if (canManageRoles(interaction.memberPermissions)) return this.ok();
		return this.checkBlacklistStatus(interaction.guildId, interaction.user.id);
	}

	public override contextMenuRun(interaction: ContextMenuCommandInteraction) {
		// Users with manage roles permission bypass the blacklist check
		if (canManageRoles(interaction.memberPermissions)) return this.ok();
		return this.checkBlacklistStatus(interaction.guildId, interaction.user.id);
	}

	public override messageRun(message: Message) {
		// Users with manage roles permission bypass the blacklist check
		if (canManageRoles(message.member?.permissions)) return this.ok();
		return this.checkBlacklistStatus(message.guildId, message.author.id);
	}

	private async checkBlacklistStatus(guildId: Snowflake | null, userId: Snowflake) {
		// If not in a guild context, allow
		if (!guildId) return this.ok();

		const result = await Result.fromAsync(
			this.container.prisma.blacklist.findFirstOrThrow({
				where: { guildId, userId },
			}),
		);

		// User isn't found in blacklist - allow
		if (result.isErr()) return this.ok();

		// User is blacklisted - deny
		return this.error({ identifier: this.#identifier, message: this.#message });
	}
}
