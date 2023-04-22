import { ApplyOptions } from '@sapphire/decorators';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import type { Snowflake } from 'discord.js';
import { BOT_NAME } from '../helpers/provide/environment';
import { getUserInfo } from '../lib/discord';
import { VoteEmbed } from '../lib/embeds';

interface VoteReminderTaskPayload {
	memberId: Snowflake;
}

@ApplyOptions<ScheduledTask.Options>({ name: 'VoteReminderTask', bullJobsOptions: { removeOnComplete: true } })
export class VoteReminderTask extends ScheduledTask {
	public async run(payload: VoteReminderTaskPayload) {
		const { memberId } = payload;
		// send a message to member with id memberId
		const user = await getUserInfo(memberId);
		if (!user) return;
		await user.send({
			content: `Hi, you can vote for ${BOT_NAME} again!`,
			embeds: [VoteEmbed],
		});
	}
}
