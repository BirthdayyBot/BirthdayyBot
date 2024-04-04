import { ApplyOptions } from '@sapphire/decorators';
import { container } from '@sapphire/framework';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { type Snowflake } from 'discord.js';

export interface RoleRemovePayload {
	memberId: Snowflake;
	guildId: Snowflake;
	roleId: Snowflake;
}

@ApplyOptions<ScheduledTask.Options>({ name: 'BirthdayRoleRemoverTask', customJobOptions: { removeOnComplete: true } })
export class BirthdayRoleRemoverTask extends ScheduledTask {
	public async run({ memberId, guildId, roleId }: RoleRemovePayload) {
		const guild = await container.client.guilds.fetch(guildId);
		const member = await guild.members.fetch(memberId);

		return member.roles.remove(roleId, 'Birthday Role Removal');
	}
}

declare module '@sapphire/plugin-scheduled-tasks' {
	interface ScheduledTasks {
		BirthdayRoleRemoverTask: RoleRemovePayload;
	}
}
