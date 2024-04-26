import { ButtonID } from '#lib/components/button';
import { editInteractionResponse } from '#lib/discord/interaction';
import { Emojis } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { Time } from '@sapphire/duration';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { resolveKey, Target } from '@sapphire/plugin-i18next';
import { ButtonBuilder, ButtonInteraction, time, TimestampStyles } from 'discord.js';

@ApplyOptions<InteractionHandler.Options>({ interactionHandlerType: InteractionHandlerTypes.Button })
export class VoteReminderButton extends InteractionHandler {
	public override parse(interaction: ButtonInteraction) {
		if (interaction.customId !== ButtonID.voteReminder) return this.none();

		const timestampTwelveHoursLater = interaction.message.createdTimestamp + Time.Hour * 12;
		return this.some({ time: timestampTwelveHoursLater });
	}

	public async run(interaction: ButtonInteraction, result: { time: number }) {
		await interaction.deferUpdate();

		await editInteractionResponse(interaction, {
			components: [
				{
					components: [await this.remindMeButtonDisabledBuilder(interaction)],
					type: 1
				}
			]
		});

		const delay = result.time - Date.now();

		if (delay < 0) {
			return interaction.followUp({ content: 'You can vote now already again!', ephemeral: true });
		}

		await this.container.tasks.create({ name: 'VoteReminderTask', payload: { memberId: interaction.user.id } }, { delay, repeated: false });

		return interaction.followUp({
			content: `I will remind you to vote ${time(Math.round(result.time / 1000), TimestampStyles.RelativeTime)} !`,
			ephemeral: true
		});
	}

	private async remindMeButtonBuilder(target: Target) {
		const label = await resolveKey(target, 'button:remindeMe');
		return new ButtonBuilder().setLabel(label).setCustomId('vote-reminder-button').setEmoji(Emojis.Alarm);
	}

	private async remindMeButtonDisabledBuilder(target: Target) {
		return (await this.remindMeButtonBuilder(target)).setDisabled(true);
	}
}
