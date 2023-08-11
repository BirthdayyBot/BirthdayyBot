import { PREMIUM_URL } from '#lib/utils/environment';
import { ApplyOptions } from '@sapphire/decorators';
import { Precondition, Result, type PreconditionOptions } from '@sapphire/framework';
import type { ChatInputCommandInteraction, ContextMenuCommandInteraction, Message } from 'discord.js';

@ApplyOptions<PreconditionOptions>({
	name: 'IsPremium',
	position: 20,
})
export class IsPremiumPrecondition extends Precondition {
	#message = `This command is a premium only command. Visit ${PREMIUM_URL}.`; // TODO: Adjust Premium Message

	public override async chatInputRun(interaction: ChatInputCommandInteraction<'cached'>) {
		return this.premiumCheck(interaction.guildId);
	}

	public override async contextMenuRun(interaction: ContextMenuCommandInteraction<'cached'>) {
		return this.premiumCheck(interaction.guildId);
	}

	public override async messageRun(message: Message<true>) {
		return this.premiumCheck(message.guildId);
	}

	private async premiumCheck(guildId: string): Promise<Precondition.Result> {
		const result = await Result.fromAsync(this.container.prisma.guild.findFirstOrThrow({ where: { guildId } }));

		return result.match({
			ok: (guild) =>
				guild.premium ? this.ok() : this.error({ identifier: 'GuildNotPremium', message: this.#message }),
			err: () => this.error({ identifier: 'GuildNotFound', message: this.#message }),
		});
	}
}

declare module '@sapphire/framework' {
	interface Preconditions {
		IsPremium: never;
	}
}
