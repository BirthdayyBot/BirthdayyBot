import { AllFlowsPrecondition } from '@sapphire/framework';
import type { CommandInteraction, ContextMenuCommandInteraction, Message } from 'discord.js';

export class UserPrecondition extends AllFlowsPrecondition {
	#message = 'This command is a premium only command.'; // TODO: Adjust Premium Message

	public override async chatInputRun(interaction: CommandInteraction) {
		return this.premiumCheck(interaction.guildId);
	}

	public override async contextMenuRun(interaction: ContextMenuCommandInteraction) {
		return this.premiumCheck(interaction.guildId);
	}

	public override async messageRun(message: Message) {
		return this.premiumCheck(message.guildId);
	}

	private premiumCheck(guildId: CommandInteraction['guildId']) {
		return guildId
			? this.container.prisma.guild
					.findUnique({
						where: { guildId },
					})
					.then((guild) => (guild?.premium ? this.ok() : this.error({ message: this.#message })))
					.catch((err) => this.error({ message: err.message }))
			: this.error({ message: this.#message });
	}
}
