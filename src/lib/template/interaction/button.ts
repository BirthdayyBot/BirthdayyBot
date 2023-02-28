import { InteractionHandler, InteractionHandlerTypes, PieceContext } from '@sapphire/framework';
import type { ButtonInteraction } from 'discord.js';

export class ExampleParseMethod extends InteractionHandler {
	public constructor(ctx: PieceContext) {
		super(ctx, { interactionHandlerType: InteractionHandlerTypes.Button });
	}

	public async run(interaction: ButtonInteraction, result: { success: boolean }) {
		await interaction.editReply({
			content: `The long running task ${result.success ? 'succeeded' : 'failed'}!`
		});
	}

	public async parse(interaction: ButtonInteraction) {
		if (!interaction.customId.startsWith('long-running-task')) return this.none();

		// Defer the interaction here as what we will do might take some time
		await interaction.deferReply();

		const result = await this.fetchDataThatMightTakeALongWhile(interaction.customId);

		return this.some(result);
	}

	private async fetchDataThatMightTakeALongWhile(customId: string) {
		console.log('customId', customId);
		// ...
	}
}
