import type { ChatInputCommandInteraction, CommandInteraction, ContextMenuCommandInteraction } from 'discord.js';

import { PrismaErrorCodeEnum } from '#utils/constants';
import { resolveOnErrorCodesPrisma } from '#utils/functions/promises';
import { Precondition } from '@sapphire/framework';

export class UserPrecondition extends Precondition {
	public override async chatInputRun(interaction: ChatInputCommandInteraction<'cached'>) {
		const result = await this.handler(interaction);
		return result;
	}

	public override async contextMenuRun(interaction: ContextMenuCommandInteraction<'cached'>) {
		const result = await this.handler(interaction);
		return result;
	}

	private async handler({ guildId }: CommandInteraction<'cached'>) {
		const result = await resolveOnErrorCodesPrisma(
			this.container.prisma.guild.findFirstOrThrow({ where: { id: guildId } }),
			PrismaErrorCodeEnum.NotFound
		);

		return result?.premium === true ? this.ok() : this.error({ identifier: 'preconditions:guildPremium' });
	}
}
