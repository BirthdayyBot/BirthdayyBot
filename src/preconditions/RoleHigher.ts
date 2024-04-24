import { ApplyOptions } from '@sapphire/decorators';
import { type AsyncPreconditionResult, Precondition } from '@sapphire/framework';
import { type ChatInputCommandInteraction } from 'discord.js';

export interface TargetPosistionPreconditionContext extends Precondition.Context {
	identifier: string;
}
@ApplyOptions<Precondition.Options>({})
export class TargetPositionPrecondition extends Precondition {
	public override async chatInputRun(interaction: ChatInputCommandInteraction<'cached'>): AsyncPreconditionResult {
		const target = interaction.options.getMember('user') ?? interaction.member;
		const author = interaction.member;

		if (author.id === target.id) return this.ok();

		return author.roles.highest.position >= target.roles.highest.position ? this.ok() : this.error({ identifier: 'preconditions:roleHigher' });
	}
}
