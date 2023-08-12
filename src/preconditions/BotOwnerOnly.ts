import { BOT_OWNER } from '#utils/environment';
import { Precondition } from '@sapphire/framework';
import type { CommandInteraction, ContextMenuCommandInteraction, Message, Snowflake } from 'discord.js';

export class OwnerOwnlyPrecondition extends Precondition {
	#message = 'This command can only be used by the bot owner.';

	public override chatInputRun(interaction: CommandInteraction) {
		return this.doOwnerCheck(interaction.user.id);
	}

	public override contextMenuRun(interaction: ContextMenuCommandInteraction) {
		return this.doOwnerCheck(interaction.user.id);
	}

	public override messageRun(message: Message) {
		return this.doOwnerCheck(message.author.id);
	}

	private doOwnerCheck(userId: Snowflake) {
		return BOT_OWNER.includes(userId)
			? this.ok()
			: this.error({ identifier: 'IsNotOwner', message: this.#message });
	}
}
