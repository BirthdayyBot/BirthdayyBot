import { ApplyOptions } from '@sapphire/decorators';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';

interface RoleRemovePayload {
	guild_id: string;
	role_id: string;
	user_id: string;
	isTest: boolean;
}

@ApplyOptions<ScheduledTask.Options>({ name: 'BirthdayRoleRemoverTask', bullJobsOptions: { removeOnComplete: true } })
export class BirthdayRoleRemoverTask extends ScheduledTask {
	public async run(payload: RoleRemovePayload) {
		const { guild_id, role_id, user_id, isTest } = payload;

		const guild = await this.container.client.guilds.fetch(guild_id).catch(() => null);
		if (!guild) return this.container.logger.error(`[BirthdayRoleRemoverTask]: Guild not found: ${guild_id}`);

		const member = await guild.members.fetch(user_id).catch(() => null);
		if (!member) return this.container.logger.error(`[BirthdayRoleRemoverTask]: Member not found: ${user_id}`);

		const role = await guild.roles.fetch(role_id).catch(() => null);
		if (!role) return this.container.logger.error(`[BirthdayRoleRemoverTask] Role not found: ${role_id}`);

		if (!member.roles.cache.has(role.id)) {
			return this.container.logger.info(`[BirthdayRoleRemoverTask]: Role ${role.name} not found on member ${member.user.id}`);
		}

		if (isTest) return this.container.logger.info(`[BirthdayRoleRemoverTask]: ${guild_id} ${role_id} ${user_id}`);

		await member.roles.remove(role, 'Birthday Role Removal').catch(() => null);
		this.container.logger.info(`[BirthdayRoleRemoverTask] Removed role ${role.name} from user ${member.user.id}`);
	}
}
