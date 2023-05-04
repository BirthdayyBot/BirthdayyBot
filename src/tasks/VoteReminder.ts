import { ApplyOptions } from '@sapphire/decorators';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { envParseString } from '@skyra/env-utilities';
import type { Snowflake } from 'discord.js';
import { getUserInfo } from '../lib/discord';
import { VoteEmbed } from '../lib/embeds';
import { generateDefaultEmbed } from '../lib/utils/embed';

interface VoteReminderTaskPayload {
	memberId: Snowflake;
}

@ApplyOptions<ScheduledTask.Options>({ name: 'VoteReminderTask', bullJobsOptions: { removeOnComplete: true } })
export class VoteReminderTask extends ScheduledTask {
	public async run(payload: VoteReminderTaskPayload) {
		const { memberId } = payload;
		const user = await getUserInfo(memberId);
		if (!user) return;
		await user.send({
			content: `Hi, you can vote for ${envParseString('BOT_NAME')} again!`,
			embeds: [generateDefaultEmbed(VoteEmbed)],
		});
	}
}
