import { PrismaErrorCodeEnum } from '#utils/constants';
import { isModerator, resolveOnErrorCodesPrisma } from '#utils/functions';
import { Precondition } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import {
	type ChatInputCommandInteraction,
	type CommandInteraction,
	type ContextMenuCommandInteraction,
} from 'discord.js';

export class UserPrecondition extends Precondition {
	public override async chatInputRun(interaction: ChatInputCommandInteraction<'cached'>) {
		const result = await this.handler(interaction);
		return result;
	}

	public override async contextMenuRun(interaction: ContextMenuCommandInteraction<'cached'>) {
		const result = await this.handler(interaction);
		return result;
	}

	private async handler({ member, guildId, user }: CommandInteraction<'cached'>) {
		if (isModerator(member!)) return this.ok();
		const result = await resolveOnErrorCodesPrisma(
			this.container.prisma.blacklist.findFirstOrThrow({ where: { guildId, userId: user.id } }),
			PrismaErrorCodeEnum.NotFound,
		);
		return isNullish(result) ? this.ok() : this.error({ identifier: 'preconditions:notBlacklisted' });
	}
}
