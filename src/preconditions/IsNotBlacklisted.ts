import { AllFlowsPrecondition, Piece, Result } from '@sapphire/framework';
import type { CommandInteraction, ContextMenuCommandInteraction, Message, Snowflake } from 'discord.js';

export class CanManageRolesPrecondition extends AllFlowsPrecondition {
	#message = 'You are blacklisted on this server from using Birthdayy.';

	public constructor(context: Piece.Context, options: AllFlowsPrecondition.Options) {
		super(context, {
			...options,
			position: 20,
		});
	}

	public override async chatInputRun(interaction: CommandInteraction) {
		return this.isBlacklisted(interaction.guildId, interaction.user.id);
	}

	public override async contextMenuRun(interaction: ContextMenuCommandInteraction) {
		return this.isBlacklisted(interaction.guildId, interaction.user.id);
	}

	public override async messageRun(message: Message) {
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
