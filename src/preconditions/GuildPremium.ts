import { Precondition } from '@sapphire/framework';
import type { CommandInteraction, ContextMenuCommandInteraction, Message } from 'discord.js';
import { PREMIUM_URL } from '../helpers';

export class IsPremiumPrecondition extends Precondition {
	#message = `This command is a premium only command. Visit ${PREMIUM_URL}.`; // TODO: Adjust Premium Message

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
					.catch(() => this.error({ message: this.#message }))
			: this.error({ identifier: 'GuildNotPremium', message: this.#message });
	}
}
