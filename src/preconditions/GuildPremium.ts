import { Precondition, Result } from '@sapphire/framework';
import type { CommandInteraction, ContextMenuCommandInteraction, Message, Snowflake } from 'discord.js';
import { PREMIUM_URL } from '../helpers';

/**
 * Ensures the guild has premium status
 * @example
 * \\@ApplyOptions<CommandOptions>({
 *   preconditions: ['GuildPremium']
 * })
 */
export class GuildPremiumPrecondition extends Precondition {
	readonly #message = `This command is a premium-only feature. Visit ${PREMIUM_URL} to upgrade.`;
	readonly #identifier = 'GuildPremiumPrecondition';

	public override chatInputRun(interaction: CommandInteraction) {
		return this.checkGuildPremium(interaction.guildId);
	}

	public override contextMenuRun(interaction: ContextMenuCommandInteraction) {
		return this.checkGuildPremium(interaction.guildId);
	}

	public override messageRun(message: Message) {
		return this.checkGuildPremium(message.guildId);
	}

	private async checkGuildPremium(guildId: Snowflake | null) {
		// Not in a guild context
		if (!guildId) {
			return this.error({ identifier: this.#identifier, message: this.#message });
		}

		const result = await Result.fromAsync(
			this.container.prisma.guild.findUniqueOrThrow({
				where: { guildId },
			}),
		);

		// Database error - deny access
		if (result.isErr()) {
			return this.error({ identifier: this.#identifier, message: this.#message });
		}

		// Check premium status
		const guild = result.unwrap();
		return guild.premium ? this.ok() : this.error({ identifier: this.#identifier, message: this.#message });
	}
}
