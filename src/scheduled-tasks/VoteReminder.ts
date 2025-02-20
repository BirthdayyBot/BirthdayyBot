import { ClientColor } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import type { TFunction } from '@sapphire/plugin-i18next';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { EmbedBuilder, Locale, type EmbedField, type Snowflake } from 'discord.js';

@ApplyOptions<ScheduledTask.Options>({ name: 'VoteReminderTask', customJobOptions: { removeOnComplete: true } })
export class VoteReminderTask extends ScheduledTask {
	public async run(payload: { local: Locale; memberId: Snowflake }) {
		const user = await this.container.client.users.fetch(payload.memberId).catch(() => null);
		if (!user) return;

		const t = this.container.i18n.getT(payload.local);
		const channel = user.dmChannel ?? (await user.createDM());

		const embed = new EmbedBuilder()
			.setColor(ClientColor)
			.setTitle(t('tasks:voteReminderEmbedTitle'))
			.setFields([this.getVoteFields(t), this.getPremiumFields(t)]);

		return channel.send({ content: t('tasks:voteReminderContent'), embeds: [embed] });
	}

	private getVoteFields(t: TFunction): EmbedField {
		return {
			name: t('tasks:voteReminderEmbedVoteFields'),
			value: t('tasks:voteReminderEmbedVoteFieldsValue'),
			inline: false
		};
	}

	private getPremiumFields(t: TFunction): EmbedField {
		return {
			name: t('tasks:voteReminderEmbedPremiumFields'),
			inline: false,
			value: t('tasks:voteReminderEmbedPremiumFieldsValue')
		};
	}
}
