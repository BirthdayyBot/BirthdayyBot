import { canManageRoles } from '#lib/utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { AllFlowsPrecondition, Result, type PreconditionOptions, type PreconditionResult } from '@sapphire/framework';
import type { ChatInputCommandInteraction, ContextMenuCommandInteraction, Message } from 'discord.js';

@ApplyOptions<PreconditionOptions>({
	name: 'IsNotBlacklisted',
	position: 20,
})
export class IsNotBlacklistedPrecondition extends AllFlowsPrecondition {
	#message = 'You are blacklisted from using Birthdayy on this.';

	public override async chatInputRun(interaction: ChatInputCommandInteraction<'cached'>) {
		if (canManageRoles(interaction.memberPermissions)) return this.ok();
		return this.isBlacklisted(interaction.guildId, interaction.user.id);
	}

	public override async contextMenuRun(interaction: ContextMenuCommandInteraction<'cached'>) {
		if (canManageRoles(interaction.memberPermissions)) return this.ok();
		return this.isBlacklisted(interaction.guildId, interaction.user.id);
	}

	public override async messageRun(message: Message<true>) {
		if (canManageRoles(message.member?.permissions)) return this.ok();
		return this.isBlacklisted(message.guildId, message.author.id);
	}

	private async isBlacklisted(guildId: string, userId: string): Promise<PreconditionResult> {
		const result = await Result.fromAsync(
			this.container.prisma.blacklist.findFirstOrThrow({ where: { guildId, userId } }),
		);

		return result.match({
			ok: () => this.error({ identifier: 'IsBlacklisted', message: this.#message }),
			err: () => this.ok(),
		});
	}
}

declare module '@sapphire/framework' {
	interface Preconditions {
		IsNotBlacklisted: never;
	}
}
