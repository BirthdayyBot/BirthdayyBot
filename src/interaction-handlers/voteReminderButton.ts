import { ApplyOptions } from '@sapphire/decorators';
import { Time } from '@sapphire/duration';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import type { ButtonInteraction } from 'discord.js';
import { remindMeButtonDisabled } from '../lib/components/button';
import { editInteractionResponse } from '../lib/discord/interaction';

@ApplyOptions<InteractionHandler.Options>({ interactionHandlerType: InteractionHandlerTypes.Button })
export class VoteReminderButton extends InteractionHandler {
	public override parse(interaction: ButtonInteraction) {
		this.container.logger.info('VoteReminderButton ~ overrideparse ~ interaction.customId:', interaction.customId);
		if (!(interaction.customId === 'vote-reminder-button')) return this.none();

		const twelveHoursLaterTimestamp = interaction.message.createdTimestamp + Time.Hour * 12;
		const timeUntil12HoursLater = twelveHoursLaterTimestamp - Date.now();
		return this.some({ time: timeUntil12HoursLater });
	}

	public async run(interaction: ButtonInteraction, result: { time: number }) {
		await interaction.deferUpdate();
		await editInteractionResponse(interaction, {
			components: [
				{
					type: 1,
					components: [remindMeButtonDisabled],
				},
			],
		});
		if (result.time < 0) return interaction.followUp({ content: 'You can vote now already!', ephemeral: true });
		const taskCreation = await this.container.tasks.create(
			'VoteReminderTask',
			{ memberId: interaction.user.id },
			{ repeated: false, delay: result.time },
		);
		if (!taskCreation) return interaction.followUp({ content: 'Something went wrong!', ephemeral: true });
		return interaction.followUp({ content: 'I will remind you in 12 hours to vote!', ephemeral: true });
	}
}
