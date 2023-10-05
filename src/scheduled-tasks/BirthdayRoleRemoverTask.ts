import { ApplyOptions } from '@sapphire/decorators';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { type Snowflake } from 'discord.js';

export interface RoleRemovePayload {
	memberId: Snowflake;
	guildId: Snowflake;
	roleId: Snowflake;
}

@ApplyOptions<ScheduledTask.Options>({ name: 'BirthdayRoleRemoverTask', bullJobsOptions: { removeOnComplete: true } })
export class BirthdayRoleRemoverTask extends ScheduledTask {
	public async run({ memberId, guildId, roleId }: RoleRemovePayload) {
		const guild = await this.container.client.guilds.fetch(guildId);
		const member = await guild.members.fetch(memberId);

		return member.roles.remove(roleId, 'Birthday Role Removal');
	}
}
