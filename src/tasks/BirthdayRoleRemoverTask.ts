import { ApplyOptions } from '@sapphire/decorators';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import type { Guild, GuildMember, Role, User } from 'discord.js';

interface RoleRemovePayload {
	member: GuildMember;
	guild: Guild;
	role: Role;
	isTest: boolean;
}

@ApplyOptions<ScheduledTask.Options>({ name: 'BirthdayRoleRemoverTask', bullJobsOptions: { removeOnComplete: true } })
export class BirthdayRoleRemoverTask extends ScheduledTask {
	public async run(payload: RoleRemovePayload) {
		const { member, guild, role, isTest } = payload;

		if (!member.roles.cache.has(role.id)) {
			return this.container.logger.info(`[BirthdayRoleRemoverTask]: Role ${role.name} not found on member ${member.user.id}`);
		}

		if (isTest) return this.container.logger.info(`[BirthdayRoleRemoverTask]: ${guild.id} ${role} ${member.id}`);

		await member.roles.remove(role, 'Birthday Role Removal').catch(() => null);
		this.container.logger.info(`[BirthdayRoleRemoverTask] Removed role ${role.name} from user ${member.user.id}`);
	}
}
