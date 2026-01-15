import { ApplyOptions } from '@sapphire/decorators';
import { Time } from '@sapphire/duration';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { ButtonInteraction, TimestampStyles, time } from 'discord.js';
import { remindMeButtonDisabled } from '../lib/components/button';
import { CustomButtonIdEnum } from '../lib/enum/CustomButtonId.enum';

/**
 * Handles vote reminder button interactions
 * Schedules a reminder task for 12 hours after the vote button was created
 */
@ApplyOptions<InteractionHandler.Options>({ interactionHandlerType: InteractionHandlerTypes.Button })
export class VoteReminderButton extends InteractionHandler {
	/** Delay before reminding the user to vote again (in milliseconds) */
	private readonly REMINDER_DELAY = Time.Hour * 12;

	public parse(interaction: ButtonInteraction) {
		if (interaction.customId !== CustomButtonIdEnum.VOTE_REMINDER) return this.none();

		return this.some(interaction.message.createdTimestamp);
	}

	public async run(interaction: ButtonInteraction, parsedData: InteractionHandler.ParseResult<this>) {
		const nextReminderTimestamp = this.calculateNextReminderTime(parsedData);
		const delayMs = this.calculateDelay(nextReminderTimestamp);

		// Disable the button in the original message
		await interaction.editReply({
			components: [
				{
					type: 1,
					components: [remindMeButtonDisabled],
				},
			],
		});

		// Check if the reminder time has already passed
		if (delayMs <= 0) {
			await interaction.followUp({
				content: 'You can vote now already again!',
				ephemeral: true,
			});
		}

		// Schedule the reminder task
		await this.container.tasks.create(
			'VoteReminderTask',
			{ memberId: interaction.user.id },
			{ repeated: false, delay: delayMs },
		);

		await interaction.followUp({
			content: `I will remind you to vote ${time(
				Math.round(nextReminderTimestamp / 1000),
				TimestampStyles.RelativeTime,
			)} !`,
			ephemeral: true,
		});
	}

	/**
	 * Calculates the next reminder timestamp based on message creation time
	 * @param messageCreatedTimestamp - The timestamp when the message was created
	 * @returns The unix timestamp (in ms) when the reminder should be sent
	 */
	private calculateNextReminderTime(messageCreatedTimestamp: number): number {
		return messageCreatedTimestamp + this.REMINDER_DELAY;
	}

	/**
	 * Calculates the delay in milliseconds until the reminder should be sent
	 * @param reminderTimestamp - The unix timestamp (in ms) when reminder should be sent
	 * @returns Delay in milliseconds from now
	 */
	private calculateDelay(reminderTimestamp: number): number {
		return reminderTimestamp - Date.now();
	}
}
