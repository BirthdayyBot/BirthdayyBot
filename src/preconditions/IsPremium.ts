import { AllFlowsPrecondition } from '@sapphire/framework';
import type { CommandInteraction, ContextMenuCommandInteraction, Message } from 'discord.js';
import { isGuildPremium } from '../helpers/provide/guild';

export class UserPrecondition extends AllFlowsPrecondition {
	#message = 'This command is a premium only command.'; //TODO: Adjust Premium Message

	public override async chatInputRun(interaction: CommandInteraction) {
		return this.premiumCheck(interaction.user.id);
	}

	public override async contextMenuRun(interaction: ContextMenuCommandInteraction) {
		return this.premiumCheck(interaction.user.id);
	}

	public override async messageRun(message: Message) {
		return await this.premiumCheck(message.author.id);
	}

	private async premiumCheck(guild_id: string) {
		const is_premium: boolean = await isGuildPremium(guild_id);
		return is_premium ? this.ok() : this.error({ message: this.#message });
	}
}

declare module '@sapphire/framework' {
	interface Preconditions {
		IsPremium: never;
	}
}
