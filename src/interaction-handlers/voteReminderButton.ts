import { editInteractionResponse } from '#lib/discord/interaction';
import { getSupportedUserLanguageT } from '#lib/i18n/translate';
import { getActionRow, getRemindMeDisabledComponent } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { Time } from '@sapphire/duration';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { ButtonInteraction, TimestampStyles, time } from 'discord.js';

@ApplyOptions<InteractionHandler.Options>({ interactionHandlerType: InteractionHandlerTypes.Button })
export class VoteReminderButton extends InteractionHandler {
	public override parse(interaction: ButtonInteraction) {
		if (interaction.customId !== 'vote-reminder-button') return this.none();

		const timestampTwelveHoursLater = interaction.message.createdTimestamp + Time.Hour * 12;
		return this.some({ time: timestampTwelveHoursLater });
	}

	public async run(interaction: ButtonInteraction, result: { time: number }) {
		await interaction.deferUpdate();
		const components = [getActionRow(getRemindMeDisabledComponent(getSupportedUserLanguageT(interaction)))];

		await editInteractionResponse(interaction, { components });

		const delay = result.time - Date.now();

		if (delay < 0) {
			return interaction.followUp({ content: 'You can vote now already again!', ephemeral: true });
		}

		await this.container.tasks.create(
			'VoteReminderTask',
			{ memberId: interaction.user.id },
			{ repeated: false, delay }
		);
		return interaction.followUp({
			content: `I will remind you to vote ${time(
				Math.round(result.time / 1000),
				TimestampStyles.RelativeTime
			)} !`,
			ephemeral: true
		});
	}
}
