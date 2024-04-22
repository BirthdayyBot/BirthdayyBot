import { VoteEmbed } from '#lib/embeds/vote';
import { generateDefaultEmbed } from '#utils/embed';
import { ApplyOptions } from '@sapphire/decorators';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import type { Snowflake } from 'discord.js';

interface VoteReminderTaskPayload {
	memberId: Snowflake;
}

@ApplyOptions<ScheduledTask.Options>({ name: 'VoteReminderTask', customJobOptions: { removeOnComplete: true } })
export class VoteReminderTask extends ScheduledTask {
	public async run(payload: VoteReminderTaskPayload) {
		const { memberId } = payload;
		const user = await this.container.client.users.fetch(memberId).catch(() => null);
		if (!user) return;
		await user.send({
			content: `Hi, you can vote for Birthdayy again!`,
			embeds: [generateDefaultEmbed(VoteEmbed)]
		});
	}
}

declare module '@sapphire/plugin-scheduled-tasks' {
	interface ScheduledTasks {
		VoteReminderTask: VoteReminderTaskPayload;
	}
}
